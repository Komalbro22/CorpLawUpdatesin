fetch("https://www.corplawupdates.in/updates/sebi-derivatives-market-reforms-consultation-paper-2026")
  .then(r => r.text())
  .then(t => {
    const m = t.match(/<meta[^>]*og:[^>]*>/g);
    console.log(m ? m.join("\n") : "no og tags");
  });
