#!/usr/bin/env node
// scripts/check-sitemap.mjs
// Fetches every URL in the sitemap and fails on non-200, redirects, noindex or canonical mismatch.

const BASE_URL = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:3000';

async function checkSitemap() {
  console.log(`[check-sitemap] Fetching sitemap from ${BASE_URL}/sitemap.xml ...`);
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!sitemapRes.ok) {
    console.error(`[check-sitemap] FAILED to fetch sitemap: HTTP ${sitemapRes.status}`);
    process.exit(1);
  }

  const xmlText = await sitemapRes.text();
  const urls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xmlText)) !== null) {
    urls.push(match[1].trim());
  }

  console.log(`[check-sitemap] Found ${urls.length} URLs in sitemap.`);

  let errors = 0;
  let passed = 0;

  for (let i = 0; i < urls.length; i++) {
    const rawUrl = urls[i];
    // Rewrite target to local test base if needed
    const testUrl = rawUrl.replace('https://www.corplawupdates.in', BASE_URL);

    try {
      const res = await fetch(testUrl, { redirect: 'manual' });
      
      if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
        console.error(`[REDIRECT ERROR] ${rawUrl} returned HTTP ${res.status} -> Location: ${res.headers.get('location')}`);
        errors++;
        continue;
      }

      if (res.status !== 200) {
        console.error(`[STATUS ERROR] ${rawUrl} returned HTTP ${res.status}`);
        errors++;
        continue;
      }

      const html = await res.text();

      // Check robots meta
      const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
      if (robotsMatch && robotsMatch[1].toLowerCase().includes('noindex')) {
        console.error(`[NOINDEX ERROR] ${rawUrl} has noindex in meta robots: "${robotsMatch[1]}"`);
        errors++;
        continue;
      }

      // Check canonical tag
      const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
      if (canonicalMatch) {
        const canonicalHref = canonicalMatch[1];
        const expectedCanonical = rawUrl;
        if (canonicalHref !== expectedCanonical) {
          console.error(`[CANONICAL MISMATCH] ${rawUrl} specifies canonical: ${canonicalHref} (expected: ${expectedCanonical})`);
          errors++;
          continue;
        }
      }

      passed++;
    } catch (err) {
      console.error(`[FETCH FAILED] ${rawUrl}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Sitemap Audit Summary:`);
  console.log(`Total URLs: ${urls.length}`);
  console.log(`Passed:     ${passed}`);
  console.log(`Errors:     ${errors}`);
  console.log(`========================================\n`);

  if (errors > 0) {
    process.exit(1);
  }
}

checkSitemap().catch(err => {
  console.error('[check-sitemap] Fatal error:', err);
  process.exit(1);
});
