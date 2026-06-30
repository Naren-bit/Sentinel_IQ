# ADR-003: Graceful Fallback

## Context
When building AI-native applications, reliance on external APIs (like Google Gemini) introduces a severe point of failure. Cloud LLMs are subject to rate limits, API key expiration, timeouts during high latency, and unexpected schema changes.

## Decision
We implemented a strict timeout and fallback mechanism in `DetectionService`. If the primary cloud API fails for *any* reason (including taking longer than 30 seconds to respond), the backend intercepts the error. 
For demo purposes (Quick Start), it falls back seamlessly to the `MockProvider` so the UI remains interactive. 
For custom user documents, it halts processing and explicitly throws a clean, user-facing error (`"Primary AI provider failed: Rate limit exceeded"`) rather than silently corrupting the document viewer with misaligned offsets.

## Alternatives
- **Infinite Retries**: Attempting to poll the API repeatedly until it succeeds.
- **Silent Failure**: Returning an empty array of detections if the API fails.

## Tradeoffs
- *Pros*: Prevents the UI from locking up or rendering corrupt data if the external API degrades. Ensures the user is always informed of the system's state.
- *Cons*: For custom documents, a failure means the user must retry manually.

## Consequences
The application remains highly robust and debuggable. We avoid the common AI-app trap where a backend timeout causes a mysterious blank screen on the frontend.
