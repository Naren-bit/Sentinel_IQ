# ADR-002: Review Priority

## Context
AI models return confidence scores (e.g., 0.99 for "John Smith"). In traditional automated systems, high confidence means the system auto-redacts or auto-approves the detection without human intervention. However, LLMs are prone to high-confidence hallucinations and under-confident edge cases. 

## Decision
We decided to completely decouple the AI's confidence score from the workflow priority. Instead, we implemented a `ReviewPriorityEngine` that ranks detections into `HIGH`, `STANDARD`, and `LOW` tiers using human-centric risk heuristics (e.g., entity repetition, document position, dense paragraphs).

## Alternatives
- **Threshold Auto-Redaction**: Automatically redacting anything above 95% confidence.
- **Chronological Review**: Forcing the reviewer to review detections strictly in the order they appear in the document.

## Tradeoffs
- *Pros*: Directly addresses reviewer fatigue. By placing `HIGH` risk items at the top of the Attention Queue, humans review the hardest, most ambiguous, and most critical items while their attention is fresh. It provides human-readable explanations for *why* something is prioritized.
- *Cons*: Adds complexity to the backend processing pipeline. The heuristics require careful tuning to ensure obvious True Positives are down-ranked and tricky False Positives/Negatives are up-ranked.

## Consequences
The AI is treated purely as a highly capable extraction sensor, but all judgment and prioritization are handled by deterministic software engineering rules, ensuring maximum safety.
