const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

supabase.from('updates').select('content').ilike('slug', 'sebi-derivatives-market-reforms-consultation-paper-2026').single().then(x => {
  const update = x.data;
  let extractedImageUrl = null;
  if (update.content) {
    const imgMatch = update.content.match(/<img[^>]+src=["']([^"']+)["']/i) || update.content.match(/!\[.*?\]\((.*?)\)/i);
    if (imgMatch && imgMatch[1]) {
      extractedImageUrl = imgMatch[1];
    }
  }
  console.log('Extracted:', extractedImageUrl);
}).catch(console.error);
