# Judging Alignment

This document outlines how SentinelIQ directly satisfies the core judging criteria for SprintFour.

## 1. Discovery
**Criterion**: *Did the team uncover a non-obvious insight about the problem space?*
**Alignment**: Yes. The obvious approach to PII redaction is "Make the AI more accurate." Our non-obvious insight is that *human reviewer fatigue* is the actual point of failure. By realizing that not all AI detections require the same cognitive effort to review, we built a system that ranks anomalies by human risk, rather than raw AI confidence.

## 2. Judgment
**Criterion**: *Did the team make smart product decisions and scope the MVP effectively?*
**Alignment**: We aggressively scoped the project to focus entirely on the core innovation: the Review Priority Engine and the Attention Queue UI. We intentionally stripped out authentication, databases, and batch processing (see `tradeoffs.md`) because they do not prove the core hypothesis.

## 3. Empathy
**Criterion**: *Does the solution demonstrate a deep understanding of the end-user's pain?*
**Alignment**: The entire UI is built with extreme empathy for the exhausted compliance analyst. The UI uses glassmorphism and subtle animations to reduce eye strain, places the hardest tasks at the start of the session, and uses nudges to prevent accidental bulk-approvals when tired. Furthermore, the heuristic engine provides human-readable explanations (e.g., "Buried in dense text") rather than cryptic AI probability scores.

## 4. Tradeoffs
**Criterion**: *Can the team articulate what they chose not to build and why?*
**Alignment**: We have extensively documented this in `docs/product/tradeoffs.md` and our Architecture Decision Records (`docs/decisions/`). For example, we chose a deterministic rule engine over a machine learning model specifically to preserve explainability for compliance users.

## 5. Reasoning
**Criterion**: *Is the technical architecture logical and defendable?*
**Alignment**: Our pipeline architecture completely decouples the AI provider from the verification logic. This guarantees that if Google Gemini changes its output format or goes offline, the core priority engine and UI remain perfectly intact. We also implemented strict Fallback Providers to prevent UI corruption during API outages.

## 6. Engineering
**Criterion**: *Is the codebase clean, robust, and production-ready?*
**Alignment**: The codebase demonstrates mature software engineering fundamentals:
- **Defensive Data Integrity (`_repairOffsets`)**: We built defensive repair logic because LLM-reported character offsets are notoriously unreliable. Rather than silently corrupting the UI, our provider auto-repairs hallucinatory indices using exact substring matching.
- **Strict Schema Validation**: Detections are violently rejected if the reported text doesn't exactly match `documentText.substring(start, end)`.
- **Honest Fallback Isolation**: We explicitly caught a subtle MockProvider data leakage bug where AI rate limits corrupted the UI. We solved it by isolating the error state, explicitly catching the timeout/failure, and routing to an honest fallback provider for the demo, rather than presenting corrupted data.
- **Architecture**: The codebase features strict ESLint rules, Zustand state management (preventing prop drilling), complete separation of concerns between Express.js routes and business logic services, and thorough Markdown documentation.
