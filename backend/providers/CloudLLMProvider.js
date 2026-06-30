/**
 * CloudLLMProvider — Google Gemini API Integration
 * 
 * Sends document text to Gemini and asks it to detect PII in the exact
 * Detection schema format. Validates the response rigorously, especially
 * character offsets (LLMs are unreliable about offsets).
 * 
 * If the API key is invalid, the request times out, or the response is
 * malformed, this provider THROWS — DetectionService handles fallback.
 */

const DetectionProvider = require('./DetectionProvider');
const { PII_TYPES, validateDetection, validateOffsets } = require('../schemas/detection');

class CloudLLMProvider extends DetectionProvider {
  /**
   * @param {string} apiKey - Google Gemini API key
   */
  constructor(apiKey) {
    super();
    this._apiKey = apiKey;
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is empty or missing');
    }
  }

  /**
   * Detect PII using Google Gemini API.
   * @param {string} documentText
   * @returns {Promise<Detection[]>}
   */
  async detect(documentText) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(this._apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = this._buildPrompt(documentText);
    
    console.log('[CloudLLMProvider] Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('[CloudLLMProvider] Received response, parsing...');

    // Parse the JSON response
    const detections = this._parseResponse(text, documentText);
    
    console.log(`[CloudLLMProvider] Parsed ${detections.length} valid detections.`);
    return detections;
  }

  /**
   * Build the prompt that asks Gemini to detect PII in the exact schema format.
   */
  _buildPrompt(documentText) {
    return `You are a PII (Personally Identifiable Information) detection system. Analyze the following document and identify ALL instances of PII.

For each PII item found, return a JSON object with EXACTLY these fields:
- "id": a unique string identifier (e.g., "det-001", "det-002", etc.)
- "text": the exact text of the PII as it appears in the document (character-perfect match)
- "start": the character offset (0-indexed) where the PII text begins in the document
- "end": the character offset (0-indexed, exclusive) where the PII text ends in the document
- "type": one of "NAME", "PHONE", "EMAIL", "ADDRESS", "ID", "OTHER"
- "confidence": a number between 0.0 and 1.0 representing your confidence that this is actual PII

CRITICAL RULES:
1. The "text" field MUST be the EXACT substring of the document at position [start, end).
2. The "start" and "end" offsets MUST be accurate character positions in the document.
3. document.substring(start, end) MUST equal the "text" field exactly.
4. Include names, phone numbers, email addresses, physical addresses, ID numbers (SSN, employee IDs, badge numbers), and any other personally identifiable information.
5. For confidence: use higher values (0.85-0.99) for clearly formatted PII, lower values (0.50-0.75) for ambiguous or non-standard formats.

Return ONLY a JSON array of detection objects. No markdown formatting, no code fences, no explanation — just the raw JSON array.

DOCUMENT:
${documentText}`;
  }

  /**
   * Parse and validate the Gemini response.
   * LLMs are unreliable about character offsets, so we validate and attempt repair.
   */
  _parseResponse(responseText, documentText) {
    // Strip potential markdown code fences
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      throw new Error(`Failed to parse Gemini response as JSON: ${err.message}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Gemini response is not a JSON array');
    }

    // Validate each detection and attempt offset repair
    const validDetections = [];
    let idCounter = 1;

    for (const raw of parsed) {
      // Ensure required fields exist
      if (!raw.text || typeof raw.text !== 'string') continue;
      
      // Normalize type
      const type = this._normalizeType(raw.type);
      if (!type) continue;

      // Attempt to repair offsets — LLMs frequently get these wrong
      const { start, end } = this._repairOffsets(raw, documentText);
      
      if (start === -1) {
        // Text not found in document at all — skip this detection
        console.warn(
          `[CloudLLMProvider] Skipping detection: text "${raw.text}" not found in document.`
        );
        continue;
      }

      const detection = {
        id: raw.id || `cloud-det-${String(idCounter++).padStart(3, '0')}`,
        text: documentText.substring(start, end), // Use the actual document text
        start,
        end,
        type,
        confidence: this._clampConfidence(raw.confidence),
      };

      // Final validation
      const result = validateDetection(detection);
      if (result.valid) {
        const offsetResult = validateOffsets(detection, documentText);
        if (offsetResult.valid) {
          validDetections.push(detection);
        } else {
          console.warn(`[CloudLLMProvider] Offset validation failed for "${raw.text}": ${offsetResult.errors.join(', ')}`);
        }
      } else {
        console.warn(`[CloudLLMProvider] Detection validation failed: ${result.errors.join(', ')}`);
      }
    }

    if (validDetections.length === 0) {
      throw new Error('No valid detections after parsing and validation');
    }

    return validDetections;
  }

  /**
   * Attempt to repair character offsets by searching for the text in the document.
   * LLMs frequently return incorrect offsets even when the text is correct.
   */
  _repairOffsets(raw, documentText) {
    const text = raw.text;
    
    // First: check if the provided offsets are correct
    if (typeof raw.start === 'number' && typeof raw.end === 'number') {
      const slice = documentText.substring(raw.start, raw.end);
      if (slice === text) {
        return { start: raw.start, end: raw.end };
      }
    }

    // Offsets are wrong — search for the text in the document
    const idx = documentText.indexOf(text);
    if (idx !== -1) {
      return { start: idx, end: idx + text.length };
    }

    // Try case-insensitive search as last resort
    const lowerDoc = documentText.toLowerCase();
    const lowerText = text.toLowerCase();
    const lowerIdx = lowerDoc.indexOf(lowerText);
    if (lowerIdx !== -1) {
      // Use the actual document casing
      return { start: lowerIdx, end: lowerIdx + text.length };
    }

    return { start: -1, end: -1 };
  }

  /**
   * Normalize PII type to one of the allowed values.
   */
  _normalizeType(type) {
    if (!type || typeof type !== 'string') return null;
    const normalized = type.toUpperCase().trim();
    
    // Direct match
    if (Object.values(PII_TYPES).includes(normalized)) return normalized;
    
    // Common aliases
    const aliases = {
      'PERSON': PII_TYPES.NAME,
      'PERSON_NAME': PII_TYPES.NAME,
      'FULL_NAME': PII_TYPES.NAME,
      'PHONE_NUMBER': PII_TYPES.PHONE,
      'TELEPHONE': PII_TYPES.PHONE,
      'EMAIL_ADDRESS': PII_TYPES.EMAIL,
      'STREET_ADDRESS': PII_TYPES.ADDRESS,
      'LOCATION': PII_TYPES.ADDRESS,
      'SSN': PII_TYPES.ID,
      'SOCIAL_SECURITY': PII_TYPES.ID,
      'EMPLOYEE_ID': PII_TYPES.ID,
      'BADGE_NUMBER': PII_TYPES.ID,
      'IP_ADDRESS': PII_TYPES.OTHER,
    };
    
    return aliases[normalized] || PII_TYPES.OTHER;
  }

  /**
   * Clamp confidence to [0.0, 1.0] range.
   */
  _clampConfidence(confidence) {
    if (typeof confidence !== 'number' || isNaN(confidence)) return 0.5;
    return Math.max(0, Math.min(1, confidence));
  }
}

module.exports = CloudLLMProvider;
