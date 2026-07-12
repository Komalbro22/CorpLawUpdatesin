const fs = require('fs');
const path = require('path');

const patchFiles = [
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\d29f9b98-77f5-43ff-a53f-2f68ab70aca4\\\\scratch\\\\patch_d29f9b98-77f5-43ff-a53f-2f68ab70aca4.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\bd0600e5-bb8e-4732-882a-24d6aa3f9a1c\\\\scratch\\\\patch_bd0600e5-bb8e-4732-882a-24d6aa3f9a1c.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\cf734470-50a4-4bc9-b17b-f3e4cea4740c\\\\scratch\\\\patch_cf734470-50a4-4bc9-b17b-f3e4cea4740c.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\36d2db67-4397-466a-b58b-9a4b43880c4e\\\\scratch\\\\patch_36d2db67-4397-466a-b58b-9a4b43880c4e.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\585b4638-c46a-4e2f-bd3a-e98a91e9064a\\\\scratch\\\\patch_585b4638-c46a-4e2f-bd3a-e98a91e9064a.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\e322102e-f28b-4ba3-b778-4c59c1b62a2d\\\\scratch\\\\patch_e322102e-f28b-4ba3-b778-4c59c1b62a2d.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\03165b88-536f-4023-abf2-3a0a85bb35b5\\\\scratch\\\\patch_03165b88-536f-4023-abf2-3a0a85bb35b5.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\fe978170-c494-4e2a-b959-e72e830035b5\\\\scratch\\\\patch_af8a2599-8c71-4cf0-bf9f-29282e9d8c0d.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\e4cd99c3-262b-4dc9-bb21-c24ca893712e\\\\scratch\\\\patch_e4cd99c3-262b-4dc9-bb21-c24ca893712e.json',
  'C:\\\\Users\\\\KOMALPRRET\\\\.gemini\\\\antigravity\\\\brain\\\\b48a821a-9494-4a3b-857b-b19a0ace2297\\\\scratch\\\\patch_b48a821a-9494-4a3b-857b-b19a0ace2297.json'
];

let allPatches = [];

patchFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const text = fs.readFileSync(file, 'utf8');
      const patches = JSON.parse(text);
      if (Array.isArray(patches)) {
         allPatches = allPatches.concat(patches);
      }
    } catch (e) {
      console.log(`Error parsing ${file}: ${e.message}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

const stagingPath = 'C:\\\\Users\\\\KOMALPRRET\\\\Desktop\\\\CorpLawUpdates\\\\data\\\\staging_patches.json';
fs.writeFileSync(stagingPath, JSON.stringify(allPatches, null, 2));
console.log(`Aggregated ${allPatches.length} patches into staging file.`);
