import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { submitUrlsToGoogleIndexing, pingGoogleWebSub } from '../lib/google-indexing';
import { submitToIndexNow } from '../lib/indexnow';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const TARGET_SLUG = 'mca-annual-filing-no-extension-fy-2025-26';
const TARGET_URL = `https://www.corplawupdates.in/updates/${TARGET_SLUG}`;

async function run() {
  console.log(`\n========================================`);
  console.log(`1. Fetching current article from Supabase: ${TARGET_SLUG}`);
  console.log(`========================================`);

  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/updates?slug=eq.${TARGET_SLUG}`, {
    headers: {
      apikey: supabaseKey!,
      Authorization: `Bearer ${supabaseKey!}`,
    },
  });

  if (!fetchRes.ok) {
    console.error('Failed to fetch article:', fetchRes.status, await fetchRes.text());
    process.exit(1);
  }

  const articles = await fetchRes.json();
  if (!articles.length) {
    console.error('No article found for slug:', TARGET_SLUG);
    process.exit(1);
  }

  const article = articles[0];
  console.log(`Found article: ID ${article.id}`);
  console.log(`Current last_verified: ${article.last_verified}`);
  console.log(`Current updated_at:    ${article.updated_at}`);

  // Create local backup
  const backupPath = path.join(__dirname, '..', 'scratch', 'article_backup_pre_24oct.json');
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(article, null, 2), 'utf8');
  console.log(`Backup saved to ${backupPath}`);

  let content = article.content;

  console.log(`\n========================================`);
  console.log(`2. Applying replacements in content`);
  console.log(`========================================`);

  // Count existing instances before replace
  const pre22October = (content.match(/22\s+October\s+2026/g) || []).length;
  const pre22Oct = (content.match(/22\s+Oct\s+2026/g) || []).length;
  const pre7Days = (content.match(/\b7\s+days\s+left\b/g) || []).length;
  const pre38Days = (content.match(/\b38\s+days\s+left\b/g) || []).length;

  console.log(`Pre-replacement counts:`);
  console.log(` - "22 October 2026": ${pre22October}`);
  console.log(` - "22 Oct 2026":     ${pre22Oct}`);
  console.log(` - "7 days left":     ${pre7Days}`);
  console.log(` - "38 days left":    ${pre38Days}`);

  // 1. Replace countdowns
  content = content.replace(/\b7\s+days\s+left\b/g, '5 days left');
  content = content.replace(/\b38\s+days\s+left\b/g, '36 days left');

  // 2. Replace verification dates
  content = content.replace(/22\s+October\s+2026/g, '24 October 2026');
  content = content.replace(/22\s+Oct\s+2026/g, '24 Oct 2026');

  // Verify post-replace counts
  const post22October = (content.match(/22\s+October\s+2026/g) || []).length;
  const post22Oct = (content.match(/22\s+Oct\s+2026/g) || []).length;
  const post24October = (content.match(/24\s+October\s+2026/g) || []).length;
  const post24Oct = (content.match(/24\s+Oct\s+2026/g) || []).length;
  const post5Days = (content.match(/\b5\s+days\s+left\b/g) || []).length;
  const post36Days = (content.match(/\b36\s+days\s+left\b/g) || []).length;

  console.log(`Post-replacement counts:`);
  console.log(` - "22 October 2026": ${post22October} (must be 0)`);
  console.log(` - "22 Oct 2026":     ${post22Oct} (must be 0)`);
  console.log(` - "24 October 2026": ${post24October}`);
  console.log(` - "24 Oct 2026":     ${post24Oct}`);
  console.log(` - "5 days left":     ${post5Days} (must be 1)`);
  console.log(` - "36 days left":    ${post36Days} (must be 1)`);

  if (post22October !== 0 || post22Oct !== 0) {
    console.error('ERROR: Unreplaced 22 Oct instances remain!');
    process.exit(1);
  }

  // Check historical preservation
  const histChecks = [
    { name: 'ICSI 9 October 2026', check: content.includes('9 October 2026') },
    { name: 'General Circular 31-08-2026', check: content.includes('31-08-2026') },
    { name: 'Checked on 15 October 2026', check: content.includes('15 October 2026') },
    { name: 'AOC-4 due 29 October 2026', check: content.includes('29 October 2026') },
    { name: 'MGT-7 due 29 November 2026', check: content.includes('29 November 2026') },
    { name: 'ADT-1 due 14 October 2026', check: content.includes('14 October 2026') },
  ];

  console.log('\nHistorical Date Integrity:');
  for (const h of histChecks) {
    console.log(` - ${h.name}: ${h.check ? 'PRESERVED ✓' : 'FAILED ✗'}`);
    if (!h.check) {
      console.error(`FATAL: Historical date corrupted for ${h.name}`);
      process.exit(1);
    }
  }

  console.log(`\n========================================`);
  console.log(`3. Updating record in Supabase updates table`);
  console.log(`========================================`);

  const nowIso = new Date().toISOString();
  const updatePayload = {
    content,
    last_verified: '2026-10-24',
    updated_at: nowIso,
  };

  const patchRes = await fetch(`${supabaseUrl}/rest/v1/updates?id=eq.${article.id}`, {
    method: 'PATCH',
    headers: {
      apikey: supabaseKey!,
      Authorization: `Bearer ${supabaseKey!}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(updatePayload),
  });

  if (!patchRes.ok) {
    console.error('Failed to update article:', patchRes.status, await patchRes.text());
    process.exit(1);
  }

  const updatedArticles = await patchRes.json();
  const updated = updatedArticles[0];
  console.log('Update successful in Supabase!');
  console.log(`- ID:            ${updated.id}`);
  console.log(`- Slug:          ${updated.slug}`);
  console.log(`- Last Verified: ${updated.last_verified}`);
  console.log(`- Updated At:    ${updated.updated_at}`);

  console.log(`\n========================================`);
  console.log(`4. Triggering on-demand revalidation on production`);
  console.log(`========================================`);

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSalt = process.env.ADMIN_SECRET_SALT;

  if (adminPassword && adminSalt) {
    const payloadObj = { role: 'admin', exp: Date.now() + 3600000 };
    const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
    const secretKey = adminPassword + adminSalt;
    const signature = crypto.createHmac('sha256', secretKey).update(payloadB64).digest('hex');
    const sessionCookie = `${payloadB64}.${signature}`;

    const revalPaths = [
      `/updates/${TARGET_SLUG}`,
      '/updates',
      '/',
    ];

    for (const p of revalPaths) {
      try {
        const rRes = await fetch('https://www.corplawupdates.in/api/admin/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `admin_session=${sessionCookie}`,
          },
          body: JSON.stringify({ path: p }),
        });
        const rJson = await rRes.json();
        console.log(`Revalidated ${p}:`, rJson);
      } catch (e) {
        console.warn(`Could not revalidate ${p}:`, e);
      }
    }
  } else {
    console.log('Skipping admin revalidate route call (no admin password in env)');
  }

  console.log(`\n========================================`);
  console.log(`5. Submitting URL to Search Indexing APIs`);
  console.log(`========================================`);

  try {
    const gRes = await submitUrlsToGoogleIndexing([TARGET_URL], 'URL_UPDATED');
    console.log('Google Indexing API result:', gRes);
  } catch (e) {
    console.warn('Google Indexing API error:', e);
  }

  try {
    const inRes = await submitToIndexNow([TARGET_URL]);
    console.log('IndexNow result:', inRes ? 'SUCCESS' : 'SKIPPED/FAILED');
  } catch (e) {
    console.warn('IndexNow error:', e);
  }

  try {
    const wsRes = await pingGoogleWebSub();
    console.log('WebSub result:', wsRes ? 'SUCCESS' : 'SKIPPED/FAILED');
  } catch (e) {
    console.warn('WebSub error:', e);
  }

  console.log(`\n=== Refresh completed successfully! ===\n`);
}

run().catch(err => {
  console.error('Fatal error in script:', err);
  process.exit(1);
});
