# ADR-001: Provider Abstraction

## Context
SentinelIQ relies on Large Language Models (LLMs) to perform zero-shot entity extraction on unstructured text. Different environments (production, local development, demo mode) have different requirements for availability, cost, and speed. Furthermore, relying directly on a single cloud vendor's SDK throughout the codebase creates tight coupling.

## Decision
We implemented a `DetectionProvider` abstract base class. All LLM integrations (like `CloudLLMProvider` using Gemini) and offline fallbacks (like `MockProvider`) must implement a unified `detect(documentText)` interface that returns a standardized JSON array of detections.

## Alternatives
- **Direct SDK Usage**: Calling the `@google/generative-ai` SDK directly inside the Express route handlers.
- **Microservice Architecture**: Standing up a separate Python/FastAPI service just to wrap the LLM.

## Tradeoffs
- *Pros*: Extreme flexibility. We can swap out Gemini for OpenAI or Anthropic simply by writing a new Provider class, without touching any verification or priority ranking code. It also makes demoing the application trivial via the `MockProvider`.
- *Cons*: We must carefully map the varying output schemas of different LLMs into our strict internal schema inside the Provider class.

## Consequences
The core orchestration layer (`DetectionService`) is completely agnostic to *which* AI is performing the extraction, leading to a highly decoupled and resilient architecture.
