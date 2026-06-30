/**
 * DetectionProvider — Abstract Interface
 * 
 * All PII detection providers (Cloud LLM, Mock, etc.) must extend this class
 * and implement the detect() method. The method must return an array of
 * Detection objects conforming to the shared schema.
 * 
 * Provider identity is NEVER exposed to the client.
 */
class DetectionProvider {
  /**
   * @param {string} documentText - The full document text to scan for PII.
   * @returns {Promise<Detection[]>} - Array of Detection objects.
   * @throws {Error} - If detection fails (caller handles fallback).
   */
  async detect(documentText) {
    throw new Error(
      `DetectionProvider.detect() must be implemented by ${this.constructor.name}`
    );
  }

  /** Human-readable name for server-side logging only. */
  get providerName() {
    return this.constructor.name;
  }
}

module.exports = DetectionProvider;
