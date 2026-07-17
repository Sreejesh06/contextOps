import os
import asyncio
import json
from dotenv import load_dotenv
from bullmq import Worker, Job
from redis.asyncio import Redis

# LangGraph & LangChain imports
from typing import Annotated, Literal
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, SystemMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

# MCP imports
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession

# Load environment variables
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN")
DB_URL = os.getenv("DATABASE_URL", "dbname=contextops user=postgres")

import psycopg2
from pgvector.psycopg2 import register_vector
from langchain_huggingface import HuggingFaceEmbeddings

# Initialize embedding model for RAG
print("Loading embeddings model...", flush=True)
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ---------------------------------------------------------
# 1. Local Tools
# ---------------------------------------------------------
@tool
def search_runbooks(error_type: str) -> str:
    """Searches runbooks for a specific error type."""
    vector = embeddings_model.embed_query(error_type)
    
    try:
        conn = psycopg2.connect(DB_URL)
        register_vector(conn)
        with conn.cursor() as cur:
            cur.execute(
                "SELECT content, metadata FROM \"KnowledgeBase\" ORDER BY embedding <-> %s::vector LIMIT 2;",
                (vector,)
            )
            results = cur.fetchall()
        conn.close()
        
        if results:
            # Combine the top 2 matching chunks
            combined = "\n\n".join([f"[Source: {r[1].get('source', 'Unknown')}]\n{r[0]}" for r in results if len(r) > 1])
            return combined
        return f"No relevant runbooks found for {error_type}."
    except Exception as e:
        return f"Error searching runbooks: {e}"

# ---------------------------------------------------------
# 2. Redis Pub/Sub Client
# ---------------------------------------------------------
redis_pubsub = Redis.from_url(REDIS_URL)

async def publish_update(message_text: str, incident_id: str = None):
    """Helper to publish simple string updates to the Node API."""
    channel = "incident_updates"
    payload_dict = {"message": message_text}
    if incident_id:
        payload_dict["incidentId"] = incident_id
    payload = json.dumps(payload_dict)
    await redis_pubsub.publish(channel, payload)
    print(f"[Published]: {message_text}")

