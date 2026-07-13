# Database Connection Pool Exhausted Runbook

## Overview
This runbook details how to address a "Database Connection Pool Exhausted" error. This usually occurs when the service has exhausted all available connections to the Postgres database due to a sudden spike in traffic, unclosed database connections in the code, or a deadlock in the database holding connections open.

## Immediate Mitigation
1. **Identify the Culprit**: Check the recent Pull Requests merged for the affected service. Look for any changes related to database queries, connection limits, or transaction management.
2. **Revert Suspicious PRs**: The most common cause is a recent deployment. If PRs related to database limits were recently merged (e.g. changing maximum pool size without considering overall limits, or missing transaction commits), revert them immediately.
3. **Restart the Service**: Restart the service pods/containers to clear the existing connection pool and provide temporary relief.
4. **Kill Idle DB Connections**: If the database is overwhelmed by idle connections, connect directly via `psql` and terminate idle connections:
   ```sql
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE state = 'idle' AND pid <> pg_backend_pid();
   ```

## Root Cause Analysis
- Ensure all open database connections are properly closed or returned to the pool after the operation.
- Implement connection timeouts to prevent long-running queries from hoarding connections.
- Review database metrics (e.g. max connections, active connections) in your monitoring dashboard.
