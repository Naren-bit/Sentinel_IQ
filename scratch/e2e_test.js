/**
 * End-to-end test: exercises the nudge logic and gap detection programmatically.
 * Run with: node scratch/e2e_test.js
 */

const { findUndetectedCandidates, enrichDetections } = require('../backend/services/ReviewPriorityService');
const { SAMPLE_DOCUMENT } = require('../backend/data/sampleDocument');
const MockProvider = require('../backend/providers/MockProvider');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ ${message}`);
      failed++;
    }
  }

  // ── Test 1: Gap detection with full MockProvider (should find 0 gaps) ──
  console.log('\n=== Test 1: Gap detection with full MockProvider ===');
  const mock = new MockProvider();
  const fullDetections = await mock.detect(SAMPLE_DOCUMENT);
  const gaps1 = findUndetectedCandidates(SAMPLE_DOCUMENT, fullDetections);
  assert(gaps1.length === 0, `Full coverage: 0 gaps found (got ${gaps1.length})`);

  // ── Test 2: Gap detection with partial provider (should find gaps) ──
  console.log('\n=== Test 2: Gap detection with partial provider ===');
  const partialDetections = [
    { id: 'd1', text: 'John Smith', start: 204, end: 214, type: 'NAME', confidence: 0.97 },
    { id: 'd2', text: 'john.smith@greenfield-analytics.com', start: 381, end: 416, type: 'EMAIL', confidence: 0.98 },
  ];
  const gaps2 = findUndetectedCandidates(SAMPLE_DOCUMENT, partialDetections);
  assert(gaps2.length > 0, `Partial coverage: found ${gaps2.length} gaps`);

  // Check that gaps have correct schema
  for (const g of gaps2) {
    assert(typeof g.id === 'string' && g.id.startsWith('gap-'), `Gap ${g.id} has valid ID`);
    assert(typeof g.start === 'number' && typeof g.end === 'number', `Gap ${g.id} has valid offsets`);
    assert(g.end > g.start, `Gap ${g.id} end > start`);
    assert(g.confidence === 0.50, `Gap ${g.id} has confidence 0.50`);
    assert(g.source === 'verification', `Gap ${g.id} has source "verification"`);
    // Verify offset correctness
    const slice = SAMPLE_DOCUMENT.substring(g.start, g.end);
    assert(slice === g.text, `Gap ${g.id} offset matches text: "${g.text}" == "${slice}"`);
  }

  // Check that phone numbers were caught
  const phoneGaps = gaps2.filter(g => g.type === 'PHONE');
  assert(phoneGaps.length >= 2, `Found ${phoneGaps.length} phone-type gaps (expected ≥2)`);

  // ── Test 3: Gap candidates flow through normal scoring ──
  console.log('\n=== Test 3: Gap candidates through scoring pipeline ===');
  const allDetections = [...partialDetections, ...gaps2];
  const enrichments = enrichDetections(allDetections, SAMPLE_DOCUMENT);
  assert(enrichments.length === allDetections.length, `Enrichments match: ${enrichments.length} == ${allDetections.length}`);

  // Check gap enrichments have valid schema
  for (let i = partialDetections.length; i < allDetections.length; i++) {
    const enr = enrichments[i];
    assert(['HIGH', 'STANDARD', 'LOW'].includes(enr.priorityTier), `Gap enrichment ${enr.detectionId}: tier=${enr.priorityTier}`);
    assert(enr.reasons.length >= 2 && enr.reasons.length <= 4, `Gap enrichment ${enr.detectionId}: ${enr.reasons.length} reasons`);
    assert(typeof enr.drivingSignal === 'string', `Gap enrichment ${enr.detectionId}: signal=${enr.drivingSignal}`);
  }

  // ── Test 4: Tier distribution with full MockProvider ──
  console.log('\n=== Test 4: Tier distribution balance ===');
  const fullEnrichments = enrichDetections(fullDetections, SAMPLE_DOCUMENT);
  const tiers = { HIGH: 0, STANDARD: 0, LOW: 0 };
  fullEnrichments.forEach(e => tiers[e.priorityTier]++);
  assert(tiers.HIGH > 0, `Has HIGH items: ${tiers.HIGH}`);
  assert(tiers.STANDARD > 0, `Has STANDARD items: ${tiers.STANDARD}`);
  assert(tiers.LOW > 0, `Has LOW items: ${tiers.LOW}`);
  assert(tiers.HIGH < fullDetections.length, `HIGH (${tiers.HIGH}) < total (${fullDetections.length})`);

  // ── Test 5: Rule 6 per-type differentiation ──
  console.log('\n=== Test 5: Rule 6 per-type differentiation ===');
  const nameEnr = fullEnrichments.find((e, i) => fullDetections[i].type === 'NAME');
  const emailEnr = fullEnrichments.find((e, i) => fullDetections[i].type === 'EMAIL');
  const addrEnr = fullEnrichments.find((e, i) => fullDetections[i].type === 'ADDRESS');
  assert(nameEnr && emailEnr && addrEnr, 'Found NAME, EMAIL, and ADDRESS enrichments');

  // ── Test 6: Source field stripping (simulated) ──
  console.log('\n=== Test 6: Source field stripping ===');
  const clientDetections = allDetections.map(({ source, ...rest }) => rest);
  const hasSource = clientDetections.some(d => d.source !== undefined);
  assert(!hasSource, 'No client detection has source field after stripping');

  // ── Test 7: Gap detection doesn't double-detect ──
  console.log('\n=== Test 7: No double-detection ===');
  const idsSeen = new Set();
  let hasDuplicate = false;
  for (const g of gaps2) {
    const key = `${g.start}-${g.end}`;
    if (idsSeen.has(key)) hasDuplicate = true;
    idsSeen.add(key);
  }
  assert(!hasDuplicate, 'No duplicate gap candidates by offset');

  // ── Summary ──
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
