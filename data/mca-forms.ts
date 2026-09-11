export type FeeSlabTable = 'standard_company_slab' | 'flat_500' | 'nil' | 'charge_slab' | 'msme_slab'

export interface MCAForm {
  slug: string
  formNumber: string
  formName: string
  aliases: string[]
  category: "annual" | "event" | "incorporation" | "charge" | "kyc"
  filedBy: string[]
  dueDate: string
  section: string
  penaltyType: "per_day" | "multiplier" | "flat" | "nil"
  penaltyRate: string
  normalFeeStructure: "capital_slab" | "flat" | "nil"
  baseFeeSlab: FeeSlabTable
  concessionApplies: boolean
  filingGuides?: {
    title: string
    slug: string
    publishedDate: string
    summary: string
    isOfficial: boolean
  }[]
  metaTitle: string
  metaDescription: string
  ogDescription: string
  faqItems: { question: string; answer: string }[]
  relatedForms: string[]
  filedTogetherWith: string[]
  contentSections: {
    whatIsThisForm: string
    whoMustFile: string
    dueDateExplained: string
    consequencesOfDelay: string
    workedExample: string
  }
}

export const mcaForms: MCAForm[] = [
  {
    slug: 'mgt-7',
    formNumber: 'MGT-7',
    formName: 'Annual Return',
    aliases: ['annual return', 'mgt7', 'MGT 7', 'annual filing'],
    category: 'annual',
    filedBy: ['Private Limited (Non-Small)', 'Public Limited (Unlisted & Listed)', 'Section 8 Company', 'Producer Company'],
    dueDate: 'Within 60 days of AGM',
    section: 'Section 92(1), Companies Act 2013 read with Rule 11(1)',
    penaltyType: 'per_day',
    penaltyRate: '₹100 per day additional filing fee',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    filingGuides: [
      {
        title: "Complete MGT-7 Annual Return Filing Guide for FY 2025-26 — Due Dates, MCA V3 & Small Co Limits",
        slug: "/updates/mgt-7-annual-return-filing-guide-fy-2025-26-due-date-mca-v3-small-company-limits-ccfs2026",
        publishedDate: "2026-03-15",
        summary: "Step-by-step walkthrough of filing MGT-7 Annual Return on MCA V3, including attachments, certification requirements, updated Small Company thresholds, and penalty rules.",
        isOfficial: true
      }
    ],
    metaTitle: 'Form MGT-7 Annual Return Fee & Penalty Calculator | CorpLaw',
    metaDescription: 'Calculate exact Form MGT-7 normal filing fees (₹200–₹600), ₹100/day additional filing fee, and Section 92(5) statutory penalty exposure for FY 2026-27.',
    ogDescription: 'Professional institutional calculator for Form MGT-7 normal fees, ₹100/day additional filing fee, and Section 92(5) statutory penalty exposure.',
    faqItems: [
      { question: 'What is the fee for filing Form MGT-7 late?', answer: 'Filing Form MGT-7 late incurs a statutory additional filing fee of ₹100 per day under Table B of the Companies (Registration Offices and Fees) Rules, 2014. This is paid on the MCA21 portal upon filing.' },
      { question: 'What is the statutory penalty under Section 92(5)?', answer: 'Under Section 92(5), default in filing annual returns attracts an adjudication penalty of ₹10,000 plus ₹100 per day after the first day of continuing default, subject to a maximum cap of ₹2,00,000 for the company and ₹50,000 per officer in default. This is separate from the MCA portal filing fee.' },
      { question: 'Who is required to file Form MGT-7?', answer: 'All companies other than One Person Companies (OPCs) and Small Companies must file Form MGT-7. OPCs and Small Companies file Form MGT-7A (Abridged Annual Return) under Rule 11.' },
      { question: 'What is the due date for filing Form MGT-7?', answer: 'Form MGT-7 must be filed within 60 days from the date of the Annual General Meeting (AGM), or within 60 days from the date the AGM ought to have been held if no AGM was conducted.' },
      { question: 'Does Section 446B relief apply to MGT-7 filings?', answer: 'Yes, if the filing company is a DPIIT-recognized Start-up Company or a Producer Company filing Form MGT-7, Section 446B halves the indicative statutory adjudication penalty exposure under Section 92(5).' }
    ],
    relatedForms: ['mgt-7a', 'aoc-4', 'dir-12'],
    filedTogetherWith: ['aoc-4'],
    contentSections: {
      whatIsThisForm: '<p>Form MGT-7 is the electronic annual return prescribed by the Ministry of Corporate Affairs (MCA) under Section 92 of the Companies Act, 2013 and Rule 11 of the Companies (Management and Administration) Rules, 2014. It captures comprehensive corporate information including shareholding patterns, indebtedness, board composition, director details, remuneration, and compliance certifications.</p>',
      whoMustFile: '<p>Every company registered under the Companies Act, 2013—including standard Private Limited Companies, Public Limited Companies (unlisted and listed), Section 8 Companies, and Producer Companies—must file Form MGT-7. However, One Person Companies (OPCs) and Small Companies are exempt from MGT-7 and file <strong>Form MGT-7A</strong>.</p>',
      dueDateExplained: '<p>Under Section 92(4), Form MGT-7 must be filed <strong>within 60 days from the date of the Annual General Meeting (AGM)</strong>. For a standard subsequent AGM with a 31st March financial year-end (AGM deadline 30th September), the statutory due date is typically <strong>29th November</strong>. If the company holds its first AGM (9 months limit) or obtains an approved ROC extension under Section 96(1), the 60-day period runs from that actual/extended date.</p>',
      consequencesOfDelay: '<p>Delayed filing of Form MGT-7 has two distinct legal consequences: (1) An <strong>Additional Filing Fee of ₹100 per day</strong> payable immediately on the MCA21 portal under Section 403, and (2) <strong>Statutory Adjudication Penalty exposure under Section 92(5)</strong> of ₹10,000 + ₹100/day after the first day (capped at ₹2,00,000 for the company and ₹50,000 per officer in default).</p>',
      workedExample: '<p><strong>Scenario:</strong> A Private Limited Company with nominal share capital of ₹5,00,000 files Form MGT-7 45 days after the due date.</p><ul><li>Normal Filing Fee (Table A, Item 5): ₹400</li><li>Additional Filing Fee (45 days × ₹100/day): ₹4,500</li><li><strong>Total MCA Portal Payable:</strong> ₹400 + ₹4,500 = <strong>₹4,900</strong></li><li><strong>Indicative Section 92(5) Penalty Exposure:</strong> ₹10,000 + (44 days × ₹100) = ₹14,400 for Company + ₹14,400 per Officer (Adjudication Required).</li></ul>'
    }
  },
  {
    slug: 'mgt-7a',
    formNumber: 'MGT-7A',
    formName: 'Abridged Annual Return for OPCs and Small Companies',
    aliases: ['mgt 7a', 'mgt7a', 'small company annual return', 'opc annual return', 'abridged annual return'],
    category: 'annual',
    filedBy: ['One Person Company (OPC)', 'Small Company'],
    dueDate: 'Within 60 days of AGM (or within 60 days of standard due date for OPC)',
    section: 'Section 92(1) Proviso, Companies Act 2013 read with Rule 11',
    penaltyType: 'per_day',
    penaltyRate: '₹100 per day additional filing fee',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: true,
    filingGuides: [
      {
        title: "Complete MGT-7A Annual Return Filing Guide for Small Companies and OPCs (FY 2025-26)",
        slug: "/updates/mgt-7-annual-return-filing-guide-fy-2025-26-due-date-mca-v3-small-company-limits-ccfs2026",
        publishedDate: "2026-03-15",
        summary: "Step-by-step guide to filing Form MGT-7A on MCA V3, covering abridged disclosures, exemption from PCS certification, updated Small Company thresholds, and Section 446B relief.",
        isOfficial: true
      }
    ],
    metaTitle: 'Form MGT-7A Small Co & OPC Annual Return Calc | CorpLaw',
    metaDescription: 'Calculate Form MGT-7A normal filing fees, ₹100/day additional late fee, and Section 446B lesser penalty relief for Small Companies and OPCs (FY 2026-27).',
    ogDescription: 'Calculate Form MGT-7A filing fees and Section 446B penalty relief ceilings for One Person Companies and Small Companies under current 2025-26 rules.',
    faqItems: [
      { question: 'Who is eligible to file Form MGT-7A?', answer: 'One Person Companies (OPCs) under Section 2(62) and Small Companies under Section 2(85) are required to file Form MGT-7A instead of Form MGT-7 from FY 2020-21 onwards (MCA Notification G.S.R. 159(E)).' },
      { question: 'What are the current Small Company thresholds for MGT-7A eligibility?', answer: 'Under MCA Notification G.S.R. 880(E) dated 01.12.2025, a private company qualifies as a Small Company if its paid-up share capital does not exceed ₹10 Crore and its turnover for the immediately preceding financial year does not exceed ₹100 Crore (and it is not a holding/subsidiary, Section 8, or special Act company).' },
      { question: 'What is the filing fee for Form MGT-7A?', answer: 'The normal filing fee for Form MGT-7A is computed under Table A, Item 5 based on Nominal Share Capital (<₹1L: ₹200, ₹1L–₹5L: ₹300, ₹5L–₹25L: ₹400, ₹25L–₹1Cr: ₹500, ≥₹1Cr: ₹600). Delayed filings attract an additional filing fee of ₹100 per day.' },
      { question: 'Does Section 446B penalty relief apply to MGT-7A filers?', answer: 'Yes. All OPCs and Small Companies filing Form MGT-7A are entitled to Section 446B relief on statutory Section 92(5) adjudication penalties (penalties cannot exceed 50% of the statutory amount, with ceilings of ₹1,00,000 for the company and ₹25,000 per officer in default).' },
      { question: 'Is certification by a Company Secretary in Practice required for MGT-7A?', answer: 'No. Form MGT-7A is statutorily exempted from certification by a Company Secretary in Practice (PCS). It can be signed by the Director alone in case of an OPC, or by a Director and Company Secretary in case of a Small Company.' }
    ],
    relatedForms: ['mgt-7', 'aoc-4', 'dir-12'],
    filedTogetherWith: ['aoc-4'],
    contentSections: {
      whatIsThisForm: '<p>Form MGT-7A is an abridged electronic annual return introduced by the Ministry of Corporate Affairs through the Companies (Management and Administration) Amendment Rules, 2021 (G.S.R. 159(E) dated 05.03.2021) specifically for <strong>One Person Companies (OPCs) and Small Companies</strong>. It contains streamlined reporting requirements compared to the full Form MGT-7.</p>',
      whoMustFile: '<p>Form MGT-7A is filed exclusively by: (1) One Person Companies (OPCs) as defined under Section 2(62), and (2) Small Companies as defined under Section 2(85). Non-small private companies, public companies, and Section 8 companies must file Form MGT-7.</p>',
      dueDateExplained: '<p>For Small Companies, Form MGT-7A must be filed <strong>within 60 days from the AGM date</strong> (standard due date: 29th November for FY ending 31st March). For One Person Companies (which are exempt from holding an AGM under Section 122(1)), the filing due date is 60 days from the statutory period within which financial statements are adopted.</p>',
      consequencesOfDelay: '<p>Late filing of Form MGT-7A attracts an <strong>Additional Filing Fee of ₹100 per day</strong> under Table B of the Fees Rules. In case of formal adjudication by the ROC, Section 446B applies to cap the Section 92(5) penalty exposure to a maximum of 50% (ceiling ₹1,00,000 for company and ₹25,000 per officer in default).</p>',
      workedExample: '<p><strong>Scenario:</strong> A Small Company with nominal share capital of ₹2,00,00,000 (₹2 Crore) files Form MGT-7A 30 days late.</p><ul><li>Normal Filing Fee (Table A, Item 5): ₹600</li><li>Additional Filing Fee (30 days × ₹100/day): ₹3,000</li><li><strong>Total MCA Portal Payable:</strong> ₹600 + ₹3,000 = <strong>₹3,600</strong></li><li><strong>Section 92(5) Penalty before 446B:</strong> ₹10,000 + (29 × ₹100) = ₹12,900 for Company + ₹12,900 per Officer.</li><li><strong>Indicative Max Penalty after Section 446B:</strong> ₹6,450 for Company + ₹6,450 per Officer (Adjudication Required).</li></ul>'
    }
  },
  {
    slug: 'aoc-4',
    formNumber: 'AOC-4',
    formName: 'Financial Statements',
    aliases: [
      'aoc form fees',
      'aoc fees',
      'aoc form fee',
      'aoc fee',
      'aoc 4 late fees',
      'aoc 4 late fees calculator',
      'aoc 4 fees calculator',
      'aoc-4 late fees calculator',
      'aoc 4 penalty',
      'aoc 4 penalty calculator',
      'aoc-4 late fees',
      'aoc4 late fees',
      'aoc 4 fees',
      'aoc 4 and mgt 7 late fees',
      'aoc 4 and mgt 7 due date',
      'aoc 4 late filing fees',
      'aoc form price',
      'aoc-4 fees',
      'aoc 4 and mgt 7 late fees calculator',
      'aoc filing fees',
      'aoc 4 filing fees',
      'aoc 4 attachments',
      'aoc fee structure',
      'financial statement filing'
    ],
    category: 'annual',
    filedBy: ['Private Limited', 'Public Limited (Unlisted & Listed)', 'One Person Company (OPC)', 'Small Company', 'Section 8 Company'],
    dueDate: 'Within 30 days of AGM (Within 180 days of FY closure for OPC)',
    section: 'Section 137, Companies Act 2013 read with Rule 12',
    penaltyType: 'per_day',
    penaltyRate: '₹100 per day uncapped additional fee',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    filingGuides: [
      {
        title: "Complete Form AOC-4 Filing Guide for FY 2025-26 — Due Dates, Attachments & MCA V3 Rules",
        slug: "/updates/aoc-4-filing-guide-fy-2024-25",
        publishedDate: "2026-06-10",
        summary: "Comprehensive walkthrough of filing Form AOC-4 Financial Statements on MCA V3, covering standalone vs CFS vs XBRL, cash flow exemptions, and penalty rules.",
        isOfficial: true
      }
    ],
    metaTitle: 'Form AOC-4 Late Fee & Penalty Calculator 2026-27 | CorpLaw',
    metaDescription: 'Calculate Form AOC-4 normal fees, ₹100/day uncapped additional late filing fees, and Section 137(3) ROC adjudication penalties on MCA V3 for FY 2026-27.',
    ogDescription: 'Free institutional calculator for MCA Form AOC-4 normal filing fees, ₹100/day late fee, 30-day AGM due date, OPC 180-day deadline, and Section 137(3) penalty exposure.',
    faqItems: [
      {
        question: 'What are the normal government filing fees for Form AOC-4 on MCA V3?',
        answer: 'The normal government filing fee for Form AOC-4 is governed by Table A (Items 5 & 6) of the Companies (Registration Offices and Fees) Rules, 2014 based on authorized share capital: Nominal capital < ₹1 Lakh: ₹200; ₹1 Lakh to ₹5 Lakhs: ₹300; ₹5 Lakhs to ₹25 Lakhs: ₹400; ₹25 Lakhs to ₹1 Crore: ₹500; ₹1 Crore or more: ₹600. For companies without share capital, the fee is a fixed ₹200.'
      },
      {
        question: 'How is the late filing fee calculated for Form AOC-4?',
        answer: 'Under Table B (Note Item 2) of the Companies (Registration Offices and Fees) Rules, 2014, late filing of Form AOC-4 attracts a flat additional fee of ₹100 per calendar day of delay from the day following the statutory due date. This additional fee has no upper ceiling on the MCA21 V3 portal and accumulates indefinitely until filed.'
      },
      {
        question: 'When is the statutory due date for filing Form AOC-4?',
        answer: 'Under Section 137(1) of the Companies Act, 2013, Form AOC-4 must be filed within 30 days from the date of the Annual General Meeting (AGM). For a company holding its standard AGM on 30th September, the due date is 30th October. If the AGM was extended by the ROC under Section 96(1), the 30-day window commences from that extended date.'
      },
      {
        question: 'What is the AOC-4 filing due date for a One Person Company (OPC)?',
        answer: 'Under the third proviso to Section 137(1), a One Person Company (OPC) is exempt from holding an AGM under Section 122(1) and must file its financial statements within 180 days from the closure of the financial year. For an OPC whose financial year closes on 31st March, the statutory due date is 27th September.'
      },
      {
        question: 'What is the difference between AOC-4 and MGT-7 due dates and late fees?',
        answer: 'Form AOC-4 (Financial Statements) is governed by Section 137 and is due within 30 days of the AGM (standard: 30th October), whereas Form MGT-7/MGT-7A (Annual Return) is governed by Section 92 and is due within 60 days of the AGM (standard: 29th November). Both forms attract the same flat additional late fee of ₹100 per day of delay on the MCA portal, but their underlying statutory adjudication penalties under Section 137(3) and Section 92(5) operate under separate caps.'
      },
      {
        question: 'What is the statutory penalty exposure under Section 137(3) for delayed filing?',
        answer: 'Under Section 137(3) (as amended by the Companies (Amendment) Act, 2020), failure to file financial statements attracts an adjudication penalty of ₹10,000 plus ₹100 per day for continuing default, subject to a maximum cap of ₹2,00,000 for the company, and ₹10,000 plus ₹100 per day subject to a maximum cap of ₹50,000 for the Managing Director, CFO, or Directors in default. These penalties require formal ROC adjudication under Section 454 and are not collected via MCA portal challan.'
      },
      {
        question: 'Does Section 446B penalty relief apply to Form AOC-4 filings?',
        answer: 'Yes. Under Section 446B of the Companies Act, 2013, if the company is an OPC, Small Company (paid-up capital ≤ ₹10 Cr, turnover ≤ ₹100 Cr), DPIIT-recognized Startup, or Producer Company, the maximum penalty payable under Section 137(3) shall not exceed one-half (50%) of the statutory penalty, effectively capping the company penalty at ₹1,00,000 and officer penalties at ₹25,000 per person.'
      },
      {
        question: 'Which companies are exempt from attaching a Cash Flow Statement in Form AOC-4?',
        answer: 'Under the proviso to Section 2(40) of the Companies Act, 2013, One Person Companies (OPCs), Small Companies, Dormant Companies (Section 455), and DPIIT-recognized Private Startups are statutorily exempt from preparing and annexing a Cash Flow Statement to their financial statements.'
      },
      {
        question: 'Who is required to file Form AOC-4 XBRL instead of standalone AOC-4?',
        answer: 'Under Rule 3 of the Companies (Filing of Documents and Forms in XBRL) Rules, 2015, filing in XBRL is mandatory for: (1) All companies listed on any stock exchange in India and their Indian subsidiaries; (2) All companies having paid-up capital of ₹5 Crore or more; (3) All companies having turnover of ₹100 Crore or more; and (4) All companies preparing financial statements under Ind AS. Banking, insurance, power sector, and NBFC companies are exempt from XBRL.'
      },
      {
        question: 'What mandatory attachments must be uploaded with Form AOC-4 on MCA V3?',
        answer: 'Mandatory attachments include: (1) Standalone Balance Sheet; (2) Statement of Profit and Loss; (3) Cash Flow Statement (unless exempt under Section 2(40)); (4) Notes to Accounts; (5) Independent Auditor\'s Report with CARO 2020 if applicable; (6) Board\'s Report signed under Section 134; (7) Notice of AGM with Explanatory Statements; (8) Form AOC-1 for subsidiaries/associates (if applicable); and (9) CSR Report in prescribed format (if Section 135 applies).'
      }
    ],
    relatedForms: ['mgt-7', 'mgt-7a', 'adt-1'],
    filedTogetherWith: ['mgt-7', 'mgt-7a'],
    contentSections: {
      whatIsThisForm: '<p>Form AOC-4 is the statutory electronic return prescribed by the Ministry of Corporate Affairs (MCA) under Section 137 of the Companies Act, 2013 read with Rule 12 of the Companies (Accounts) Rules, 2014. Through this form, every company files its audited financial statements, including the Balance Sheet, Profit and Loss Account, Directors\' Report, and Auditor\'s Report, with the Registrar of Companies (ROC).</p><p>Depending on corporate structure and thresholds, companies file variants of this form: <strong>AOC-4</strong> (standard standalone non-XBRL), <strong>AOC-4 CFS</strong> (consolidated financial statements for companies with subsidiaries/JVs under Section 129(3)), <strong>AOC-4 XBRL</strong> (for listed entities, capital ≥ ₹5 Cr, or turnover ≥ ₹100 Cr), or <strong>AOC-4 NBFC (Ind AS)</strong> for NBFCs.</p>',
      whoMustFile: '<p>Every company incorporated under the Companies Act, 2013 or previous company laws—including Private Limited Companies, Public Limited Companies (unlisted and listed), One Person Companies (OPCs), Section 8 Companies, and Producer Companies—must file its financial statements annually using Form AOC-4 or its applicable variant.</p><p>Small Companies and OPCs benefit from significant disclosure relaxations, including a statutory exemption from preparing a Cash Flow Statement under the proviso to Section 2(40) and abridged Board\'s Report disclosures under Rule 8A of the Companies (Accounts) Rules, 2014.</p>',
      dueDateExplained: '<p>The statutory due date for filing Form AOC-4 depends on the company classification:</p><ul><li><strong>Standard Companies (AGM Held):</strong> Within <strong>30 days</strong> from the date of the Annual General Meeting (AGM) under Section 137(1). For a company holding its AGM on the standard deadline of 30th September, the due date is <strong>30th October</strong>.</li><li><strong>Subsequent AGM with ROC Extension:</strong> If the company obtains an extension of up to 3 months from the ROC under Section 96(1), the 30-day clock begins from the actual/extended AGM date.</li><li><strong>One Person Company (OPC):</strong> Under the third proviso to Section 137(1), OPCs are exempt from holding an AGM (Section 122(1)) and must file within <strong>180 days from the closure of the financial year</strong> (i.e. <strong>27th September</strong> for a 31st March financial year-end).</li><li><strong>AGM Not Held:</strong> Under Section 137(2), if the AGM is not held, financial statements along with reasons for not holding the meeting must be filed within <strong>30 days of the latest date on which the AGM ought to have been held</strong>.</li></ul>',
      consequencesOfDelay: '<p>Delay in filing Form AOC-4 triggers dual statutory liabilities under corporate law:</p><ol><li><strong>Additional Late Filing Fee (Table B, Note Item 2):</strong> A flat statutory late fee of <strong>₹100 per day</strong> of delay is levied automatically on the MCA21 V3 portal upon form upload. This additional fee has no upper ceiling and continues indefinitely until the form is filed.</li><li><strong>Civil Adjudication Penalty Exposure (Section 137(3)):</strong> In case of formal adjudication proceedings initiated by the ROC under Section 454, the company is liable to a base penalty of <strong>₹10,000 plus ₹100 per day</strong> for continuing default (capped at <strong>₹2,00,000</strong>). The Managing Director, CFO, and Directors in default face individual penalties of <strong>₹10,000 plus ₹100 per day</strong> (capped at <strong>₹50,000</strong> each). Under Section 446B, these penalties are halved for Small Companies, OPCs, and Startups.</li><li><strong>Director Disqualification (Section 164(2)(a)):</strong> Failure to file financial statements for continuous period of <strong>3 financial years</strong> results in automatic disqualification of all directors from holding office in any company for 5 years.</li></ol>',
      workedExample: '<p><strong>Scenario:</strong> A Private Limited Company with nominal share capital of ₹10,00,000 held its AGM on 30th September 2026 and filed Form AOC-4 on 29th November 2026 (30 days delay past the 30th October due date).</p><ul><li>Normal Government Filing Fee (Table A, Item 5 — ₹5L to ₹25L): <strong>₹400</strong></li><li>Additional Filing Fee on MCA V3 (30 days × ₹100/day): <strong>₹3,000</strong></li><li><strong>Total MCA21 Portal Payable:</strong> ₹400 + ₹3,000 = <strong>₹3,400</strong></li><li><strong>Indicative Section 137(3) Adjudication Exposure:</strong> ₹10,000 base + (29 continuing days × ₹100) = <strong>₹12,900 for Company</strong> and <strong>₹12,900 per Officer in default</strong> (Subject to ROC adjudication under Section 454; not collected via e-Challan).</li></ul>'
    }
  },
  {
    slug: 'spice-plus',
    formNumber: 'SPICe+',
    formName: 'Incorporation of Company (SPICe+ / Form INC-32)',
    aliases: [
      'spice',
      'spice+',
      'spice plus',
      'inc-32',
      'form inc-32',
      'incorporation',
      'company registration',
      'mca incorporation fee',
      'company registration fees',
      'stamp duty company incorporation',
      'moa aoa stamp duty',
      'spice part a part b',
      'agile-pro-s',
      'inc-33',
      'inc-34',
      'opc incorporation',
      'private limited registration fee'
    ],
    category: 'incorporation',
    filedBy: ['Promoters', 'Subscribers', 'New Companies (Pvt Ltd, Public, OPC, Section 8)'],
    dueDate: '20 days from Name Reservation (Rule 9A)',
    section: 'Section 7, 8, 12, 152 & 153 read with Rule 38 & 38A, Companies (Incorporation) Rules 2014',
    penaltyType: 'nil',
    penaltyRate: 'No late fee (Entity not yet formed; name lapses after 20 days if unfiled)',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'nil',
    concessionApplies: true,
    metaTitle: 'SPICe+ INC-32 Company Incorporation Calculator | CorpLaw',
    metaDescription: 'Calculate SPICe+ (INC-32) MCA registration fees, 36 states MOA/AOA stamp duty, PAN/TAN charges, and DIN costs for incorporating an Indian company.',
    ogDescription: 'Accurate 2026 SPICe+ (INC-32) MCA & State Stamp Duty Fee Calculator covering all 36 States/UTs, G.S.R. 329(E) ₹15L zero-fee waiver, and 180-day compliance checklist.',
    faqItems: [
      {
        question: 'Is the MCA incorporation fee completely waived up to ₹15 Lakhs capital?',
        answer: 'Yes. Under G.S.R. 329(E) dated 25th April 2019 amending Table A of the Companies (Registration Offices and Fees) Rules, 2014, the MCA normal filing fee is NIL for companies incorporating with an authorized share capital up to ₹15,00,000. However, state stamp duty on MOA/AOA, e-form stamp duty, and statutory PAN/TAN charges (₹155) remain payable.'
      },
      {
        question: 'What are the linked forms integrated into SPICe+ (INC-32)?',
        answer: 'SPICe+ Part B is filed alongside SPICe+ MOA (Form INC-33), SPICe+ AOA (Form INC-34), AGILE-PRO-S (Form INC-35) for GSTIN/EPFO/ESIC/PT/Bank Account, and INC-9 electronic declarations signed digitally by directors and subscribers.'
      },
      {
        question: 'How is state stamp duty calculated for electronic MOA and AOA?',
        answer: 'Stamp duty is governed by the Indian Stamp Act, 1899 and respective State Stamp Acts. Some states levy flat charges (e.g. Uttar Pradesh flat ₹500 MOA + ₹500 AOA; West Bengal ₹300 MOA + ₹300 AOA), while others apply progressive slabs or percentages (e.g. Maharashtra 0.3% min ₹1,000 max ₹1 Cr; Karnataka ₹5,000 per ₹10L on AOA under Karnataka Stamp Amendment Act 2024; Delhi 0.15% on AOA).'
      },
      {
        question: 'Can proposed directors obtain DIN through SPICe+ without filing DIR-3?',
        answer: 'Yes. Under Section 153 read with Rule 38, up to 3 proposed directors who do not possess a DIN can apply for and receive DIN directly through SPICe+ Part B at ₹0 government fee. Any director beyond 3 must obtain DIN separately via Form DIR-3 paying the standard ₹500 statutory fee.'
      },
      {
        question: 'What is the statutory validity of a company name reserved under SPICe+ Part A?',
        answer: 'Under Rule 9A of the Companies (Incorporation) Rules, 2014, a reserved name for a new company is valid for 20 days. Promoters can extend name validity before expiry by paying ₹1,000 for an additional 20 days (up to 40 days total) or ₹2,000 for an additional 40 days (up to 60 days total).'
      },
      {
        question: 'What are the critical post-incorporation compliances within 180 days?',
        answer: 'Upon receiving the Certificate of Incorporation, every company must: (1) Open a bank account and deposit subscription money; (2) File Form INC-20A (Commencement of Business) within 180 days under Section 10A; (3) File Form ADT-1 within 30 days of the first board meeting to formalize auditor appointment under Section 139(6); and (4) Issue physical share certificates to subscribers within 60 days under Section 56(4).'
      },
      {
        question: 'Are Section 8 (Non-Profit) companies exempt from stamp duty?',
        answer: 'Yes. In the majority of states and union territories (including Delhi, Maharashtra, Karnataka, and Tamil Nadu), electronic MOA and AOA stamp duties are either fully exempt or levied at nominal base rates for non-profit companies licensed under Section 8 of the Companies Act, 2013.'
      }
    ],
    relatedForms: ['inc-20a', 'adt-1', 'dir-3-kyc'],
    filedTogetherWith: ['inc-33', 'inc-34', 'agile-pro-s', 'inc-9'],
    contentSections: {
      whatIsThisForm: '<p><strong>SPICe+ (Simplified Proforma for Incorporating Company Electronically Plus)</strong>, officially designated as <strong>Form INC-32</strong>, is the comprehensive single-window web-based incorporation mechanism administered by the Ministry of Corporate Affairs (MCA) under Section 7 of the Companies Act, 2013 read with Rule 38 and Rule 38A of the Companies (Incorporation) Rules, 2014.</p><p>SPICe+ operates in two integrated segments: <strong>Part A</strong> for reservation of name for new companies, and <strong>Part B</strong> for incorporation offering 11 integrated services in a unified workflow: Company Name Reservation, Certificate of Incorporation (COI) allotment by the Central Registration Centre (CRC), Director Identification Numbers (DIN for up to 3 directors), Permanent Account Number (PAN), Tax Deduction and Collection Account Number (TAN), EPFO registration, ESIC registration, State Professional Tax (PT) registration, Mandatory Corporate Bank Account opening, optional GSTIN registration, and Delhi Shops & Establishment registration.</p>',
      whoMustFile: '<p>Any group of promoters, professionals, or sole entrepreneurs intending to incorporate an entity under the Companies Act, 2013 in India must file SPICe+ (INC-32). This includes:</p><ul><li><strong>Private Limited Companies:</strong> Minimum 2 subscribers and 2 directors.</li><li><strong>One Person Companies (OPCs):</strong> Single subscriber/director plus designated nominee under Section 3(1)(c).</li><li><strong>Public Limited Companies (Unlisted & Listed):</strong> Minimum 7 subscribers and 3 directors.</li><li><strong>Section 8 Non-Profit Companies:</strong> Entities licensed under Section 8 for charitable or social objectives.</li><li><strong>Producer Companies:</strong> Agricultural and primary producer collectives formed under Chapter XXIA.</li></ul>',
      dueDateExplained: '<p>Because SPICe+ is an initial incorporation application, there is no recurring annual statutory due date. However, strict statutory timeframes govern the incorporation cycle:</p><ul><li><strong>SPICe+ Part A Name Reservation (Rule 9A):</strong> A name approved under Part A remains valid for <strong>20 days</strong> from the date of approval. SPICe+ Part B along with linked forms must be submitted within this 20-day window.</li><li><strong>Name Extension Facility (Rule 9A Provisos):</strong> Promoters can extend the name validity on MCA V3 by paying <strong>₹1,000</strong> (before 20 days expiry to extend up to 40 days) or <strong>₹2,000</strong> (before 40 days expiry to extend up to 60 days).</li><li><strong>180-Day Commencement Deadline (Section 10A):</strong> Within <strong>180 days</strong> of receiving the Certificate of Incorporation, the company must receive subscription funds and file <strong>Form INC-20A</strong> before commencing any commercial operations or borrowing money.</li></ul>',
      consequencesOfDelay: '<p>Filing SPICe+ does not attract per-day late filing fees (such as the ₹100/day late fee under Table B) because the company does not legally exist prior to incorporation. However, procedural delays carry significant consequences:</p><ol><li><strong>Lapse of Approved Name:</strong> If SPICe+ Part B is not filed before the 20-day validity expires (and no Rule 9A extension is applied for), the approved name is released back into the public MCA name pool, requiring a fresh ₹1,000 filing.</li><li><strong>Default in Post-Incorporation Form INC-20A (Section 10A(2)):</strong> If the company fails to file Form INC-20A within 180 days of incorporation, the company is liable to a penalty of <strong>₹50,000</strong>, and every officer in default is liable to a penalty of <strong>₹1,000 per day</strong> of continuing default, up to a maximum of <strong>₹1,00,000</strong>. Furthermore, the ROC may initiate strike-off proceedings under Section 248.</li><li><strong>Delayed Auditor Appointment (Section 139(6)):</strong> The first auditor must be appointed by the Board within 30 days of incorporation, failing which members must hold an EGM within 90 days.</li></ol>',
      workedExample: '<p><strong>Comparative Scenario:</strong> Incorporating a Private Limited Company with <strong>₹10,00,000 Authorized Capital</strong> and 2 directors across key jurisdictions:</p><ul><li><strong>MCA Normal Registration Fee (G.S.R. 329(E)):</strong> <strong>₹0</strong> (Zero fee applies across India since capital ≤ ₹15,00,000).</li><li><strong>Statutory PAN & TAN Charges:</strong> <strong>₹155</strong> (₹78 PAN + ₹77 TAN fixed across all states).</li><li><strong>Case A — NCT of Delhi:</strong> MOA Stamp Duty: ₹200 | AOA Stamp Duty (0.15%): ₹1,500 | SPICe+ Form Stamp Duty: ₹10. <strong>Total Government Estimate: ₹1,865</strong>.</li><li><strong>Case B — Maharashtra (Mumbai):</strong> MOA Stamp Duty: ₹1,000 | AOA Stamp Duty (0.3% / ₹1,000 per ₹5L): ₹2,000 | SPICe+ Form Stamp Duty: ₹100. <strong>Total Government Estimate: ₹3,255</strong>.</li><li><strong>Case C — Karnataka (Bengaluru):</strong> MOA Stamp Duty: ₹1,000 | AOA Stamp Duty (Karnataka Stamp Amendment Act 2024 — ₹5,000 per ₹10L): ₹5,000 | SPICe+ Form Stamp Duty: ₹20. <strong>Total Government Estimate: ₹6,175</strong>.</li></ul>'
    }
  },
  {
    slug: 'dir-3-kyc',
    formNumber: 'DIR-3 KYC',
    formName: 'Director KYC Web (Triennial Cycle & Change Update)',
    aliases: ['dir3 kyc', 'director kyc', 'din kyc', 'dir 3 kyc', 'dir-3 kyc web', 'triennial kyc', 'din reactivation fee', 'rule 12a'],
    category: 'kyc',
    filedBy: ['Individual DIN Holders (Active & Disqualified)', 'Company Directors', 'Designated Partners (LLP)'],
    dueDate: '30th June of every 3rd Financial Year (or within 30 days of change in details)',
    section: 'Rule 12A(1) & 12A(2), Companies (Appointment and Qualification of Directors) Rules, 2014 (G.S.R. 943(E))',
    penaltyType: 'flat',
    penaltyRate: 'NIL on-time; ₹500 for change update; ₹5,000 for late / DIN reactivation',
    normalFeeStructure: 'nil',
    baseFeeSlab: 'nil',
    concessionApplies: false,
    metaTitle: 'DIR-3 KYC Due Date & Penalty Fee Calculator | CorpLaw',
    metaDescription: 'Check exact DIR-3 KYC triennial due date, Rule 12A(2) 30-day change rules, and G.S.R. 300(E) fee schedule (₹0 on-time / ₹500 change / ₹5,000 reactivation).',
    ogDescription: 'Authoritative DIR-3 KYC Due Date & Fee Calculator. Determine your triennial cycle anchor, check 30-day update rules, and calculate DIN reactivation fees on MCA V3.',
    faqItems: [
      {
        question: 'What is the new Triennial DIR-3 KYC regime under G.S.R. 943(E)?',
        answer: 'By notification G.S.R. 943(E) dated 31 December 2025 (effective 31 March 2026), the MCA replaced the old annual September filing with a triennial (every 3 consecutive financial years) filing cycle. Routine KYC is now due on or before 30 June of the year following every third financial year. Additionally, the old e-form and web service have been unified into a single Form DIR-3 KYC Web.'
      },
      {
        question: 'Do I need to file DIR-3 KYC in FY 2026-27 if I filed in FY 2025-26?',
        answer: 'No. For directors who held a DIN on or before 31 March 2025 and completed their KYC for FY 2025-26, no routine filing is required in FY 2026-27. Under the transitional triennial rules, your next routine KYC compliance window will open in April – June 2028. You only need to file in FY 2026-27 if your mobile number, email, or address changes.'
      },
      {
        question: 'How is the triennial 3-year cycle calculated for new DIN allotments?',
        answer: 'The cycle is anchored strictly to the financial year in which the DIN was allotted (NOT the date of last filing). A DIN allotted during FY 2025-26 is due in April–June 2029. A DIN allotted during FY 2026-27 is due in April–June 2030.'
      },
      {
        question: 'What is the 30-day event-based update rule under Rule 12A(2)?',
        answer: 'Under Rule 12A(2), whenever there is any change in personal particulars (mobile number, email address, residential address, nationality, or PAN details), the DIN holder MUST file Form DIR-3 KYC Web within 30 days of such change, accompanied by a fee of ₹500.'
      },
      {
        question: 'Does filing an event-based update reset or extend the 3-year triennial cycle?',
        answer: 'No. This is the single biggest misconception. Filing a change update under Rule 12A(2) keeps your contact details current, but DOES NOT reset or postpone the 3-year clock. Your next routine triennial KYC remains strictly anchored to your original DIN allotment year.'
      },
      {
        question: 'What is the government fee schedule for Form DIR-3 KYC Web under G.S.R. 300(E)?',
        answer: 'Under G.S.R. 300(E) dated 21 April 2026 (Item VII of Fees Rules Annexure): (1) Routine triennial filing on time: ₹0 (NIL); (2) Event-based update under Rule 12A(2): ₹500 per filing; (3) Delayed routine filing or DIN reactivation: Flat ₹5,000 fee.'
      },
      {
        question: 'Does the ₹5,000 late fee compound with days or months of delay?',
        answer: 'No. Unlike Form AOC-4 (which charges ₹100 per day without limit) or Table B multiplier forms (DPT-3/ADT-1), the ₹5,000 fee for DIR-3 KYC is a flat, non-compounding fee. Whether you file 1 day late or 4 years late, the portal fee is ₹5,000.'
      },
      {
        question: 'What are the legal consequences if my DIN is deactivated for non-filing?',
        answer: 'A deactivated DIN cannot be used to sign any electronic form on MCA V3, and the individual cannot be appointed to any new board. More critically, one deactivated DIN can freeze the entire filing pipeline of a company, preventing it from filing annual returns (MGT-7) and financial statements (AOC-4).'
      },
      {
        question: 'Can DIN deactivation lead to Section 164(2) director disqualification?',
        answer: 'Yes, through a dangerous cascading effect. While KYC non-filing does not directly trigger disqualification, a deactivated DIN prevents the company from submitting annual returns. If the company fails to file financial statements or annual returns for continuous 3 years as a result, ALL directors face automatic 5-year disqualification under Section 164(2).'
      },
      {
        question: 'Is professional certification by CA/CS/CMA mandatory for DIR-3 KYC Web?',
        answer: 'Yes. Every Form DIR-3 KYC Web must be digitally signed by the DIN holder and certified by a practicing Chartered Accountant (CA), Company Secretary (CS), or Cost Accountant (CMA). Providing false statements attracts criminal liability and up to 3 years imprisonment under Sections 448 and 449 of the Companies Act, 2013.'
      }
    ],
    relatedForms: ['dir-12', 'aoc-4', 'mgt-7'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form DIR-3 KYC Web</strong> is the unified electronic return prescribed under <strong>Rule 12A of the Companies (Appointment and Qualification of Directors) Rules, 2014</strong>. Effective <strong>31 March 2026</strong> via MCA Notification <strong>G.S.R. 943(E)</strong>, the MCA merged the legacy DIR-3 KYC e-form and web service into a single web form and transitioned corporate India from an annual filing obligation to a <strong>triennial (every 3 consecutive financial years) compliance cycle</strong>.</p><p>The return verifies director identity, mobile number, email address, residential address, and active DIN status across the MCA21 database to prevent fraudulent appointments and maintain statutory transparency.</p>',
      whoMustFile: '<p>Every individual who has been allotted a <strong>Director Identification Number (DIN)</strong> on or before the 31st of March of a financial year must comply with Rule 12A. This obligation attaches to the <strong>DIN itself</strong>, meaning it applies regardless of whether the individual is actively serving on a board, is currently inactive, or has been disqualified under Section 164.</p><p><strong>Exemption:</strong> Only DIN holders who have validly surrendered their DIN under Section 153 or whose DIN has been officially cancelled by the Central Government are exempt.</p>',
      dueDateExplained: '<p>Under G.S.R. 943(E), compliance operates under two distinct statutory tracks:</p><ol><li><strong>Track 1 — Routine Triennial KYC (Rule 12A(1)):</strong> Due once every 3 consecutive financial years, on or before <strong>30th June</strong> of the applicable year. The cycle is anchored strictly to the financial year of DIN allotment. For example, directors holding DINs prior to 31 March 2025 who filed for FY 2025-26 are next due in <strong>April – June 2028</strong>.</li><li><strong>Track 2 — Event-Based Updates (Rule 12A(2)):</strong> Any change in mobile number, email address, or residential address must be filed <strong>within 30 days</strong> of the change with a fee of ₹500. <em>Crucially, filing a change update does NOT reset or extend the 3-year triennial cycle.</em></li></ol>',
      consequencesOfDelay: '<p>Failing to file Form DIR-3 KYC Web carries immediate operational and legal consequences:</p><ul><li><strong>Immediate DIN Deactivation:</strong> On 1st July following the due date, the MCA21 system automatically marks the DIN as <em>"Deactivated due to non-filing of DIR-3 KYC"</em>.</li><li><strong>Complete Filing Freeze:</strong> A deactivated DIN cannot sign any MCA form digitally and blocks the company from filing its mandatory Annual Returns (MGT-7/7A) and Financial Statements (AOC-4).</li><li><strong>Flat Reactivation Fee of ₹5,000:</strong> Reactivation requires submitting Form DIR-3 KYC Web along with a flat ₹5,000 fee prescribed under G.S.R. 300(E). Approvals are processed on Straight-Through-Process (STP) basis.</li><li><strong>Cascading Disqualification Risk (Section 164(2)):</strong> If unfiled company returns accumulate for 3 continuous financial years due to a director\'s deactivated DIN, all board members face statutory 5-year disqualification across all Indian entities.</li><li><strong>False Statement Sanctions (Sections 448 & 449):</strong> Certifying false or manipulated contact details exposes both the director and the certifying CA/CS/CMA to criminal prosecution and up to 3 years imprisonment.</li></ul>',
      workedExample: '<div class="space-y-4"><p><strong>Scenario 1: Active Director (DIN allotted June 2024, KYC filed for FY 2025-26)</strong></p><ul><li>Filing obligation in FY 2026-27: <strong>None (Compliant)</strong></li><li>Next Triennial Compliance Window: <strong>April – 30 June 2028</strong></li><li>Government Fee Payable: <strong>₹0 (NIL)</strong></li></ul><p><strong>Scenario 2: Director Changes Residential Address in August 2026</strong></p><ul><li>Statutory Rule: Rule 12A(2) (Event-based update)</li><li>Statutory Deadline: Within 30 days of relocation</li><li>Government Fee Payable (Item VII): <strong>₹500 flat</strong></li><li>Impact on Triennial Clock: <strong>None</strong> (Next routine KYC remains due in April–June 2028).</li></ul><p><strong>Scenario 3: Director Missed Previous Filings (DIN Deactivated)</strong></p><ul><li>Action Required: Immediate filing of Form DIR-3 KYC Web</li><li>Statutory Fee Payable (G.S.R. 300(E)): <strong>₹5,000 flat fee</strong></li><li>Approval Mode: Automatic reactivation via MCA21 V3 STP</li></ul></div>'
    }
  },
  {
    slug: 'adt-1',
    formNumber: 'ADT-1',
    formName: 'Auditor Appointment',
    aliases: [
      'adt 1 late fees',
      'adt 1 late fees calculator',
      'adt-1 late fees calculator',
      'adt1 late fees',
      'adt-1 late fees',
      'adt-1 fees calculator',
      'adt-1 due date and penalty',
      'late fee for adt 1',
      'late fees for adt 1',
      'adt 1 penalty',
      'adt 1 late filing fees',
      'adt 1 filing fees',
      'adt1 due date',
      'adt-1 late filing fees',
      'adt-1 penalty',
      'adt 1 fees calculator',
      'penalty for late filing of adt 1',
      'adt 1 due date',
      'adt 1 fees',
      'adt-1 fees',
      'adt-1 due date',
      'adt1 fees',
      'adt 1 late fee',
      'adt 1 fee',
      'penalty for late filing of adt-1',
      'adt-1 filing fees',
      'adt-1 late fee',
      'auditor appointment fees',
      'adt 1 form fees',
      'auditor appointment late fees',
      'fees for filing adt 1',
      'adt-1 additional fees',
      'adt 1 penalty calculator',
      'adt 1 additional fees',
      'adt 1 due date and penalty',
      'casual vacancy adt-1',
      'adt-1 calculator',
      'auditor appointment'
    ],
    category: 'event',
    filedBy: ['Private Limited', 'Public Limited (Unlisted & Listed)', 'One Person Company (OPC)', 'Section 8 Company', 'Producer Company'],
    dueDate: 'Within 15 days of AGM / Appointment Meeting',
    section: 'Section 139(1), Companies Act 2013 read with Rule 4(2)',
    penaltyType: 'multiplier',
    penaltyRate: '1x to 12x normal fee (Table B, Rule 12)',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    metaTitle: 'Form ADT-1 Auditor Appointment Late Fee Calc | CorpLaw',
    metaDescription: 'Calculate MCA normal fees, 15-day due date from AGM, Table B late multipliers (2x to 12x), and Section 403 condonation rules for Form ADT-1 appointment.',
    ogDescription: 'Calculate MCA fees and late penalties for Form ADT-1 (Notice of appointment of auditor) with Table B multiplier slabs and 15-day statutory due date engine.',
    faqItems: [
      {
        question: 'What is the statutory due date for filing Form ADT-1?',
        answer: 'Pursuant to Section 139(1) of the Companies Act, 2013 read with Rule 4(2) of the Companies (Audit and Auditors) Rules, 2014, Form ADT-1 must be filed with the Registrar of Companies (ROC) strictly within 15 days from the date of the meeting (AGM, EGM, or Board Meeting) in which the statutory auditor was appointed.'
      },
      {
        question: 'How is late fee calculated for Form ADT-1 under MCA Table B?',
        answer: 'Form ADT-1 is an event-based form governed by Table B of the Companies (Registration Offices and Fees) Rules, 2014. If delayed, additional fees escalate as a multiple of the normal filing fee: up to 15 days delay = 1x; 16 to 30 days = 2x; 31 to 60 days = 4x; 61 to 90 days = 6x; 91 to 180 days = 10x; beyond 180 days = 12x normal fee.'
      },
      {
        question: 'Does Form ADT-1 have a ₹100 per day penalty like AOC-4 or MGT-7?',
        answer: 'No. The flat ₹100 per day additional fee introduced by the Companies (Registration Offices and Fees) Second Amendment Rules, 2018 applies exclusively to annual statutory returns (Form AOC-4, AOC-4 CFS, AOC-4 XBRL, MGT-7, and MGT-7A). Form ADT-1 is governed by the time-slab multiplier system under Table B and is capped at 12 times the base fee for delays up to 270 days.'
      },
      {
        question: 'Is Form ADT-1 mandatory for the appointment of the First Auditor?',
        answer: 'Yes, absolutely. Under Notification G.S.R. 359(E) dated 30 May 2025 (effective 14 July 2025), the MCA amended Rule 4(2) of the Companies (Audit and Auditors) Rules, 2014 to explicitly mandate filing Form ADT-1 for the First Auditor within 15 days of the Board Meeting held under Section 139(6). The historical ambiguity regarding whether a board resolution alone was sufficient without filing ADT-1 has now been completely extinguished.'
      },
      {
        question: 'What is the Straight Through Process (STP) auto-approval mode for Form ADT-1 on MCA V3?',
        answer: 'Form ADT-1 on MCA V3 operates under Straight Through Process (STP). Once the web-form is digitally signed by the Director/CS and the statutory e-Challan is paid, the MCA system instantly auto-approves the filing without manual ROC intervention, updating company master records and the auditor’s PAN association immediately.'
      },
      {
        question: 'Can the appointment date of an auditor be backdated when filing Form ADT-1?',
        answer: 'No. The MCA V3 portal enforces automated date validations and systemic consistency checks with incorporation dates and previous filings. Backdating appointments is strictly prohibited under Rule 4(2) and Section 448 (punishment for false statement). Timely filing within 15 days of the actual meeting date is legally required.'
      },
      {
        question: 'What is the role of the Audit Committee under Section 177 before filing Form ADT-1?',
        answer: 'For companies required to constitute an Audit Committee under Section 177 (all listed public companies and unlisted public companies with paid-up capital ≥ ₹10 Cr, turnover ≥ ₹100 Cr, or borrowings > ₹50 Cr), the appointment, qualification, remuneration, and rotation of the statutory auditor must first be recommended by the Audit Committee before consideration by the Board of Directors or shareholders.'
      },
      {
        question: 'What is the due date and procedure for filing ADT-1 in case of a Casual Vacancy?',
        answer: 'Under Section 139(8), a casual vacancy caused by death or disqualification must be filled by the Board within 30 days. If caused by resignation, the Board’s recommendation must also be approved by members at an EGM convened within 3 months. In both instances, Form ADT-1 must be filed with the ROC within 15 days of the meeting where the appointment was effected.'
      },
      {
        question: 'Can a statutory auditor be appointed for 5 consecutive years? Is annual ratification required?',
        answer: 'Yes. Individual auditors can be appointed for one term of 5 consecutive years, and audit firms for two terms of 5 consecutive years (subject to rotation under Section 139(2)). Form ADT-1 is filed once upon the 5-year appointment. Following the Companies (Amendment) Act, 2017, the earlier requirement of annual ratification of auditor appointment at every AGM has been deleted.'
      },
      {
        question: 'What happens if Form ADT-1 is delayed beyond 180 days or 270 days?',
        answer: 'For delays between 181 and 270 days, the maximum Table B additional fee of 12 times the normal fee is payable. If the delay exceeds 270 days, under the second proviso to Section 403(1) of the Companies Act, 2013, the form cannot be processed normally without obtaining prior condonation of delay from the Central Government (Regional Director) by filing Form CG-1.'
      },
      {
        question: 'What are the normal filing fees for Form ADT-1 based on authorized share capital?',
        answer: 'Under Table A (Items 5 & 6) of Rule 12 Annexure: Nominal capital < ₹1 Lakh = ₹200; ₹1 Lakh to < ₹5 Lakhs = ₹300; ₹5 Lakhs to < ₹25 Lakhs = ₹400; ₹25 Lakhs to < ₹1 Crore = ₹500; ₹1 Crore or more = ₹600; Companies not having share capital = ₹200.'
      },
      {
        question: 'Is there any concessional fee in Form ADT-1 for Small Companies or OPCs?',
        answer: 'No. The concessional fee schedule for One Person Companies (OPC) and Small Companies under Table A applies only to initial incorporation documents (SPICe+ / MOA registration). Normal post-incorporation filing fees (Items 5 & 6) and Table B late fee multipliers apply uniformly to all companies, including OPCs and Small Companies.'
      },
      {
        question: 'What mandatory documents must be attached to Form ADT-1 on MCA V3?',
        answer: 'The mandatory attachments on MCA V3 are: (1) Written consent of the auditor in terms of Section 139(1); (2) Certificate of eligibility under Section 141 confirming they are not disqualified and within statutory ceiling limits; (3) Certified true copy of the Board or AGM / EGM resolution; and (4) Intimation letter sent by the company to the appointed auditor.'
      },
      {
        question: 'What is the statutory penalty for non-filing of Form ADT-1 under Section 147?',
        answer: 'If a company fails to appoint an auditor or contravenes Section 139, the company is punishable with a fine of not less than ₹25,000 which may extend to ₹5,00,000, and every officer in default is punishable with fine of not less than ₹10,000 which may extend to ₹1,00,000 under Section 147(1).'
      },
      {
        question: 'Can late fees for Form ADT-1 be waived under MCA immunity or amnesty schemes?',
        answer: 'MCA occasional amnesty schemes (such as the earlier CFSS 2020 or LLP Settlement Scheme) periodically grant immunity from additional filing fees for belated returns. However, in standard operational periods on MCA V3, the portal automatically calculates and levies the non-waivable Table B additional fee at checkout.'
      },
      {
        question: 'How to calculate the 15-day deadline if the AGM was held on 30th September?',
        answer: 'Day 0 is the date of the meeting (30th September). The 15-day statutory window begins the next day (1st October). Therefore, Day 15 falls on 15th October. Any filing on or before 15th October attracts ₹0 late fee. Filing on 16th October constitutes a 1-day delay and attracts a 1x additional filing fee.'
      },
      {
        question: 'What if the statutory auditor resigns before completing their 5-year tenure?',
        answer: 'The resigning auditor must file Form ADT-3 with the ROC and the company within 30 days of resignation stating reasons. The company must then fill the casual vacancy under Section 139(8) by holding a Board Meeting within 30 days and EGM within 3 months, followed by filing a fresh Form ADT-1 for the incoming auditor within 15 days of appointment.'
      }
    ],
    relatedForms: ['aoc-4', 'mgt-7', 'dir-12'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form ADT-1</strong> is the statutory notice mandated under <strong>Section 139(1) of the Companies Act, 2013</strong> read with <strong>Rule 4(2) of the Companies (Audit and Auditors) Rules, 2014</strong>, filed with the Ministry of Corporate Affairs (MCA) to officially intimate the Registrar of Companies (ROC) regarding the appointment of a statutory auditor.</p><p>Following <strong>Notification G.S.R. 359(E) (effective 14 July 2025)</strong>, filing Form ADT-1 is explicitly mandatory for <strong>First Auditor appointments</strong> under Section 139(6) as well as subsequent 5-year AGM appointments. Submitting Form ADT-1 on the MCA V3 portal registers the auditor’s PAN, ICAI Firm Registration Number (FRN), membership number, term of appointment, and registered office into the public record under Straight Through Process (STP) auto-approval.</p>',
      whoMustFile: '<p>Every company incorporated under the Companies Act, 2013 or previous company laws must file Form ADT-1 upon appointing or re-appointing a statutory auditor. This includes:</p><ul><li><strong>Private Limited Companies</strong> (Standard & Small Companies)</li><li><strong>Public Limited Companies</strong> (Unlisted and Listed)</li><li><strong>One Person Companies (OPC)</strong></li><li><strong>Section 8 Companies</strong> (Non-profit organizations)</li><li><strong>Producer Companies</strong></li></ul><p>Form ADT-1 is statutorily mandated for:</p><ol><li><strong>First Auditor Appointment:</strong> Appointed by the Board within 30 days of incorporation under Section 139(6). Mandatory Form ADT-1 filing within 15 days of Board meeting under amended Rule 4(2) [Notification G.S.R. 359(E)].</li><li><strong>Subsequent Auditor Appointment at AGM:</strong> Appointed for a term of up to 5 consecutive years under Section 139(1).</li><li><strong>Casual Vacancy Appointment:</strong> Filling a vacancy caused by death, disqualification, or resignation under Section 139(8).</li></ol>',
      dueDateExplained: '<p>Unlike standard ROC returns allowing a 30-day window, Form ADT-1 enforces a tight statutory timeline of <strong>strictly within 15 days</strong> from the date of the meeting at which the auditor was appointed:</p><ul><li><strong>Standard AGM Scenario:</strong> If the Annual General Meeting is held on <strong>30th September</strong>, the 15-day statutory window expires on <strong>15th October</strong>.</li><li><strong>First Auditor Board Meeting:</strong> If the Board appoints the first auditor on <strong>10th August</strong>, Form ADT-1 must be filed on or before <strong>25th August</strong>.</li><li><strong>Casual Vacancy Scenario:</strong> If the appointment resolution is passed on <strong>10th November</strong>, Form ADT-1 must be filed on or before <strong>25th November</strong>.</li><li><strong>Filing Day Calculation:</strong> The day of the meeting is excluded (Day 0), and counting starts the following day. Filing on Day 16 triggers an immediate delay classification under MCA rules. Backdating is strictly prevented by MCA V3.</li></ul>',
      consequencesOfDelay: '<p>Delay in filing Form ADT-1 triggers two separate levels of statutory exposure:</p><h3>1. Table B Additional Filing Fee Multipliers (Rule 12 Annexure)</h3><p>Unlike annual financial returns (AOC-4 and MGT-7) which attract an uncapped ₹100 per day late fee, Form ADT-1 is an event-based form governed by <strong>Table B</strong>. The additional fee escalates based on the duration of delay as a direct multiplier of the normal base fee:</p><ul><li><strong>Delay up to 15 days:</strong> 1 time the normal filing fee (1x)</li><li><strong>Delay 16 to 30 days:</strong> 2 times the normal filing fee (2x)</li><li><strong>Delay 31 to 60 days:</strong> 4 times the normal filing fee (4x)</li><li><strong>Delay 61 to 90 days:</strong> 6 times the normal filing fee (6x)</li><li><strong>Delay 91 to 180 days:</strong> 10 times the normal filing fee (10x)</li><li><strong>Delay beyond 180 days:</strong> 12 times the normal filing fee (12x)</li></ul><h3>2. Section 403 Condonation Requirement (> 270 Days Delay)</h3><p>Under the second proviso to Section 403(1), if Form ADT-1 is delayed <strong>beyond 270 days</strong> from the statutory due date, the company cannot directly file the form through self-service checkout on MCA V3. The company must file an application in Form CG-1 with the Regional Director for <strong>Condonation of Delay</strong> before the ROC accepts the belated ADT-1.</p><h3>3. Statutory Adjudication Penalties (Section 147)</h3><p>Failure to appoint an auditor or contravention of Section 139 renders the company liable to a fine of <strong>₹25,000 up to ₹5,00,000</strong>, and every officer in default liable to a fine of <strong>₹10,000 up to ₹1,00,000</strong>. Furthermore, failure to file ADT-1 prevents filing AOC-4 and MGT-7 as the portal will fail auditor verification.</p>',
      workedExample: '<p><strong>Real-World Illustration:</strong> A Private Limited Company with an authorized nominal capital of <strong>₹10 Lakhs</strong> holds its AGM on <strong>30th September 2026</strong> and appoints ABC & Associates, Chartered Accountants, for a 5-year term.</p><ul><li><strong>Statutory Due Date:</strong> 15th October 2026 (15 days from AGM).</li><li><strong>Nominal Capital Bracket:</strong> ₹5 Lakhs to < ₹25 Lakhs $\\rightarrow$ Normal Base Filing Fee = <strong>₹400</strong>.</li></ul><h4>Scenario A — Timely Filing (on or before 15th October 2026):</h4><ul><li>Normal Filing Fee: ₹400</li><li>Additional Late Fee: ₹0</li><li><strong>Total MCA Challan: ₹400</strong></li></ul><h4>Scenario B — Delayed by 20 Days (Filing on 4th November 2026):</h4><ul><li>Delay Bracket: 16 to 30 days $\\rightarrow$ Multiplier = <strong>2x normal fee</strong></li><li>Additional Late Fee: ₹400 × 2 = ₹800</li><li><strong>Total MCA Challan: ₹400 + ₹800 = ₹1,200</strong></li></ul><h4>Scenario C — Delayed by 75 Days (Filing on 29th December 2026):</h4><ul><li>Delay Bracket: 61 to 90 days $\\rightarrow$ Multiplier = <strong>6x normal fee</strong></li><li>Additional Late Fee: ₹400 × 6 = ₹2,400</li><li><strong>Total MCA Challan: ₹400 + ₹2,400 = ₹2,800</strong></li></ul><h4>Scenario D — Delayed by 200 Days (Filing in May 2027):</h4><ul><li>Delay Bracket: Beyond 180 days (≤ 270 days) $\\rightarrow$ Multiplier = <strong>12x normal fee</strong></li><li>Additional Late Fee: ₹400 × 12 = ₹4,800</li><li><strong>Total MCA Challan: ₹400 + ₹4,800 = ₹5,200</strong></li></ul>'
    }
  },
  {
    slug: 'dir-12',
    formNumber: 'DIR-12',
    formName: 'Director Appointment & Resignation',
    aliases: ['dir12', 'dir 12', 'file dir 12 within 30 days', 'dir-12 form', 'director appointment', 'director resignation', 'dir 12 due date', 'dir 12 mca v3'],
    category: 'event',
    filedBy: ['Private Limited', 'Public Limited', 'One Person Company (OPC)', 'Section 8 Company', 'Producer Company'],
    dueDate: 'Within 30 days of appointment, resignation, or change',
    section: 'Sections 168 & 170, Companies Act 2013 read with Rule 17',
    penaltyType: 'multiplier',
    penaltyRate: 'Table B Multiplier (2x to 12x normal fee)',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    metaTitle: 'DIR-12 Form: Director Appointment/Resignation Filing Guide (2026)',
    metaDescription: 'Complete guide to file DIR-12 within 30 days for director appointment, resignation, or change. Calculate MCA V3 fees, Table B late penalties & rules.',
    ogDescription: 'Complete guide to file DIR-12 within 30 days for director appointment, resignation, or change. Calculate MCA V3 fees, Table B late penalties & rules.',
    faqItems: [
      { question: 'When is Form DIR-12 required to be filed?', answer: 'Form DIR-12 must be filed with the Registrar of Companies (ROC) whenever there is an appointment of a director, resignation or cessation of a director, appointment/cessation of Key Managerial Personnel (KMP), or a change in designation (such as Additional Director to Regular Director, or Director to Managing Director).' },
      { question: 'What is the statutory due date to file DIR-12?', answer: 'Under Sections 168 and 170 of the Companies Act, 2013 read with Rule 17 of the Companies (Appointment and Qualification of Directors) Rules, 2014, companies must file DIR-12 within 30 days from the effective date of the appointment, resignation, or change in designation.' },
      { question: 'What documents and attachments are mandatory for director appointment in DIR-12?', answer: 'Mandatory attachments include: (1) Form DIR-2 (Consent in writing to act as director), (2) Form DIR-8 (Intimation of non-disqualification under Section 164(2)), (3) Certified True Copy of Board/General Meeting Resolution, (4) Letter of Appointment with terms, and (5) Proof of identity and residential address of the appointee.' },
      { question: 'What documents are required when filing DIR-12 for a director resignation?', answer: 'For resignation, the company must attach: (1) Formal Notice / Letter of Resignation submitted by the director, (2) Board resolution or intimation taking note of the resignation, and (3) Proof of dispatch/delivery. The resigning director may also optionally file Form DIR-11 within 30 days to protect themselves.' },
      { question: 'What are the late filing penalties under Table B for Form DIR-12?', answer: 'DIR-12 is an event-based form governed by Table B multipliers of the normal fee: delay up to 30 days attracts 2× normal fee; 31 to 60 days attracts 4×; 61 to 90 days attracts 6×; 91 to 180 days attracts 10×; and 181 to 270 days attracts 12× normal fee.' },
      { question: 'Can DIR-12 be filed after 270 days without condonation?', answer: 'No. Under the second proviso to Section 403(1), if Form DIR-12 is delayed beyond 270 days from the statutory due date, MCA V3 blocks direct filing. The company must file Form CG-1 with the Regional Director for Condonation of Delay before the ROC will accept the belated DIR-12.' },
      { question: 'Does regularizing an Additional Director at the AGM require Form DIR-12?', answer: 'Yes. When an Additional Director appointed under Section 161(1) is regularized as an Ordinary/Regular Director at the Annual General Meeting under Section 152, Form DIR-12 must be filed within 30 days of the AGM for change in designation.' },
      { question: 'Who must sign and certify Form DIR-12 on MCA V3?', answer: 'Form DIR-12 must be digitally signed with a Class 3 DSC by an existing Director, Manager, Company Secretary, or CEO/CFO of the company. It must also be certified by an independent practicing professional (CA, CS, or CMA in whole-time practice) confirming statutory verification.' }
    ],
    relatedForms: ['dir-3-kyc', 'mgt-14', 'inc-22'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form DIR-12</strong> is the statutory e-form mandated under <strong>Sections 168 and 170 of the Companies Act, 2013</strong> read with <strong>Rule 17 of the Companies (Appointment and Qualification of Directors) Rules, 2014</strong>, filed with the Ministry of Corporate Affairs (MCA) to intimate the Registrar of Companies (ROC) regarding particulars of appointment, cessation, or change in designation of Directors and Key Managerial Personnel (KMP).</p><p>Whenever a company alters its board composition or executive leadership, filing Form DIR-12 on the MCA V3 portal updates the public master data of the company on the MCA registry. Because master data drives banking relationships, vendor diligence, GST registrations, and statutory credibility, timely filing is vital.</p>',
      whoMustFile: '<p>Every incorporated company—including <strong>Private Limited Companies, Public Limited Companies (unlisted and listed), One Person Companies (OPC), Section 8 Non-Profit Companies, and Producer Companies</strong>—must file Form DIR-12 whenever any of the following corporate events take place:</p><ol><li><strong>Appointment of New Director:</strong> Additional Director (Sec 161(1)), Alternate Director (Sec 161(2)), Nominee Director (Sec 161(3)), Casual Vacancy Director (Sec 161(4)), or Independent Director (Sec 149).</li><li><strong>Regularization of Director:</strong> Confirmation of an Additional Director as a permanent Director at the Annual General Meeting (Sec 152).</li><li><strong>Resignation or Cessation:</strong> Resignation under Section 168, vacation of office under Section 167, removal by shareholders under Section 169, or disqualification under Section 164.</li><li><strong>Change in Designation:</strong> Elevation from Director to Managing Director (MD), Whole-Time Director (WTD), or Executive Director.</li><li><strong>Appointment or Cessation of KMP:</strong> Managing Director, CEO, CFO, Manager, or Whole-Time Company Secretary (CS) under Section 203.</li></ol>',
      dueDateExplained: '<p>Companies are legally required to <strong>file DIR-12 within 30 days</strong> of the triggering event:</p><ul><li><strong>Day 0 Anchor Date:</strong> The 30-day countdown begins on the effective date of appointment or resignation specified in the Board Resolution or Resignation Letter. Day 0 is excluded, and counting starts on Day 1.</li><li><strong>Example Timeline:</strong> If a director is appointed at a Board Meeting on <strong>10th April</strong>, the statutory 30-day window expires on <strong>10th May</strong>. Filing on 11th May constitutes Day 1 of statutory delay.</li><li><strong>No Backdating Allowed:</strong> MCA V3 system validates event dates against company master data, board meeting intimations, and digital signature timestamps. Belated filings cannot be backdated.</li><li><strong>Simultaneous Events:</strong> Multiple appointments or resignations effective on the same date can be combined into a single Form DIR-12, saving MCA base filing fees.</li></ul>',
      consequencesOfDelay: '<p>Failing to file DIR-12 within 30 days exposes the company and its officers to three distinct legal consequences:</p><h3>1. Table B Additional Filing Fee Multipliers (Rule 12 Annexure)</h3><p>Unlike annual returns which carry ₹100/day fees, Form DIR-12 is an event-based form governed by <strong>Table B</strong> escalation multipliers:</p><ul><li><strong>Delay up to 30 days:</strong> 2 times the normal filing fee (2×)</li><li><strong>Delay 31 to 60 days:</strong> 4 times the normal filing fee (4×)</li><li><strong>Delay 61 to 90 days:</strong> 6 times the normal filing fee (6×)</li><li><strong>Delay 91 to 180 days:</strong> 10 times the normal filing fee (10×)</li><li><strong>Delay 181 to 270 days:</strong> 12 times the normal filing fee (12×)</li></ul><h3>2. Section 403 Hard Stop (> 270 Days Delay)</h3><p>If Form DIR-12 is delayed beyond 270 days from the statutory due date (total 300 days from event), self-service filing on MCA V3 is automatically blocked. The company cannot file the form without first obtaining <strong>Condonation of Delay from the Regional Director (RD)</strong> via Form CG-1 under Section 460.</p><h3>3. Section 172 Residuary Penalties</h3><p>Under Section 172 of the Companies Act, 2013, default in filing director particulars attracts a company fine of <strong>₹50,000</strong>, plus a continuing penalty of <strong>₹500 per day</strong> of default (up to ₹3,00,000 for the company and ₹1,00,000 for every officer in default). Eligible Small Companies and Startups receive a 50% statutory reduction under Section 446B.</p>',
      workedExample: '<p><strong>Real-World Illustration:</strong> A Private Limited Company with an authorized nominal capital of <strong>₹15 Lakhs</strong> appoints an Additional Director on <strong>1st August 2026</strong>.</p><ul><li><strong>Statutory Due Date:</strong> 31st August 2026 (strictly within 30 days).</li><li><strong>Nominal Capital Bracket:</strong> ₹5 Lakhs to &lt; ₹25 Lakhs &rarr; Normal Base Filing Fee = <strong>₹400</strong>.</li></ul><h4>Scenario 1 — On-Time Filing (On or before 31st August 2026):</h4><ul><li>Normal Filing Fee: ₹400</li><li>Late Multiplier: ₹0</li><li><strong>Total MCA Challan: ₹400</strong></li></ul><h4>Scenario 2 — Delayed by 25 Days (Filing on 25th September 2026):</h4><ul><li>Delay Bracket: 1 to 30 days &rarr; Multiplier = <strong>2× normal fee</strong></li><li>Additional Fee: ₹400 × 2 = ₹800</li><li><strong>Total MCA Challan: ₹400 + ₹800 = ₹1,200</strong></li></ul><h4>Scenario 3 — Delayed by 75 Days (Filing on 14th November 2026):</h4><ul><li>Delay Bracket: 61 to 90 days &rarr; Multiplier = <strong>6× normal fee</strong></li><li>Additional Fee: ₹400 × 6 = ₹2,400</li><li><strong>Total MCA Challan: ₹400 + ₹2,400 = ₹2,800</strong></li></ul><h4>Scenario 4 — Delayed by 210 Days (Filing in April 2027):</h4><ul><li>Delay Bracket: 181 to 270 days &rarr; Multiplier = <strong>12× normal fee</strong></li><li>Additional Fee: ₹400 × 12 = ₹4,800</li><li><strong>Total MCA Challan: ₹400 + ₹4,800 = ₹5,200</strong></li></ul>'
    }
  },
  {
    slug: 'pas-3',
    formNumber: 'PAS-3',
    formName: 'Return of Allotment',
    aliases: [
      'pas3',
      'pas 3',
      'return of allotment',
      'share allotment',
      'pas 3 due date',
      'pas 3 late fees',
      'pas 3 filing due date',
      'form pas 3',
      'private placement return of allotment'
    ],
    category: 'event',
    filedBy: ['Private Limited', 'Public Limited (Unlisted & Listed)', 'One Person Company (OPC)', 'Section 8 Company', 'Producer Company'],
    dueDate: '15 Days (Private Placement) / 30 Days (Other Allotments)',
    section: 'Section 39(4) & Section 42(8), Companies Act 2013 read with Rules 12 & 14, Companies (PAS) Rules, 2014',
    penaltyType: 'multiplier',
    penaltyRate: '2x to 12x Table B late fee + ₹1,000/day adjudication penalty',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: true,
    metaTitle: 'PAS-3 Return of Allotment: Due Date (15/30 Days), Fees & Late Fee Calculator (2026) | CorpLaw',
    metaDescription: 'When is PAS-3 due? 15 days for private placement (Section 42), 30 days for other allotments (Section 39). Calculate normal fees, Table B late fees, and statutory penalty exposure.',
    ogDescription: 'Calculate Form PAS-3 Return of Allotment normal fees, 15 vs 30-day statutory deadlines, Table B escalation multipliers, and Section 42/39 penalty exposure.',
    faqItems: [
      {
        question: 'When is Form PAS-3 due for filing with ROC?',
        answer: 'The statutory deadline depends strictly on the mode of allotment: For Private Placements under Section 42, PAS-3 must be filed within strictly 15 days from the date of the board resolution allotting securities. For all other allotments (Rights issues, Bonus shares, ESOPs, Preferential issues under Section 62(1)(c), and Debenture conversions), it must be filed within 30 days from the date of allotment under Section 39(4).'
      },
      {
        question: 'Is PAS-3 due date 15 days or 30 days?',
        answer: 'Both deadlines exist under corporate law: 15 days applies to Private Placements pursuant to Section 42(8) read with Rule 14. 30 days applies to ordinary allotments (rights, bonus, sweat equity, ESOPs) under Section 39(4) read with Rule 12. Treating a private placement as a 30-day filing is a severe statutory default penalised by ROCs.'
      },
      {
        question: 'What is the late filing fee on MCA V3 for Form PAS-3?',
        answer: 'Form PAS-3 is an event-based document governed by Table B escalation multipliers of the Companies (Registration Offices and Fees) Rules: Delay up to 30 days: 2× normal fee; Delay 31 to 60 days: 4× normal fee; Delay 61 to 90 days: 6× normal fee; Delay 91 to 180 days: 10× normal fee; Delay beyond 180 days: 12× normal fee. Normal fees range from ₹200 to ₹600 based on authorised nominal share capital.'
      },
      {
        question: 'What is the statutory adjudication penalty under Section 42(9) vs Section 39(5)?',
        answer: 'Under Section 42(9) (Private Placement default), the company, its promoters, and its directors are individually liable to a penalty of ₹1,00,000 or ₹1,000 per day of continuing default, capped at a massive ₹25,00,000 each. Under Section 39(5) (Ordinary allotment default), the company and every officer in default face a penalty of ₹1,000 per day, capped at ₹1,00,000 each. Eligible Small Companies, OPCs, and DPIIT Startups receive a 50% concession under Section 446B (capped at ₹2 Lakh for company and ₹1 Lakh for individuals).'
      },
      {
        question: 'Can a company utilise application money before filing Form PAS-3?',
        answer: 'No! The proviso to Section 42(6) strictly prohibits companies from utilising subscription monies until Form PAS-3 has been submitted to the Registrar. Spending money before filing constitutes an independent breach under Section 42(10), punishable by a penalty up to the entire amount raised or ₹2 Crore (whichever is lower), plus mandatory refund of all subscription monies with 12% p.a. interest.'
      },
      {
        question: 'What is the 60-day allotment window under Section 42(6)?',
        answer: 'A company offering securities through private placement must allot securities within 60 days from the date of receiving application money. If unable to allot within 60 days, the company must refund all application money within 15 days from the expiry of the 60th day. Failing this, the company becomes liable to repay the money with 12% p.a. interest calculated from the 60th day onwards.'
      },
      {
        question: 'Can multiple allotment dates be combined in a single Form PAS-3?',
        answer: 'Yes, but subject to two strict MCA V3 portal conditions: (1) A maximum of 5 distinct allotment dates can be included in a single form; and (2) All allotment dates must fall within 30 days of the filing date. If any allotment date is older than 30 days from filing, a separate Form PAS-3 must be filed for each allotment date.'
      },
      {
        question: 'What mandatory attachments must be uploaded with Form PAS-3?',
        answer: 'Mandatory attachments include: (1) Complete list of allottees (separate list for each allotment date stating name, address, PAN, folio, securities allotted, and consideration); (2) Certified true copy of Board resolution approving allotment; (3) Certified true copy of Special resolution (for private placement or bonus shares); (4) Registered Valuer report (for consideration other than cash or Section 62(1)(c) preferential issues); (5) PAS-4 offer letter and PAS-5 record of offers; and (6) Copy of stamped contract/agreement for non-cash allotments.'
      }
    ],
    relatedForms: ['pas-4', 'pas-5', 'mgt-14', 'sh-7', 'pas-6', 'dir-12'],
    filedTogetherWith: ['MGT-14', 'SH-7'],
    contentSections: {
      whatIsThisForm: '<p><strong>Form PAS-3</strong> (Return of Allotment) is the statutory declaration filed with the Registrar of Companies (ROC) pursuant to Section 39(4) and Section 42(8) of the Companies Act, 2013 whenever a company allots shares, debentures, preference shares, or other securities. It intimates the government regarding the identity of allottees, class of securities, nominal value, issue price, premium or discount, and consideration received (cash or non-cash).</p><p>Every corporate capital alteration triggers this filing—including founder seed allotments, venture capital rounds, rights issues, bonus issues, preferential allotments, sweat equity, ESOP exercises, and conversion of convertible instruments (CCPS/CCD).</p>',
      whoMustFile: '<p>Every company having a share capital—including <strong>Private Limited Companies, Public Limited Companies (unlisted and listed), One Person Companies (OPC), Section 8 Non-Profit Companies, and Producer Companies</strong>—must file Form PAS-3 upon executing an allotment of securities.</p><p>The return must be digitally signed by an authorized Director (DSC) and certified by an independent Practicing Professional (PCS, PCA, or PCMA), except for One Person Companies and Small Companies which are exempt from mandatory professional pre-certification.</p>',
      dueDateExplained: '<h3>The Two Statutory Clocks: 15 Days vs 30 Days</h3><p>Unlike standard annual returns which follow financial year deadlines, Form PAS-3 is an event-based statutory return governed by <strong>two distinct regulatory timelines</strong>:</p><ul><li><strong>1. Private Placement (Section 42(8) read with Rule 14):</strong> Must be filed within strictly <strong>15 calendar days</strong> from the date of the board resolution approving the allotment of securities.</li><li><strong>2. All Other Allotments (Section 39(4) read with Rule 12):</strong> Must be filed within <strong>30 calendar days</strong> from the date of the board resolution approving allotment (governing Rights Issues, Bonus Shares, Preferential Allotments, ESOP Exercises, and Loan/Debenture Conversions).</li></ul><p><strong>Anchor Date:</strong> The statutory clock begins ticking on the exact date on which the Board of Directors passed the allotment resolution (Day 0). The date on which application money was remitted does NOT determine the filing deadline.</p>',
      consequencesOfDelay: '<h3>Triple Legal Exposure for Delayed PAS-3 Filings</h3><p>Failing to submit Form PAS-3 within the prescribed 15-day or 30-day window exposes the company and its management to three cumulative layers of legal and financial liability:</p><h4>1. Table B Additional Filing Fee Multipliers</h4><p>The MCA V3 portal automatically computes escalation multipliers based on authorized share capital and the delay past the event-specific due date:</p><ul><li><strong>Delay up to 30 days:</strong> 2× normal base fee</li><li><strong>Delay 31 to 60 days:</strong> 4× normal base fee</li><li><strong>Delay 61 to 90 days:</strong> 6× normal base fee</li><li><strong>Delay 91 to 180 days:</strong> 10× normal base fee</li><li><strong>Delay beyond 180 days:</strong> 12× normal base fee</li></ul><h4>2. Statutory Adjudication Penalties: Section 42(9) vs Section 39(5)</h4><p>Beyond portal late fees, ROC Adjudication Officers levy severe civil financial penalties under the Companies Act:</p><ul><li><strong>Private Placement Default (Section 42(9)):</strong> The company, its <strong>promoters, and its directors</strong> are individually liable to a continuing penalty of <strong>₹1,000 per day</strong>, capped at <strong>₹25,00,000 each</strong>!</li><li><strong>Ordinary Allotment Default (Section 39(5)):</strong> The company and every officer in default are liable to <strong>₹1,000 per day</strong>, capped at <strong>₹1,00,000 each</strong>.</li><li><strong>Section 446B Concession:</strong> Small Companies, OPCs, DPIIT-recognised Startups, and Producer Companies pay 50% reduced penalties (capped at ₹2,00,000 for the company and ₹1,00,000 per officer/promoter).</li></ul><h4>3. Section 42(6) Critical Fund Utilisation Violation</h4><p>Under the proviso to Section 42(6), subscription money kept in a separate scheduled bank account <strong>cannot be utilised until Form PAS-3 is filed</strong>. Using money prematurely triggers Section 42(10) with penalties up to the amount raised or ₹2 Crore, plus compulsory refund of all capital with 12% p.a. interest.</p>',
      workedExample: '<h4>Scenario 1: Private Placement Allotment (The ROC Chennai Precedent)</h4><p>A corporate entity with ₹2 Crore capital allots shares via Private Placement on 1st January 2026. The 15-day statutory deadline expires on 16th January 2026. The company files on 3rd March 2026 (46 days delayed):</p><ul><li>Normal Filing Fee (₹1 Cr+ capital): ₹600</li><li>Table B Multiplier (31–60 days delay = 4×): ₹2,400</li><li><strong>Total MCA V3 Challan: ₹3,000</strong></li><li>Section 42(9) Company Penalty (46 × ₹1,000): ₹46,000</li><li>Section 42(9) Promoter/Director Penalty (2 individuals × ₹46,000): ₹92,000</li><li><strong>Total Statutory Adjudication Exposure: ₹1,38,000</strong></li></ul><h4>Scenario 2: Ordinary Rights Issue (Section 39)</h4><p>A company with ₹10 Lakh capital allots rights shares on 1st October 2026. The 30-day deadline expires on 31st October 2026. Company files on 15th December 2026 (45 days delayed):</p><ul><li>Normal Filing Fee (₹5L–₹25L capital): ₹400</li><li>Table B Multiplier (4×): ₹1,600</li><li><strong>Total MCA V3 Challan: ₹2,000</strong></li><li>Section 39(5) Company Penalty: ₹45,000 (Cap ₹1 Lakh)</li><li>Section 39(5) Officers Penalty (2 officers): ₹90,000</li><li><strong>Total Adjudication Liability: ₹1,35,000</strong></li></ul>'
    }
  },
  {
    slug: 'pas-6',
    formNumber: 'PAS-6',
    formName: 'Reconciliation of Share Capital Audit Report (Half-yearly)',
    aliases: [
      'pas 6',
      'pas-6',
      'pas6',
      'form pas-6',
      'form pas 6',
      'reconciliation of share capital audit',
      'pas 6 due date',
      'pas 6 late fees',
      'pas 6 fees calculator',
      'rule 9a dematerialisation',
      'rule 9b private company demat',
      'private company demat deadline',
      'pas 6 penalty calculator',
      'isin reconciliation report'
    ],
    category: 'event',
    filedBy: [
      'Unlisted Public Companies (Rule 9A)',
      'Non-Small Private Companies (Rule 9B)',
      'Holding & Subsidiary Companies',
      'Section 8 Companies with Share Capital'
    ],
    dueDate: 'Within 60 days of half-year end (29 Nov & 30 May)',
    section: 'Section 29 read with Rule 9A & 9B, Companies (PAS) Rules, 2014',
    penaltyType: 'multiplier',
    penaltyRate: '2× to 12× Normal Fee + Section 450 Adjudication (Up to ₹2L Company / ₹50k Officer)',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: true,
    filingGuides: [
      {
        title: 'Form PAS-6 Dematerialisation & Share Capital Reconciliation Guide: Rules 9A & 9B, Due Dates, ISIN Audit & Late Penalties (2026-27)',
        slug: '/updates/pas-6-reconciliation-share-capital-audit-demat-rules-9a-9b-due-date-mca-v3',
        publishedDate: '2026-09-07',
        summary: 'Comprehensive legal and procedural guide to filing Form PAS-6 on MCA V3. Covers Rule 9A & 9B demat mandates, 30 September 2026 deadline, ISIN allotment via RTA, Table B fee multipliers, and Section 450 civil adjudication risks.',
        isOfficial: true
      }
    ],
    metaTitle: 'Form PAS-6 Fee & Late Penalty Calculator 2026-27 | CorpLaw',
    metaDescription: 'Calculate Form PAS-6 normal filing fees, Table B delay multipliers, and Section 450 civil adjudication penalties with live demat share reconciliation.',
    ogDescription: 'Instant statutory calculation of Form PAS-6 filing fees, 60-day deadlines (29 Nov & 30 May), Table B late multipliers, and Section 450 penalties.',
    faqItems: [
      {
        question: 'What is Form PAS-6 and what is its statutory purpose?',
        answer: 'Form PAS-6 is the half-yearly Reconciliation of Share Capital Audit Report mandated under Section 29 of the Companies Act, 2013 read with Rule 9A (for unlisted public companies) and Rule 9B (for non-small private companies). It reconciles the total issued share capital of a company with the holdings across NSDL, CDSL, and remaining physical share certificates. Under Rule 9A(8A), any discrepancy must be immediately flagged to the depositories.'
      },
      {
        question: 'Who is required to file Form PAS-6 and who is exempt?',
        answer: 'Filing is mandatory for all unlisted public companies and all private companies that do not qualify as "small companies" under Section 2(85). Private holding companies, subsidiaries, and Section 8 companies with share capital are always required to file because the Section 2(85) proviso disqualifies them from small company status. Exempt entities include Small Companies (revised thresholds: paid-up capital ≤ ₹10 Cr and turnover ≤ ₹100 Cr under G.S.R. 880(E)), Listed companies (which file under SEBI Reg 55A), Nidhi companies, Government companies, and Wholly-Owned Subsidiaries of unlisted public companies.'
      },
      {
        question: 'What are the half-yearly due dates for filing Form PAS-6?',
        answer: 'Form PAS-6 must be filed within 60 calendar days from the end of each half-year: for the half-year ending 30th September, the due date is 29th November; for the half-year ending 31st March, the due date is 30th May.'
      },
      {
        question: 'How are normal filing fees and late fees computed on MCA V3?',
        answer: 'Normal filing fees follow Table A based on authorized share capital: ₹200 (< ₹1L), ₹300 (₹1L to ₹5L), ₹400 (₹5L to ₹25L), ₹500 (₹25L to ₹1 Crore), and ₹600 (₹1 Crore or more). Late filings attract Table B multipliers: up to 30 days delay: 2× normal fee; 31 to 60 days: 4×; 61 to 90 days: 6×; 91 to 180 days: 10×; beyond 180 days: 12× normal fee.'
      },
      {
        question: 'What are the Section 450 civil adjudication penalties for non-filing of PAS-6?',
        answer: 'Because Rules 9A and 9B do not prescribe a specific fine, Section 450 (General Penalty) applies. In adjudication proceedings initiated by the ROC under Section 454, the company is liable to a base penalty of ₹10,000 plus ₹1,000 per day for continuing default (capped at ₹2,00,000). Every officer in default is liable to a base penalty of ₹10,000 plus ₹1,000 per day (capped at ₹50,000 each). Under Section 446B, eligible startups and small entities receive a 50% reduction in penalties.'
      },
      {
        question: 'Does Form PAS-6 require certification by a Practising Professional?',
        answer: 'Yes. Form PAS-6 must be digitally certified with DSC by an independent Practising Company Secretary (PCS) holding a Certificate of Practice from ICSI or a Practising Chartered Accountant (PCA) holding a Certificate of Practice from ICAI. False certification attracts criminal liability under Section 448 read with Section 447 (fraud).'
      },
      {
        question: 'What are the consequences if physical shares remain undematerialised?',
        answer: 'Under Rule 9A(4) and Rule 9B(4), every promoter, director, and Key Managerial Personnel (KMP) must dematerialise their entire shareholding before the company can make any offer of securities, rights issue, bonus issue, or buyback. Furthermore, any shareholder wishing to transfer physical shares must first convert them into demat form.'
      }
    ],
    relatedForms: ['pas-3', 'inc-20a', 'mgt-7'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form PAS-6</strong> is the statutory <strong>Reconciliation of Share Capital Audit Report (Half-yearly)</strong> prescribed by the Ministry of Corporate Affairs under Section 29 of the Companies Act, 2013 read with Rule 9A (for unlisted public companies) and Rule 9B (for non-small private companies) of the Companies (Prospectus and Allotment of Securities) Rules, 2014.</p><p>Its primary objective is to maintain complete transparency over corporate equity by reconciling a company&apos;s total issued share capital against shares held in dematerialised electronic form with the two national depositories—<strong>National Securities Depository Limited (NSDL)</strong> and <strong>Central Depository Services (India) Limited (CDSL)</strong>—and physical share certificates. Any discrepancy between issued capital and depository records must be reported immediately to depositories under Rule 9A(8A).</p>',
      whoMustFile: '<p>The obligation to file Form PAS-6 applies on an ongoing half-yearly basis to:</p><ul><li><strong>Unlisted Public Companies:</strong> Governed by Rule 9A since October 2018.</li><li><strong>Private Limited Companies (Non-Small):</strong> Governed by Rule 9B. All private companies that exceed the Small Company limits (paid-up capital > ₹10 Crore or turnover > ₹100 Crore per G.S.R. 880(E)) must obtain ISIN and file PAS-6.</li><li><strong>Private Holding & Subsidiary Companies:</strong> Disqualified from small company status under the proviso to Section 2(85); mandatory demat applies regardless of capital size.</li><li><strong>Section 8 Companies with Share Capital:</strong> Also excluded from small company classification under Section 2(85).</li><li><strong>Producer Companies:</strong> Required to comply by 31 March 2028 per the February 2025 amendment.</li></ul><p><strong>Exempt Entities:</strong> Small Companies under Section 2(85), Listed companies (covered under SEBI Regulation 55A), Nidhi companies, Government companies, and Wholly-Owned Subsidiaries of unlisted public companies are exempt.</p>',
      dueDateExplained: '<p>Form PAS-6 is filed semi-annually within <strong>60 calendar days</strong> from the conclusion of each half-year:</p><ul><li><strong>Half-Year 1 (1 April to 30 September):</strong> Due on or before <strong>29th November</strong>.</li><li><strong>Half-Year 2 (1 October to 31 March):</strong> Due on or before <strong>30th May</strong>.</li></ul><p>A separate Form PAS-6 must be submitted electronically on MCA V3 for <strong>each individual ISIN</strong> (e.g., if a company has both equity shares and preference shares, two distinct PAS-6 filings are required per half-year).</p>',
      consequencesOfDelay: '<p>Delayed or non-filing of Form PAS-6 triggers dual statutory liabilities:</p><ol><li><strong>MCA21 Portal Additional Fee (Table B Multiplier):</strong> The portal automatically levies an additional fee scaling from <strong>2× to 12× the normal filing fee</strong> depending on the duration of delay past the 60-day window (12× maximum fee of up to ₹7,200 for delay exceeding 180 days).</li><li><strong>Section 450 Civil Adjudication Exposure:</strong> Under Section 450 read with Section 454, the ROC may initiate adjudication proceedings imposing a base penalty of <strong>₹10,000 plus ₹1,000 per day</strong> of continuing default on the company (capped at <strong>₹2,00,000</strong>) and <strong>₹10,000 plus ₹1,000 per day</strong> on each officer in default (capped at <strong>₹50,000 per officer</strong>). Section 446B halves these penalties for eligible startups.</li><li><strong>Commercial Embargo (Rule 9A(4) & 9B(4)):</strong> Companies in default cannot issue bonus shares, rights issues, private placements, or buybacks. Non-compliance severely impairs investor due diligence in M&A and funding rounds.</li></ol>',
      workedExample: '<p><strong>Scenario:</strong> A Non-Small Private Limited Company with ₹5 Crore authorized share capital files Form PAS-6 for the half-year ended 30 September 2026 on 13 January 2027 (45 days delay past the 29 November statutory deadline) with 3 directors in default.</p><ul><li>Normal Government Filing Fee (Table A, Item 5 — ₹1Cr+): <strong>₹600</strong></li><li>Additional Late Fee on MCA V3 (31 to 60 days delay = 4× normal fee): 4 × ₹600 = <strong>₹2,400</strong></li><li><strong>Total MCA21 Portal Payable:</strong> ₹600 + ₹2,400 = <strong>₹3,000</strong></li><li><strong>Section 450 Civil Adjudication Exposure:</strong></li><ul><li>Company Penalty: ₹10,000 base + (45 days × ₹1,000) = <strong>₹55,000</strong> (within ₹2,00,000 cap).</li><li>Officers in Default (3 Directors): (₹10,000 base + 45 days × ₹1,000) = ₹55,000, capped at <strong>₹50,000 per director</strong> → 3 × ₹50,000 = <strong>₹1,50,000</strong>.</li></ul><li><strong>Total Maximum Combined Statutory Exposure:</strong> ₹3,000 + ₹55,000 + ₹1,50,000 = <strong>₹2,08,000</strong>.</li></ul>'
    }
  },
  {
    slug: 'chg-1',
    formNumber: 'CHG-1',
    formName: 'Creation or Modification of Charge',
    aliases: [
      'chg 1',
      'chg-1',
      'chg1',
      'form chg 1',
      'creation of charge',
      'modification of charge',
      'chg 1 late fees',
      'chg 1 late fees calculator',
      'chg-1 late fees calculator',
      'chg-1 fees calculator',
      'chg 1 ad valorem fee',
      'charge creation fee calculator',
      'chg 1 penalty calculator',
      'chg 1 due date',
      'chg-1 due date and penalty',
      'section 77 charge timeline',
      'chg 1 condonation chg 8',
      'small company chg 1 late fee',
      'bank loan charge registration'
    ],
    category: 'charge',
    filedBy: ['Private Limited', 'Public Limited', 'One Person Company (OPC)', 'Section 8 Company'],
    dueDate: 'Within 30 days of charge creation / modification',
    section: 'Section 77, 78 & 79, Companies Act 2013 read with Rules 3, 4 & 12',
    penaltyType: 'multiplier',
    penaltyRate: '3×/6× Normal Fee + Ad Valorem up to ₹5 Lakhs (Hard Stop at 120 Days)',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: true,
    metaTitle: 'Form CHG-1 Charge Creation Late Fee Calculator | CorpLaw',
    metaDescription: 'Calculate MCA filing fees, Table B multipliers (3x/6x), and ad valorem late penalties (0.025%/0.05%) for Form CHG-1 charge creation on MCA V3 portal.',
    ogDescription: 'Instant statutory calculation of Form CHG-1 filing fees, 30-60-120 day deadlines, extension multipliers, and ad valorem penalties under Section 77.',
    faqItems: [
      {
        question: 'What is the statutory due date for filing Form CHG-1?',
        answer: 'Pursuant to Section 77(1) of the Companies Act, 2013, Form CHG-1 must be filed within 30 calendar days from the date of creation or modification of the charge (i.e. the date when the loan agreement, sanction letter, or deed of hypothecation/mortgage is executed).'
      },
      {
        question: 'What is the normal government filing fee for Form CHG-1?',
        answer: 'The normal filing fee is governed by Table A (Items 5 & 6) of the Companies (Registration Offices and Fees) Rules, 2014 based on authorized share capital: ₹200 (capital < ₹1 Lakh or companies without share capital), ₹300 (₹1L to ₹5L), ₹400 (₹5L to ₹25L), ₹500 (₹25L to ₹1 Crore), and ₹600 (₹1 Crore or more).'
      },
      {
        question: 'What are the late fees for filing CHG-1 between 31 and 60 days from creation (First Extension)?',
        answer: 'Under Section 77(1) first proviso, the ROC may permit registration within an additional 30 days (Days 31 to 60 from creation, i.e., 1 to 30 days delay) upon payment of additional fees: Small Companies and OPCs pay 3× the normal filing fee, while Other Companies pay 6× the normal filing fee. No ad valorem fee applies in this first extension window.'
      },
      {
        question: 'What is the ad valorem fee for CHG-1 filed between 61 and 120 days from creation (Second Extension)?',
        answer: 'Under Section 77(1) second proviso, if filed within a further period of 60 days (Days 61 to 120 from creation, i.e., 31 to 90 days delay), the company must pay the extension multiplier (3× for Small/OPC, 6× for Others) PLUS an Ad Valorem fee based on the secured loan amount: 0.025% of the charge amount for Small Companies/OPCs (capped at ₹1,00,000) or 0.05% of the charge amount for Other Companies (capped at ₹5,00,000).'
      },
      {
        question: 'What are the statutory caps on the ad valorem fee for CHG-1?',
        answer: 'The ad valorem additional fee is subject to strict statutory ceilings under the 2019 Amendment Rules: ₹1,00,000 maximum for Small Companies and One Person Companies (0.025%), and ₹5,00,000 maximum for all other companies (0.05%).'
      },
      {
        question: 'What happens if Form CHG-1 is not filed within 120 days of charge creation?',
        answer: 'Beyond 120 days from the date of charge creation (delay exceeding 90 days), there is an absolute statutory hard stop under Section 77. The Registrar of Companies (ROC) has NO legal jurisdiction to register the charge or accept late fees. Filing Form CHG-1 directly on the MCA portal is blocked.'
      },
      {
        question: 'Can the ROC condone a delay beyond 120 days for Form CHG-1?',
        answer: 'No. The ROC\'s discretionary extension power is capped at a further period of 60 days (total 120 days from creation, which corresponds to 90 days delay past the initial 30 days). Beyond 120 days, only the Regional Director (delegated by the Central Government) under Section 87 has the legal authority to condone the delay upon hearing a formal petition.'
      },
      {
        question: 'What is the procedure for Section 87 Condonation of Delay via Form CHG-8?',
        answer: 'To condone delay exceeding 120 days (delay > 90 days): (1) File a petition with affidavit before the Regional Director (RD) in Form CHG-8; (2) Serve notice to the ROC and charge-holder bank; (3) Attend the hearing and obtain a formal Condonation Order; (4) File the RD Order with the ROC in Form INC-28 within 30 days; (5) File Form CHG-1 attaching the SRN of approved INC-28.'
      },
      {
        question: 'Can the lending bank or charge-holder file Form CHG-1 if the company defaults (Section 78)?',
        answer: 'Yes. Under Section 78, if the company fails to register the charge within the initial 30 days, the bank or financial institution can apply to the ROC for registration along with the instrument. The ROC serves a 14-day notice to the company. If the company fails to show cause, the ROC registers the charge, and the bank is legally entitled to recover the entire filing fees and costs from the company.'
      },
      {
        question: 'Does the daily penalty of ₹100 per day apply to Form CHG-1?',
        answer: 'No. The ₹100 per day penalty under Section 403 applies exclusively to Annual Returns (MGT-7/7A) and Financial Statements (AOC-4). Form CHG-1 is governed strictly by the Chapter VI charge timeline (30-60-120 days) and ad-valorem fee structure.'
      },
      {
        question: 'What is the difference between Creation and Modification of Charge in CHG-1?',
        answer: 'Creation of charge refers to registering a fresh security interest created in favor of a lender for a new loan facility. Modification of charge refers to recording changes in existing terms—such as an enhancement or reduction of loan limits, change in interest rate, release or substitution of mortgaged property, or addition of new consortium lenders.'
      },
      {
        question: 'What documents must be attached to Form CHG-1 on MCA V3?',
        answer: 'Mandatory attachments include: (1) Certified true copy of the instrument creating/modifying the charge (Sanction Letter, Deed of Hypothecation, Mortgage Deed); (2) Certified Board Resolution under Section 179(3)(d); (3) Special Resolution under Section 180(1)(a)/(c) if borrowing limits exceed capital; (4) NOC from existing charge-holders if pari-passu; and (5) Certification by a practicing CA, CS, or CMA.'
      },
      {
        question: 'Is Form CHG-1 required for vehicle loans, unsecured loans, or personal guarantees?',
        answer: 'CHG-1 is required for vehicle loans if the vehicle is registered in the name of the company and hypothecated to the financier. It is NOT required for purely unsecured loans, clean overdrafts, or personal guarantees given by directors in their individual capacities where no corporate assets are hypothecated.'
      },
      {
        question: 'What are the legal consequences of non-registration of a charge under Section 77(3)?',
        answer: 'Under Section 77(3), an unregistered charge is completely VOID against the liquidator and any other creditors of the company in the event of winding up. The lending bank loses its secured creditor status and becomes an ordinary unsecured creditor. However, the underlying debt contract remains valid, and the loan becomes immediately repayable.'
      },
      {
        question: 'Is Form CHG-1 processed under Straight Through Process (STP) or ROC Approval?',
        answer: 'Form CHG-1 is NOT processed under Straight Through Process (STP). It is routed to the jurisdictional Registrar of Companies (ROC) for manual verification and scrutiny of the attached loan instruments. Once approved by the ROC, an official Certificate of Registration of Charge (Form CHG-2 for creation or Form CHG-3 for modification) is issued electronically.'
      }
    ],
    relatedForms: ['aoc-4', 'mgt-7', 'adt-1'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form CHG-1</strong> is a statutory application filed under Section 77 and Section 79 of the Companies Act, 2013 read with Rule 3 of the Companies (Registration of Charges) Rules, 2014 for the registration of <strong>creation or modification of a charge</strong> (other than debentures, which are filed in Form CHG-9).</p><p>Under Section 2(16) of the Act, a "charge" means an interest or lien created on the property or assets of a company or any of its undertakings or both as security, and includes a mortgage. When a company secures credit facilities, working capital, or term loans from banks, financial institutions, or NBFCs, registering the charge on the MCA21 portal creates a public notice of the lender\'s priority interest in the company\'s assets.</p>',
      whoMustFile: '<p>Every company—including <strong>Private Limited, Public Limited, One Person Companies (OPC), and Section 8 companies</strong>—that creates a charge on its assets (tangible, intangible, movable, or immovable, situated in India or abroad) must file Form CHG-1.</p><p>Under <strong>Section 78</strong>, if the company fails to register the charge within the initial 30 days, the <strong>charge-holder (the lending bank or financial institution)</strong> has the statutory right to apply directly to the ROC for registration and recover the filing fees from the defaulting company.</p>',
      dueDateExplained: '<p>For charges created or modified on or after <strong>2nd November 2018</strong>, Chapter VI enforces an aggressive, non-negotiable 3-tier statutory timeline:</p><ol><li><strong>Tier 1 — Statutory Window (Days 0 to 30 from Creation):</strong> Must be filed within 30 days from the date of execution of the charge instrument. Attracts only normal government filing fees under Table A (₹200 to ₹600).</li><li><strong>Tier 2 — First Extension Window (Days 31 to 60 from Creation / 1–30 Days Delay):</strong> The ROC may allow filing within an additional 30 days upon payment of prescribed additional fees (3× normal fee for Small/OPC; 6× normal fee for Other companies).</li><li><strong>Tier 3 — Second Extension Window (Days 61 to 120 from Creation / 31–90 Days Delay):</strong> Under Section 77(1)(b)(ii), the ROC may grant a further period of 60 days upon payment of 3×/6× normal fee PLUS an <strong>Ad Valorem fee</strong>: 0.025% of the charge amount for Small/OPC (capped at ₹1 Lakh) or 0.05% of the charge amount for Other companies (capped at ₹5 Lakhs).</li><li><strong>Tier 4 — Statutory Hard Stop (Beyond 120 Days / Delay > 90 Days):</strong> ROC has NO power to register the charge. Form CHG-1 is blocked on MCA V3. Requires formal Condonation of Delay from the Regional Director via Form CHG-8.</li></ol>',
      consequencesOfDelay: '<p>Delay in filing Form CHG-1 carries severe commercial, legal, and financial penalties:</p><ul><li><strong>Ad Valorem Penalties up to ₹5 Lakhs:</strong> Missing the 60-day window triggers punitive ad valorem fees calculated on the sanctioned loan amount, leading to substantial cash outflows.</li><li><strong>Charge VOID Against Liquidator (Section 77(3)):</strong> In the event of liquidation, an unregistered charge is completely unenforceable against the official liquidator and other creditors. The bank is downgraded to an unsecured creditor, creating significant lender friction.</li><li><strong>Bank Freezes & Penal Interest:</strong> Lending banks routinely freeze credit facilities, refuse further disbursements, and levy 1% to 2% penal interest if the MCA Charge Certificate (CHG-2) is not submitted within 30 days of loan disbursement.</li><li><strong>Section 87 Condonation Costs:</strong> Crossing 120 days (delay > 90 days) necessitates petitioning the Regional Director, incurring legal fees, court attendances, and hefty compounding penalties.</li></ul>',
      workedExample: '<div class="space-y-4"><p><strong>Scenario 1: Small Company — ₹50 Lakh Loan Filed on Day 50 (Tier 2, 20 Days Delay)</strong></p><ul><li>Authorized Share Capital: ₹10 Lakhs &rarr; Normal Base Fee (Table A): <strong>₹400</strong></li><li>Delay Period: 20 days (Days 31 to 60 window) &rarr; Multiplier: <strong>3×</strong> Normal Fee</li><li>Additional Late Fee: 3 × ₹400 = <strong>₹1,200</strong></li><li>Ad Valorem Fee: <strong>₹0</strong> (Not applicable in Tier 2)</li><li><strong>Total MCA Challan:</strong> ₹400 + ₹1,200 = <strong>₹1,600</strong></li></ul><p><strong>Scenario 2: Public Company — ₹10 Crore Credit Facility Filed on Day 80 (Tier 3, 50 Days Delay)</strong></p><ul><li>Authorized Share Capital: ₹1 Crore &rarr; Normal Base Fee (Table A): <strong>₹600</strong></li><li>Delay Period: 50 days (Days 61 to 120 window) &rarr; Multiplier: <strong>6×</strong> Normal Fee</li><li>Extension Multiplier Fee: 6 × ₹600 = <strong>₹3,600</strong></li><li>Ad Valorem Calculation: 0.05% of ₹10,00,00,000 = ₹50,000 (Within ₹5,00,000 statutory cap)</li><li><strong>Total MCA Challan:</strong> ₹600 + ₹3,600 + ₹50,000 = <strong>₹54,200</strong></li></ul><p><strong>Scenario 3: Any Company — Filed on Day 135 (> 120 Days from Creation / 105 Days Delay)</strong></p><ul><li>ROC jurisdiction barred under Section 77(1) proviso. Direct portal challan = <strong>₹0 (Blocked)</strong>.</li><li>Action: Company must file Form CHG-8 with Regional Director for Section 87 condonation.</li></ul></div>'
    }
  },
  {
    slug: 'msme-1',
    formNumber: 'MSME-1',
    formName: 'MSME Half-Yearly Return (Delayed Payments)',
    aliases: ['msme 1', 'msme form 1', 'msme-1 due date', 'msme-1 penalty', 'section 405 companies act', 'msme half yearly return', 'msme form 1 mca v3', 'msme delayed payment return'],
    category: 'event',
    filedBy: ['Private Limited', 'Public Limited', 'One Person Company (OPC)', 'Section 8 Company', 'Small Company', 'Producer Company'],
    dueDate: '31st October (Apr–Sep) & 30th April (Oct–Mar)',
    section: 'Section 405, Companies Act 2013 read with Specified Companies Order 2019',
    penaltyType: 'nil', // Zero portal fee, severe adjudication penalty under Section 405(4)
    penaltyRate: 'Section 405(4) Adjudication (₹20,000 + ₹1,000/day, Max ₹3L Each)',
    normalFeeStructure: 'nil', // No portal fee (₹0)
    baseFeeSlab: 'nil',
    concessionApplies: false,
    filingGuides: [
      {
        title: "Complete MSME Form 1 Filing Guide: Due Dates (31 Oct / 30 Apr), Section 405(4) Penalties & MCA V3 Reporting Rules",
        slug: "/updates/msme-form-1-half-yearly-return-filing-guide-due-dates-penalties-mca-v3-section-405",
        publishedDate: "2026-09-09",
        summary: "Comprehensive statutory guide to filing MSME Form 1 on MCA V3, avoiding the V3 disclosure trap, calculating Section 405(4) company and officer penalties, and managing Section 16 interest.",
        isOfficial: true
      }
    ],
    metaTitle: 'MSME Form 1 Due Date, Penalty Calculator & Filing Guide (2026)',
    metaDescription: 'File MSME Form 1 under Section 405. Check 31 Oct due date, Section 405(4) penalty calculator (₹20,000 + ₹1,000/day), V3 disclosure rules & filing guide.',
    ogDescription: 'File MSME Form 1 under Section 405. Check 31 Oct due date, Section 405(4) penalty calculator (₹20,000 + ₹1,000/day), V3 disclosure rules & filing guide.',
    faqItems: [
      {
        question: 'Who is required to file Form MSME-1?',
        answer: 'Any specified company (Private, Public, OPC, Section 8, or Small Company) that receives goods or services from a supplier registered as a Micro or Small Enterprise under the MSMED Act and delays payment beyond 45 days from acceptance (or 15 days without written agreement) must file Form MSME-1.'
      },
      {
        question: 'What are the statutory due dates for Form MSME-1?',
        answer: 'Form MSME-1 is a half-yearly return. For the April 1 to September 30 half-year, the due date is strictly 31st October. For the October 1 to March 31 half-year, the due date is strictly 30th April.'
      },
      {
        question: 'What is the government portal filing fee for Form MSME-1?',
        answer: 'The MCA V3 portal charges ₹0 (zero filing fee) for Form MSME-1. There is also no late fee multiplier charged at checkout. However, defaulting companies face severe adjudication penalties under Section 405(4).'
      },
      {
        question: 'What are the penalties under Section 405(4) for not filing MSME-1?',
        answer: 'Under Section 405(4) of the Companies Act, 2013, default in filing Form MSME-1 attracts a fine of ₹20,000 base penalty PLUS a continuing penalty of ₹1,000 per day of default, capped at ₹3,00,000 for the company AND ₹3,00,000 for each officer in default. A 90-day delay for 2 directors creates a ₹3,30,000 penalty exposure.'
      },
      {
        question: 'What is the "MCA V3 Disclosure Trap" for MSME-1?',
        answer: 'Under old V2 rules, companies only filed if dues exceeded 45 days at period end. Under MCA V3, if ANY payment to a Micro or Small vendor crossed 45 days during the half-year—even if fully paid and settled before 30 September or 31 March—the filing obligation is triggered, and all 4 transaction categories with that vendor must be reported.'
      },
      {
        question: 'Are Limited Liability Partnerships (LLPs) required to file MSME-1?',
        answer: 'No. LLPs are governed by the Limited Liability Partnership Act, 2008 and are not "companies" under Section 405 of the Companies Act, 2013. LLPs are exempt from filing Form MSME-1, though they remain bound by Section 15 and 16 of the MSMED Act regarding vendor payment and 16.50% interest.'
      },
      {
        question: 'Do outstanding dues to Medium Enterprises trigger Form MSME-1?',
        answer: 'No. The Specified Companies Order, 2019 strictly covers Micro Enterprises (investment ≤ ₹1 Cr, turnover ≤ ₹5 Cr) and Small Enterprises (investment ≤ ₹10 Cr, turnover ≤ ₹50 Cr). Medium enterprises and wholesale/retail traders are excluded from MSME-1 reporting.'
      },
      {
        question: 'Have ROCs imposed real penalties for Form MSME-1 non-filing?',
        answer: 'Yes. In January 2026, ROC Coimbatore imposed the maximum statutory penalty of ₹9,00,000 on Natrinai Ventures Limited (₹3,00,000 on the company and ₹3,00,000 on each of two directors) for delayed filings. ROC Bangalore similarly imposed ~₹11.67 Lakhs on Samsung R&D Institute India Pvt Ltd.'
      }
    ],
    relatedForms: ['aoc-4', 'dpt-3'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form MSME-1</strong> is a statutory half-yearly return mandated under <strong>Section 405 of the Companies Act, 2013</strong> read with the <strong>Specified Companies (Furnishing of Information about Payment to Micro and Small Enterprise Suppliers) Order, 2019</strong>, notified on 22 January 2019.</p><p>Its purpose is to create regulatory visibility into delayed corporate payments to Micro and Small Enterprise (MSE) vendors. Any incorporated company that procures goods or services from MSE suppliers and delays payment beyond <strong>45 days</strong> must submit this electronic return disclosing invoice details, supplier Udyam registration numbers, reasons for delay, and penal interest accrued under the MSMED Act, 2006.</p>',
      whoMustFile: '<p>A company must file Form MSME-1 if it satisfies the <strong>Two-Condition Test</strong>:</p><ol><li>The company has received goods or services from a supplier registered as a <strong>Micro or Small Enterprise</strong> under the MSMED Act (verified via Udyam Registration); <strong>AND</strong></li><li>Payment to that supplier has been delayed for <strong>more than 45 days</strong> from the date of acceptance or deemed acceptance.</li></ol><p><strong>Applicable Entities:</strong> Private Limited Companies, Public Limited Companies, One Person Companies (OPC), Small Companies, Section 8 Non-Profit Companies, and Producer Companies.<br/><strong>Exempt Entities:</strong> Limited Liability Partnerships (LLPs), Partnership Firms, Sole Proprietorships, and transactions with Medium Enterprises (turnover &gt; ₹50 Cr) or retail traders.</p>',
      dueDateExplained: '<p>Form MSME-1 follows a strict bi-annual cycle governed by Section 405:</p><ul><li><strong>Half-Year 1 (April 1 to September 30):</strong> Statutory Due Date is <strong>31st October</strong>.</li><li><strong>Half-Year 2 (October 1 to March 31):</strong> Statutory Due Date is <strong>30th April</strong>.</li><li><strong>No Nil Return (Subject to V3 Trap):</strong> If no vendor payments crossed 45 days during the half-year, no return is due. However, if any payment crossed 45 days during the term—even if settled before period end—filing is mandatory on MCA V3.</li><li><strong>No Extension of Time:</strong> Unlike annual financial returns, MCA circulars rarely extend MSME-1 due dates. Backdating is strictly blocked.</li></ul>',
      consequencesOfDelay: '<p>Failing to file Form MSME-1 or delaying payments triggers three cumulative legal consequences:</p><h3>1. Section 405(4) Civil Adjudication Penalties</h3><p>Section 405(4) imposes an immediate base penalty of <strong>₹20,000</strong> PLUS a continuing penalty of <strong>₹1,000 per day</strong> of default on the company AND on every officer in default (capped at <strong>₹3,00,000 each</strong>). For a 2-director company with a 90-day delay, the total exposure is ₹3,30,000.</p><h3>2. Section 16 MSMED Act Compound Interest (16.50% p.a.)</h3><p>Buyers must pay compound interest at <strong>3× the RBI Bank Rate</strong> (currently 16.50% p.a. based on 5.50% Bank Rate) with monthly rests for every day of delay. Under Section 23 of the MSMED Act, this interest is <strong>permanently non-deductible</strong> from business income.</p><h3>3. Section 43B(h) Income Tax Disallowance</h3><p>Under Section 43B(h) of the Income Tax Act, 1961 (renumbered Section 37(2)(g) from TY 2026-27), delayed principal amounts are disallowed as business expenses in the year of accrual, causing a direct 25.17% corporate tax outflow.</p>',
      workedExample: '<div class="space-y-4"><p><strong>Scenario:</strong> A Private Limited Company with 2 directors has an overdue invoice of ₹10,00,000 payable to a Micro supplier. The company files Form MSME-1 <strong>30 days late</strong>.</p><h4>1. ROC Portal Outlay:</h4><ul><li>Normal MCA Filing Fee: ₹0</li><li>Portal Late Fee: ₹0</li></ul><h4>2. Section 405(4) ROC Adjudication Exposure:</h4><ul><li>Company Penalty: ₹20,000 + (30 × ₹1,000) = <strong>₹50,000</strong></li><li>Officer 1 Penalty: ₹20,000 + (30 × ₹1,000) = <strong>₹50,000</strong></li><li>Officer 2 Penalty: ₹20,000 + (30 × ₹1,000) = <strong>₹50,000</strong></li><li><strong>Total ROC Exposure: ₹1,50,000</strong></li></ul><h4>3. Section 16 Penal Interest (16.50% p.a., 60-day delay):</h4><ul><li>Penal Interest Payable to Vendor: <strong>₹27,330</strong> (Permanently non-deductible)</li></ul><h4>4. Section 43B(h) Tax Impact:</h4><ul><li>Delayed Expense Disallowed: ₹10,00,000</li><li>Additional Tax Outflow (at 25.17%): <strong>₹2,51,700</strong></li></ul><p><strong>Total Combined Financial Burden: ₹1,50,000 + ₹27,330 + ₹2,51,700 = ₹4,29,030.</strong></p></div>'
    }
  },
  {
    slug: 'dpt-3',
    formNumber: 'DPT-3',
    formName: 'Return of Deposits and Exempted Transactions',
    aliases: ['dpt-3', 'dpt3', 'DPT 3', 'return of deposits', 'exempted deposits return', 'deposit return MCA', 'rule 16 return'],
    category: 'annual',
    filedBy: ['Private Limited Companies', 'Public Limited Companies (Unlisted & Listed)', 'One Person Companies (OPC)', 'Small Companies', 'Section 8 Companies', 'Holding & Subsidiary Companies'],
    dueDate: '30th June annually (Within 90 days of FY closure; waived up to 31 July 2026 for FY 2025-26 under MCA Circular 02/2026)',
    section: 'Section 73 & 76 read with Rule 16 & 16A, Companies (Acceptance of Deposits) Rules, 2014',
    penaltyType: 'multiplier',
    penaltyRate: '2× to 12× normal fee (Table B) + Rule 21 fine up to ₹5,000 + ₹500/day',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    metaTitle: 'Form DPT-3 Return of Deposits Late Fee Calculator | CorpLaw',
    metaDescription: 'Calculate Form DPT-3 normal filing fees (₹200–₹600), Table B late multipliers (2×–12×), June 30 statutory due date, and Rule 21 non-filing penalties.',
    ogDescription: 'Calculate Form DPT-3 normal filing fees (₹200–₹600), Table B late multipliers (2×–12×), June 30 statutory due date, and Rule 21 non-filing penalties.',
    faqItems: [
      {
        question: 'Who is required to file Form DPT-3?',
        answer: 'Every company registered in India (including Private Limited, Public Limited, One Person Companies, Small Companies, and Section 8 Companies) must file Form DPT-3 if it has any outstanding loan, advance, deposit, or receipt not considered as a deposit as on 31st March. Only Government Companies, Banking Companies, RBI-registered NBFCs, and NHB-registered Housing Finance Companies (HFCs) are exempt.'
      },
      {
        question: 'Does a company with only director loans or inter-corporate loans need to file DPT-3?',
        answer: 'Yes, absolutely. This is the single most common compliance mistake. Rule 16A requires reporting of all receipts not considered as deposits under Rule 2(1)(c). "Exempted from deposit definition" does NOT mean "exempt from filing." Every director loan, inter-corporate advance, bank loan, or customer advance outstanding on 31 March must be reported in DPT-3.'
      },
      {
        question: 'What is the statutory due date for filing Form DPT-3?',
        answer: 'Under Rule 16 of the Companies (Acceptance of Deposits) Rules, 2014, Form DPT-3 must be filed on or before 30th June of each year (i.e., within 90 days from the closure of the financial year on 31st March).'
      },
      {
        question: 'What was the MCA Circular No. 02/2026 extension for FY 2025-26?',
        answer: 'Following a major fire incident at the MCA Data Centre on 5 June 2026 that disrupted MCA21 V3 services, the Ministry issued General Circular No. 02/2026 dated 19 June 2026 waiving additional filing fees for Form DPT-3 filed up to 31 July 2026 for FY 2025-26. However, for filings made on or after 1 August 2026, Table B delay multipliers are calculated from the original due date of 1 July 2026.'
      },
      {
        question: 'Is an Auditor\'s Certificate mandatory for filing Form DPT-3?',
        answer: 'An Auditor\'s Certificate is mandatory only when filing: (1) Return of Deposits, or (2) Return of Deposits and particulars of transactions by a company not considered as deposits. When filing ONLY for particulars of transactions not considered as deposits under Rule 2(1)(c) (which applies to over 90% of private companies with director loans), an auditor certificate is NOT mandatory on the MCA V3 portal.'
      },
      {
        question: 'What are the normal government filing fees for Form DPT-3 under Table A?',
        answer: 'Normal filing fees are based on nominal share capital: Less than ₹1 Lakh: ₹200; ₹1 Lakh to ₹4,99,999: ₹300; ₹5 Lakh to ₹24,99,999: ₹400; ₹25 Lakh to ₹99,99,999: ₹500; ₹1 Crore or more: ₹600. Companies without share capital pay a flat fee of ₹200.'
      },
      {
        question: 'What are the late fee multipliers for delayed filing of Form DPT-3 under Table B?',
        answer: 'Under Table B of the Companies (Registration Offices and Fees) Rules, 2014: Delay up to 30 days: 2× normal fee; Delay 31 to 60 days: 4× normal fee; Delay 61 to 90 days: 6× normal fee; Delay 91 to 180 days: 10× normal fee; Delay beyond 180 days: 12× normal fee.'
      },
      {
        question: 'What is the penalty for non-filing of Form DPT-3 under Rule 21?',
        answer: 'Under Rule 21 of the Deposit Rules, failure to file DPT-3 attracts a fine up to ₹5,000 on the company and up to ₹5,000 on every officer in default, plus a continuing fine of ₹500 per day for each day the default continues. This is in addition to the MCA portal additional filing fee.'
      },
      {
        question: 'When does Section 76A substantive penalty apply to deposits?',
        answer: 'Section 76A applies if a company accepts deposits from the public in contravention of Section 73 or Section 76, or fails to repay them. Penalties include a fine on the company of ₹1 Crore to ₹10 Crore (or 2× the deposit amount), and imprisonment up to 7 years plus fine of ₹25 Lakh to ₹2 Crore for officers in default. It does not apply to mere procedural delay of exempted loans.'
      },
      {
        question: 'Do LLPs need to file Form DPT-3?',
        answer: 'No. Form DPT-3 is prescribed strictly under the Companies Act, 2013 and applies only to companies. Limited Liability Partnerships (LLPs) are governed by the LLP Act, 2008 and file Form 8 (Statement of Account & Solvency) and Form 11 (Annual Return).'
      }
    ],
    relatedForms: ['aoc-4', 'mgt-7', 'chg-1'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form DPT-3</strong> is a statutory compliance return filed under <strong>Section 73 and Section 76 of the Companies Act, 2013</strong> read with <strong>Rule 16 and Rule 16A of the Companies (Acceptance of Deposits) Rules, 2014</strong>. It serves as an electronic information return to disclose all outstanding deposits as well as all receipts of money or loans not considered as deposits (exempted receipts) under Rule 2(1)(c) as on 31st March of each financial year.</p><p>Introduced by the MCA via the 2019 Amendment Rules, Form DPT-3 was created to curb illicit deposit-taking, prevent unaccounted corporate borrowings, and provide transparency regarding related-party loans, director advances, and inter-corporate deposits.</p>',
      whoMustFile: '<p>Every company incorporated under the Companies Act, 2013—including <strong>Private Limited Companies, Public Limited Companies (unlisted and listed), One Person Companies (OPC), Small Companies, and Section 8 Companies</strong>—must file Form DPT-3 if they have any outstanding loans or advances as on 31st March.</p><p><strong>Exempted Entities:</strong> Only Government Companies, Banking Companies, Reserve Bank of India (RBI) registered Non-Banking Financial Companies (NBFCs), and National Housing Bank (NHB) registered Housing Finance Companies (HFCs) are exempt from filing Form DPT-3.</p>',
      dueDateExplained: '<p>Under Rule 16, Form DPT-3 must be filed annually <strong>on or before 30th June</strong> following the close of the financial year (within 90 days from 31st March). For FY 2025-26, following the MCA Data Centre fire on 5th June 2026, the MCA issued <strong>General Circular No. 02/2026</strong> waiving additional filing fees up to <strong>31st July 2026</strong>. For any filings on or after 1st August 2026, Table B delay multipliers apply calculated from the original due date of 1st July 2026.</p>',
      consequencesOfDelay: '<p>Non-filing or delayed filing of Form DPT-3 carries distinct statutory consequences:</p><ul><li><strong>MCA21 Table B Late Fees:</strong> Escalating additional fees of 2× to 12× the normal base fee based on the period of delay.</li><li><strong>Rule 21 Procedural Fine:</strong> Fine up to ₹5,000 on the company and ₹5,000 on every officer in default, plus ₹500 per day for continuing default.</li><li><strong>Section 76A Deposit Penalties:</strong> If unauthorized receipts are recharacterized as illegal public deposits, the company faces fines of ₹1 Crore to ₹10 Crore, and officers face imprisonment up to 7 years.</li></ul>',
      workedExample: '<div class="space-y-4"><p><strong>Scenario: Private Limited Company (Authorized Capital ₹10 Lakhs) filing DPT-3 for FY 2025-26 on 20th August 2026 (51 Days Delay from 30 June)</strong></p><ul><li>Authorized Capital: ₹10,00,000 &rarr; Normal Base Fee (Table A, Item 5): <strong>₹400</strong></li><li>Statutory Due Date: 30 June 2026 (Circular 02/2026 waiver ended 31 July 2026)</li><li>Days of Delay (from 1 July): 51 days &rarr; Table B Slab (31 to 60 days): <strong>4× Normal Fee</strong></li><li>Additional Late Fee: 4 × ₹400 = <strong>₹1,600</strong></li><li><strong>Total MCA21 Portal Challan:</strong> ₹400 + ₹1,600 = <strong>₹2,000</strong></li><li><strong>Rule 21 Indicative Exposure:</strong> ₹5,000 (Company) + ₹5,000 (Officer) + (51 days × ₹500 = ₹25,500) = <strong>₹35,500</strong></li></ul></div>'
    }
  },
  {
    slug: 'inc-20a',
    formNumber: 'INC-20A',
    formName: 'Declaration for Commencement of Business',
    aliases: [
      'inc 20a',
      'inc-20a',
      'commencement of business',
      'form inc 20a',
      'section 10a',
      'inc 20a penalty calculator',
      'inc 20a late fees calculator',
      'inc 20a fees',
      'inc 20a penalty',
      'declaration of commencement of business',
      'inc 20a due date'
    ],
    category: 'incorporation',
    filedBy: [
      'Private Limited Companies',
      'Public Limited Companies',
      'One Person Companies (OPC)',
      'Small Companies',
      'DPIIT-Recognized Startups',
      'Producer Companies'
    ],
    dueDate: 'Within 180 calendar days from Certificate of Incorporation date',
    section: 'Section 10A(1)(a), Companies Act, 2013 read with Rule 23A of Companies (Incorporation) Rules, 2014',
    penaltyType: 'multiplier',
    penaltyRate: 'Table B Multipliers (2× to 12×) + Section 10A(2) Adjudication (₹50k Co + ₹1k/day per Officer)',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: true,
    metaTitle: 'Form INC-20A Commencement of Business Calculator | CorpLaw',
    metaDescription: 'Calculate Form INC-20A MCA portal filing fees, Table B multipliers (2x–12x), and Section 10A(2) penalties with Section 446B relief for startups.',
    ogDescription: 'Calculate Form INC-20A MCA portal filing fees, Table B multipliers (2x–12x), and Section 10A(2) penalties with Section 446B relief for startups.',
    faqItems: [
      {
        question: 'What is Form INC-20A and why is it mandatory?',
        answer: 'Form INC-20A is a mandatory one-time statutory declaration filed under Section 10A of the Companies Act, 2013 confirming that every subscriber to the Memorandum of Association (MOA) has deposited the agreed subscription money into the company bank account, and registered office verification under Section 12(2) is complete. Without filing INC-20A, the company cannot legally commence commercial operations or exercise borrowing powers.'
      },
      {
        question: 'What is the statutory deadline for filing Form INC-20A?',
        answer: 'Form INC-20A must be filed strictly within 180 calendar days from the date of incorporation printed on the Certificate of Incorporation (CoI). Unlike annual returns, this deadline is unique to each company and does not align with financial years. Day 181 onwards is a statutory default.'
      },
      {
        question: 'What are the MCA portal fees for filing Form INC-20A late?',
        answer: 'Late filing on the MCA21 portal incurs slab-based additional fees under Table B of the Fees Rules, 2014: Up to 30 days late: 2× normal fee; 31 to 60 days: 4× normal fee; 61 to 90 days: 6× normal fee; 91 to 180 days: 10× normal fee; beyond 180 days: 12× normal fee. The normal base fee ranges from ₹200 to ₹600 depending on authorized capital.'
      },
      {
        question: 'What are the statutory adjudication penalties under Section 10A(2)?',
        answer: 'Separate from the MCA portal fee, default under Section 10A(2) attracts a flat penalty of ₹50,000 on the company and ₹1,000 per day of continuing default on every officer in default (capped at ₹1,00,000 per officer). Directors must pay this penalty from personal funds.'
      },
      {
        question: 'How does Section 446B reduce INC-20A penalties for Small Companies and Startups?',
        answer: 'Under Section 446B, eligible Small Companies (per Section 2(85)), One Person Companies (OPC), Producer Companies, and DPIIT-recognized Startups are granted a 50% statutory reduction: the company penalty is capped at ₹25,000, and officer penalties are ₹500 per day capped at ₹50,000 per officer. This must be disclosed in the upcoming Board Report.'
      },
      {
        question: 'What happens if a company commences business or borrows loans before filing INC-20A?',
        answer: 'Under Section 10A(1), commencing business or borrowing prior to filing is ultra vires and unlawful. Pre-filing loans are unauthorized, commercial agreements may be deemed voidable by counterparties, and directors face severe adjudication and prosecution risks.'
      },
      {
        question: 'Can the ROC strike off a company for not filing Form INC-20A?',
        answer: 'Yes. Under Section 10A(3) read with Section 248(1)(c), if a company fails to file Form INC-20A within 180 days and the ROC has reasonable cause to believe no business is being carried on, the ROC may initiate strike-off proceedings and dissolve the corporate entity.'
      },
      {
        question: 'Is Form INC-20A covered under the CCFS-2026 amnesty scheme?',
        answer: 'No. The Companies Compliance Facilitation Scheme (CCFS-2026) covers annual defaults under Sections 92 and 137 only. Section 10A defaults are strictly excluded from CCFS amnesty, meaning companies with pending INC-20A face the full Table B late fees and Section 10A(2) penalties.'
      },
      {
        question: 'Which companies are exempt from filing Form INC-20A?',
        answer: 'Companies incorporated prior to 2 November 2018 (when Section 10A was introduced), companies without share capital (limited by guarantee without share capital), and LLPs are completely exempt from Form INC-20A.'
      },
      {
        question: 'What documents are mandatory for filing Form INC-20A on MCA V3?',
        answer: 'Mandatory attachments include: (1) Corporate bank account statement showing individual subscription receipts from each subscriber, (2) Geo-tagged photographs of the registered office (external nameplate with CIN + interior with director), (3) Board Resolution under Section 179 authorising the director to sign, and (4) Digital certification by a practicing CA, CS, or CMA.'
      }
    ],
    relatedForms: ['spice-plus', 'inc-22', 'aoc-4', 'mgt-7'],
    filedTogetherWith: ['inc-22'],
    contentSections: {
      whatIsThisForm: '<p><strong>Form INC-20A</strong> is the statutory declaration for commencement of business required under <strong>Section 10A of the Companies Act, 2013</strong> and <strong>Rule 23A of the Companies (Incorporation) Rules, 2014</strong>. Introduced by the Companies (Amendment) Ordinance, 2018 (effective 2 November 2018), it ensures that newly formed companies do not operate as hollow shell entities before subscribers fulfill their capital commitment.</p><p>Through this electronic filing on MCA21 V3, an authorized director solemnly declares that all MOA subscribers have paid the full value of shares agreed to be taken, verified by bank statements and certified by an independent practicing CA, CS, or CMA.</p>',
      whoMustFile: '<p>Every company registered under the Companies Act, 2013 <strong>having a share capital</strong> and incorporated on or after <strong>2 November 2018</strong> must file Form INC-20A. This includes:</p><ul><li>Private Limited Companies</li><li>Public Limited Companies (Unlisted & Listed)</li><li>One Person Companies (OPCs) with share capital</li><li>Small Companies with share capital</li><li>DPIIT-Recognized Startup Companies</li><li>Producer Companies with share capital</li><li>Section 8 Companies with share capital</li></ul><p><strong>Exempted Entities:</strong> Companies incorporated before 2 November 2018, companies without share capital (guarantee companies), and LLPs are legally exempt.</p>',
      dueDateExplained: '<p>The statutory deadline is strictly <strong>180 calendar days from the date of incorporation</strong> printed on the Certificate of Incorporation (CoI). Day 0 is the registration date. Unlike annual filings (AOC-4 or MGT-7), there is no fixed calendar date or financial year trigger—each company has its own independent 180-day deadline. Day 181 onwards constitutes statutory default under Section 10A(2).</p>',
      consequencesOfDelay: '<p>Failure or delay in filing Form INC-20A triggers four cascading legal consequences:</p><ol><li><strong>Operational Freeze (Section 10A(1)):</strong> The company cannot legally commence commercial operations or exercise borrowing powers. Pre-filing agreements are voidable.</li><li><strong>MCA21 Slab Late Fees (Table B):</strong> Escalating multipliers from 2× to 12× normal filing fees.</li><li><strong>Statutory Adjudication Penalties (Section 10A(2)):</strong> Flat ₹50,000 fine on the company plus ₹1,000/day per officer in default (max ₹1,00,000 each), payable from personal funds (halved under Section 446B for Small Companies/Startups).</li><li><strong>Strike-Off Risk (Section 10A(3) / 248(1)(c)):</strong> If delay exceeds 180 days, ROC may initiate name removal and entity dissolution.</li></ol>',
      workedExample: '<div class="space-y-4"><p><strong>Scenario: Private Limited Company (Authorized Capital ₹10 Lakhs, 2 Directors) filing INC-20A 42 Days Late</strong></p><ul><li>Nominal Share Capital: ₹10,00,000 &rarr; Normal Base Fee (Table A, Item 5): <strong>₹400</strong></li><li>Days of Delay: 42 calendar days &rarr; Table B Slab (31 to 60 days): <strong>4× Normal Fee</strong></li><li>Additional Late Fee: 4 × ₹400 = <strong>₹1,600</strong></li><li><strong>Total MCA21 Portal e-Challan:</strong> ₹400 + ₹1,600 = <strong>₹2,000</strong></li><li><strong>Section 10A(2) Adjudication Exposure:</strong> ₹50,000 (Company) + (42 days × ₹1,000 × 2 Directors = ₹84,000) = <strong>₹1,34,000</strong> (Directors pay personally).</li><li><strong>Combined Financial Exposure:</strong> ₹2,000 + ₹1,34,000 = <strong>₹1,36,000</strong>.</li></ul></div>'
    }
  }
]

