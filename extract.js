const fs = require('fs');
const text = fs.readFileSync('app/documents/[slug]/page.tsx', 'utf-8');
const startIdx = text.indexOf('const AI_SUGGESTIONS');
const endIdx = text.indexOf('export default function', startIdx);
const substr = text.substring(startIdx, endIdx);

const results = [];
let currentType = null;

const lines = substr.split('\n');
for (const line of lines) {
  const matchType = line.match(/'([^']+)': \[/);
  if (matchType) {
    currentType = matchType[1];
  }
  const matchPrompt = line.match(/label: '([^']+)', prompt: '([^']+)'/);
  if (matchPrompt && currentType) {
    results.push({
      document_type: currentType,
      label: matchPrompt[1],
      prompt: matchPrompt[2]
    });
  }
}

if (!fs.existsSync('scripts')) fs.mkdirSync('scripts');
fs.writeFileSync('scripts/suggestions_parsed.json', JSON.stringify(results, null, 2));
console.log('Saved ' + results.length + ' suggestions to scripts/suggestions_parsed.json');
