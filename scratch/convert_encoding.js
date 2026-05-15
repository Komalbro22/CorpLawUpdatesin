const fs = require('fs');

const file = 'c:\\Users\\KOMALPRRET\\Desktop\\CorpLawUpdates\\types\\supabase.ts';
const content = fs.readFileSync(file, 'utf16le');
fs.writeFileSync(file, content, 'utf8');

console.log('Converted types/supabase.ts to UTF-8');
