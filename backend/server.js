/**
 * Express Server — SentinelIQ PII Review Priority Tool
 * 
 * Endpoints:
 *   POST /review  — JSON body with documentText (existing)
 *   POST /upload  — multipart/form-data file upload (.txt, .pdf, .docx)
 *   GET  /health   — health check
 * 
 * Both /review and /upload feed into the same pipeline:
 *   detect → verify (gap detection) → prioritize → respond
 * 
 * Provider selection:
 * - If GEMINI_API_KEY is set → CloudLLMProvider (primary) with MockProvider (fallback)
 * - Otherwise → MockProvider only
 */
// Hardcoded for demo purposes as requested by user
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const DetectionService = require('./services/DetectionService');
const { enrichDetections, findUndetectedCandidates } = require('./services/ReviewPriorityService');
const { extractText } = require('./services/DocumentExtractionService');
const { SAMPLE_DOCUMENT } = require('./data/sampleDocument');
const { validateDetection } = require('./schemas/detection');

const PORT = process.env.PORT || 3001;
const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────────

// Enable CORS for frontend (local dev + deployed Vercel URL)
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Set this on Render to your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    // In production, also allow any *.vercel.app origin
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(null, false);
  }
}));
app.use(express.json({ limit: '1mb' }));



// File upload middleware — 5MB cap with friendly error
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    // Also allow by extension as a fallback (some systems send octet-stream)
    const ext = (file.originalname || '').toLowerCase().split('.').pop();
    if (allowed.includes(file.mimetype) || ['txt', 'pdf', 'docx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type "${file.originalname}". SentinelIQ accepts .txt, .pdf, or .docx files.`));
    }
  },
});

// ─── Provider Setup ────────────────────────────────────────────────────────────

let detectionService;

function initializeService() {
  let primaryProvider = null;

  if (process.env.GEMINI_API_KEY) {
    try {
      const CloudLLMProvider = require('./providers/CloudLLMProvider');
      primaryProvider = new CloudLLMProvider(process.env.GEMINI_API_KEY);
      console.log('[Server] CloudLLMProvider configured as primary (Gemini).');
    } catch (err) {
      console.warn(`[Server] Failed to initialize CloudLLMProvider: ${err.message}`);
      console.warn('[Server] Falling back to MockProvider only.');
    }
  } else {
    console.log('[Server] No GEMINI_API_KEY found. Using MockProvider only.');
  }

  detectionService = new DetectionService(primaryProvider);
}

// ─── Shared Pipeline ───────────────────────────────────────────────────────────

/**
 * Run the full detection → verification → enrichment pipeline on a document.
 * Returns the response payload shape consumed by the frontend.
 */
async function runPipeline(documentText, forceDemo = false) {
  console.log(`[Pipeline] Processing document (${documentText.length} chars, demo=${forceDemo})...`);

  // Step 1: Get detections from provider (with fallback or demo bypass)
  const { detections: providerDetections, fallbackOccurred } = await detectionService.detect(documentText, forceDemo);
  console.log(`[Pipeline] Provider returned ${providerDetections.length} detections.`);

  // Validate provider detections — collect warnings for the client
  const validationWarnings = [];
  for (const det of providerDetections) {
    const result = validateDetection(det);
    if (!result.valid) {
      const warning = `Detection ${det.id} ("${det.text}"): ${result.errors.join(', ')}`;
      console.warn(`[Pipeline] Validation warning: ${warning}`);
      validationWarnings.push({ detectionId: det.id, errors: result.errors });
    }
  }
  if (validationWarnings.length > 0) {
    console.log(`[Pipeline] ${validationWarnings.length} detection(s) failed schema validation (logged as warnings).`);
  }

  // Step 2: Verification pass — gap detection for missed candidates
  const gapCandidates = findUndetectedCandidates(documentText, providerDetections);
  const allDetections = [...providerDetections, ...gapCandidates];
  if (gapCandidates.length > 0) {
    console.log(`[Pipeline] Gap detection added ${gapCandidates.length} candidate(s). Total: ${allDetections.length}`);
  }

  // Step 3: Enrich ALL detections with priority tiers
  const enrichments = enrichDetections(allDetections, documentText);
  console.log(
    `[Pipeline] Enriched: ${enrichments.filter(e => e.priorityTier === 'HIGH').length} HIGH, ` +
    `${enrichments.filter(e => e.priorityTier === 'STANDARD').length} STANDARD, ` +
    `${enrichments.filter(e => e.priorityTier === 'LOW').length} LOW`
  );

  // Strip internal fields before sending to client
  const clientEnrichments = enrichments.map(({ _score, ...rest }) => rest);
  const clientDetections = allDetections; // Preserve source property

  return {
    detections: clientDetections,
    enrichments: clientEnrichments,
    documentText,
    fallbackOccurred,
    validationWarnings,
  };
}

