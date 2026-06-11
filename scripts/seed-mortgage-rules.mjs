import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE2_URL;
const supabaseKey = process.env.SUPABASE2_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE2 credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const intentsToSeed = [
  // simple-mortgage-deed
  {
    name: 'SM_ADD_PENAL_INTEREST',
    original_label: '+ Add Penal Interest Clause',
    document_type: 'simple-mortgage-deed',
    description: 'Adds a clause specifying penal interest for delayed payments.',
    content: '<p style="text-align: justify; margin-bottom: 15px;"><strong>AND IT IS FURTHER AGREED</strong> that in the event of default in payment of the principal or interest on the due dates, the Mortgagor shall be liable to pay penal interest at the rate of 2% per month on the defaulted amount until it is fully paid.</p>',
    placement_action: 'APPEND',
    placement_anchor: '<strong>AND IT IS FURTHER AGREED THAT</strong> the mortgagor can grant lease of the said house with the consent of the mortgagee in writing.</p>'
  },
  
  // mortgage-conditional-sale
  {
    name: 'MCS_EXTEND_REPAYMENT',
    original_label: '⇄ Extend Repayment Period',
    document_type: 'mortgage-conditional-sale',
    description: 'Extends the repayment period before the sale becomes absolute.',
    content: 'And it is hereby agreed and declared that if the Vendor shall at any time hereafter repay to the Purchaser the said sum of Rs <strong>{{LOAN_AMOUNT}}</strong> within an extended period of <strong>{{EXTENDED_YEARS}}</strong> years that is on or before the <strong>{{EXTENDED_DATE}}</strong> the grant and transfer of the said property as hereinbefore provided shall become void and in that event the Purchaser shall retransfer the said property to the Vendor or his heirs, executors, administrators or assigns by executing a document of re-sale.',
    placement_action: 'REPLACE',
    placement_anchor: 'And it is hereby agreed and declared that if the Vendor shall at any time hereafter repay to the Purchaser the said sum of Rs {{LOAN_AMOUNT}} within a period of <strong>{{REPAYMENT_YEARS}}</strong> years that is on or before the <strong>{{REPAYMENT_DATE}}</strong> the grant and transfer of the said property as hereinbefore provided shall become void'
  },

  // english-mortgage-deed
  {
    name: 'EM_ADD_RIGHT_TO_LEASE',
    original_label: '+ Add Right to Lease Clause',
    document_type: 'english-mortgage-deed',
    description: 'Adds a right for the mortgagor to lease the property.',
    content: '<li style="margin-bottom: 15px;"><strong>Right to Lease:</strong> The Mortgagor shall have the right to lease the mortgaged property or any part thereof, provided that prior written consent of the Mortgagee is obtained, which consent shall not be unreasonably withheld.</li>',
    placement_action: 'APPEND',
    placement_anchor: 'after giving three months\' notice in writing to the Mortgagor.</li>'
  },

  // usufructuary-mortgage-deed
  {
    name: 'UM_SPECIFY_REPAIR_LIMITS',
    original_label: '+ Specify Repair Limits',
    document_type: 'usufructuary-mortgage-deed',
    description: 'Limits the amount the mortgagee can spend on repairs.',
    content: '<li style="margin-bottom: 15px;">The Mortgagee\'s authority to incur expenses towards the routine maintenance and repair of the property shall be capped at Rs. 50,000/- (Rupees Fifty Thousand Only) per annum. Any expenses beyond this limit require the prior written approval of the Mortgagor.</li>',
    placement_action: 'APPEND',
    placement_anchor: 'manage the property prudently as a person of ordinary prudence would manage his own property.</li>'
  },

  // equitable-mortgage-deed (MODT)
  {
    name: 'MODT_ADD_JOINT_LIABILITY',
    original_label: '+ Add Joint Liability Clause',
    document_type: 'equitable-mortgage-deed',
    description: 'Makes all co-owners jointly and severally liable.',
    content: '<li style="margin-bottom: 15px;">In the event the scheduled property is owned by multiple persons, all such co-owners executing this Memorandum shall be jointly and severally liable for the repayment of the entire loan facility and all associated costs.</li>',
    placement_action: 'APPEND',
    placement_anchor: 'The Lender is authorized to retain the deposited title deeds until the entire outstanding dues of the loan are fully paid and satisfied by the Mortgagor.</li>'
  }
];

async function seed() {
  console.log("Seeding Rule Engine for Mortgage Templates...");
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
