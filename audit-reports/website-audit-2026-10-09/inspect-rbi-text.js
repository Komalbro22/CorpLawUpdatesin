async function checkRbi() {
  const res = await fetch('https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63742', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  let text = await res.text();
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const idx = clean.indexOf('Monetary Policy');
  if (idx !== -1) {
    console.log('Context around Monetary Policy:\n', clean.slice(idx - 100, idx + 800));
  } else {
    const idx2 = clean.indexOf('2026');
    console.log('Context around 2026:\n', clean.slice(idx2, idx2 + 800));
  }
}
checkRbi();
