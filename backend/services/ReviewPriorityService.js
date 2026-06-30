/**
 * ReviewPriorityService — Pure Heuristic Enrichment
 * 
 * This is the brain of the product. The workflow is:
 *   detect → verify (gap detection) → prioritize → hand to the human
 * 
 * It takes raw detections + document text and:
 * 1. Runs a verification pass (gap detection) to find PII candidates the
 *    provider may have missed — phone-number-shaped substrings and repeated
 *    proper nouns with only partial detection coverage.
 * 2. Enriches ALL detections (original + gap-detected) with a priority tier
 *    and human-readable reasons using weighted heuristic rules.
 * 
 * The priority heuristic is designed around ONE core insight:
 * Sam misses items that are easy to overlook, not just ones the AI was unsure about.
 * So we weight non-canonical formatting HEAVIEST (it defeats both AI pattern-matching
 * and human scanning), then late position (reviewer fatigue), then low confidence, etc.
 * 
 * This is a PURE FUNCTION — no side effects, no provider knowledge, no mutation of
 * the Detection objects. Input detections in, enrichments out.
 * 
 * HEURISTIC RULES (see detailed comments in each rule function):
 * 1. Low confidence on sensitive type  → +20  (signal: confidence)
 * 2. Late position in document         → +15  (signal: position)
 * 3. Single occurrence of entity       → +12  (signal: repetition)
 * 4. Dense surrounding text            → +10  (signal: density)
 * 5. Non-canonical formatting          → +25  (signal: pattern)     ← HEAVIEST
 * 6. Consequence-if-missed by type     → +3/+5/+8  (signal: confidence)
 * 
 * Tier thresholds: HIGH ≥ 35, STANDARD 20–34, LOW < 20
 * Max possible score: 20+15+12+10+25+8 = 90
 */

const { PRIORITY_TIERS, DRIVING_SIGNALS, PII_TYPES } = require('../schemas/detection');

// ─── Canonical Format Patterns ─────────────────────────────────────────────────
// These define what "standard" formatting looks like for each type.
// Anything that doesn't match is flagged as non-canonical (Rule 5).

const CANONICAL_PATTERNS = {
  // US phone: (XXX) XXX-XXXX or XXX-XXX-XXXX
  PHONE: [
    /^\(\d{3}\)\s?\d{3}-\d{4}$/,       // (503) 555-0147
    /^\d{3}-\d{3}-\d{4}$/,              // 503-555-0147
    /^\+?1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, // +1 (503) 555-0147
  ],
  // SSN: XXX-XX-XXXX
  ID: [
    /^\d{3}-\d{2}-\d{4}$/,              // 123-45-6789
    /^[A-Z]{2,4}-\d{3,6}$/,             // EMP-4892, BDG-7291
  ],
  // Email: standard format
  EMAIL: [
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,       // any valid-looking email
  ],
};

// ─── Rule Functions ────────────────────────────────────────────────────────────
// Each returns { score: number, reason: string | null }
// reason is null if the rule didn't fire.

/**
 * Rule 1: Low confidence on a sensitive type (NAME, PHONE, ID)
 * Weight: 20
 * 
 * Rationale: When the AI itself is unsure AND the PII type is high-consequence,
 * a human reviewer should pay extra attention. But this alone isn't enough —
 * Sam tends to trust the AI's confidence too much, so we don't make this the
 * heaviest signal.
 */
function ruleConfidenceSensitiveType(detection) {
  const SENSITIVE_TYPES = [PII_TYPES.NAME, PII_TYPES.PHONE, PII_TYPES.ID];
  const CONFIDENCE_THRESHOLD = 0.75;
  const WEIGHT = 20;

  if (SENSITIVE_TYPES.includes(detection.type) && detection.confidence < CONFIDENCE_THRESHOLD) {
    return {
      score: WEIGHT,
      signal: DRIVING_SIGNALS.CONFIDENCE,
      reason: `Low AI confidence (${(detection.confidence * 100).toFixed(0)}%) on a ${detection.type.toLowerCase()} — needs human verification`,
    };
  }
  return { score: 0, signal: null, reason: null };
}

/**
 * Rule 2: Late position in document (last third by character offset)
 * Weight: 15
 * 
 * Rationale: Research shows reviewer attention degrades in the final third of
 * a document. Items here are more likely to be glossed over, especially during
 * time-pressured reviews.
 */
