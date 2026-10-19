const { submitUrlsToGoogleIndexing, pingGoogleWebSub } = require('../lib/google-indexing.ts');
const { submitToIndexNow } = require('../lib/indexnow.ts');

const TARGET_URLS = [
  'https://www.corplawupdates.in/glossary/board-meeting',
  'https://www.corplawupdates.in/glossary/key-managerial-personnel',
  'https://www.corplawupdates.in/glossary/lodr',
  'https://www.corplawupdates.in/glossary/authorised-dealer',
  'https://www.corplawupdates.in/glossary/upsi',
  'https://www.corplawupdates.in/glossary/section-241-242',
  'https://www.corplawupdates.in/glossary/whole-time-director',
  'https://www.corplawupdates.in/glossary/interim-application',
  'https://www.corplawupdates.in/glossary/audit-committee',
  'https://www.corplawupdates.in/glossary/form-fc-trs',
  'https://www.corplawupdates.in/glossary/cirp',
  'https://www.corplawupdates.in/glossary/alternative-investment-fund'
];

async function main() {
  console.log('=== Dispatching Re-Indexing Requests for 12 Glossary URLs ===\n');
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
  console.log('\n2. Submitting to IndexNow (Bing / Yandex / Seznam)...');
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

  console.log('\n=== Re-Indexing Requests Dispatched Successfully ===');
}

main().catch(console.error);
