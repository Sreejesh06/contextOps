# OOMKilled Issue Runbook

## Overview
This runbook addresses "OOMKilled" (Out Of Memory) issues in Kubernetes pods. This happens when a pod exceeds its memory limits.

## Immediate Mitigation
1. **Identify the Culprit Pod**: Check Datadog APM or Kubernetes events for the pod crashing with exit code 137.
2. **Increase Memory Limits**: Temporarily increase the memory limits in the deployment YAML and re-deploy.
   ```yaml
   resources:
     limits:
       memory: "1024Mi"
   ```
3. **Restart the Pod**: Usually Kubernetes will auto-restart the pod, but if it is stuck in a CrashLoopBackOff, delete the pod to force a fresh restart.

## Root Cause Analysis
- A common cause is a memory leak introduced in a recent commit. Check recent GitHub Pull Requests related to caching, large data processing, or global variables.
- Review heap dumps if available.
- Ensure large payloads are paginated.
