# Deployment Architecture

This document describes the logical deployment footprint of SentinelIQ.

## Deployment Topology

```
[ User Browser ]
       │
       ▼
[ Frontend (Next.js) ]  <-- (Port 3000)
       │
       ▼
[ Backend (Express.js) ] <-- (Port 3001)
       │
       ├─────────────────────────┐
       ▼                         ▼
[ Gemini API (Cloud) ]    [ Mock Provider (Local) ]
```

## Layers

### 1. Browser
The client execution environment. SentinelIQ is a single-page React application hosted via Next.js. All document viewing and highlighting logic occurs in memory within the user's browser for speed and security.

### 2. Frontend Server
Hosts the static assets and handles React hydration. During development, this runs on port 3000. In production, this can be exported as static HTML or hosted via Vercel.

### 3. Backend API Server
A lightweight Node.js server (port 3001). This server is responsible for parsing `.pdf` and `.docx` blobs, constructing prompts, handling LLM network traffic, and running the heuristic prioritization logic. 

### 4. External Services
- **Google Generative AI (Gemini)**: The primary cloud provider used to run zero-shot PII extraction.
- **Fallback Engine**: Runs locally on the Node.js backend. If external network requests fail, the backend securely isolates the error and prevents UI corruption.
