# ADR-004: Human-in-the-Loop

## Context
When processing sensitive documents (PII, PHI, financial data), false negatives (missing a SSN) are disastrous, and false positives (redacting a company name) damage document legibility. Fully automated LLM redaction systems cannot guarantee 100% accuracy, yet they are often deployed without human oversight.

## Decision
We architected SentinelIQ strictly as a Human-in-the-Loop (HITL) augmentation tool, not a replacement tool. The AI proposes detections, but the human user retains the ultimate authority. The UI is designed to prevent thoughtless bulk approval:
- The "Bulk Approve" button warns the user if they attempt to click it too quickly.
- The UI explicitly prevents bulk approval if there are unreviewed `HIGH` priority items remaining in the queue.

## Alternatives
- **Fully Automated Redaction**: Automatically burning the PII out of the PDF and serving the final document to the user.
- **AI Auto-Approval**: Using a secondary AI agent to "review" the first AI's work.

## Tradeoffs
- *Pros*: Ensures enterprise compliance and accountability. Reduces liability. Keeps humans engaged by only surfacing the most complex decisions to them via the Priority Engine.
- *Cons*: Slower end-to-end processing time compared to fully automated systems, as it requires a human to sit at the dashboard.

## Consequences
SentinelIQ functions as a co-pilot for legal and compliance reviewers, drastically speeding up their workflow while ensuring the final legal responsibility remains with a human.
