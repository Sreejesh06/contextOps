<div align="center">
  <br />
  <h1>ContextOps</h1>
  <p><strong>AI-Native Incident Triager</strong></p>
  <br />
</div>

![ContextOps Demo](./demo.gif)

## The Problem

At 3:00 AM, during a critical production outage, engineering teams face massive **Context Fragmentation**. 
Alerts fire in PagerDuty, logs stream through Datadog, metrics spike in Grafana, and pull requests are scattered across GitHub. 

ContextOps is the AI-native solution to this problem. It acts as an intelligent traffic cop and investigator, automatically fetching context across your entire infrastructure the second an incident is created, analyzing it using advanced AI, and providing actionable resolution steps directly in a stunning, real-time "Void Luxury" dashboard.

## System Architecture

ContextOps operates on a robust, highly-concurrent 3-tier distributed architecture:

- **Frontend (Next.js / The Glass)**: A gorgeous, real-time dashboard built with React and Tailwind CSS. It connects via WebSockets to instantly stream AI investigation timelines to engineers without refreshing.
- **Message Broker & API (Node.js)**: The central nervous system. It receives webhooks (e.g., from PagerDuty), queues jobs in Redis using BullMQ, and manages WebSocket connections to push updates to the UI in real-time.
- **AI Engine (Python / FastAPI)**: Powered by LangGraph, this intelligent agent processes incidents asynchronously. It orchestrates tool calls via the Model Context Protocol (MCP) and performs Retrieval-Augmented Generation (RAG).

## AI & Data Layer

ContextOps does not just hallucinate answers. It is grounded in *your* engineering truth:

- **Agentic Workflows**: Utilizing **LangGraph**, the agent dynamically decides which tools to call (e.g., searching recent GitHub PRs, checking logs) based on the incident description.
- **Retrieval-Augmented Generation (RAG)**: The AI engine relies on standard **PostgreSQL** enriched with the **pgvector** extension. When an incident occurs, the agent computes vector embeddings of the error locally using `sentence-transformers/all-MiniLM-L6-v2` and queries the database for the exact, proprietary Runbook steps to resolve the issue.

## Local Development

Follow these steps to spin up the ContextOps environment locally.

### 1. Start Infrastructure
Make sure Docker is running, then spin up the required Redis and PostgreSQL instances:
```bash
docker compose up -d
```
*(If you are running PostgreSQL natively, ensure `pgvector` is installed and Redis is running on port 6379).*

### 2. Ingest Proprietary Runbooks
Seed the database with the runbook knowledge base.
```bash
cd ai-engine
pip install -r requirements.txt
python ingest_runbooks.py
```

### 3. Start the AI Worker
The Python worker listens to the Redis queue for new incident jobs.
```bash
cd ai-engine
python worker.py
```

### 4. Start the Node.js Core API
The central nervous system that orchestrates queues and WebSockets.
```bash
cd core-api
npm install
npm run dev # or npm start
```

### 5. Start the Dashboard (Frontend)
The sleek glassmorphism UI.
```bash
cd dashboard
npm install
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) and sign in using the provided Clerk authentication.

---

*ContextOps: Stop searching. Start resolving.*
