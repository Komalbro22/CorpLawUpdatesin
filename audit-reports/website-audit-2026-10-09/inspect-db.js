const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) {
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[m[1].trim()] = val;
  }
}
const { createClient } = require('@supabase/supabase-js');
const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const key = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const client = createClient(url, key);

async function run() {
  const { data: updates, error } = await client
    .from('updates')
    .select('id, title, slug, category, published_at, source_url')
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching updates:', error.message);
  } else {
    console.log('Recent 10 updates:');
    updates.forEach(u => {
      console.log(`- [${u.category}] ${u.title} (Slug: ${u.slug}) Source: ${u.source_url || 'None'}`);
    });
  }

  // Check total counts
  const { count: updateCount } = await client.from('updates').select('*', { count: 'exact', head: true });
  const { count: glossaryCount } = await client.from('glossary').select('*', { count: 'exact', head: true });
  console.log(`\nTotals: Updates=${updateCount}, Glossary=${glossaryCount}`);
}

run();
