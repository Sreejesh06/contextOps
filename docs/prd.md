1. Product Overview
ContextOps is a 3-tier, AI-native incident response platform. It ingests system alerts, autonomously gathers context using LangGraph and MCP, and streams its investigation timeline in real-time to an on-call engineer.

2. Core Loop (The Happy Path)

Datadog/PagerDuty hits POST /api/webhooks/pagerduty (Node.js).

Node.js writes the incident to PostgreSQL and pushes a job to Redis (via BullMQ).

Python FastAPI worker picks up the job and runs a LangGraph agent.

Python agent searches Runbooks (via pgvector) and queries GitHub (via MCP).

Python streams its "thoughts" to a Redis Pub/Sub channel.

Node.js listens to Pub/Sub and forwards the stream via WebSockets to the Next.js frontend.

3. The Tech Stack (Strictly Enforced)


Frontend: Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui.


Authentication & RBAC: Clerk (Admin vs. Viewer roles).


Core API (Traffic & WebSockets): Node.js (Express or Fastify) + TypeScript + Prisma.


AI Engine (Workers & Memory): Python + FastAPI + LangGraph + MCP + OpenAI/Anthropic API.


Database (State & RAG): PostgreSQL with the pgvector extension.


Message Broker: Redis (Pub/Sub and Queues).


Deployment: Railway (PaaS for native long-running workers and WebSockets).

4. Out of Scope (Do Not Generate)

Custom hand-rolled JWT authentication (Rely entirely on Clerk).

Standalone Vector Databases like Pinecone/Qdrant (Use pgvector only).

Complex microservice routing/orchestration (Keep to 3 standard services).

AWS/Vercel deployment pipelines (Local Docker-compose first, then Railway).
