import { createClient } from '@supabase/supabase-js';

const SUPABASE2_URL = 'https://igglydprjtptmkzvfngg.supabase.co';
const SUPABASE2_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZ2x5ZHByanRwdG1renZmbmdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA2MjQwOSwiZXhwIjoyMDk1NjM4NDA5fQ.Gk1XM4Ss90UBJsjuK5zyTtSYLW8urCcDDqaJmJOnmw0';
const GEMINI_API_KEY = 'AIzaSyB3fQA0uaf-Vq7a97sm-q985wfLBiZ6o3E';

const supabase = createClient(SUPABASE2_URL, SUPABASE2_KEY);

function normalizePrompt(prompt) {
  return prompt
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .replace(/\b(please|the|a|an|could|you|insert|add|put|show|make|in|for|to|into|section)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getEmbedding(text) {
  // Correct model name as used in lib/gemini.ts!
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: 768
    })
  });

  if (!response.ok) {
    throw new Error('Gemini embedding failed: ' + await response.text());
  }

  const data = await response.json();
  return data.embedding.values;
}

async function main() {
  const prompt = 'Add a clause specifying the authorized signatories can operate up to their designated transaction limits: single signatory up to ₹50,000, joint signatories above ₹50,000';
  const normalized = normalizePrompt(prompt);

  const { data: intent } = await supabase.from('intents').select('id').eq('name', 'ADD_JOINT_SIGNING_LIMIT').single();
  if (!intent) { console.log('Intent not found'); return; }

  try {
    const embedding = await getEmbedding(normalized);
    
    // Check if alias already exists
    const { data: existingAlias } = await supabase.from('intent_aliases').select('id').eq('phrase', normalized).single();
    if (existingAlias) {
      console.log('Alias already exists!');
      // Update embedding
      await supabase.from('intent_aliases').update({ embedding }).eq('id', existingAlias.id);
      console.log('Updated embedding for existing alias!');
      return;
    }

    const { error } = await supabase.from('intent_aliases').insert({
      intent_id: intent.id,
      phrase: normalized,
      embedding
    });

    if (error) {
       console.error('Error:', error);
    } else {
       console.log('Alias added successfully with embedding!');
    }
  } catch(e) {
    console.error(e);
  }
}
main().catch(console.error);
