async function checkUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    console.log(`URL: ${url} -> Status: ${res.status}`);
    const text = await res.text();
    const titleMatch = text.match(/<title[^>]*>(.*?)<\/title>/i);
    console.log(`  Title: ${titleMatch ? titleMatch[1].trim() : 'N/A'}`);
  } catch (err) {
    console.log(`URL: ${url} -> Error: ${err.message}`);
  }
}

async function run() {
  await checkUrl('https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63742');
  await checkUrl('https://www.sebi.gov.in/legal/circulars/oct-2026/review-of-provisions-related-to-international-securities-identification-number-isin-for-debt-securities-issued-on-private-placement-basis_105076.html');
}

run();
