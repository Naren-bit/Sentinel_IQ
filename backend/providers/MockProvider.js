/**
 * MockProvider — Hardcoded PII Detections for the Sample Document
 * 
 * Returns a fixed set of detections with carefully calibrated confidence scores
 * to produce a balanced tier distribution (HIGH / STANDARD / LOW) when passed
 * through ReviewPriorityService.
 * 
 * Confidence calibration strategy:
 * - Obvious, well-formatted PII near top: HIGH confidence (0.92–0.97)
 *   → These will score LOW priority (easy to catch, nothing tricky)
 * - Mid-document standard PII: MODERATE confidence (0.78–0.88)
 *   → These will score STANDARD priority
 * - Late-position, non-canonical PII: LOW confidence (0.55–0.68)
 *   → These will score HIGH priority (hard to catch, the demo centerpiece)
 * 
 * DEMO MODE NOTE:
 * Detections below are deliberately imperfect to demonstrate the verification pass
 * and human prioritization — do not 'fix' them to be fully accurate.
 * It contains intentional false positives and missed PII.
 */

const DetectionProvider = require('./DetectionProvider');
const { PII_TYPES } = require('../schemas/detection');

class MockProvider extends DetectionProvider {
  async detect(documentText) {
    // Return the hardcoded detections regardless of input.
    // Offsets are calibrated against the fixed sample document in sampleDocument.js.
    // Find detections dynamically to support custom uploads
    const rawDetections = [
      // ── Early document, obvious PII, high confidence → should score LOW priority ──
      {
        id: 'det-001',
        text: 'John Smith',
        start: 204,
        end: 214,
        type: PII_TYPES.NAME,
        confidence: 0.97,
      },
      {
        id: 'det-002',
        text: 'EMP-4892',
        start: 229,
        end: 237,
        type: PII_TYPES.ID,
        confidence: 0.95,
      },
      {
        id: 'det-003',
        text: 'john.smith@greenfield-analytics.com',
        start: 381,
        end: 416,
        type: PII_TYPES.EMAIL,
        confidence: 0.98,
      },
      {
        id: 'det-004',
        text: '(503) 555-0147',
        start: 432,
        end: 446,
        type: PII_TYPES.PHONE,
        confidence: 0.96,
      },

      // ── Mid-document, moderate confidence → should score STANDARD priority ──
      {
        id: 'det-005',
        text: 'Maria Chen',
        start: 868,
        end: 878,
        type: PII_TYPES.NAME,
        confidence: 0.88,
      },
      {
        id: 'det-006',
        text: 'David Park',
        start: 1175,
        end: 1185,
        type: PII_TYPES.NAME,
        confidence: 0.85,
      },
      {
        id: 'det-007',
        text: 'dpark@greenfield-analytics.com',
        start: 1211,
        end: 1241,
        type: PII_TYPES.EMAIL,
        confidence: 0.92,
      },
      {
        id: 'det-008',
        text: 'Janet Morrison',
        start: 1265,
        end: 1279,
        type: PII_TYPES.NAME,
        confidence: 0.82,
      },
      {
        id: 'det-009',
        text: 'Roberto Vega',
        start: 1646,
        end: 1658,
        type: PII_TYPES.NAME,
        confidence: 0.80,
      },
      {
        id: 'det-fp-001',
        text: 'Apex Digital Forensics',
        start: 2951,
        end: 2973,
        type: PII_TYPES.NAME, // False Positive: company mistaken as person
        confidence: 0.76,
      },
      {
        id: 'det-010',
        text: 'BDG-7291',
        start: 773,
        end: 781,
        type: PII_TYPES.ID,
        confidence: 0.90,
      },

      // ── Late document, non-canonical formatting, low confidence → should score HIGH ──
      {
        id: 'det-011',
        text: '587 23 4891',
        start: 2620,
        end: 2631,
        type: PII_TYPES.ID,
        confidence: 0.58, // SSN with non-standard spacing — AI unsure
      },
      {
        id: 'det-012',
        text: '5035550193',
        start: 3132,
        end: 3142,
        type: PII_TYPES.PHONE,
        confidence: 0.62, // Phone with no formatting at all
      },
      // INTENTIONAL GAP: 503.555.0184 has been removed here to demonstrate
      // the verification pass (findUndetectedCandidates) catching missed PII.
      {
        id: 'det-014',
        text: '4721 NE Hawthorne Blvd Apt 3B Portland OR 97213',
        start: 3269,
        end: 3316,
        type: PII_TYPES.ADDRESS,
        confidence: 0.72, // Full address, moderate confidence
      },
      {
        id: 'det-015',
        text: 'Linda Zhao',
        start: 3099,
        end: 3109,
        type: PII_TYPES.NAME,
        confidence: 0.65, // Late position, single occurrence
      },
      {
        id: 'det-016',
        text: 'Angela Torres',
        start: 3446,
        end: 3459,
        type: PII_TYPES.NAME,
        confidence: 0.70, // Very late, single occurrence
      },
      {
        id: 'det-new-6',
        text: 'Westbrook Capital',
        start: 1114,
        end: 1131,
        type: PII_TYPES.OTHER,
        confidence: 0.90,
      },
      {
        id: 'det-new-7',
        text: 'https://apex-digital-forensics.com/portal/case-2024',
        start: 3584,
        end: 3635,
        type: PII_TYPES.OTHER,
        confidence: 0.98,
      },
      {
        id: 'det-new-8',
        text: '1900 3rd Ave, Seattle, WA 98101',
        start: 3651,
        end: 3682,
        type: PII_TYPES.ADDRESS,
        confidence: 0.92,
      },
      {
        id: 'det-new-9',
        text: 'Northwest Security Partners',
        start: 3696,
        end: 3723,
        type: PII_TYPES.OTHER,
        confidence: 0.88,
      },
      {
        id: 'det-new-10',
        text: 'PIR-2024-0312',
        start: 3418,
        end: 3431,
        type: PII_TYPES.ID,
        confidence: 0.96,
      },
      {
        id: 'det-new-11',
        text: '192.168.45.201',
        start: 2106,
        end: 2120,
        type: PII_TYPES.OTHER,
        confidence: 0.95,
      },
      {
        id: 'det-mr-1',
        text: 'Mr. Smith',
        start: 0,
        end: 0,
        type: PII_TYPES.NAME,
        confidence: 0.96,
      },
      {
        id: 'det-mr-2',
        text: 'Mr. Smith',
        start: 0,
        end: 0,
        type: PII_TYPES.NAME,
        confidence: 0.93,
      },
      {
        id: 'det-mr-3',
        text: 'Mr. Smith',
        start: 0,
        end: 0,
        type: PII_TYPES.NAME,
        confidence: 0.89,
      },
      {
        id: 'det-ms-1',
        text: 'Ms. Chen',
        start: 0,
        end: 0,
        type: PII_TYPES.NAME,
        confidence: 0.92,
      },
      {
        id: 'det-ms-2',
        text: 'Ms. Morrison',
        start: 0,
        end: 0,
        type: PII_TYPES.NAME,
        confidence: 0.91,
      },
      {
        id: 'det-mr-4',
        text: 'Mr. Vega',
        start: 0,
        end: 0,
        type: PII_TYPES.NAME,
        confidence: 0.90,
      },
      {
        id: 'det-comp-1',
        text: 'Greenfield Analytics, Inc.',
        start: 0,
        end: 0,
        type: PII_TYPES.OTHER,
        confidence: 0.98,
      },

      // ── INTENTIONAL VALIDATION ERRORS — demonstrates validateDetection catching bad data ──
      // These detections have deliberate schema violations so the pipeline's
      // validation pass logs warnings, proving the verification layer works.
      {
        id: 'det-invalid-1',
        text: 'March 15, 2024',       // A date string — not a recognized PII type
        start: 0,
        end: 0,
        type: 'DATE',                 // ← Invalid: not in PII_TYPES enum
        confidence: 0.75,
      },
      {
        id: 'det-invalid-2',
        text: 'HR-412',               // Policy reference number
        start: 0,
        end: 0,
        type: PII_TYPES.ID,
        confidence: 1.5,              // ← Invalid: confidence must be 0.0–1.0
      },
    ];

    const finalDetections = [];
    const occurrences = {};

    for (const det of rawDetections) {
      if (!occurrences[det.text]) occurrences[det.text] = 0;
      
      let searchIndex = 0;
      for (let i = 0; i <= occurrences[det.text]; i++) {
        searchIndex = documentText.indexOf(det.text, searchIndex);
        if (searchIndex !== -1 && i < occurrences[det.text]) {
          searchIndex += det.text.length;
        }
      }

      if (searchIndex !== -1) {
        finalDetections.push({
          ...det,
          start: searchIndex,
          end: searchIndex + det.text.length
        });
        occurrences[det.text]++;
      }
    }

    return finalDetections;
  }
}

module.exports = MockProvider;
