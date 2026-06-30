# Review Priority Engine

The Review Priority Engine is the core intellectual property of SentinelIQ. It shifts the burden of trust from an AI's internal "confidence" to transparent, explainable heuristic rules.

## Why It Exists

Large Language Models are excellent at zero-shot entity extraction, but their internal confidence scores are notoriously unreliable (they are often highly confident when hallucinating, and under-confident on complex edge cases). SentinelIQ exists to solve this problem by routing review tasks based on human-centric risk factors.

## The Heuristics

The Engine evaluates every detection against 6 distinct rules. The final score categorizes the item into `HIGH`, `STANDARD`, or `LOW` priority.

### 1. AI Uncertainty
*   **Why it exists**: If the AI is unsure, a human must step in.
*   **Problem solved**: Catches low-confidence edge cases that might be ignored by traditional automated redaction filters.
*   **Explainable**: Output directly states: "Low AI confidence (X%) on a [TYPE] — needs human verification."

### 2. Entity Type Consequence
*   **Why it exists**: Missing a Social Security Number is a catastrophic breach. Missing a generic Company Name is a minor leak.
*   **Problem solved**: Scales priority strictly based on privacy severity.
*   **Explainable**: Output directly states: "[TYPE] is a high-severity PII type if leaked."

### 3. Single Occurrence
*   **Why it exists**: If a PII entity appears multiple times, the reviewer has multiple chances to catch it. If it appears only once, it is a single point of failure.
*   **Problem solved**: Highlights isolated data leaks that are statistically most likely to be missed in long documents.
*   **Explainable**: Output directly states: "Only mention in the document — no second reference to catch if missed."

### 4. Dense Paragraph (Context Density)
*   **Why it exists**: Humans skim large blocks of text. PII buried in a 400-character paragraph is easily overlooked.
*   **Problem solved**: Quantifies visual fatigue.
*   **Explainable**: Output directly states: "Buried in a dense paragraph (X chars) — easy to skim past."

### 5. Formatting Anomaly
*   **Why it exists**: Traditional filters and human eyes look for canonical shapes (e.g., `XXX-XX-XXXX`). An SSN formatted as `XX X XX XXXX` defeats visual scanning.
*   **Problem solved**: Flags obfuscated or poorly formatted PII.
*   **Explainable**: Output directly states: "Non-standard ID/SSN format — unusual formatting defeats visual scanning."

### 6. Verification Findings (Gap Detection)
*   **Why it exists**: If the LLM entirely misses a piece of PII, our Regex fallback layer catches it.
*   **Problem solved**: Provides a safety net against AI false negatives. Because the AI missed it, it is automatically marked as `HIGH` priority.
*   **Explainable**: Output directly states: "Missed by primary AI model; caught by safety verification pass."
