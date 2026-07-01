import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE2_URL = process.env.SUPABASE2_URL || "https://igglydprjtptmkzvfngg.supabase.co";
const SUPABASE2_KEY = process.env.SUPABASE2_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: 768
      }),
    }
  );
  if (!response.ok) {
    throw new Error('Embedding failed: ' + await response.text());
  }
  const data = await response.json();
  return data.embedding.values;
}

async function main() {
  const generated = JSON.parse(fs.readFileSync('scratch/generated_rules.json', 'utf8'));
  console.log(`Starting to seed ${generated.length} generated intents...`);

  let addedIntents = 0;
  let addedClauses = 0;
  let addedAliases = 0;
  let addedRules = 0;

  for (const gen of generated) {
    console.log(`Seeding: ${gen.name} (${gen.original_label})`);
    
    // 1. Check if intent exists
    let { data: intent } = await supabase.from('intents').select('id').eq('name', gen.name).single();
    let intentId = intent?.id;
    
    if (!intent) {
      // Must include embedding since intents table requires it!
      const intentDesc = gen.description || gen.original_label;
      const embedding = await getEmbedding(intentDesc);
      const { data: newIntent, error } = await supabase
        .from('intents')
        .insert({
          name: gen.name,
          description: intentDesc,
          embedding: embedding
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting intent:', error.message);
        continue;
      }
      intentId = newIntent.id;
      addedIntents++;
    }

    // 2. Insert Alias (using the EXACT prompt)
    const normalized = normalizePrompt(gen.original_prompt);
    // Check if alias exists
    const { data: existingAlias } = await supabase
      .from('intent_aliases')
      .select('id')
      .eq('intent_id', intentId)
      .eq('phrase', normalized)
      .single();
      
    if (!existingAlias) {
      const { error: aliasError } = await supabase
        .from('intent_aliases')
        .insert({
          intent_id: intentId,
          phrase: normalized
        });
      if (!aliasError) addedAliases++;
    }

    // 3. Insert Clause
    const { data: existingClause } = await supabase
      .from('clauses')
      .select('id')
      .eq('content', gen.content)
      .single();

    let clauseId = existingClause?.id;
    
    if (!existingClause) {
      const { data: newClause, error: clauseError } = await supabase
        .from('clauses')
        .insert({
          document_type: gen.document_type,
          category: 'INSERT',
          content: gen.content,
          variables: gen.variables || {},
          placement_rules: {
            action: gen.placement_action || 'APPEND',
            anchor: gen.placement_anchor || '',
            anchor_type: 'REGEX',
            fallback: 'BOTTOM'
          },
          version: 1
        })
        .select()
        .single();
        
      if (clauseError) {
        console.error('Error inserting clause:', clauseError.message);
        continue;
      }
      clauseId = newClause.id;
      addedClauses++;
    }

    // 4. Insert Rule
    const { data: existingRule } = await supabase
      .from('rules')
      .select('id')
      .eq('intent_id', intentId)
      .eq('document_type', gen.document_type)
      .single();

    if (!existingRule && clauseId) {
      const { error: ruleError } = await supabase
        .from('rules')
        .insert({
          intent_id: intentId,
          document_type: gen.document_type,
          clause_id: clauseId
        });
      if (!ruleError) addedRules++;
      else console.error('Rule error:', ruleError);
    }
  }

  console.log(`\nSeed Complete!`);
  console.log(`Added: ${addedIntents} Intents, ${addedAliases} Aliases, ${addedClauses} Clauses, ${addedRules} Rules.`);
}

main().catch(console.error);
