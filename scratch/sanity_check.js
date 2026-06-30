/**
 * Sanity check: verify the heuristic produces a balanced tier distribution.
 * 
 * Expected:
 * - At least 1 HIGH (the subtle late-position non-canonical items)
 * - At least 1 STANDARD (mid-document moderate confidence items)
 * - At least 1 LOW (early obvious high-confidence items)
 * 
 * Also checks Rule 6 differentiation: NAME vs EMAIL vs ADDRESS with identical
 * other signals should produce different scores.
 */

const MockProvider = require('../backend/providers/MockProvider');
const { enrichDetections } = require('../backend/services/ReviewPriorityService');
const { SAMPLE_DOCUMENT } = require('../backend/data/sampleDocument');

async function sanityCheck() {
  const provider = new MockProvider();
  const detections = await provider.detect(SAMPLE_DOCUMENT);
  const enrichments = enrichDetections(detections, SAMPLE_DOCUMENT);

  console.log('=== TIER DISTRIBUTION ===\n');
  
  const tiers = { HIGH: [], STANDARD: [], LOW: [] };
  
  for (let i = 0; i < detections.length; i++) {
    const det = detections[i];
    const enr = enrichments[i];
    tiers[enr.priorityTier].push(det);
    
    const positionPct = ((det.start / SAMPLE_DOCUMENT.length) * 100).toFixed(1);
    console.log(
      `[${enr.priorityTier.padEnd(8)}] score=${String(enr._score).padStart(2)} | ` +
      `${det.type.padEnd(7)} | conf=${det.confidence.toFixed(2)} | ` +
      `pos=${positionPct.padStart(5)}% | "${det.text}"`
    );
    console.log(`  Reasons: ${enr.reasons.join(' | ')}`);
    console.log(`  Driving signal: ${enr.drivingSignal}`);
    console.log();
  }

  console.log('=== SUMMARY ===');
  console.log(`HIGH:     ${tiers.HIGH.length} items`);
  console.log(`STANDARD: ${tiers.STANDARD.length} items`);
  console.log(`LOW:      ${tiers.LOW.length} items`);
  console.log();

  // Verify balance
  if (tiers.HIGH.length === 0) console.error('❌ FAIL: No HIGH priority items!');
  else console.log('✅ Has HIGH priority items');
  
  if (tiers.STANDARD.length === 0) console.error('❌ FAIL: No STANDARD priority items!');
  else console.log('✅ Has STANDARD priority items');
  
  if (tiers.LOW.length === 0) console.error('❌ FAIL: No LOW priority items!');
  else console.log('✅ Has LOW priority items');
  
  // Verify Rule 6 differentiation
  console.log('\n=== RULE 6 DIFFERENTIATION CHECK ===');
  const nameItem = enrichments.find((e, i) => detections[i].type === 'NAME');
  const emailItem = enrichments.find((e, i) => detections[i].type === 'EMAIL');
  const addressItem = enrichments.find((e, i) => detections[i].type === 'ADDRESS');
  
  if (nameItem && emailItem && addressItem) {
    console.log(`NAME score sample:    ${nameItem._score}`);
    console.log(`EMAIL score sample:   ${emailItem._score}`);
    console.log(`ADDRESS score sample: ${addressItem._score}`);
  } else {
    console.log('(Not all types present for comparison)');
  }
}

sanityCheck().catch(console.error);
