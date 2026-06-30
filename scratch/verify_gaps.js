// Test gap detection with a simulated scenario where the provider MISSES something
const { findUndetectedCandidates } = require('../backend/services/ReviewPriorityService');
const { SAMPLE_DOCUMENT } = require('../backend/data/sampleDocument');

// Simulate: provider only detected the FIRST occurrence of "Mr. Smith" patterns
// but missed a phone number and a repeated name
const partialDetections = [
  { id: 'det-001', text: 'John Smith', start: 204, end: 214, type: 'NAME', confidence: 0.97 },
  // Deliberately NOT including: (503) 555-0147, 5035550193, etc.
  // to see if gap detection catches them
  { id: 'det-003', text: 'john.smith@greenfield-analytics.com', start: 381, end: 416, type: 'EMAIL', confidence: 0.98 },
];

console.log('=== Simulated partial detection (only 2 detections) ===\n');
const gaps = findUndetectedCandidates(SAMPLE_DOCUMENT, partialDetections);
console.log(`\nGap detection found ${gaps.length} candidate(s):`);
for (const g of gaps) {
  console.log(`  [${g.type}] "${g.text}" at ${g.start}-${g.end} (conf: ${g.confidence})`);
}

// Check that "Mr. Smith" repeated name detection works
console.log('\n=== Proper noun occurrences in doc ===');
const pattern = /\b([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})+)\b/g;
const nouns = {};
let m;
while ((m = pattern.exec(SAMPLE_DOCUMENT)) !== null) {
  const t = m[0];
  if (/^(Summary of|Recommended Actions|IT Security|Witness Statements)/.test(t)) continue;
  if (!nouns[t]) nouns[t] = [];
  nouns[t].push(m.index);
}
for (const [text, positions] of Object.entries(nouns)) {
  if (positions.length >= 2) {
    console.log(`  "${text}" appears ${positions.length}x at positions: ${positions.join(', ')}`);
  }
}