function ruleLatePosition(detection, documentLength) {
  const WEIGHT = 15;
  const LATE_THRESHOLD = 2 / 3;

  const relativePosition = detection.start / documentLength;
  if (relativePosition >= LATE_THRESHOLD) {
    const positionPct = (relativePosition * 100).toFixed(0);
    return {
      score: WEIGHT,
      signal: DRIVING_SIGNALS.POSITION,
      reason: `Appears at ${positionPct}% through the document — reviewer fatigue zone`,
    };
  }
  return { score: 0, signal: null, reason: null };
}

/**
 * Rule 3: Single occurrence of entity text (no repeated mention to cross-check)
 * Weight: 12
 * 
 * Rationale: When a name, number, or ID appears only once, there's no redundancy
 * to catch mistakes. If this one instance is missed, the PII leak is complete.
 * Repeated entities are lower risk because the reviewer has multiple chances.
 */
function ruleSingleOccurrence(detection, allDetections, documentText) {
  const WEIGHT = 12;

  // Count how many times this exact text appears in the document
  const text = detection.text;
  let count = 0;
  let pos = 0;
  while ((pos = documentText.indexOf(text, pos)) !== -1) {
    count++;
    pos += text.length;
  }

  if (count === 1) {
    return {
      score: WEIGHT,
      signal: DRIVING_SIGNALS.REPETITION,
      reason: `Only mention in the document — no second reference to catch if missed`,
    };
  }
  return { score: 0, signal: null, reason: null };
}

/**
 * Rule 4: Dense surrounding text (detection is buried in a long paragraph)
 * Weight: 10
 * 
 * Rationale: PII embedded in a wall of text is harder to spot visually than
 * PII on its own line or in a short paragraph. We check for >200 chars of
 * continuous text without line breaks within ±150 chars of the detection.
 */
function ruleDenseSurrounding(detection, documentText) {
  const WEIGHT = 10;
  const SCAN_RADIUS = 150;
  const DENSITY_THRESHOLD = 200;

  const start = Math.max(0, detection.start - SCAN_RADIUS);
  const end = Math.min(documentText.length, detection.end + SCAN_RADIUS);
  const surrounding = documentText.substring(start, end);

  // Check if there are line breaks (paragraph separators) in the surrounding text
  const lines = surrounding.split(/\n\s*\n/); // double newline = paragraph break
  
  // Find which segment contains our detection
  let charCount = start;
  for (const line of lines) {
    const segStart = charCount;
    const segEnd = charCount + line.length;
    if (detection.start >= segStart && detection.start < segEnd + 2) {
      // This is the paragraph our detection is in
      if (line.length >= DENSITY_THRESHOLD) {
        return {
          score: WEIGHT,
          signal: DRIVING_SIGNALS.DENSITY,
          reason: `Buried in a dense paragraph (${line.length} chars) — easy to skim past`,
        };
      }
      break;
    }
    charCount = segEnd + 2; // +2 for the double newline
  }
  return { score: 0, signal: null, reason: null };
}

/**
 * Rule 5: Non-canonical formatting (phone/ID doesn't match standard patterns)
 * Weight: 25 — HEAVIEST
 * 
 * This is the most important rule and the demo centerpiece.
 * 
 * Rationale: Non-standard formatting defeats BOTH the AI's pattern matching
 * (leading to lower confidence) AND human visual scanning (we look for patterns
 * like "(XXX) XXX-XXXX" and miss "5035550193"). This is the #1 reason Sam
 * misses PII — not because the AI was uncertain, but because neither the AI
 * nor Sam recognize the format as PII at a glance.
 */
function ruleNonCanonicalFormat(detection) {
  const WEIGHT = 25;

  const patterns = CANONICAL_PATTERNS[detection.type];
  if (!patterns) {
    // No canonical patterns defined for this type (NAME, ADDRESS, OTHER)
    return { score: 0, signal: null, reason: null };
  }

  const isCanonical = patterns.some((p) => p.test(detection.text));
  if (!isCanonical) {
    const typeLabels = {
      PHONE: 'phone number',
      ID: 'ID/SSN',
      EMAIL: 'email address',
    };
    const label = typeLabels[detection.type] || detection.type.toLowerCase();
    return {
      score: WEIGHT,
      signal: DRIVING_SIGNALS.PATTERN,
      reason: `Non-standard ${label} format ("${detection.text}") — unusual formatting defeats visual scanning`,
    };
  }
  return { score: 0, signal: null, reason: null };
}

/**
 * Rule 6: Consequence-if-missed — weight by PII type
 * Per-type values (NOT a flat weight):
 *   NAME / PHONE / ID → +8
 *   EMAIL → +5
 *   ADDRESS fragment / OTHER → +3
 * 
 * Rationale: Not all PII leaks are equally harmful. A leaked SSN or phone number
 * is immediately exploitable; a partial address fragment is less so. This adjusts
 * priority based on the real-world harm of a miss.
 */
