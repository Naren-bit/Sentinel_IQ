# 90-Second Demo Script

This script is designed to demonstrate SentinelIQ's core value proposition in under 90 seconds.

## Setup
1. Run both frontend and backend servers.
2. Open the browser to `http://localhost:3000`.
3. Have the browser window maximized to show off the glassmorphism UI.

## The Script

### 1. The Hook (0:00 - 0:15)
*   **Action**: Start on the Landing Page. Click **"Get Started"** to enter the workspace.
*   **Talk Track**: "Automated AI redaction tools are dangerous because LLMs hallucinate and miss edge cases. But manually reviewing 500 pages of AI output causes severe reviewer fatigue. SentinelIQ solves this by shifting the burden of trust from the AI to a deterministic Priority Engine."

### 2. The Setup (0:15 - 0:30)
*   **Action**: On the Upload Screen, click the **"Quick Start / Sample Financial Report"** card. Wait for the loading screen.
*   **Talk Track**: "Watch what happens when we process a document. The system uses Gemini 2.5 Flash to extract the PII, but then our backend algorithm intercepts those detections and scores them based on human cognitive risk."

### 3. The "Aha!" Moment (0:30 - 0:60)
*   **Action**: The Review Queue loads. **Hover** over the `HIGH` priority items at the top of the Attention Queue.
*   **Talk Track**: "Instead of showing a chronological list of 50 boring emails, SentinelIQ forces the reviewer to look at the highest-risk items first. Look at this first item: It's a Social Security Number, but the formatting is completely broken, the AI confidence was incredibly low, and it's buried in a dense paragraph. A human skimming this document would almost certainly miss it, but our Priority Engine caught the anomaly and bumped it to the top."

### 4. The Human-in-the-Loop Interaction (0:60 - 0:90)
*   **Action**: **Click** the text in the Document Viewer to open the interactive popover. **Click** "Approve". Then **Click** the global "Bulk Approve" button to show the nudge warning.
*   **Talk Track**: "Because the reasons are explainable—unlike a black-box ML model—the reviewer knows exactly *why* they need to look closely. And notice what happens if a lazy reviewer tries to click 'Approve All' right now. The UI explicitly blocks them because there are still high-risk items left in the queue. SentinelIQ isn't replacing the human; it's forcing the human to be better."
