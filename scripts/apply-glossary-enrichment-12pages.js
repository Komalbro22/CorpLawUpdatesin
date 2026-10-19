const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enrichGlossary() {
  console.log('=== Starting Glossary Enrichment for 12 Pages ===\n');

  // Helper to update or insert METADATA in extended_note
  function applyMetadata(extendedNote, newMeta) {
    const rawNote = extendedNote || '';
    const metaMatch = rawNote.match(/^\s*<!--\s*METADATA\s*([\s\S]*?)\s*METADATA\s*-->/);
    let existingMeta = {};
    let cleanContent = rawNote;
    if (metaMatch) {
      try {
        existingMeta = JSON.parse(metaMatch[1]);
        cleanContent = rawNote.substring(metaMatch[0].length).trim();
      } catch (e) {
        console.warn('Error parsing existing metadata:', e);
      }
    }
    const mergedMeta = { ...existingMeta, ...newMeta };
    const metaString = `<!-- METADATA\n${JSON.stringify(mergedMeta, null, 2)}\nMETADATA -->\n\n`;
    return metaString + cleanContent;
  }

  // ----------------------------------------------------
  // 1. Board Meeting (slug: board-meeting)
  // ----------------------------------------------------
  console.log('1. Processing Board Meeting...');
  const { data: bm } = await supabase
    .from('glossary')
    .select('id, extended_note, faqs')
    .eq('slug', 'board-meeting')
    .single();

  let bmNote = bm.extended_note || '';
  const ss1Section = `
<h2 style="color:#0f2342;font-size:22px;border-bottom:2px solid #e8e0d0;padding-bottom:10px;margin-top:40px;margin-bottom:24px;font-weight:700;">Board meetings under SS-1 (Secretarial Standard-1)</h2>

<p>Secretarial Standard on Meetings of the Board of Directors (SS-1), issued by ICSI and mandated under Section 118(10) of the Companies Act, 2013, governs the procedural conduct of board meetings. Three of the most critical compliance areas under SS-1 include:</p>

<ul>
  <li><strong>Maximum Gap Between Two Board Meetings:</strong> Under Section 173(1) and SS-1 Clause 2.1, not more than <strong>120 days</strong> shall intervene between two consecutive meetings of the Board. Every company must hold a minimum of four board meetings in every calendar year.</li>
  <li><strong>Shorter Notice Consent:</strong> Under Section 173(3) and SS-1 Clause 1.3.11, a Board Meeting may be called on shorter notice (less than 7 days) to transact urgent business, subject to the condition that at least one <strong>Independent Director</strong>, if any, is present at the meeting. If no Independent Director is present, decisions taken at such meeting must be circulated to all directors and shall be final only on ratification thereof by at least one Independent Director.</li>
  <li><strong>Board Meeting on a National Holiday:</strong> Unlike an Annual General Meeting (AGM) which cannot be held on a National Holiday under Section 96(2), there is <strong>no statutory restriction</strong> under the Companies Act, 2013 or SS-1 prohibiting a Board Meeting on a National Holiday or a Sunday. A Board Meeting can legally be held on any day, including a National Holiday, unless the company’s Articles of Association (AoA) provide otherwise.</li>
</ul>
`;

  if (!bmNote.includes('Board meetings under SS-1 (Secretarial Standard-1)')) {
    bmNote = bmNote + '\n' + ss1Section;
  }

  let bmFaqs = Array.isArray(bm.faqs) ? [...bm.faqs] : [];
  const bmNewFaqs = [
    {
      q: 'What is the maximum gap between two board meetings?',
      a: 'Under Section 173(1) of the Companies Act, 2013 and SS-1 (Secretarial Standard-1), not more than 120 days shall intervene between two consecutive board meetings. Every company must hold a minimum of four board meetings in each calendar year.'
    },
    {
      q: 'Can a board meeting be held on a national holiday?',
      a: 'Yes. Unlike an Annual General Meeting (Section 96(2)), neither the Companies Act, 2013 nor Secretarial Standard-1 (SS-1) restricts holding a Board Meeting on a national holiday or Sunday, unless expressly prohibited by the company’s Articles of Association (AoA).'
    },
    {
      q: 'What is the quorum and shorter-notice consent rule for board meetings?',
      a: 'The quorum under Section 174 is 1/3rd of total strength or two directors, whichever is higher. A board meeting may be convened on shorter notice (less than 7 days) to transact urgent business, provided at least one Independent Director is present, or the decisions are subsequently ratified by at least one Independent Director.'
    }
  ];

  for (const nq of bmNewFaqs) {
    if (!bmFaqs.some(f => f.q === nq.q)) {
      bmFaqs.push(nq);
    }
  }

  await supabase
    .from('glossary')
    .update({ extended_note: bmNote, faqs: bmFaqs })
    .eq('id', bm.id);
  console.log('   Board Meeting updated.');

  // ----------------------------------------------------
  // 2. Key Managerial Personnel (slug: key-managerial-personnel)
  // ----------------------------------------------------
  console.log('2. Processing Key Managerial Personnel...');
  const { data: kmp } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'key-managerial-personnel')
    .single();

  const newKmpSeoTitle = 'KMP Full Form: Key Managerial Personnel (Section 2(51))';
  const newKmpSeoMeta = 'KMP full form is Key Managerial Personnel (Section 2(51), Companies Act 2013). Understand Section 203 appointment rules, roles of CEO, MD, CFO, CS, WTD, and statutory compliance under Indian company law.';

  let kmpDef = 'KMP full form stands for Key Managerial Personnel. Under Section 2(51) of Companies Act 2013, KMP includes the CEO/MD, Whole-Time Director, CFO, Company Secretary, and Manager. Prescribed companies must mandatorily appoint KMP under Section 203.';

  let kmpNote = applyMetadata(kmp.extended_note, {
    seo_title: newKmpSeoTitle,
    seo_description: newKmpSeoMeta
  });

  const kmpSection203 = `
<h2 style="color:#0f2342;font-size:22px;border-bottom:2px solid #e8e0d0;padding-bottom:10px;margin-top:40px;margin-bottom:24px;font-weight:700;">Appointment of KMP — Section 203</h2>

<p>Under Section 203 of the Companies Act, 2013 read with Rule 8 of the Companies (Appointment and Remuneration of Managerial Personnel) Rules, 2014, every listed company and every other public company having a paid-up share capital of ₹10 crore or more must mandatorily appoint whole-time Key Managerial Personnel (Managing Director or CEO or Manager, and in their absence a Whole-Time Director; Company Secretary; and Chief Financial Officer). In addition, Rule 8A mandates that every private company with a paid-up share capital of ₹10 crore or more must appoint a whole-time Company Secretary. All KMP appointments must be approved by the Board via resolution and reported to the ROC in Form DIR-12 within 30 days.</p>
`;

  if (!kmpNote.includes('Appointment of KMP — Section 203')) {
    kmpNote = kmpNote + '\n' + kmpSection203;
  }

  await supabase
    .from('glossary')
    .update({ definition: kmpDef, extended_note: kmpNote })
    .eq('id', kmp.id);
  console.log('   Key Managerial Personnel updated.');

  // ----------------------------------------------------
  // 3. LODR (slug: lodr)
  // ----------------------------------------------------
  console.log('3. Processing LODR...');
  const { data: lodr } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'lodr')
    .single();

  const newLodrSeoTitle = 'LODR Full Form: Listing Obligations & Disclosure Rules';
  const newLodrSeoMeta = 'LODR full form: Listing Obligations and Disclosure Requirements (SEBI LODR Regulations, 2015). A complete guide to disclosure timelines, corporate governance standards, board composition, and listing compliance in India.';

  let lodrDef = 'LODR full form stands for Listing Obligations and Disclosure Requirements. SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 governs the obligations of listed entities to ensure timely disclosures, investor protection, and robust governance in India.';

  let lodrNote = applyMetadata(lodr.extended_note, {
    seo_title: newLodrSeoTitle,
    seo_description: newLodrSeoMeta
  });

  const lodr2015Section = `
<h2 style="color:#0f2342;font-size:22px;border-bottom:2px solid #e8e0d0;padding-bottom:10px;margin-top:40px;margin-bottom:24px;font-weight:700;">SEBI LODR Regulations, 2015 — what they cover</h2>

<p>The SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 lay down statutory disclosure obligations, corporate governance mandates, and compliance duties for entities listed on recognised Indian stock exchanges. They cover mandatory periodic financial results (Regulation 33), event-based disclosures of material information within strict timelines (Regulation 30), board composition and independent director rules (Regulation 17), audit committee oversight (Regulation 18), and related party transaction approvals (Regulation 23) to safeguard investor interests.</p>
`;

  if (!lodrNote.includes('SEBI LODR Regulations, 2015 — what they cover')) {
    lodrNote = lodrNote + '\n' + lodr2015Section;
  }

  await supabase
    .from('glossary')
    .update({ definition: lodrDef, extended_note: lodrNote })
    .eq('id', lodr.id);
  console.log('   LODR updated.');

  // ----------------------------------------------------
  // 4. Authorised Dealer (slug: authorised-dealer)
  // ----------------------------------------------------
  console.log('4. Processing Authorised Dealer...');
  const { data: ad } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'authorised-dealer')
    .single();

  const newAdDef = "A bank or financial institution authorised by RBI under Section 10 of FEMA to deal in foreign exchange. Also spelled 'authorized dealer' (US spelling); both refer to the same FEMA concept. AD Category-I banks (scheduled commercial banks) can handle all forex transactions; AD Category-II handles limited transactions.";
  const newAdSeoMeta = "Authorised Dealer meaning under Indian FEMA: A bank or financial institution authorised by RBI under Section 10 to deal in foreign exchange. Also spelled 'authorized dealer'.";

  let adNote = applyMetadata(ad.extended_note, {
    seo_title: 'Authorised Dealer — Meaning, Definition | CorpLawUpdates',
    seo_description: newAdSeoMeta
  });

  await supabase
    .from('glossary')
    .update({ definition: newAdDef, extended_note: adNote })
    .eq('id', ad.id);
  console.log('   Authorised Dealer updated.');

  // ----------------------------------------------------
  // 5. UPSI (slug: upsi)
  // ----------------------------------------------------
  console.log('5. Processing UPSI...');
  const { data: upsi } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'upsi')
    .single();

  const newUpsiSeoTitle = 'UPSI Full Form: Unpublished Price Sensitive Information';
  const newUpsiSeoMeta = 'UPSI stands for Unpublished Price Sensitive Information (SEBI insider trading regulations). Complete guide to 2025 PIT amendments, expanded illustrative categories, trading window rules, and Structured Digital Database (SDD) compliance.';

  const newUpsiDef = 'UPSI stands for Unpublished Price Sensitive Information. Under SEBI (Prohibition of Insider Trading) Regulations, 2015, UPSI refers to any information relating to a company or its securities, directly or indirectly, that is not generally available and which upon becoming available is likely to materially affect securities prices.';

  let upsiNote = applyMetadata(upsi.extended_note, {
    seo_title: newUpsiSeoTitle,
    seo_description: newUpsiSeoMeta
  });

  await supabase
    .from('glossary')
    .update({ definition: newUpsiDef, extended_note: upsiNote })
    .eq('id', upsi.id);
  console.log('   UPSI updated.');

  // ----------------------------------------------------
  // 6. Section 241–242 (slug: section-241-242)
  // ----------------------------------------------------
  console.log('6. Processing Section 241–242...');
  const { data: s241 } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'section-241-242')
    .single();

  const newS241SeoTitle = 'Section 241 & 242 Companies Act: Oppression & Mismanagement';
  const newS241SeoMeta = 'Sections 241–242, Companies Act 2013: oppression and mismanagement remedies. Section 241 allows eligible members to apply to NCLT, while Section 242 empowers NCLT to pass relief orders including alteration of MOA/AOA and director changes.';

  const newS241Def = 'Sections 241 and 242 of Companies Act 2013 dealing with relief in cases of oppression and mismanagement. Section 241 allows eligible members to apply; Section 242 empowers NCLT to pass orders including change of directors, alteration of MOA/AOA, and buyback of shares.';

  let s241Note = applyMetadata(s241.extended_note, {
    seo_title: newS241SeoTitle,
    seo_description: newS241SeoMeta
  });

  await supabase
    .from('glossary')
    .update({ definition: newS241Def, extended_note: s241Note })
    .eq('id', s241.id);
  console.log('   Section 241–242 updated.');

  // ----------------------------------------------------
  // 7. Whole-Time Director (slug: whole-time-director)
  // ----------------------------------------------------
  console.log('7. Processing Whole-Time Director...');
  const { data: wtd } = await supabase
    .from('glossary')
    .select('id, definition, extended_note, faqs')
    .eq('slug', 'whole-time-director')
    .single();

  const newWtdSeoTitle = 'Whole-Time Director: Meaning, Definition & Section 2(94)';
  const newWtdSeoMeta = 'WTD full form: Whole-Time Director. Under Section 2(94) of Companies Act 2013, a whole-time director is in whole-time employment of the company. Covers appointment, Schedule V remuneration, and differences with Managing Director.';

  const newWtdDef = 'A whole-time director means a director in whole-time employment of the company. WTD is the common abbreviation (WTD full form: Whole-Time Director). Under Section 2(94) of Companies Act 2013, appointment requires board and shareholder approval. Remuneration is governed by Schedule V in case of inadequate profits.';

  let wtdNote = applyMetadata(wtd.extended_note, {
    seo_title: newWtdSeoTitle,
    seo_description: newWtdSeoMeta
  });

  let wtdFaqs = Array.isArray(wtd.faqs) ? [...wtd.faqs] : [];
  const wtdDiffFaq = {
    q: 'What is the difference between a whole-time director and a managing director?',
    a: 'Under the Companies Act, 2013, a Managing Director (Section 2(54)) is entrusted with substantial powers of management of the affairs of the company. In contrast, a Whole-Time Director (Section 2(94)) is a director in whole-time employment of the company who oversees specific functional or executive departments, but is not necessarily entrusted with substantial powers of management.'
  };

  if (!wtdFaqs.some(f => f.q === wtdDiffFaq.q)) {
    wtdFaqs.push(wtdDiffFaq);
  }

  await supabase
    .from('glossary')
    .update({ definition: newWtdDef, extended_note: wtdNote, faqs: wtdFaqs })
    .eq('id', wtd.id);
  console.log('   Whole-Time Director updated.');

  // ----------------------------------------------------
  // 8. Interim Application (slug: interim-application)
  // ----------------------------------------------------
  console.log('8. Processing Interim Application...');
  const { data: ia } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'interim-application')
    .single();

  const newIaSeoTitle = 'Interim Application (IA): Meaning, NCLT Procedure & Relief';
  const newIaSeoMeta = 'Interim application meaning: An application filed before a court or tribunal (such as NCLT) seeking temporary or interim relief like stay, injunction, or urgent directions while the main company or insolvency matter is pending.';

  const newIaDef = 'An interim application means an application filed before a court or tribunal seeking temporary/interim relief while the main matter is pending. In NCLT and company law proceedings, an Interim Application (IA) is filed within main proceedings seeking urgent relief such as stay, injunction, appointment of administrator, or other urgent directions pending final disposal of the main petition.';

  let iaNote = applyMetadata(ia.extended_note, {
    seo_title: newIaSeoTitle,
    seo_description: newIaSeoMeta
  });

  await supabase
    .from('glossary')
    .update({ definition: newIaDef, extended_note: iaNote })
    .eq('id', ia.id);
  console.log('   Interim Application updated.');

  // ----------------------------------------------------
  // 9. Audit Committee (slug: audit-committee)
  // ----------------------------------------------------
  console.log('9. Processing Audit Committee...');
  const { data: ac } = await supabase
    .from('glossary')
    .select('id, faqs')
    .eq('slug', 'audit-committee')
    .single();

  let acFaqs = Array.isArray(ac.faqs) ? [...ac.faqs] : [];
  const acNewFaqs = [
    {
      q: 'What is the quorum of an audit committee?',
      a: 'For listed companies, under Regulation 18(2)(b) of the SEBI LODR Regulations, 2015, the quorum for an Audit Committee meeting is either two members or one-third of the members of the audit committee, whichever is greater, with at least two independent directors. For unlisted public companies under Section 177 of the Companies Act, 2013, quorum follows the general committee provisions of the Board.'
    },
    {
      q: 'Is an audit committee applicable to private companies?',
      a: 'No. Section 177 of the Companies Act, 2013 read with Rule 6 of the Companies (Meetings of Board and its Powers) Rules, 2014 applies only to all listed public companies and unlisted public companies with paid-up capital of ₹10 crore or more, turnover of ₹100 crore or more, or outstanding loans/borrowings/deposits exceeding ₹50 crore. Private limited companies are exempt.'
    },
    {
      q: 'Who can be the chairperson of an audit committee?',
      a: 'Under Section 177(2) of the Companies Act, 2013 and Regulation 18(1)(d) of SEBI LODR Regulations, 2015, the Chairperson of the Audit Committee must be an Independent Director. Under SEBI LODR, the Chairperson must have accounting or related financial management expertise and shall be present at the Annual General Meeting to answer shareholder queries.'
    }
  ];

  for (const nq of acNewFaqs) {
    if (!acFaqs.some(f => f.q === nq.q)) {
      acFaqs.push(nq);
    }
  }

  await supabase
    .from('glossary')
    .update({ faqs: acFaqs })
    .eq('id', ac.id);
  console.log('   Audit Committee updated.');

  // ----------------------------------------------------
  // 10. Form FC-TRS (slug: form-fc-trs)
  // ----------------------------------------------------
  console.log('10. Processing Form FC-TRS...');
  const { data: fctrs } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'form-fc-trs')
    .single();

  const newFcSeoTitle = 'Form FC-TRS (Form FC): FEMA Filing for Share Transfers';
  const newFcSeoMeta = 'Form FC (FC-TRS): the RBI/FEMA form for reporting transfer of shares. Mandatory FIRMS portal reporting within 60 days of transfer of capital instruments between residents and non-residents under FEMA regulations.';

  const newFcDef = "Form FC-TRS — commonly searched as 'Form FC' — is filed under FEMA for reporting transfer of shares/securities. It is an RBI regulatory return submitted online through the FIRMS portal within 60 days from the date of transfer of capital instruments between a person resident in India and a person resident outside India, reporting consideration value, pricing guidelines compliance, and KYC documentation.";

  let fcNote = applyMetadata(fctrs.extended_note, {
    seo_title: newFcSeoTitle,
    seo_description: newFcSeoMeta
  });

  await supabase
    .from('glossary')
    .update({ definition: newFcDef, extended_note: fcNote })
    .eq('id', fctrs.id);
  console.log('   Form FC-TRS updated.');

  // ----------------------------------------------------
  // 11. CIRP (slug: cirp)
  // ----------------------------------------------------
  console.log('11. Processing CIRP...');
  const { data: cirp } = await supabase
    .from('glossary')
    .select('id, definition, extended_note')
    .eq('slug', 'cirp')
    .single();

  const newCirpSeoTitle = 'CIRP Full Form & Meaning: Insolvency Resolution Process';
  const newCirpSeoMeta = "CIRP full form: Corporate Insolvency Resolution Process under the IBC, 2016. What 'under CIRP' means, the 330-day timeline, and who runs the process.";

  const newCirpDef = "CIRP stands for Corporate Insolvency Resolution Process under the Insolvency and Bankruptcy Code, 2016. A company 'under CIRP' means the insolvency resolution process has been admitted against it by the NCLT. It is a time-bound statutory mechanism (mandated to complete within 180 to 330 days) to resolve insolvency of a corporate debtor, protect enterprise value, and maximize asset recovery through an Interim Resolution Professional (IRP) or Resolution Professional (RP) under Committee of Creditors (CoC) supervision.";

  let cirpNote = applyMetadata(cirp.extended_note, {
    seo_title: newCirpSeoTitle,
    seo_description: newCirpSeoMeta
  });

  await supabase
    .from('glossary')
    .update({ definition: newCirpDef, extended_note: cirpNote })
    .eq('id', cirp.id);
  console.log('   CIRP updated.');

  // ----------------------------------------------------
  // 12. Alternative Investment Fund (slug: alternative-investment-fund)
  // ----------------------------------------------------
  console.log('12. Processing Alternative Investment Fund...');
  const { data: aif } = await supabase
    .from('glossary')
    .select('id, extended_note')
    .eq('slug', 'alternative-investment-fund')
    .single();

  const newAifSeoTitle = 'AIF: Alternative Investment Fund — Types, Tax & Investment';
  const newAifSeoMeta = 'AIF (Alternative Investment Fund) in India: Understand Category I, II, and III AIFs, ₹1 crore minimum investment amount, pass-through taxation rules, regulatory framework under SEBI (AIF) Regulations, and latest guidelines.';

  let aifNote = applyMetadata(aif.extended_note, {
    seo_title: newAifSeoTitle,
    seo_description: newAifSeoMeta
  });

  const aifCategoriesSection = `
<h2 style="color:#0f2342;font-size:22px;border-bottom:2px solid #e8e0d0;padding-bottom:10px;margin-top:40px;margin-bottom:24px;font-weight:700;">AIF categories and taxation</h2>

<p>Under the SEBI (Alternative Investment Funds) Regulations, 2012, AIFs in India are classified into three distinct categories based on their investment strategy: Category I AIFs invest in start-ups, early-stage ventures, social ventures, and SMEs (e.g., Venture Capital Funds, Angel Funds, Infrastructure Funds); Category II AIFs do not undertake leverage other than for meeting day-to-day operational requirements and invest primarily in private equity, debt funds, or fund of funds; Category III AIFs employ diverse or complex trading strategies and may employ leverage (e.g., Hedge Funds, PIPE funds). The minimum investment amount for any investor in an AIF is statutorily set at ₹1 crore (reduced to ₹25 lakh for employees or directors of the AIF/manager and accredited angel investors).</p>
`;

  const aifTaxationSection = `
<h2 style="color:#0f2342;font-size:22px;border-bottom:2px solid #e8e0d0;padding-bottom:10px;margin-top:40px;margin-bottom:24px;font-weight:700;">AIF taxation in India</h2>

<p>Taxation of AIFs in India depends fundamentally on the fund category under Section 115UB of the Income-tax Act, 1961. Category I and Category II AIFs enjoy statutory "pass-through" status for tax purposes: income (other than business income) generated by the fund is not taxed at the fund level, but is taxed directly in the hands of the unit holders in the same nature and proportion as if received directly by them. However, any business income earned by Category I or II AIFs is taxed at the fund level at the Maximum Marginal Rate (MMR). Conversely, Category III AIFs do not enjoy pass-through tax status; the fund itself is treated as a separate taxable entity (usually a determinate trust) and is taxed on its income at the Maximum Marginal Rate (MMR).</p>
`;

  if (!aifNote.includes('AIF categories and taxation')) {
    aifNote = aifNote + '\n' + aifCategoriesSection;
  }
  if (!aifNote.includes('AIF taxation in India')) {
    aifNote = aifNote + '\n' + aifTaxationSection;
  }

  await supabase
    .from('glossary')
    .update({ extended_note: aifNote })
    .eq('id', aif.id);
  console.log('   Alternative Investment Fund updated.');

  console.log('\n=== All 12 Glossary Pages Successfully Enriched ===');
}

enrichGlossary().catch((err) => {
  console.error('Fatal error during glossary enrichment:', err);
  process.exit(1);
});
