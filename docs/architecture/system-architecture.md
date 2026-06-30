# System Architecture

SentinelIQ is designed as a secure, pipeline-driven application that ingests unstructured text, extracts Personally Identifiable Information (PII) using a large language model, and ranks those detections based on human-review heuristics.

## End-to-End Pipeline

The system operates in a strict, linear pipeline ensuring every document is processed consistently:

1. **Detection Provider Interface**
   The entry point for AI analysis. An abstract interface that handles the communication with external Large Language Models (LLMs). It constructs the prompt, sends the document, and receives the raw JSON array of detected entities.

2. **`providers/`**: The abstracted AI layer. Currently implements `CloudLLMProvider` (Google Gemini 2.5 Flash) and `MockProvider` (Offline Fallback Engine).
    *   *Defensive Engineering (MockProvider Isolation)*: If the primary AI provider times out or fails (e.g. rate limits), the `DetectionService` catches the failure and silently falls back to the `MockProvider`. This isolates network volatility, preventing silent UI corruption and replacing it with an honest, robust fallback.
    *   *Defensive Engineering (`_repairOffsets`)*: LLMs are notoriously bad at counting characters and returning exact substring indices. The `CloudLLMProvider` implements a `_repairOffsets` algorithm that uses exact string matching (`indexOf`) to find the true location of the LLM's returned text within the source document, preventing data-integrity failures where highlighted offsets don't match the actual text.

3. **Verification Pass**
   A critical safety net. LLMs occasionally hallucinate numerical character offsets or completely miss standard formats (like SSNs). This layer runs deterministic regex rules (`findUndetectedCandidates`) to identify false negatives and re-calculates hallucinatory offsets using exact string matching.

4. **Review Priority Engine**
   The core intellectual property of SentinelIQ. Instead of blindly trusting AI confidence scores, this engine applies heuristics (e.g., position in document, formatting anomalies, entity density) to score and sort the detections into `HIGH`, `STANDARD`, and `LOW` priority tiers.

5. **API Layer**
   An Express.js REST API that exposes the pipeline to the frontend via `/upload` and `/review` endpoints.

6. **Frontend**
   A Next.js React application using Zustand for state management. It renders the original document with interactive highlights and side-by-side prioritized detection cards.

7. **Human Review**
   The user explicitly reviews each flagged item. The UI prevents bulk approval if high-priority items remain unchecked, enforcing a true human-in-the-loop workflow.

8. **Final Approved Document**
   Once all items are reviewed and approved, the session ends securely.

## Why This Separation Exists

- **Resilience**: By separating the Detection Provider from the Verification Pass, the system can tolerate LLM hallucinations and network instability.
- **Explainability**: The Review Priority Engine is decoupled from the black-box AI model. This allows SentinelIQ to generate human-readable reasons (e.g., "Single mention in a dense paragraph") for *why* an item was flagged for review.
- **Flexibility**: The Provider interface allows swapping Gemini for another LLM or a Mock engine without changing the downstream priority or verification logic.
