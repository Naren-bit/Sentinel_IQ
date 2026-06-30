/**
 * DetectionService — Provider Orchestration with Fallback
 * 
 * Calls the configured primary provider with a timeout.
 * On ANY failure (timeout, error, quota, auth, invalid key, missing key),
 * silently falls back to MockProvider. Logs fallback server-side only.
 * NEVER exposes provider identity to the client.
 */

const MockProvider = require('../providers/MockProvider');

const TIMEOUT_MS = 120000; // 60-second timeout for cloud provider

class DetectionService {
  /**
   * @param {DetectionProvider|null} primaryProvider - Cloud provider (or null to use mock only)
   */
  constructor(primaryProvider = null) {
    this._primary = primaryProvider;
    this._fallback = new MockProvider();
  }

  /**
   * Run detection using the configured providers.
   * Uses the primary provider (e.g. CloudLLM) if available. If it fails or isn't
   * configured, it automatically falls back to the MockProvider.
   * 
   * @param {string} documentText - The text to analyze
   * @param {boolean} forceDemo - If true, bypasses the primary provider directly to MockProvider
   * @returns {Promise<Detection[]>} - List of identified PII entities
   */
  async detect(documentText, forceDemo = false) {
    // If no primary provider configured, go straight to fallback
    if (!this._primary || forceDemo) {
      if (forceDemo) {
        console.log('[DetectionService] forceDemo=true. Bypassing primary provider directly to MockProvider.');
      } else {
        console.log('[DetectionService] No primary provider configured, using fallback.');
      }
      return { detections: await this._fallback.detect(documentText), fallbackOccurred: !this._primary && !forceDemo };
    }

    try {
      // Race the primary provider against a timeout
      const result = await Promise.race([
        this._primary.detect(documentText),
        this._createTimeout(),
      ]);

      // If timeout won, result is the TIMEOUT_SENTINEL
      if (result === TIMEOUT_SENTINEL) {
        console.warn(
          `[DetectionService] Primary provider (${this._primary.providerName}) timed out after ${TIMEOUT_MS}ms. Falling back.`
        );
        return { detections: await this._fallback.detect(documentText), fallbackOccurred: true };
      }

      // Validate we got an array back
      if (!Array.isArray(result)) {
        console.warn(
          `[DetectionService] Primary provider returned non-array. Falling back.`
        );
        return { detections: await this._fallback.detect(documentText), fallbackOccurred: true };
      }

      console.log(
        `[DetectionService] Primary provider (${this._primary.providerName}) returned ${result.length} detections.`
      );
      return { detections: result, fallbackOccurred: false };
    } catch (err) {
      // Catch ALL errors: network, quota, auth, parse failures, etc.
      console.warn(
        `[DetectionService] Primary provider (${this._primary.providerName}) failed: ${err.message}. Falling back.`
      );
      return { detections: await this._fallback.detect(documentText), fallbackOccurred: true };
    }
  }

  /**
   * Creates a promise that resolves to a sentinel value after TIMEOUT_MS.
   * We use a sentinel instead of rejecting so we can distinguish timeout from error.
   */
  _createTimeout() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(TIMEOUT_SENTINEL), TIMEOUT_MS);
    });
  }
}

/** Sentinel value to identify timeout (not exported, internal only) */
const TIMEOUT_SENTINEL = Symbol('TIMEOUT');

module.exports = DetectionService;
