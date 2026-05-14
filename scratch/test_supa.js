const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const decodedSlug = 'sebi-derivatives-market-reforms-consultation-paper-2026';
  const { data: update, error } = await supabase
    .from('updates')
    .select('title, summary, category, published_at, updated_at, tags, slug, seo_title, seo_description, image_url')
    .ilike('slug', decodedSlug)
    .single();

  console.log('Update:', update);
  console.log('Error:', error);
}

test();
