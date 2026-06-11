import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = "AIzaSyB3fQA0uaf-Vq7a97sm-q985wfLBiZ6o3E";

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function callGemini(promptText, retries = 5) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
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
      if (response.status === 503 || response.status === 429) {
        console.log(`Rate limited/503 on attempt ${attempt}, waiting ${attempt * 5}s...`);
        await sleep(attempt * 5000);
        continue;
      }
      throw new Error('Gemini API Error: ' + err);
    }
    
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  }
  throw new Error('Failed after ' + retries + ' retries');
}

async function main() {
  const suggestions = JSON.parse(fs.readFileSync('scripts/suggestions_parsed.json', 'utf8'));
  console.log(`Loaded ${suggestions.length} suggestions.`);
  
  const allIntents = [];
  
  for (let i = 0; i < suggestions.length; i++) {
    const sug = suggestions[i];
    console.log(`Processing ${i + 1}/${suggestions.length}: ${sug.label}`);
    
    const promptText = `
You are a legal template engineer. I have a quick edit suggestion for a legal document.
Document Type: ${sug.document_type}
Quick Edit Label: ${sug.label}
Quick Edit Prompt: ${sug.prompt}

Generate a deterministic Rule Engine Intent for this suggestion.
Output a JSON object in this exact format:
{
  "document_type": "${sug.document_type === '_default' ? 'GENERAL' : sug.document_type}",
  "name": "ADD_SOMETHING_SPECIFIC",
  "description": "Short description of what the clause does",
  "content": "The actual legal clause text in highly formal Indian legal language. IMPORTANT: Replace any names, amounts (like ₹50,000), cities, dates, limits, or specific conditions mentioned in the prompt with {{variable_name}} placeholders.",
  "variables": { "variable_name": "STRING or NUMBER or DATE or CITY or CURRENCY" },
  "placement_action": "INSERT_AFTER" or "APPEND",
  "placement_anchor": "The word or heading to insert after (e.g., 'TERMINATION', 'RESOLVED THAT'). Leave empty if APPEND."
}

CRITICAL RULES:
1. Ensure the output is a valid JSON object.
2. Replace ANY dynamic values (like ₹50,000, 11-month, 30 days) from the user prompt with {{variable_name}} placeholders in the content, and declare them in 'variables'.
3. Maintain formal Indian legal language in 'content'.
    `;
    
    try {
      const generated = await callGemini(promptText);
      allIntents.push({
        original_prompt: sug.prompt,
        original_label: sug.label,
        ...generated
      });
      fs.writeFileSync('scripts/generated_intents_partial.json', JSON.stringify(allIntents, null, 2));
      await sleep(2000); // 2 second delay between successful calls to avoid quota issues
    } catch (err) {
      console.error(`Error on ${sug.label}:`, err.message);
    }
  }
  
  fs.writeFileSync('scripts/generated_intents.json', JSON.stringify(allIntents, null, 2));
  console.log(`Generated ${allIntents.length} intents successfully.`);
}

main().catch(console.error);
