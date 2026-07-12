const fs = require('fs');
const path = require('path');

const patchFiles = [
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\1a03691d-7264-4ddd-b6fc-62df0c2ac8b3\\\\scratch\\\\patch_1a03691d-7264-4ddd-b6fc-62df0c2ac8b3.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\c1d10228-6db4-4e35-bc48-261becba8852\\\\scratch\\\\patch_c1d10228-6db4-4e35-bc48-261becba8852.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\0ed0e846-5af8-4e00-a781-fa66268fbc7d\\\\scratch\\\\patch_0ed0e846-5af8-4e00-a781-fa66268fbc7d.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\35ef662b-3313-4388-b312-89d115161850\\\\scratch\\\\patch_35ef662b-3313-4388-b312-89d115161850.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\8a70319a-0a54-47b9-87f1-8924ec50df3b\\\\scratch\\\\patch_8a70319a-0a54-47b9-87f1-8924ec50df3b.json'
];

const dataPath = 'C:\\\\Users\\\\KOMALPRRET\\\\Desktop\\\\CorpLawUpdates\\\\data\\\\penalty-provisions.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let patchesApplied = 0;

patchFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const patches = JSON.parse(fs.readFileSync(file, 'utf8'));
      patches.forEach(patch => {
        const item = data.find(d => d.section === patch.section || d.id === patch.id || (patch.section && d.section.startsWith(patch.section)));
        if (item && patch.dynamic_variable) {
          item.dynamic_variable = patch.dynamic_variable;
          if (patch.company_custom_multiplier !== undefined) item.company_custom_multiplier = patch.company_custom_multiplier;
          if (patch.company_custom_cap !== undefined) item.company_custom_cap = patch.company_custom_cap;
          if (patch.officer_custom_multiplier !== undefined) item.officer_custom_multiplier = patch.officer_custom_multiplier;
          if (patch.officer_custom_cap !== undefined) item.officer_custom_cap = patch.officer_custom_cap;
          patchesApplied++;
          console.log(`Applied patch to ${item.section}`);
        }
      });
    } catch (e) {
      console.log(`Error parsing ${file}: ${e.message}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Total patches applied: ${patchesApplied}`);
