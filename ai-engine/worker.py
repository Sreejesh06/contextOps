import os
import asyncio
import json
from dotenv import load_dotenv
from bullmq import Worker, Job
from redis.asyncio import Redis

# LangGraph & LangChain imports
from typing import Annotated, Literal
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict
from langgraph.prebuilt import ToolNode

# Load environment variables
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ---------------------------------------------------------
# 1. Mock Tools
# ---------------------------------------------------------
@tool
def search_github_prs(service_name: str) -> str:
    """Searches Github for recent Pull Requests related to a service."""
    return f"Found recent PR #999 changing database limits in {service_name}"

@tool
def search_runbooks(error_type: str) -> str:
    """Searches runbooks for a specific error type."""
    return f"Runbook says {error_type} usually requires reverting recent PRs."

tools = [search_github_prs, search_runbooks]
tool_node = ToolNode(tools)

# ---------------------------------------------------------
# 2. LangGraph Setup
# ---------------------------------------------------------
class MessagesState(TypedDict):
    messages: Annotated[list, add_messages]

llm = ChatGroq(model="llama3-70b-8192")
llm_with_tools = llm.bind_tools(tools)

def agent_node(state: MessagesState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

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

# ---------------------------------------------------------
# 3. Redis Pub/Sub Client
# ---------------------------------------------------------
redis_pubsub = Redis.from_url(REDIS_URL)

async def publish_update(message_text: str):
    """Helper to publish simple string updates to the Node API."""
    channel = "incident_updates"
    payload = json.dumps({"message": message_text})
    await redis_pubsub.publish(channel, payload)
    print(f"[Published]: {message_text}")

# ---------------------------------------------------------
# 4. Worker Process Function
# ---------------------------------------------------------
async def process_incident(job: Job, token: str):
    print(f"\n[Worker] Picked up job {job.id}")
    await publish_update(f"Started investigating incident {job.id}...")
    
    payload_str = json.dumps(job.data, indent=2)
    prompt = f"An incident has been reported with the following payload:\n{payload_str}\n\nPlease investigate this using your tools."
    
    messages = [HumanMessage(content=prompt)]
    
    try:
        # Stream events from LangGraph
        async for event in app.astream({"messages": messages}, stream_mode="updates"):
            for node, state_update in event.items():
                
                # Get the message(s) from this node update
                msgs = state_update.get("messages", [])
                if not isinstance(msgs, list):
                    msgs = [msgs]
                
                for msg in msgs:
                    if isinstance(msg, AIMessage):
                        if msg.content:
                            await publish_update(f"AI: {msg.content}")
                        if getattr(msg, 'tool_calls', None):
                            for tool_call in msg.tool_calls:
                                await publish_update(f"Calling tool '{tool_call['name']}' with args: {tool_call['args']}")
                    
                    elif isinstance(msg, ToolMessage):
                        await publish_update(f"Tool '{msg.name}' returned: {msg.content}")

    except Exception as e:
        error_msg = f"Error during investigation: {str(e)}"
        print(error_msg)
        await publish_update(error_msg)
        return {"status": "error", "error": error_msg}
    
    await publish_update(f"Investigation complete for job {job.id}.")
    return {"status": "success"}

# ---------------------------------------------------------
# 5. Main Worker Loop
# ---------------------------------------------------------
async def main():
    if not GROQ_API_KEY:
        print("WARNING: GROQ_API_KEY environment variable is missing. The agent will fail.")
        
    print("Starting AI Brain worker...")
    
    redis_opts = {
        "host": "localhost",
        "port": 6379,
    }
    
    worker = Worker(
        "incident-investigation-queue",
        process_incident,
        {"connection": redis_opts}
    )
    
    print("Worker is listening for jobs on 'incident-investigation-queue'...")
    
    try:
        # Keep the worker running
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down worker...")
        await worker.close()

if __name__ == "__main__":
    asyncio.run(main())