function ruleConsequenceIfMissed(detection) {
  const CONSEQUENCE_WEIGHTS = {
    [PII_TYPES.NAME]: 8,
    [PII_TYPES.PHONE]: 8,
    [PII_TYPES.ID]: 8,
    [PII_TYPES.EMAIL]: 5,
    [PII_TYPES.ADDRESS]: 3,
    [PII_TYPES.OTHER]: 3,
  };

  const score = CONSEQUENCE_WEIGHTS[detection.type] || 3;
  const severityLabels = {
    8: 'high-severity',
    5: 'moderate-severity',
    3: 'lower-severity',
  };
  const label = severityLabels[score] || 'moderate-severity';

  return {
    score,
    signal: DRIVING_SIGNALS.CONFIDENCE, // grouped with confidence as it's about risk
    reason: `${detection.type} is a ${label} PII type if leaked`,
  };
}

// ─── Gap Detection (Verification Pass) ─────────────────────────────────────────
// Runs BEFORE scoring. Finds PII candidates the provider may have missed.
// This is a deterministic regex/heuristic pass — no LLM call.

/**
 * Regex patterns for phone-number-shaped substrings.
 * Covers a wide range of US phone formats including non-canonical ones.
 */
const PHONE_PATTERNS = [
  // Standard formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX
  /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  // Unformatted 10-digit sequences that aren't part of longer numbers
  /(?<!\d)\d{10}(?!\d)/g,
  // SSN-like: XXX-XX-XXXX or XXX XX XXXX (space-separated)
  /(?<!\d)\d{3}[- ]\d{2}[- ]\d{4}(?!\d)/g,
];

/**
 * Proper-noun pattern: sequences of capitalized words (2+ words).
 * Used to detect repeated names where only some occurrences were flagged.
 */
const PROPER_NOUN_PATTERN = /\b([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})+)\b/g;

/**
 * Gap detection: find PII candidates the provider missed.
 *
 * Strategy:
 * 1. Sweep for phone-number-shaped substrings not already in existingDetections.
 * 2. Find repeated proper-noun-like tokens where only some occurrences are detected.
 * 3. Synthesize new Detection objects with low confidence (0.50) that flow into
 *    the normal scoring pipeline.
 *
 * The `source: "verification"` field is internal only — it's not exposed to the
 * frontend as a separate category. These candidates are scored and displayed
 * identically to provider detections.
 *
 * @param {string} documentText - Full document text
 * @param {Detection[]} existingDetections - Detections already found by the provider
 * @returns {Detection[]} - New candidate detections (may be empty)
 */
