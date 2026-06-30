// Quick offset finder for the sample document — scratch file
const { SAMPLE_DOCUMENT } = require('../backend/data/sampleDocument');

const targets = [
  'John Smith',
  'EMP-4892',
  'john.smith@greenfield-analytics.com',
  '(503) 555-0147',
  'BDG-7291',
  'Maria Chen',
  'dpark@greenfield-analytics.com',
  'David Park',
  'Janet Morrison',
  'Roberto Vega',
  '192.168.45.201',
  '587 23 4891',
  'Linda Zhao',
  '5035550193',
  '503.555.0184',
  '4721 NE Hawthorne Blvd Apt 3B Portland OR 97213',
  'Angela Torres',
];

const docLen = SAMPLE_DOCUMENT.length;
console.log(`Document length: ${docLen} chars\n`);
console.log(`Last third starts at char: ${Math.floor(docLen * 2/3)}\n`);

for (const t of targets) {
  const idx = SAMPLE_DOCUMENT.indexOf(t);
  if (idx === -1) {
    console.log(`NOT FOUND: "${t}"`);
  } else {
    const positionPct = ((idx / docLen) * 100).toFixed(1);
    // Check for second occurrence
    const idx2 = SAMPLE_DOCUMENT.indexOf(t, idx + 1);
    const occurrences = idx2 === -1 ? 1 : '2+';
    console.log(`"${t}" -> start: ${idx}, end: ${idx + t.length}, position: ${positionPct}%, occurrences: ${occurrences}`);
  }
}
