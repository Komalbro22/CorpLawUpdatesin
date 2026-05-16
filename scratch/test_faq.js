
const content = `
**Q1 Does this circular apply only to road projects, or to all PPP infrastructure projects?**

The new proviso refers to "an SPV holding an infrastructure project" where the underlying rights arise under a concession agreement or other agreement of a similar nature. In practice, this primarily covers PPP-style infrastructure projects such as national and state highways, power transmission lines, gas pipelines, ports, airports and urban infrastructure that are operated under concession agreements with public authorities. While the circular does not restrict itself only to roads, the most immediate impact is on road sector InvITs, since India’s earliest PPP road concessions from the early 2000s are now approaching their 25–30 year expiry from 2025 onwards.

**Q2 What if the Investment Manager cannot exit or reinvest within the 1-year window?**

The circular prescribes a mandatory 1-year exit/reinvest window from the latest of the three triggers. There is currently no automatic extension provided. If an InvIT anticipates it cannot meet the 1-year deadline (due to extraordinary circumstances — protracted litigation, court orders, etc.), it would need to approach SEBI for specific guidance or seek regulatory dispensation. Investment Managers should proactively plan for exit/reinvestment well in advance of the 1-year deadline to avoid last-minute complications.
`;

function extractFAQs(content) {
  const faqs = [];
  // Regex to find Q1, Q2 etc followed by answer until next Q or end
  const regex = /(?:\*\*|)?Q\d+[:.]?\s*(.*?)(?:\*\*|)?(?:\r?\n)+([\s\S]*?)(?=(?:\r?\n\s*(?:\*\*|)?Q\d+)|$)/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }
  return faqs;
}

console.log(JSON.stringify(extractFAQs(content), null, 2));