// ─── API Routes ────────────────────────────────────────────────────────────────

/**
 * POST /review
 * 
 * JSON body: { documentText?: string }
 * 
 * INTENTIONAL: If documentText is empty or missing, the built-in sample document
 * is used. This is a documented contract relied upon by the frontend's
 * "Load Sample Document" button, which sends an empty string to trigger it.
 */
app.post('/review', async (req, res) => {
  try {
    const documentText = (req.body && req.body.documentText && req.body.documentText.trim())
      ? req.body.documentText.trim()
      : SAMPLE_DOCUMENT;  // ← Intentional fallback to sample document when empty

    const forceDemo = req.body && req.body.forceMode === 'demo';

    const result = await runPipeline(documentText, forceDemo);
    res.json(result);
  } catch (err) {
    console.error(`[/review] Unexpected error: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * POST /upload
 * 
 * Multipart form: single file field "document" (.txt, .pdf, .docx)
 * Extracts text, then runs the same pipeline as POST /review.
 * 
 * Response shape on success:
 *   { detections, enrichments, documentText, fileName }
 * 
 * Response shape on extraction failure:
 *   { success: false, error: "..." }
 */
app.post('/upload', (req, res) => {
  // Handle multer errors (file too large, wrong type) gracefully
  upload.single('document')(req, res, async (multerErr) => {
    if (multerErr) {
      // Multer-specific error handling
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. SentinelIQ accepts files up to 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        error: multerErr.message || 'File upload failed.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file was uploaded. Please select a .txt, .pdf, or .docx file.',
      });
    }

    try {
      const fileName = req.file.originalname || 'uploaded-file';
      console.log(`[/upload] Received file: "${fileName}" (${(req.file.size / 1024).toFixed(1)} KB)`);

      // Extract text from the uploaded file
      const extraction = await extractText(req.file.buffer, fileName);

      if (!extraction.success) {
        console.log(`[/upload] Extraction failed for "${fileName}": ${extraction.error}`);
        return res.status(400).json({
          success: false,
          error: extraction.error,
        });
      }

      console.log(`[/upload] Extracted ${extraction.text.length} chars from "${fileName}"`);

      // We read forceMode from the body alongside the file
      const forceDemo = req.body && req.body.forceMode === 'demo';

      // Run through the same pipeline as /review
      const result = await runPipeline(extraction.text, forceDemo);
      res.json({ ...result, fileName });
    } catch (err) {
      console.error(`[/upload] Unexpected error: ${err.message}`);
      console.error(err.stack);
      res.status(500).json({ error: err.message || 'Internal server error during file processing.' });
    }
  });
});

/**
 * GET /health — simple health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



// ─── Start ─────────────────────────────────────────────────────────────────────

initializeService();

app.listen(PORT, () => {
  console.log(`\n🛡️  SentinelIQ running at http://localhost:${PORT}\n`);
});

module.exports = app; // for testing
