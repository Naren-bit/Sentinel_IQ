# Sequence Flow

This document details the user journey from document ingestion to final approval in SentinelIQ.

## Step-by-Step Flow

1. **User Uploads Document**
   *   The user accesses the frontend and chooses to upload a PDF/TXT/DOCX file, paste raw text, or run the demo.
   *   The frontend dispatches the data to the backend API (`/upload` or `/review`).

2. **Detection Provider**
   *   The backend extracts text from the document (if necessary).
   *   The `DetectionService` constructs a prompt and calls the Gemini 2.5 Flash API.
   *   Gemini returns a JSON payload of PII detections with offsets and AI confidence scores.

3. **Verification Pass**
   *   The backend validates the schema and strictly checks offsets.
   *   `CloudLLMProvider` auto-repairs minor offset hallucinations.
   *   `ReviewPriorityService` runs regex gap detection to catch obvious items missed by the AI.

4. **Review Priority Engine**
   *   All valid detections are run through the prioritization rules.
   *   Each detection receives a `priorityTier` (`HIGH`, `STANDARD`, `LOW`) and a human-readable justification.

5. **Frontend Renders Queue**
   *   The API returns the enriched payload.
   *   The frontend parses the response, splitting the document into highlighted segments.
   *   The sidebar populates the `Attention Queue`, sorting `HIGH` priority items to the top.

6. **User Reviews**
   *   The user visually reviews the document.
   *   They can click on specific highlighted entities to view the `DetectionCard` rationale.
   *   The user clicks "Approve" on each individual card.

7. **Final Approval**
   *   Once all items (especially `HIGH` priority items) are approved, the user can safely finalize the review session.
