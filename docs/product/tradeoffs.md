# Engineering Tradeoffs

To ensure SentinelIQ remained focused, stable, and deliverable within the hackathon timeline, we intentionally excluded several standard SaaS features. This document outlines those tradeoffs.

## 1. No Authentication or User Management
*   **Excluded**: Login screens, JWTs, OAuth, User roles (Admin vs. Reviewer).
*   **Why**: Auth is a solved problem. Implementing it would consume valuable hackathon time without demonstrating any unique innovation. The core value of SentinelIQ is the Priority Engine and UI/UX, so we focused 100% of our effort there.

## 2. No Database Persistence
*   **Excluded**: Saving documents, queues, or review states to a PostgreSQL or MongoDB database.
*   **Why**: Storing PII in a database requires extensive security, encryption at rest, and data lifecycle management. By keeping the application stateless (processing the document in memory and maintaining state in the React client via Zustand), we eliminated the security risk of storing highly sensitive hackathon data and dramatically simplified the backend architecture.

## 3. No Custom Heuristics UI
*   **Excluded**: A settings panel allowing users to define their own regex rules or adjust the weights of the priority scoring algorithm.
*   **Why**: While this is a critical feature for an enterprise V2 product, building a generic rules engine UI is incredibly complex. Hardcoding the 6 primary heuristics in `ReviewPriorityService.js` allowed us to guarantee a perfect demonstration of the concept without building out a massive configuration backend.

## 4. No Batch Processing
*   **Excluded**: Uploading 50 documents at once and generating a unified queue.
*   **Why**: Batch processing requires asynchronous task queues (like Redis/Celery or BullMQ), WebSockets for progress updates, and complex UI virtualization. The core interaction paradigm (ranking and reviewing) can be proven perfectly on a single document.

## 5. No ML Ranking Model
*   **Excluded**: Training a custom machine learning model to rank the detections instead of using a deterministic heuristic algorithm.
*   **Why**: Black-box ML models suffer from explainability issues. When an ML model says "This is high priority," it cannot easily explain *why*. Our deterministic heuristic engine can output exact, human-readable strings (e.g., "Found 1 time, buried in 300 chars of text"), which is critical for compliance and trust in legal/financial sectors.
