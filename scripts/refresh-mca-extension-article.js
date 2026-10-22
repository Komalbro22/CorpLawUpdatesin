const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function updateArticle() {
  const targetSlug = 'mca-annual-filing-no-extension-fy-2025-26';
  console.log(`Checking article: ${targetSlug}...`);

  const { data: current, error: fetchErr } = await supabase
    .from('updates')
    .select('*')
    .eq('slug', targetSlug)
    .single();

  if (fetchErr || !current) {
    console.error('Fetch error:', fetchErr);
    process.exit(1);
  }

  const updatedContentPath = 'C:/Users/KOMALPRRET/.gemini/antigravity/brain/2e4196a8-9ae9-488f-b620-5bc1a8b5106b/scratch/updated_content.html';
  const updatedContent = fs.readFileSync(updatedContentPath, 'utf8');
  const readingTime = calculateReadingTime(updatedContent);
  const now = new Date().toISOString();

  const updatePayload = {
    content: updatedContent,
    last_verified: '2026-10-22',
    reading_time: readingTime,
    updated_at: now
  };

  console.log('Applying update to Supabase updates table...');
  const { data: updated, error: updateErr } = await supabase
    .from('updates')
    .update(updatePayload)
    .eq('id', current.id)
    .select('id, slug, title, category, last_verified, reading_time, updated_at')
    .single();

  if (updateErr) {
    console.error('Update failed:', updateErr);
    process.exit(1);
  }

  console.log('Update successful:', updated);

  // Re-fetch to verify persistence
  const { data: verified, error: verifyErr } = await supabase
    .from('updates')
    .select('id, slug, title, summary, last_verified, reading_time, updated_at, content')
    .eq('id', current.id)
    .single();

  if (verifyErr || !verified) {
    console.error('Verification fetch failed:', verifyErr);
    process.exit(1);
  }

  console.log('Verified persisted data:');
  console.log('- ID:', verified.id);
  console.log('- Slug:', verified.slug);
  console.log('- Title:', verified.title);
  console.log('- Last Verified:', verified.last_verified);
  console.log('- Reading Time:', verified.reading_time);
  console.log('- Updated At:', verified.updated_at);
  console.log('- Content Length:', verified.content.length);
}

updateArticle();
