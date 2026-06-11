import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = "AIzaSyB3fQA0uaf-Vq7a97sm-q985wfLBiZ6o3E";
const SUPABASE2_URL = "https://igglydprjtptmkzvfngg.supabase.co";
const SUPABASE2_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZ2x5ZHByanRwdG1renZmbmdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA2MjQwOSwiZXhwIjoyMDk1NjM4NDA5fQ.Gk1XM4Ss90UBJsjuK5zyTtSYLW8urCcDDqaJmJOnmw0";

const supabase = createClient(SUPABASE2_URL, SUPABASE2_KEY);

function normalizePrompt(prompt) {
  return prompt
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .replace(/\b(please|the|a|an|could|you|insert|add|put|show|make|in|for|to|into|section)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function callGemini(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error('Gemini API Error: ' + err);
  }
  
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

async function main() {
  const suggestions = JSON.parse(fs.readFileSync('scripts/suggestions_parsed.json', 'utf8'));
  console.log(`Loaded ${suggestions.length} suggestions.`);
  
  // We'll skip "_default" and generate them as "GENERAL" type
  const BATCH_SIZE = 10;
  const allIntents = [];
  
  for (let i = 0; i < suggestions.length; i += BATCH_SIZE) {
    const batch = suggestions.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(suggestions.length / BATCH_SIZE)}...`);
    
    const promptText = `
You are a legal template engineer. I have a list of quick edit suggestions for legal documents.
For each suggestion, generate a deterministic Rule Engine Intent.

The input is an array of objects:
${JSON.stringify(batch, null, 2)}

For each object, output a matching intent object in this exact JSON array format:
[
  {
    "document_type": "The original document_type from input. If '_default', use 'GENERAL'.",
    "name": "ADD_SOMETHING_SPECIFIC",
    "description": "Short description of what the clause does",
    "content": "The actual legal clause text. IMPORTANT: Replace any names, amounts, cities, dates, or specific conditions in the user prompt with {{variable_name}} placeholders.",
    "variables": { "variable_name": "STRING or NUMBER or DATE or CITY or CURRENCY" },
    "placement_action": "INSERT_AFTER" or "APPEND" or "REPLACE",
    "placement_anchor": "The word or heading to insert after (e.g., 'TERMINATION', 'RESOLVED THAT'). Leave empty if APPEND."
  }
]

CRITICAL RULES:
1. Ensure the output is a valid JSON array of objects.
2. The order of the output array MUST exactly match the order of the input array.
3. Replace ANY dynamic values (like ₹50,000, 11-month, 30 days) from the user prompt with {{variable_name}} placeholders in the content, and declare them in 'variables'. This makes the rule robust if the user changes the number.
4. Maintain formal Indian legal language in 'content'.
    `;
    
    try {
      const generated = await callGemini(promptText);
      
      if (Array.isArray(generated)) {
        for (let j = 0; j < batch.length; j++) {
          const gen = generated[j] || generated[0]; // fallback if mismatched length
          
          allIntents.push({
            original_prompt: batch[j].prompt,
            original_label: batch[j].label,
            ...gen
          });
        }
      }
    } catch (err) {
      console.error(`Error in batch ${i}:`, err.message);
      // fallback just push empty
    }
  }
  
  fs.writeFileSync('scripts/generated_intents.json', JSON.stringify(allIntents, null, 2));
  console.log(`Generated ${allIntents.length} intents and saved to scripts/generated_intents.json.`);
}

main().catch(console.error);
