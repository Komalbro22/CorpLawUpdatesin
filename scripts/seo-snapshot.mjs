#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Usage:
// node scripts/seo-snapshot.mjs [--base https://www.corplawupdates.in] [--out seo-baseline/before.json] [--concurrency 10]
// node scripts/seo-snapshot.mjs --diff seo-baseline/before.json seo-baseline/after-phase-a.json

const args = process.argv.slice(2);

function getArg(flag, defaultValue = null) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return defaultValue;
}

const isDiffMode = args.includes('--diff');

if (isDiffMode) {
  const diffIdx = args.indexOf('--diff');
  const file1 = args[diffIdx + 1];
  const file2 = args[diffIdx + 2];
  if (!file1 || !file2) {
    console.error('Usage: node scripts/seo-snapshot.mjs --diff <before.json> <after.json>');
    process.exit(1);
  }
  runDiff(file1, file2);
  process.exit(0);
}

const BASE_URL = (getArg('--base', 'https://www.corplawupdates.in')).replace(/\/+$/, '');
const OUT_PATH = getArg('--out', 'seo-baseline/before.json');
const CONCURRENCY = parseInt(getArg('--concurrency', '8'), 10);

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function extractPageData(url) {
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'CorpLawUpdates-SEOSnapshot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });

    const status = res.status;
    const finalUrl = res.url;
    const contentType = res.headers.get('content-type') || '';

    // Handle non-HTML assets
    if (!contentType.includes('text/html')) {
      const text = await res.text();
      return {
        url,
        status,
        finalUrl,
        contentType,
        canonical: null,
        robotsMeta: res.headers.get('x-robots-tag') || null,
        title: null,
        h1: null,
        metaDescription: null,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        internalLinkCount: 0,
        jsonLdTypes: [],
        hreflang: null,
      };
    }

    const html = await res.text();

    // Canonical
    const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
      || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : null;

    // Robots meta
    const robotsMatch = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
    const robotsMeta = robotsMatch ? robotsMatch[1] : (res.headers.get('x-robots-tag') || null);

    // Title
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : null;

    // H1
    const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : null;

    // Meta Description
    const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : null;

    // Word count (strip script, style, html tags)
    const strippedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = strippedHtml ? strippedHtml.split(' ').filter(Boolean).length : 0;

    // Internal links count
    let internalLinkCount = 0;
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
    let lMatch;
    while ((lMatch = linkRegex.exec(html)) !== null) {
      const href = lMatch[1];
      if (href.startsWith('/') || href.startsWith(BASE_URL)) {
        internalLinkCount++;
      }
    }

    // JSON-LD @types
    const jsonLdTypes = [];
    const jsonLdRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jMatch;
    while ((jMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(jMatch[1]);
        function extractTypes(obj) {
          if (!obj) return;
          if (Array.isArray(obj)) {
            obj.forEach(extractTypes);
          } else if (typeof obj === 'object') {
            if (obj['@type']) {
              if (Array.isArray(obj['@type'])) {
                jsonLdTypes.push(...obj['@type']);
              } else {
                jsonLdTypes.push(obj['@type']);
              }
            }
            if (obj['@graph'] && Array.isArray(obj['@graph'])) {
              obj['@graph'].forEach(extractTypes);
            }
          }
        }
        extractTypes(parsed);
      } catch {
        // malformed json-ld block
      }
    }

    return {
      url,
      status,
      finalUrl,
      canonical,
      robotsMeta,
      title,
      h1,
      metaDescription,
      wordCount,
      internalLinkCount,
      jsonLdTypes: [...new Set(jsonLdTypes)],
      hreflang: null,
    };
  } catch (err) {
    return {
      url,
      status: 0,
      finalUrl: null,
      error: err.message,
      canonical: null,
      robotsMeta: null,
      title: null,
      h1: null,
      metaDescription: null,
      wordCount: 0,
      internalLinkCount: 0,
      jsonLdTypes: [],
      hreflang: null,
    };
  }
}

