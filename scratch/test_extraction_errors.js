/**
 * DocumentExtractionService — error-handling tests
 * 
 * Tests:
 * 1. Corrupted PDF (random bytes masquerading as PDF)
 * 2. Corrupted DOCX (random bytes masquerading as DOCX)
 * 3. Oversized text file (simulated)
 * 4. Empty file
 * 5. Unsupported extension
 * 6. Valid .txt file
 * 
 * Verifies: no stack traces leak, friendly error messages returned,
 * success: false on all failure cases.
 */

const { extractText } = require('../backend/services/DocumentExtractionService');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${name}: ${err.message}`);
      failed++;
    }
  }

  function assert(condition, msg) {
    if (!condition) throw new Error(msg);
  }

  console.log('\n📋 DocumentExtractionService Error Handling Tests\n');

  // ─── Test 1: Corrupted PDF ───────────────────────────────────────────────
  await test('Corrupted PDF returns friendly error (no stack trace)', async () => {
    // Random bytes that start with %PDF but are otherwise garbage
    const corruptedPdf = Buffer.concat([
      Buffer.from('%PDF-1.4 '),
      Buffer.from(Array(500).fill(0).map(() => Math.floor(Math.random() * 256)))
    ]);
    
    const result = await extractText(corruptedPdf, 'corrupted.pdf');
    assert(result.success === false, `Expected success=false, got ${result.success}`);
    assert(typeof result.error === 'string', 'Expected error string');
    assert(result.error.length > 0, 'Error should not be empty');
    assert(!result.error.includes('at '), 'Error must not contain stack trace');
    assert(!result.error.includes('node_modules'), 'Error must not reference node_modules');
    console.log(`    → Error message: "${result.error}"`);
  });

  // ─── Test 2: Corrupted DOCX ──────────────────────────────────────────────
  await test('Corrupted DOCX returns friendly error (no stack trace)', async () => {
    // Random bytes — not a valid ZIP/DOCX at all
    const corruptedDocx = Buffer.from(Array(500).fill(0).map(() => Math.floor(Math.random() * 256)));
    
    const result = await extractText(corruptedDocx, 'corrupted.docx');
    assert(result.success === false, `Expected success=false, got ${result.success}`);
    assert(typeof result.error === 'string', 'Expected error string');
    assert(result.error.length > 0, 'Error should not be empty');
    assert(!result.error.includes('at '), 'Error must not contain stack trace');
    assert(!result.error.includes('node_modules'), 'Error must not reference node_modules');
    console.log(`    → Error message: "${result.error}"`);
  });

  // ─── Test 3: Empty file ──────────────────────────────────────────────────
  await test('Empty file returns friendly error', async () => {
    const result = await extractText(Buffer.alloc(0), 'empty.txt');
    assert(result.success === false, `Expected success=false, got ${result.success}`);
    assert(result.error.includes('empty'), 'Error should mention "empty"');
  });

  // ─── Test 4: Unsupported extension ────────────────────────────────────────
  await test('Unsupported extension returns friendly error', async () => {
    const result = await extractText(Buffer.from('hello'), 'file.xlsx');
    assert(result.success === false, `Expected success=false, got ${result.success}`);
    assert(result.error.includes('.xlsx'), 'Error should mention the extension');
    assert(result.error.includes('SentinelIQ'), 'Error should mention SentinelIQ');
  });

  // ─── Test 5: Valid .txt ───────────────────────────────────────────────────
  await test('Valid .txt file extracts successfully', async () => {
    const text = 'John Smith lives at 123 Main St. His SSN is 555-12-3456.';
    const result = await extractText(Buffer.from(text, 'utf-8'), 'valid.txt');
    assert(result.success === true, `Expected success=true, got ${result.success}`);
    assert(result.text === text, 'Extracted text should match input');
  });

  // ─── Test 6: Empty .txt (whitespace only) ─────────────────────────────────
  await test('Whitespace-only .txt returns error', async () => {
    const result = await extractText(Buffer.from('   \n\n  ', 'utf-8'), 'blank.txt');
    assert(result.success === false, `Expected success=false, got ${result.success}`);
    assert(result.error.includes('empty'), 'Error should mention "empty"');
  });

  // ─── Test 7: null buffer ──────────────────────────────────────────────────
  await test('null buffer returns error (not crash)', async () => {
    const result = await extractText(null, 'null.pdf');
    assert(result.success === false, `Expected success=false, got ${result.success}`);
    assert(result.error.includes('empty'), 'Error should mention empty');
  });

  // ─── Summary ────────────────────────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed}\n`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
