# Product Vision

## Target User
Legal associates, compliance officers, and data privacy analysts tasked with reviewing hundreds of pages of unstructured documents (contracts, court filings, financial reports) for Personally Identifiable Information (PII) before external distribution.

## Problem
Fully automated AI redaction systems are risky because LLMs hallucinate false positives and miss subtle false negatives. Therefore, humans must still review the documents. 
However, traditional review tools present PII flags chronologically or purely alphabetically. This causes extreme **reviewer fatigue**. A reviewer might spend 2 hours clicking "Approve" on 500 perfectly formatted, obvious email addresses, and then completely miss the one unformatted, obscure Social Security Number buried on page 42 because they were exhausted.

## Core Insight
Not all PII detections require the same cognitive effort. 
An AI is highly certain about standard phone numbers. It is highly uncertain about a string of numbers that *might* be an SSN. 
By ranking the detections based on **human cognitive risk**—putting the ambiguous, hard-to-see, low-confidence, and high-severity items at the absolute top of the queue—we can ensure the reviewer's freshest attention is spent on the most dangerous potential leaks.

## Solution
**SentinelIQ**: A Human-in-the-Loop review dashboard that uses a zero-shot LLM (Gemini 2.5 Flash) to extract entities, and a deterministic Priority Engine to score them. It builds an "Attention Queue" that forces the reviewer to handle the `HIGH` priority anomalies first.

## Future Improvements
- **Optical Character Recognition (OCR)**: Integrating an OCR engine to process scanned image PDFs before passing the text to Gemini.
- **Custom Priority Rubrics**: Allowing enterprise organizations to weight the priority heuristics (e.g., heavily weighting healthcare terms for HIPAA compliance).
- **Batch Processing Dashboard**: Allowing reviewers to upload 50 documents at once and generating a single unified Attention Queue across the entire batch.
