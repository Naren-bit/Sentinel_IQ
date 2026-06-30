# API Specification

This document outlines the REST API exposed by the SentinelIQ backend. 

*Note: The frontend consumes these endpoints to generate the Review Queue. Endpoints operate synchronously.*

## 1. POST `/upload`

Accepts a multi-part form file upload (`.txt`, `.pdf`, `.docx`), extracts the text, and runs it through the detection and prioritization pipeline.

### Request
*   **Headers**: `Content-Type: multipart/form-data`
*   **Body**: 
    *   `document`: (File) The file to be analyzed. Max size 5MB.
    *   `forceMode`: (String, Optional) If set to `"demo"`, bypasses cloud AI and uses the Mock Engine.

### Response (200 OK)
```json
{
  "detections": [
    {
      "id": "det-001",
      "text": "John Smith",
      "start": 204,
      "end": 214,
      "type": "NAME",
      "confidence": 0.97
    }
  ],
  "enrichments": [
    {
      "detectionId": "det-001",
      "priorityTier": "LOW",
      "reasons": [
        "Flagged for routine review"
      ],
      "drivingSignal": "confidence"
    }
  ],
  "documentText": "Full extracted text of the document...",
  "fileName": "contract.pdf",
  "fallbackOccurred": false
}
```

## 2. POST `/review`

Accepts raw string text and runs it through the detection and prioritization pipeline.

### Request
*   **Headers**: `Content-Type: application/json`
*   **Body**:
```json
{
  "documentText": "Call me at 503-555-0193.",
  "forceMode": "demo" // Optional
}
```
*Note: If `documentText` is empty or missing, the backend intentionally falls back to processing the built-in Sample Document.*

### Response (200 OK)
Returns the exact same schema as `/upload`, minus the `fileName` field.

```json
{
  "detections": [ ... ],
  "enrichments": [ ... ],
  "documentText": "Call me at 503-555-0193.",
  "fallbackOccurred": false
}
```

## 3. GET `/health`

Basic health check for the Express server.

### Request
*   **Method**: `GET`
*   **No Body**

### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2024-10-24T12:00:00.000Z"
}
```
