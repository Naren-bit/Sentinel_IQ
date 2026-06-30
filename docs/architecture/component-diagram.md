# Component Diagram

This document illustrates the internal component structure of SentinelIQ.

## System Flow

```
Frontend (Next.js / Zustand)
│
└── API (Express.js)
    │
    └── Detection Provider Interface
        ├── Gemini Provider (Primary Cloud AI)
        └── Mock Provider (Fallback / Demo)
        │
        └── Verification Engine (Gap Detection & Offset Repair)
            │
            └── Review Priority Engine (Heuristic Ranking)
                │
                └── Review Queue (Attention Queue Sidebar)
                    │
                    └── Document View (Interactive Highlights)
```

## Component Details

### Frontend Components
*   **Upload Screen**: Manages file selection, pasting, and demo triggers.
*   **Review Queue**: The main workspace rendering the "Attention Queue" sidebar and sorting detections.
*   **Document View**: A custom renderer that splits document text by offsets and renders interactive `Popover` highlights over PII entities.
*   **DetectionCard**: A visual component rendering priority tags, extraction reasons, and human-readable feedback.

### Backend Components
*   **Server**: Exposes REST endpoints (`/upload`, `/review`).
*   **Detection Service**: Handles timeouts and manages fallbacks.
*   **Verification Engine**: Validates JSON schema adherence, repairs LLM offset hallucinations, and flags obvious missing PII.
*   **Review Priority Engine**: Scores each detection and categorizes them into `HIGH`, `STANDARD`, and `LOW` tiers.
