/**
 * Shared Detection & Enrichment Schemas
 * 
 * These schemas define the contract between providers, services, and the frontend.
 * Both CloudLLMProvider and MockProvider MUST return Detection objects in this exact shape.
 * ReviewPriorityService produces Enrichment objects that NEVER mutate the Detection.
 */

// ─── Type Enums ────────────────────────────────────────────────────────────────

const PII_TYPES = Object.freeze({
  NAME: 'NAME',
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  ADDRESS: 'ADDRESS',
  ID: 'ID',
  OTHER: 'OTHER',
});

const PRIORITY_TIERS = Object.freeze({
  HIGH: 'HIGH',
  STANDARD: 'STANDARD',
  LOW: 'LOW',
});

const DRIVING_SIGNALS = Object.freeze({
  POSITION: 'position',
  PATTERN: 'pattern',
  CONFIDENCE: 'confidence',
  REPETITION: 'repetition',
  DENSITY: 'density',
});

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates a single Detection object.
 * Returns { valid: true } or { valid: false, errors: string[] }.
 */
function validateDetection(det) {
  const errors = [];

  if (typeof det.id !== 'string' || det.id.length === 0) {
    errors.push('id must be a non-empty string');
  }
  if (typeof det.text !== 'string' || det.text.length === 0) {
    errors.push('text must be a non-empty string');
  }
  if (typeof det.start !== 'number' || !Number.isInteger(det.start) || det.start < 0) {
    errors.push('start must be a non-negative integer');
  }
  if (typeof det.end !== 'number' || !Number.isInteger(det.end) || det.end < 0) {
    errors.push('end must be a non-negative integer');
  }
  if (typeof det.start === 'number' && typeof det.end === 'number' && det.end <= det.start) {
    errors.push('end must be greater than start');
  }
  if (!Object.values(PII_TYPES).includes(det.type)) {
    errors.push(`type must be one of: ${Object.values(PII_TYPES).join(', ')}`);
  }
  if (typeof det.confidence !== 'number' || det.confidence < 0 || det.confidence > 1) {
    errors.push('confidence must be a number between 0.0 and 1.0');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validates a single Enrichment object.
 */
function validateEnrichment(enr) {
  const errors = [];

  if (typeof enr.detectionId !== 'string' || enr.detectionId.length === 0) {
    errors.push('detectionId must be a non-empty string');
  }
  if (!Object.values(PRIORITY_TIERS).includes(enr.priorityTier)) {
    errors.push(`priorityTier must be one of: ${Object.values(PRIORITY_TIERS).join(', ')}`);
  }
  if (!Array.isArray(enr.reasons) || enr.reasons.length < 2 || enr.reasons.length > 4) {
    errors.push('reasons must be an array of 2-4 strings');
  }
  if (!Object.values(DRIVING_SIGNALS).includes(enr.drivingSignal)) {
    errors.push(`drivingSignal must be one of: ${Object.values(DRIVING_SIGNALS).join(', ')}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validates that a detection's text matches the document at [start, end).
 */
function validateOffsets(det, documentText) {
  if (!documentText) return { valid: true }; // skip if no document context
  const slice = documentText.substring(det.start, det.end);
  if (slice !== det.text) {
    return {
      valid: false,
      errors: [`Offset mismatch: text="${det.text}" but document[${det.start}:${det.end}]="${slice}"`],
    };
  }
  return { valid: true };
}

module.exports = {
  PII_TYPES,
  PRIORITY_TIERS,
  DRIVING_SIGNALS,
  validateDetection,
  validateEnrichment,
  validateOffsets,
};
