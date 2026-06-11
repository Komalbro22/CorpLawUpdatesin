import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE2_URL;
const supabaseKey = process.env.SUPABASE2_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE2 credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const intentsToSeed = [
  // public-notice-financial-results
  {
    name: 'CONVERT_TO_CONSOLIDATED_RESULTS',
    original_label: '↕ Convert to Consolidated Results',
    document_type: 'public-notice-financial-results',
    description: 'Convert this notice from Standalone to Consolidated unaudited financial results',
    content: 'EXTRACT OF CONSOLIDATED UNAUDITED FINANCIAL RESULTS FOR THE QUARTER AND NINE MONTHS ENDED {{QUARTER_END_DATE}}',
    placement_action: 'REPLACE',
    placement_anchor: 'EXTRACT OF STANDALONE UNAUDITED FINANCIAL RESULTS'
  },
  {
    name: 'ADD_EXCEPTIONAL_ITEMS_NOTE',
    original_label: '+ Add exceptional items note',
    document_type: 'public-notice-financial-results',
    description: 'Add a note explaining the exceptional items included in the net profit calculation',
    content: '*Exceptional Items: Net Profit includes an exceptional gain/loss of ₹ {{EXCEPTIONAL_AMOUNT}} due to {{EXCEPTIONAL_REASON}}.',
    placement_action: 'APPEND',
    placement_anchor: 'Note:'
  },
  {
    name: 'ADD_PREVIOUS_YEAR_COMPARISON',
    original_label: '+ Add previous year comparison',
    document_type: 'public-notice-financial-results',
    description: 'Add a column showing the audited figures for the previous full financial year',
    content: '<th style="padding: 8px; text-align: center;">PREVIOUS AUDITED YEAR ENDED {{PREVIOUS_AUDITED_YEAR}}</th>',
    placement_action: 'APPEND',
    placement_anchor: '<th style="padding: 8px; text-align: center;">YEAR ENDED</th>'
  },
  // public-notice-trading-member-expulsion
  {
    name: 'ADD_INVESTOR_GRIEVANCE_EMAIL',
    original_label: '+ Add investor grievance email',
    document_type: 'public-notice-trading-member-expulsion',
    description: 'Add a specific email address (e.g., ig@exchange.com) for investors to send their queries',
    content: 'For any Investor Grievances or specific claim-related queries, please email us directly at {{INVESTOR_GRIEVANCE_EMAIL}}.',
    placement_action: 'APPEND',
    placement_anchor: 'In case of any queries you may contact us on'
  },
  {
    name: 'EXTEND_CLAIM_PERIOD_6_MONTHS',
    original_label: '↕ Extend claim period to 6 months',
    document_type: 'public-notice-trading-member-expulsion',
    description: 'Modify the claim lodgment period from 3 months to 6 months from the date of this notice',
    content: 'within 6 months from the date of this notice.',
    placement_action: 'REPLACE',
    placement_anchor: 'within 3 months from the date of this notice.'
  },
  {
    name: 'ADD_SEBI_CIRCULAR_REFERENCE',
    original_label: '+ Add reference to SEBI circular',
    document_type: 'public-notice-trading-member-expulsion',
    description: 'Add a reference to the specific SEBI circular governing the maximum compensation limit from the Investor Protection Fund',
    content: '(As per SEBI Circular No. SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2023/71 dated May 19, 2023 or any latest applicable circular)',
    placement_action: 'APPEND',
    placement_anchor: 'maximum compensation limit per investor is ₹ {{MAX_COMPENSATION}} lakhs out of the Investor Protection Fund.'
  }
];

async function seed() {
  console.log("Seeding Rule Engine for Public Notices...");
  for (const gen of intentsToSeed) {
    console.log(`Seeding: ${gen.name} (${gen.original_label})`);

    // 1. Insert Intent
    const { data: existingIntent } = await supabase
      .from('intents')
      .select('id')
      .eq('name', gen.name)
      .single();

    let intentId = existingIntent?.id;
    
    if (!existingIntent) {
      const mockEmbedding = Array(768).fill(0.01);
      const { data: newIntent, error: intentError } = await supabase
        .from('intents')
        .insert({ name: gen.name, description: gen.description, embedding: mockEmbedding })
        .select()
        .single();
      if (intentError) {
        console.error('Error inserting intent:', intentError.message);
        continue;
      }
      intentId = newIntent.id;
    }

    // 2. Insert Alias
    const { data: existingAlias } = await supabase
      .from('intent_aliases')
      .select('id')
      .eq('intent_id', intentId)
      .eq('alias', gen.original_label)
      .single();
      
    if (!existingAlias) {
      // Mock embedding since we don't need real vector search for explicit quick edit clicks
      const mockEmbedding = Array(768).fill(0.01);
      
      const { error: aliasError } = await supabase
        .from('intent_aliases')
        .insert({
          intent_id: intentId,
          phrase: gen.original_label
        });
      if (aliasError) console.error('Alias error:', aliasError);
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
          variables: {},
          placement_rules: {
            action: gen.placement_action,
            anchor: gen.placement_anchor,
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
      if (ruleError) console.error('Rule error:', ruleError);
    }
  }
  console.log("Done seeding Rule Engine.");
}

seed();
