const { submitUrlsToGoogleIndexing, pingGoogleWebSub } = require('../lib/google-indexing.ts');
const { submitToIndexNow } = require('../lib/indexnow.ts');

const TARGET_URLS = [
  'https://www.corplawupdates.in/updates/epfo-september-2026-ecr-deadline-extended-31-october-2026',
  'https://www.corplawupdates.in/glossary/mca21',
  'https://www.corplawupdates.in/updates/rbi-noc-rec-pfc-merger-october-2026',
  'https://www.corplawupdates.in/updates/idbi-bank-fairfax-strategic-sale-ccea-approval-2026',
  'https://www.corplawupdates.in/updates/mca-annual-filing-no-extension-fy-2025-26',
];

async function main() {
  console.log('--- Requesting Re-Indexing for 5 URLs ---');
  for (const url of TARGET_URLS) {
    console.log(` • ${url}`);
  }

  // 1. Google Indexing API
  console.log('\n1. Submitting to Google Indexing API...');
  try {
    const googleRes = await submitUrlsToGoogleIndexing(TARGET_URLS, 'URL_UPDATED');
    console.log('Google Indexing API Result:', googleRes);
  } catch (err) {
    console.warn('Google Indexing API error:', err);
  }

  // 2. IndexNow
  console.log('\n2. Submitting to IndexNow...');
  try {
    const indexNowRes = await submitToIndexNow(TARGET_URLS);
    console.log('IndexNow Result:', indexNowRes ? 'SUCCESS' : 'SKIPPED/FAILED');
  } catch (err) {
    console.warn('IndexNow error:', err);
  }

  // 3. WebSub / PubSubHubbub
  console.log('\n3. Pinging Google WebSub...');
  try {
    const websubRes = await pingGoogleWebSub();
    console.log('WebSub Result:', websubRes ? 'SUCCESS' : 'SKIPPED/FAILED');
  } catch (err) {
    console.warn('WebSub error:', err);
  }

  console.log('\n--- Re-indexing requests dispatched ---');
}

main().catch(console.error);
