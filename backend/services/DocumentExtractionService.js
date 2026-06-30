/**
 * DocumentExtractionService
 * 
 * Extracts plaintext from uploaded files.
 * Supports: .txt, .pdf (via pdf-parse), .docx (via mammoth).
 * 
 * Contract: extractText() NEVER throws. On failure it returns
 * { text: '', success: false, error: '...' } with a user-friendly message.
 * Library stack traces are logged server-side but never leaked to the client.
 */

const MAX_EXTRACTED_LENGTH = 500_000; // ~500KB of text, more than enough

/**
 * Extract plaintext from a file buffer.
 * 
 * @param {Buffer} fileBuffer - The raw file bytes
 * @param {string} originalName - Original filename (used for extension detection)
 * @returns {Promise<{ text: string, success: boolean, error?: string }>}
 */
async function extractText(fileBuffer, originalName) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      return { text: '', success: false, error: 'Uploaded file is empty.' };
    }

    const ext = (originalName || '').toLowerCase().split('.').pop();

    switch (ext) {
      case 'txt':
        return extractTxt(fileBuffer);
      case 'pdf':
        return await extractPdf(fileBuffer);
      case 'docx':
        return await extractDocx(fileBuffer);
      default:
        return {
          text: '',
          success: false,
          error: `Unsupported file type ".${ext}". SentinelIQ accepts .txt, .pdf, or .docx files.`,
        };
    }
  } catch (err) {
    // Catch-all: log the real error server-side, return a generic message to client
    console.error(`[DocumentExtractionService] Unexpected error extracting "${originalName}":`, err.message);
    return {
      text: '',
      success: false,
      error: 'Failed to read the uploaded file. It may be corrupted or in an unsupported format.',
    };
  }
}

// ─── Format-specific extractors ─────────────────────────────────────────────

function extractTxt(buffer) {
  const text = buffer.toString('utf-8').trim();
  if (!text) {
    return { text: '', success: false, error: 'The uploaded .txt file is empty.' };
  }
  if (text.length > MAX_EXTRACTED_LENGTH) {
    return {
      text: '',
      success: false,
      error: `File too large: extracted ${(text.length / 1000).toFixed(0)}KB of text (limit: ${(MAX_EXTRACTED_LENGTH / 1000).toFixed(0)}KB).`,
    };
  }
  return { text, success: true };
}

async function extractPdf(buffer) {
  try {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    const text = (result.text || '').trim();

    if (!text) {
      return {
        text: '',
        success: false,
        error: 'Could not extract text from this PDF. It may be a scanned document (image-only) — SentinelIQ requires text-based PDFs.',
      };
    }
    if (text.length > MAX_EXTRACTED_LENGTH) {
      return {
        text: '',
        success: false,
        error: `PDF too large: extracted ${(text.length / 1000).toFixed(0)}KB of text (limit: ${(MAX_EXTRACTED_LENGTH / 1000).toFixed(0)}KB).`,
      };
    }
    return { text, success: true };
  } catch (err) {
    console.error('[DocumentExtractionService] pdf-parse error:', err.message);
    return {
      text: '',
      success: false,
      error: 'Failed to parse this PDF. The file may be corrupted, password-protected, or in an unsupported PDF format.',
    };
  }
}

async function extractDocx(buffer) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();

    if (!text) {
      return {
        text: '',
        success: false,
        error: 'Could not extract text from this .docx file. The document appears to be empty.',
      };
    }
    if (text.length > MAX_EXTRACTED_LENGTH) {
      return {
        text: '',
        success: false,
        error: `.docx too large: extracted ${(text.length / 1000).toFixed(0)}KB of text (limit: ${(MAX_EXTRACTED_LENGTH / 1000).toFixed(0)}KB).`,
      };
    }
    return { text, success: true };
  } catch (err) {
    console.error('[DocumentExtractionService] mammoth error:', err.message);
    return {
      text: '',
      success: false,
      error: 'Failed to parse this .docx file. The file may be corrupted or not a valid Word document.',
    };
  }
}

module.exports = { extractText };
