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
  const { data: update, error } = await client
    .from('updates')
    .select('id, title, slug, category, published_at, source_url, content, summary')
    .eq('slug', 'rbi-repo-rate-hike-5-50-percent-october-2026')
    .single();

  if (error) {
    console.error('Error fetching update:', error.message);
  } else {
    console.log('Title:', update.title);
    console.log('Published at:', update.published_at);
    console.log('Source URL:', update.source_url);
    console.log('Summary:', update.summary);
    console.log('Content preview (first 1000 chars):\n', update.content ? update.content.slice(0, 1000) : 'No content');
  }
}

run();