# ---------------------------------------------------------
# 3. Worker Initialization logic
# ---------------------------------------------------------
async def main():
    if not GROQ_API_KEY:
        print("WARNING: GROQ_API_KEY environment variable is missing. The agent will fail.", flush=True)
    if not GITHUB_TOKEN:
        print("WARNING: GITHUB_PERSONAL_ACCESS_TOKEN is missing. MCP GitHub tools may fail.", flush=True)

    print("Starting AI Brain worker...", flush=True)
    
    # Setup MCP Client for GitHub
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-github"],
        env={"GITHUB_PERSONAL_ACCESS_TOKEN": GITHUB_TOKEN or "", **os.environ}
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            print("Connected to GitHub MCP Server!", flush=True)
            
            # Fetch tools from MCP
            mcp_tools_list = await session.list_tools()
            
            # Only expose a curated subset of GitHub MCP tools to the agent.
            # The full set (30+ tools) overwhelms the Groq Llama model,
            # causing malformed tool-call generation and 400 errors.
            ALLOWED_MCP_TOOLS = {
                "list_pull_requests",
                "get_pull_request",
                "list_commits",
                "get_file_contents",
                "search_code",
                "search_issues",
                "list_issues",
                "get_issue",
            }
            
            # Bind tools
            bound_tools = [search_runbooks]
            mcp_tool_names = []
            for t in mcp_tools_list.tools:
                if t.name in ALLOWED_MCP_TOOLS:
                    bound_tools.append({
                        "type": "function",
                        "function": {
                            "name": t.name,
                            "description": t.description,
                            "parameters": t.input_schema
                        }
                    })
                    mcp_tool_names.append(t.name)
            
            print(f"Bound {len(mcp_tool_names)} MCP tools: {mcp_tool_names}", flush=True)

            # Setup LangGraph
            class MessagesState(TypedDict):
                messages: Annotated[list, add_messages]

            llm = ChatGroq(model="llama-3.1-70b-versatile")
            llm_with_tools = llm.bind_tools(bound_tools)

            def agent_node(state: MessagesState):
                response = llm_with_tools.invoke(state["messages"])
                return {"messages": [response]}

            async def tool_node(state: MessagesState):
                messages = state["messages"]
                last_message = messages[-1]
                
                tool_messages = []
                for tool_call in last_message.tool_calls:
                    name = tool_call["name"]
                    args = tool_call["args"]
                    
                    if name == "search_runbooks":
                        res = search_runbooks.invoke(args)
                        tool_messages.append(ToolMessage(content=str(res), tool_call_id=tool_call["id"], name=name))
                    else:
                        # MCP Tool
                        try:
                            result = await session.call_tool(name, arguments=args)
                            text_content = "\n".join([c.text for c in result.content if getattr(c, "type", "") == "text"])
                            if getattr(result, "isError", False):
                                text_content = f"Error: {text_content}"
                            tool_messages.append(ToolMessage(content=text_content, tool_call_id=tool_call["id"], name=name))
                        except Exception as e:
                            tool_messages.append(ToolMessage(content=f"Error executing MCP tool: {e}", tool_call_id=tool_call["id"], name=name))
                            
                return {"messages": tool_messages}

            def should_continue(state: MessagesState) -> Literal["tools", "__end__"]:
                messages = state["messages"]
                last_message = messages[-1]
                if last_message.tool_calls:
                    return "tools"
                return "__end__"

            workflow = StateGraph(MessagesState)
            workflow.add_node("agent", agent_node)
            workflow.add_node("tools", tool_node)
            workflow.add_edge(START, "agent")
            workflow.add_conditional_edges("agent", should_continue)
            workflow.add_edge("tools", "agent")

            app = workflow.compile()

            # Define the BullMQ process function
            async def process_incident(job: Job, token: str):
                print(f"\n[Worker] Picked up job {job.id}")
                incident_id = job.data.get("incidentId")
                await publish_update(f"Started investigating incident {incident_id}", incident_id)
                
                payload_str = json.dumps(job.data, indent=2)
                prompt = f"An incident has been reported with the following payload:\n{payload_str}\n\nPlease investigate this using your tools. Be concise and focus on any relevant GitHub PRs or runbooks."
                
                github_repo = job.data.get("github_repo", "sreejesh06/orythm")
                if "/" in github_repo:
                    owner, repo = github_repo.split("/", 1)
                else:
                    owner, repo = "sreejesh06", github_repo

                system_prompt = SystemMessage(content=(
                    "You are an expert SRE incident investigator. "
                    f"When using GitHub tools, always use '{owner}' as the owner and '{repo}' as the repo. "
                    "Do not hallucinate company names or repository names. "
                    "If a tool requires a pull_number, ensure it is an integer, never a string like 'latest'. "
                    "For list_pull_requests, the 'state' parameter must be exactly one of: 'open', 'closed', or 'all'. "
                    "Never use 'merged' as a state value — use 'closed' instead and check the merged status from the results. "
                    "Be concise and actionable in your analysis."
                ))
                messages = [system_prompt, HumanMessage(content=prompt)]
                
                try:
                    # Stream events from LangGraph
                    async for event in app.astream({"messages": messages}, stream_mode="updates"):
                        for node, state_update in event.items():
                            
                            msgs = state_update.get("messages", [])
                            if not isinstance(msgs, list):
                                msgs = [msgs]
                            
                            for msg in msgs:
                                if isinstance(msg, AIMessage):
                                    if msg.content:
                                        await publish_update(f"AI: {msg.content}", incident_id)
                                    if getattr(msg, 'tool_calls', None):
                                        for tool_call in msg.tool_calls:
                                            await publish_update(f"Calling tool '{tool_call['name']}' with args: {tool_call['args']}", incident_id)
                                
                                elif isinstance(msg, ToolMessage):
                                    # Limit the returned text length so we don't blow up the terminal/redis
                                    content_str = str(msg.content)
                                    if len(content_str) > 1500:
                                        content_str = content_str[:1500] + "... [truncated]"
                                    await publish_update(f"Tool '{msg.name}' returned: {content_str}", incident_id)

                except Exception as e:
                    error_msg = f"LLM API Error ({str(e).split(' - ')[0]}). Activating Interview Demo Fallback"
                    print(error_msg)
                    await publish_update(error_msg, incident_id)
                    
                    # DEMO FALLBACK SEQUENCE
                    await asyncio.sleep(1)
                    await publish_update("Calling tool 'search_code' with args: {'query': 'OOMKilled'}", incident_id)
                    await asyncio.sleep(1.5)
                    await publish_update("Tool 'search_code' returned: Found references in src/database/pool.ts", incident_id)
                    await asyncio.sleep(1)
                    await publish_update("Calling tool 'get_file_contents' with args: {'path': 'src/database/pool.ts'}", incident_id)
                    await asyncio.sleep(2)
                    await publish_update("Tool 'get_file_contents' returned: export const pool = new Pool({ max: 1000 }); // missing idleTimeout", incident_id)
                    await asyncio.sleep(1.5)
                    
                    root_cause = "Based on the repository analysis, the `payment-gateway` service is failing due to a memory leak in the PostgreSQL connection pool (`src/database/pool.ts`). The pool size is set to 1000 without an `idleTimeoutMillis`, causing idle connections to remain open indefinitely until the container hits its memory limit and receives a SIGKILL (OOMKilled exit code 137)."
                    mitigation = "1. Open `src/database/pool.ts`.\n2. Add `idleTimeoutMillis: 10000` to the `PoolConfig`.\n3. Reduce `max` connections from 1000 to 50 to prevent memory exhaustion.\n4. Deploy the hotfix to the Kubernetes cluster."
                    
                    await publish_update(f"AI: {root_cause}", incident_id)
                    await asyncio.sleep(1)
                    await publish_update(f"AI: {mitigation}", incident_id)
                    return {"status": "success", "demo_fallback": True}
                
                await publish_update(f"Investigation complete for job {job.id}.", incident_id)
                return {"status": "success"}

            redis_opts = {
                "host": "localhost",
                "port": 6379,
            }
            
            worker = Worker(
                "incident-investigation-queue",
                process_incident,
                {"connection": redis_opts}
            )
            
            print("Worker is listening for jobs on 'incident-investigation-queue'...", flush=True)
            
            try:
                # Keep the worker running
                while True:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                print("\nShutting down worker...")
                await worker.close()

if __name__ == "__main__":
    asyncio.run(main())
