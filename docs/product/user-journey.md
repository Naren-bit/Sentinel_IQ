# User Journey

## Phase 1: Ingestion
1. The user navigates to the SentinelIQ Dashboard.
2. They drag-and-drop a target document (PDF, TXT, DOCX) into the Upload zone, or click "Quick Start" for the demo document.
3. A loading state appears while the backend processes the file.

## Phase 2: Processing (Invisible to User)
1. The file is parsed into a raw string.
2. Gemini 2.5 Flash extracts entities and confidence scores.
3. The Verification Engine repairs offsets and finds gaps.
4. The Priority Engine assigns a `HIGH`, `STANDARD`, or `LOW` tier to every finding.

## Phase 3: The Attention Queue
1. The user is presented with the **Review Queue** screen.
2. On the right, the **Attention Queue** sidebar displays all detections. `HIGH` priority items are aggressively sorted to the top.
3. The user reads the first card (e.g., a `HIGH` priority unformatted SSN). The card explicitly states *why* it is high priority (e.g., "Buried in dense paragraph", "Low AI confidence").
4. The user clicks the highlighted text in the Document Viewer to see context.
5. The user clicks **Approve** on the card. The card fades out and is marked as reviewed.

## Phase 4: Resolution
1. The user continues down the queue.
2. If the user tries to click the global "Approve All" button while `HIGH` priority items still remain unreviewed, the UI prevents it and shows a warning toast.
3. Once all items are approved (or all High-risk items are cleared), the user finalizes the document.
4. A success screen confirms the document is secure and ready for export.
