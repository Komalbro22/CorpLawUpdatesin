const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const matchUrl = line.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)$/);
    const matchKey = line.match(/^\s*NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)$/);
    if (matchUrl) supabaseUrl = matchUrl[1].replace(/['"]/g, '').trim();
    if (matchKey) supabaseAnonKey = matchKey[1].replace(/['"]/g, '').trim();
  });
} catch (e) {
  console.error('Failed to read .env.local:', e);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('compliance_entries')
    .select('id, regulator, form_name, compliance_title, due_date')
    .order('regulator');

  if (error) {
    console.error('Error fetching compliance_entries:', error);
  } else {
    console.log('Total entries:', data.length);
    console.log('Entries list:', JSON.stringify(data, null, 2));
  }
}

run();
