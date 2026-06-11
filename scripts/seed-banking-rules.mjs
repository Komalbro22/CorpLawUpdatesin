import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE2_URL;
const supabaseKey = process.env.SUPABASE2_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE2 credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const intentsToSeed = [
  // letter-of-credit
  {
    name: 'LC_WITHOUT_RECOURSE',
    original_label: '+ Add "Without Recourse" clause',
    document_type: 'letter-of-credit',
    description: 'Adds a clause ensuring Issuing Bank has no recourse to the exporter if importer defaults.',
    content: '<li><strong>Without Recourse:</strong> This Letter of Credit is issued "Without Recourse" to the Drawer (Beneficiary). The Issuing Bank shall have no recourse to the Beneficiary in the event of default by the Applicant (Importer).</li>',
    placement_action: 'APPEND',
    placement_anchor: '<h4>2. Terms and Conditions:</h4>'
  },
  {
    name: 'LC_RED_CLAUSE',
    original_label: '+ Add Red Clause',
    document_type: 'letter-of-credit',
    description: 'Adds authority to grant packing credit advance to the beneficiary.',
    content: '<li><strong>Red Clause Advance:</strong> The Advising Bank / Negotiating Bank is authorized to grant pre-shipment/packing credit advances to the Beneficiary up to {{ADVANCE_PERCENTAGE}}% of the Face Value at the responsibility of the Issuing Bank.</li>',
    placement_action: 'APPEND',
    placement_anchor: '<h4>2. Terms and Conditions:</h4>'
  },
  {
    name: 'LC_TRANSFERABLE',
    original_label: '⇄ Convert to Transferable LC',
    document_type: 'letter-of-credit',
    description: 'Allows the beneficiary to transfer the credit to a local supplier.',
    content: 'This Letter of Credit is Transferable. The Beneficiary may request the Advising/Confirming Bank to transfer this credit, in whole or in part, to one or more secondary beneficiaries (local suppliers).',
    placement_action: 'REPLACE',
    placement_anchor: 'This Letter of Credit shall not be discharged by any change'
  },
  {
    name: 'LC_REMOVE_PARTIAL_SHIPMENT',
    original_label: '- Remove partial shipment',
    document_type: 'letter-of-credit',
    description: 'Removes clauses allowing partial shipments or multiple drawings.',
    content: '',
    placement_action: 'REPLACE',
    placement_anchor: '<li>This Letter of Credit (L/C) shall also cover requests against partial payment and/or multiple drawings.</li>'
  },

  // bank-guarantee
  {
    name: 'BG_AUTOMATIC_EXTENSION',
    original_label: '+ Add Automatic Extension Clause',
    document_type: 'bank-guarantee',
    description: 'Automatically extends the validity if not renewed or released 30 days prior.',
    content: '<li><strong>Automatic Extension:</strong> Notwithstanding anything contained herein, if the purchasing entity does not receive a renewal or replacement of this guarantee at least 30 days prior to the Validity Date, the validity of this guarantee shall be automatically extended for a further period of 6 months without any further act or deed.</li>',
    placement_action: 'APPEND',
    placement_anchor: '<strong>Notwithstanding anything contained herein:</strong>'
  },
  {
    name: 'BG_REMOVE_ORIGINAL_RETURN',
    original_label: '- Remove Original Return Condition',
    document_type: 'bank-guarantee',
    description: 'Removes the requirement that original BG must be returned to discharge the bank.',
    content: 'We shall be discharged from all liabilities under this guarantee upon expiry, irrespective of whether the original Bank Guarantee document is returned to us or not.',
    placement_action: 'REPLACE',
    placement_anchor: 'Unless demand for claim under this guarantee is made on us in writing on or before <strong>{{CLAIM_EXPIRY_DATE}}</strong>, we shall be discharged from all liabilities under this guarantee thereafter.'
  },
  {
    name: 'BG_FINANCIAL_GUARANTEE',
    original_label: '⇄ Change to Financial Guarantee',
    document_type: 'bank-guarantee',
    description: 'Replaces performance clauses with financial/payment obligations.',
    content: 'a Contract by issue of Purchase Order No <strong>{{PURCHASE_ORDER_NO}}</strong> dated <strong>{{PURCHASE_ORDER_DATE}}</strong> and the same having been acknowledged by the contractor, for <strong>{{CONTRACT_SUM}}</strong> and the Contractor having agreed to provide a Financial Guarantee for the timely payment and fulfillment of financial obligations equivalent to <strong>{{GUARANTEE_PERCENTAGE}}%</strong> of the said basic value.',
    placement_action: 'REPLACE',
    placement_anchor: 'a Contract by issue of Purchase Order No <strong>{{PURCHASE_ORDER_NO}}</strong> dated <strong>{{PURCHASE_ORDER_DATE}}</strong> and the same having been acknowledged by the contractor, for <strong>{{CONTRACT_SUM}}</strong> and the Contractor having agreed to provide a Contract Performance Guarantee for the faithful performance of the entire Contract equivalent to <strong>{{GUARANTEE_PERCENTAGE}}%</strong> of the said basic value of the aforesaid work under the Purchase Order.'
  }
];

async function seed() {
  console.log("Seeding Rule Engine for Banking Templates...");
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
      .eq('phrase', gen.original_label)
      .single();
      
    if (!existingAlias) {
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