function findUndetectedCandidates(documentText, existingDetections) {
  const candidates = [];
  let candidateId = 1;

  // Build a set of already-covered character ranges for quick overlap checks
  const coveredRanges = existingDetections.map(d => ({ start: d.start, end: d.end }));

  function isAlreadyCovered(start, end) {
    return coveredRanges.some(r =>
      // Any overlap counts as covered (not just exact match)
      start < r.end && end > r.start
    );
  }

  function isPlausibleContext(start, end) {
    // Reject matches that are clearly inside URLs, file paths, or code-like strings
    const contextRadius = 30;
    const before = documentText.substring(Math.max(0, start - contextRadius), start);
    const after = documentText.substring(end, Math.min(documentText.length, end + contextRadius));
    const context = before + after;
    // If surrounded by slashes, dots with no spaces, or typical URL chars, skip
    if (/https?:\/\//.test(before) || /\.\d+\.\d+/.test(context)) return false;
    return true;
  }

  // ── Step 1: Phone-number-shaped substrings ──────────────────────────────────
  for (const pattern of PHONE_PATTERNS) {
    // Reset regex state (global flag)
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(documentText)) !== null) {
      const text = match[0];
      const start = match.index;
      const end = start + text.length;

      if (isAlreadyCovered(start, end)) continue;
      if (!isPlausibleContext(start, end)) continue;

      // Determine type: 9-digit pattern → likely SSN/ID, 10-digit → likely phone
      const digitsOnly = text.replace(/\D/g, '');
      let type = PII_TYPES.PHONE;
      if (digitsOnly.length === 9) type = PII_TYPES.ID;

      candidates.push({
        id: `gap-${String(candidateId++).padStart(3, '0')}`,
        text,
        start,
        end,
        type,
        confidence: 0.50,
        source: 'verification', // internal tag, not shown to frontend
      });

      // Mark this range as covered so we don't double-detect
      coveredRanges.push({ start, end });
    }
  }

  // ── Step 2: Repeated proper nouns with partial detection coverage ───────────
  // Find all proper-noun-like sequences in the document
  const nounOccurrences = {}; // { "John Smith": [{ start, end }, ...] }
  PROPER_NOUN_PATTERN.lastIndex = 0;
  let nounMatch;
  while ((nounMatch = PROPER_NOUN_PATTERN.exec(documentText)) !== null) {
    const text = nounMatch[0];
    const start = nounMatch.index;
    const end = start + text.length;

    // Skip very common non-name phrases (section headers, etc.)
    if (/^(Summary of|Recommended Actions|IT Security|Witness Statements)/.test(text)) continue;

    if (!nounOccurrences[text]) nounOccurrences[text] = [];
    nounOccurrences[text].push({ start, end });
  }

  // For each proper noun that appears multiple times, check if only some are detected
  for (const [text, occurrences] of Object.entries(nounOccurrences)) {
    if (occurrences.length < 2) continue; // only care about repeated names

    const detectedCount = occurrences.filter(o => isAlreadyCovered(o.start, o.end)).length;
    const undetectedOccurrences = occurrences.filter(o => !isAlreadyCovered(o.start, o.end));

    // If at least one occurrence IS detected but others are NOT, the gaps are candidates
    if (detectedCount > 0 && undetectedOccurrences.length > 0) {
      for (const occ of undetectedOccurrences) {
        candidates.push({
          id: `gap-${String(candidateId++).padStart(3, '0')}`,
          text,
          start: occ.start,
          end: occ.end,
          type: PII_TYPES.NAME,
          confidence: 0.50,
          source: 'verification',
        });
        coveredRanges.push({ start: occ.start, end: occ.end });
      }
    }
  }

  if (candidates.length > 0) {
    console.log(
      `[ReviewPriorityService] Gap detection found ${candidates.length} additional candidate(s): ` +
      candidates.map(c => `"${c.text}" (${c.type})`).join(', ')
    );
  }

  return candidates;
}

// ─── Main Enrichment Function ──────────────────────────────────────────────────

/**
 * Enrich detections with priority tiers and human-readable reasons.
 * 
 * @param {Detection[]} detections - Raw detections from any provider
 * @param {string} documentText - The full document text
 * @returns {Enrichment[]} - One enrichment per detection
 */
function enrichDetections(detections, documentText) {
  const docLength = documentText.length;

  return detections.map((det) => {
    // Run all 6 rules
    const ruleResults = [
      ruleConfidenceSensitiveType(det),
      ruleLatePosition(det, docLength),
      ruleSingleOccurrence(det, detections, documentText),
      ruleDenseSurrounding(det, documentText),
      ruleNonCanonicalFormat(det),
      ruleConsequenceIfMissed(det),
    ];

    // Sum scores
    const totalScore = ruleResults.reduce((sum, r) => sum + r.score, 0);

    // Collect reasons from rules that fired (non-null reasons)
    const allReasons = ruleResults
      .filter((r) => r.reason !== null)
      .map((r) => ({ reason: r.reason, score: r.score, signal: r.signal }));

    // Sort by score descending to pick the top reasons
    allReasons.sort((a, b) => b.score - a.score);

    // Take 2-4 reasons (always at least the top 2 if available)
    const reasons = allReasons.slice(0, 4).map((r) => r.reason);

    // Ensure at least 2 reasons — pad with a generic one if needed
    while (reasons.length < 2) {
      reasons.push('Flagged for routine review');
    }

    // Determine driving signal (the signal with highest score contribution)
    const drivingSignal = allReasons.length > 0
      ? allReasons[0].signal
      : DRIVING_SIGNALS.CONFIDENCE; // default fallback

    // Map total score to priority tier
    //   HIGH:     ≥ 35
    //   STANDARD: 20–34
    //   LOW:      < 20
    let priorityTier;
    if (totalScore >= 35) {
      priorityTier = PRIORITY_TIERS.HIGH;
    } else if (totalScore >= 20) {
      priorityTier = PRIORITY_TIERS.STANDARD;
    } else {
      priorityTier = PRIORITY_TIERS.LOW;
    }

    return {
      detectionId: det.id,
      priorityTier,
      reasons,
      drivingSignal,
      _score: totalScore, // included for debugging, stripped before client response if desired
    };
  });
}

module.exports = { enrichDetections, findUndetectedCandidates };