async function runSnapshot() {
  console.log(`[SEO Snapshot] Target host: ${BASE_URL}`);
  console.log(`[SEO Snapshot] Output file: ${OUT_PATH}`);

  // 1. Fetch sitemap
  console.log(`[SEO Snapshot] Fetching sitemap from ${BASE_URL}/sitemap.xml...`);
  let sitemapXml = '';
  try {
    const sRes = await fetchWithTimeout(`${BASE_URL}/sitemap.xml`);
    sitemapXml = await sRes.text();
  } catch (err) {
    console.error(`[SEO Snapshot] Failed to fetch sitemap: ${err.message}`);
    process.exit(1);
  }

  const sitemapUrls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
  let locMatch;
  while ((locMatch = locRegex.exec(sitemapXml)) !== null) {
    let u = locMatch[1].trim();
    // Normalize to BASE_URL if testing locally
    if (BASE_URL !== 'https://www.corplawupdates.in') {
      u = u.replace('https://www.corplawupdates.in', BASE_URL);
    }
    sitemapUrls.push(u);
  }

  console.log(`[SEO Snapshot] Found ${sitemapUrls.length} URLs in sitemap.`);

  // Extra mandatory non-HTML & special URLs
  const extraUrls = [
    `${BASE_URL}/llms.txt`,
    `${BASE_URL}/llms-full.txt`,
    `${BASE_URL}/robots.txt`,
    `${BASE_URL}/ads.txt`,
    `${BASE_URL}/news-sitemap.xml`,
    `${BASE_URL}/api/feed.xml`,
    `${BASE_URL}/disclaimer`,
  ];

  const allUrls = [...new Set([...sitemapUrls, ...extraUrls])];
  console.log(`[SEO Snapshot] Total targets to inspect: ${allUrls.length}`);

  const results = [];
  let index = 0;

  async function worker() {
    while (index < allUrls.length) {
      const currentIdx = index++;
      const currentUrl = allUrls[currentIdx];
      const data = await extractPageData(currentUrl);
      results.push(data);
      if (results.length % 25 === 0 || results.length === allUrls.length) {
        process.stdout.write(`\r[SEO Snapshot] Progress: ${results.length}/${allUrls.length} completed...`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  console.log('\n[SEO Snapshot] Completed fetching all URLs.');

  // Sort by URL
  results.sort((a, b) => a.url.localeCompare(b.url));

  const outDir = path.dirname(path.resolve(OUT_PATH));
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.resolve(OUT_PATH), JSON.stringify(results, null, 2), 'utf-8');
  console.log(`[SEO Snapshot] Snapshot saved to ${OUT_PATH} (${results.length} records).`);

  // Summary statistics
  const statusCounts = {};
  results.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  console.log('\n--- Snapshot Summary ---');
  console.log('HTTP Status Breakdown:', statusCounts);
  const canonicalMismatches = results.filter(r => r.status === 200 && r.canonical && r.canonical !== r.url);
  console.log(`Canonical mismatches: ${canonicalMismatches.length}`);
  const noindexPages = results.filter(r => r.robotsMeta && r.robotsMeta.includes('noindex'));
  console.log(`Noindex pages: ${noindexPages.length}`);
}

function runDiff(file1, file2) {
  const p1 = path.resolve(file1);
  const p2 = path.resolve(file2);

  if (!fs.existsSync(p1) || !fs.existsSync(p2)) {
    console.error(`Error: Cannot find ${!fs.existsSync(p1) ? p1 : p2}`);
    process.exit(1);
  }

  const data1 = JSON.parse(fs.readFileSync(p1, 'utf-8'));
  const data2 = JSON.parse(fs.readFileSync(p2, 'utf-8'));

  const map1 = new Map(data1.map(d => [d.url.replace(/^https?:\/\/[^/]+/, ''), d]));
  const map2 = new Map(data2.map(d => [d.url.replace(/^https?:\/\/[^/]+/, ''), d]));

  const allPaths = [...new Set([...map1.keys(), ...map2.keys()])].sort();

  console.log(`\n=============================================================`);
  console.log(`=== SEO SNAPSHOT DIFF: ${path.basename(file1)} vs ${path.basename(file2)} ===`);
  console.log(`=============================================================\n`);

  let added = 0;
  let removed = 0;
  let changedCount = 0;

  for (const p of allPaths) {
    const item1 = map1.get(p);
    const item2 = map2.get(p);

    if (!item1) {
      console.log(`➕ ADDED: ${p} (Status: ${item2.status})`);
      added++;
      continue;
    }
    if (!item2) {
      console.log(`➖ REMOVED: ${p} (Previous Status: ${item1.status})`);
      removed++;
      continue;
    }

    const changes = [];
    if (item1.status !== item2.status) {
      changes.push(`Status: ${item1.status} → ${item2.status}`);
    }
    if (item1.canonical !== item2.canonical) {
      changes.push(`Canonical: "${item1.canonical}" → "${item2.canonical}"`);
    }
    if (item1.robotsMeta !== item2.robotsMeta) {
      changes.push(`Robots: "${item1.robotsMeta}" → "${item2.robotsMeta}"`);
    }
    if (item1.title !== item2.title) {
      changes.push(`Title: "${item1.title}" → "${item2.title}"`);
    }
    if (item1.h1 !== item2.h1) {
      changes.push(`H1: "${item1.h1}" → "${item2.h1}"`);
    }
    if (item1.metaDescription !== item2.metaDescription) {
      changes.push(`Description: "${item1.metaDescription}" → "${item2.metaDescription}"`);
    }
    const wcDiff = (item2.wordCount || 0) - (item1.wordCount || 0);
    if (Math.abs(wcDiff) > 100) {
      changes.push(`WordCount: ${item1.wordCount} → ${item2.wordCount} (${wcDiff > 0 ? '+' : ''}${wcDiff})`);
    }
    const types1 = (item1.jsonLdTypes || []).sort().join(',');
    const types2 = (item2.jsonLdTypes || []).sort().join(',');
    if (types1 !== types2) {
      changes.push(`JSON-LD: [${types1}] → [${types2}]`);
    }

    if (changes.length > 0) {
      changedCount++;
      console.log(`⚡ CHANGED: ${p}`);
      changes.forEach(c => console.log(`   • ${c}`));
    }
  }

  console.log(`\nDiff Summary: Added: ${added}, Removed: ${removed}, Modified: ${changedCount}, Unchanged: ${allPaths.length - added - removed - changedCount}`);
}

runSnapshot();
