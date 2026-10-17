const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('Fetching compliance entries with 15,000...');
  const { data: entries, error: fetchErr } = await supabase
    .from('compliance_entries')
    .select('id, form_name, compliance_title, applicable_to')
    .ilike('applicable_to', '%15,000%');

  if (fetchErr) {
    console.error('Error fetching entries:', fetchErr);
    process.exit(1);
  }

  console.log(`Found ${entries.length} entries to update.`);

  for (const entry of entries) {
    const updatedApplicableTo = entry.applicable_to.replace(/₹15,000\/month/g, '₹25,000/month').replace(/15,000/g, '25,000');
    console.log(`Updating ${entry.id} (${entry.compliance_title}):`);
    console.log(`  OLD: ${entry.applicable_to}`);
    console.log(`  NEW: ${updatedApplicableTo}`);

    const { error: updateErr } = await supabase
      .from('compliance_entries')
      .update({
        applicable_to: updatedApplicableTo,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id);

    if (updateErr) {
      console.error(`Failed to update ${entry.id}:`, updateErr);
    }
  }

  // Verification
  const { data: remaining } = await supabase
    .from('compliance_entries')
    .select('id, applicable_to')
    .ilike('applicable_to', '%15,000%');

  console.log('Remaining entries with 15,000:', remaining ? remaining.length : 0);
}

run();
