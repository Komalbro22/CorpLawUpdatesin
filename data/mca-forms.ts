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
    metaTitle: 'Form MGT-7 Fee Calculator: Annual Return Filing Fee & Penalty | CorpLawUpdates.in',
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
    metaTitle: 'Form MGT-7A Fee Calculator: Small Company & OPC Annual Return | CorpLawUpdates.in',
    metaDescription: 'Calculate Form MGT-7A normal filing fees, ₹100/day additional filing fee, and Section 446B lesser penalty ceilings for OPCs and Small Companies (FY 2026-27).',
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
    aliases: ['financial statement', 'aoc4', 'AOC 4', 'balance sheet filing'],
    category: 'annual',
    filedBy: ['Private Limited', 'Public Limited', 'OPC', 'Small Company'],
    dueDate: 'Within 30 days of AGM',
    section: 'Section 137, Companies Act 2013',
    penaltyType: 'per_day',
    penaltyRate: '₹100 per day, no upper cap',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    filingGuides: [
      {
        title: "AOC-4 Filing Guide — Financial Statements for FY 2024-25",
        slug: "/updates/aoc-4-filing-guide-fy-2024-25",
        publishedDate: "2026-06-10",
        summary: "How to file AOC-4 Financial Statements, attachments required, and common rejection reasons.",
        isOfficial: true
      }
    ],
    metaTitle: 'AOC-4 Late Fee Calculator | Financial Statement ROC Penalty | CorpLawUpdates.in',
    metaDescription: 'Calculate AOC-4 late filing fees and penalty of ₹100/day for financial statements. Free ROC fee calculator updated for FY 2026-27.',
    ogDescription: 'Calculate AOC-4 late filing fees and penalty of ₹100/day for financial statements. Free ROC fee calculator updated for FY 2026-27.',
    faqItems: [
      { question: 'What is Form AOC-4 used for?', answer: 'Form AOC-4 is used to file the financial statements (Balance Sheet, Profit & Loss Account, Board Report) of a company with the ROC.' },
      { question: 'What is the late fee for AOC-4?', answer: 'The late fee for AOC-4 is a flat ₹100 per day for every day of delay, without any maximum cap.' },
      { question: 'When is the due date for AOC-4?', answer: 'AOC-4 must be filed within 30 days of the company’s Annual General Meeting (AGM).' },
      { question: 'Can AOC-4 and MGT-7 be filed together?', answer: 'Yes, they are generally filed in tandem as part of the annual ROC compliance, though their specific due dates differ slightly (30 days vs 60 days from AGM).' },
      { question: 'Does a small company pay less normal fee for AOC-4?', answer: 'Yes, Small Companies and OPCs enjoy a concessional normal filing fee (starting at ₹50), but the late fee penalty remains the strict ₹100/day.' }
    ],
    relatedForms: ['mgt-7', 'adt-1'],
    filedTogetherWith: ['mgt-7'],
    contentSections: {
      whatIsThisForm: '<p>Form AOC-4 is the official document through which a company files its <strong>Financial Statements</strong> with the Ministry of Corporate Affairs. This form must include the Balance Sheet, Profit and Loss account, Directors\' Report, Auditors\' Report, and other required financial annexures. This filing ensures that the company\'s financial health is officially recorded and available in the public domain for stakeholders and regulatory oversight.</p>',
      whoMustFile: '<p>All companies registered in India, irrespective of their size, turnover, or nature of business (Private, Public, OPC, Section 8), must file Form AOC-4. Depending on the turnover and specific rules, some companies may be required to file <strong>AOC-4 XBRL</strong> instead of the standard form.</p>',
      dueDateExplained: '<p>Under Section 137 of the Companies Act, AOC-4 must be filed <strong>within 30 days from the date of the Annual General Meeting (AGM)</strong>. If the AGM is held on the last permissible date (September 30th), the due date for AOC-4 falls on <strong>October 29th</strong>.</p>',
      consequencesOfDelay: '<p>Failure to file AOC-4 within the 30-day window results in an immediate and uncapped late fee penalty of <strong>₹100 per day</strong>. Beyond financial penalties, chronic failure to file financial statements for three consecutive years can lead to the automatic disqualification of all directors of the company.</p>',
      workedExample: '<p><strong>Scenario:</strong> A Small Company with an authorized capital of ₹1,00,000 files AOC-4 exactly 10 days late.</p><ul><li>Normal Filing Fee (Concessional Slab): ₹50</li><li>Late Penalty: 10 days × ₹100 = ₹1,000</li><li><strong>Total Liability:</strong> ₹50 + ₹1,000 = <strong>₹1,050</strong></li></ul>'
    }
  },
  {
    slug: 'spice-plus',
    formNumber: 'SPICe+',
    formName: 'Incorporation (SPICe+)',
    aliases: ['spice', 'inc-32', 'incorporation', 'company registration'],
    category: 'incorporation',
    filedBy: ['Promoters', 'New Companies'],
    dueDate: 'N/A',
    section: 'Section 7, Companies Act 2013',
    penaltyType: 'nil',
    penaltyRate: 'No penalty, initial filing',
    normalFeeStructure: 'flat',
    baseFeeSlab: 'nil',
    concessionApplies: false,
    metaTitle: 'SPICe+ Company Incorporation Fee Calculator | Stamp Duty Estimate',
    metaDescription: 'Calculate the exact MCA fee and state-wise stamp duty for incorporating a new company in India using SPICe+ (INC-32). Free estimator tool.',
    ogDescription: 'Calculate the exact MCA fee and state-wise stamp duty for incorporating a new company in India using SPICe+ (INC-32).',
    faqItems: [
      { question: 'Is the SPICe+ form fee waived for small capitals?', answer: 'Yes, the MCA has waived the normal incorporation fee for companies incorporating with an authorized capital of up to ₹15 Lakhs. However, stamp duty still applies.' },
      { question: 'What is SPICe+ Part A and Part B?', answer: 'Part A is exclusively for name reservation, while Part B covers the actual incorporation, DIN allotment, PAN/TAN application, and other registrations.' },
      { question: 'Is stamp duty the same across India?', answer: 'No, stamp duty is a state subject. It varies heavily depending on the state where the registered office is located.' },
      { question: 'Does SPICe+ include GST registration?', answer: 'Yes, GST registration is optional but integrated into the SPICe+ process via the AGILE-PRO-S linked form.' },
      { question: 'Can I apply for DIN through SPICe+?', answer: 'Yes, up to 3 directors who do not currently possess a DIN can apply for it simultaneously through the SPICe+ form.' }
    ],
    relatedForms: ['inc-20a', 'dir-3-kyc'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>SPICe+ (Simplified Proforma for Incorporating Company Electronically Plus)</strong>, technically designated as Form INC-32, is the flagship web-based form introduced by the MCA to drastically simplify company registration in India. It replaces multiple older forms by offering over 10 services integrated into a single application, allowing entrepreneurs to register their business, obtain PAN, TAN, EPFO, ESIC, and optionally GST in one go.</p>',
      whoMustFile: '<p>Any entrepreneur, promoter, or professional seeking to incorporate a new Private Limited, Public Limited, or One Person Company (OPC) in India must use the SPICe+ web form.</p>',
      dueDateExplained: '<p>Because SPICe+ is an initial registration form, there is no "due date" per se. However, if you reserve a company name via SPICe+ Part A, that name is only valid for <strong>20 days</strong>. You must file Part B to complete incorporation within this 20-day window.</p>',
      consequencesOfDelay: '<p>There are no late fees for SPICe+ since it is an initial application. If you fail to file Part B within the 20-day name reservation window, the reserved name will expire, and you will have to pay ₹1,000 to reserve a name again.</p>',
      workedExample: '<p><strong>Scenario:</strong> Incorporating a Private Limited Company in Maharashtra with an authorized capital of ₹1,00,000.</p><ul><li>MCA Incorporation Fee (Waived up to 15L): ₹0</li><li>Estimated MOA Stamp Duty (Maharashtra): ₹1,000</li><li>Estimated AOA Stamp Duty (Maharashtra): ₹500</li><li><strong>Estimated Total Liability:</strong> <strong>₹1,500</strong></li></ul>'
    }
  },
  {
    slug: 'dir-3-kyc',
    formNumber: 'DIR-3 KYC',
    formName: 'Director KYC',
    aliases: ['dir3 kyc', 'director kyc', 'din kyc'],
    category: 'kyc',
    filedBy: ['Individual Directors'],
    dueDate: '30th June of applicable year',
    section: 'Rule 12A, Companies (Appointment and Qualification of Directors) Rules',
    penaltyType: 'flat',
    penaltyRate: 'Flat ₹5,000 penalty',
    normalFeeStructure: 'nil',
    baseFeeSlab: 'nil',
    concessionApplies: false,
    metaTitle: 'DIR-3 KYC Penalty Calculator | Director KYC Late Fee | CorpLawUpdates',
    metaDescription: 'Check the exact late fee penalty for delayed DIR-3 KYC filing. Know the ₹5000 penalty rules for deactivated DINs.',
    ogDescription: 'Check the exact late fee penalty for delayed DIR-3 KYC filing. Know the ₹5000 penalty rules for deactivated DINs.',
    faqItems: [
      { question: 'What is DIR-3 KYC?', answer: 'DIR-3 KYC is a mandatory annual compliance form for all individuals holding a Director Identification Number (DIN) to verify their identity and contact details.' },
      { question: 'What happens if I miss the DIR-3 KYC deadline?', answer: 'If you miss the 30th June deadline, your DIN will be marked as "Deactivated due to non-filing of DIR-3 KYC". You cannot file any MCA forms until it is reactivated.' },
      { question: 'What is the penalty for filing DIR-3 KYC late?', answer: 'Filing DIR-3 KYC after the due date attracts a flat penalty of ₹5,000. There is no normal fee if filed on time.' },
      { question: 'Who needs to file DIR-3 KYC?', answer: 'Every individual holding a DIN as of 31st March of a financial year must file DIR-3 KYC by 30th June of the next financial year.' },
      { question: 'Is web KYC sufficient?', answer: 'Yes, if your details (phone and email) have not changed from the previous year, you can simply complete DIR-3 KYC Web, which is a quicker OTP-based process.' }
    ],
    relatedForms: ['dir-12'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>DIR-3 KYC</strong> is a critical compliance requirement designed by the MCA to maintain a clean, verified database of all company directors. Every individual who has been allotted a Director Identification Number (DIN) must submit this form annually to confirm their permanent address, mobile number, and email ID. This prevents the existence of shell company directors and identity fraud.</p>',
      whoMustFile: '<p>Every individual who has been allotted a DIN on or before the 31st of March of a financial year must submit DIR-3 KYC. This applies even if the individual is not currently holding a directorship in any active company.</p>',
      dueDateExplained: '<p>The deadline to file DIR-3 KYC is strictly <strong>30th June</strong> of the immediate next financial year. For instance, for the financial year ending March 31, 2026, the KYC must be filed by June 30, 2026.</p>',
      consequencesOfDelay: '<p>If DIR-3 KYC is not filed by the deadline, the MCA system automatically deactivates the DIN. A deactivated DIN prevents the director from signing any compliance documents or being appointed to a new company. To reactivate the DIN, the director must file the form along with a heavy, flat penalty of <strong>₹5,000</strong>.</p>',
      workedExample: '<p><strong>Scenario:</strong> A director forgets to file DIR-3 KYC by 30th June and attempts to file on 5th July.</p><ul><li>Normal Filing Fee: ₹0</li><li>Late Penalty (Flat Reactivation Fee): ₹5,000</li><li><strong>Total Liability:</strong> <strong>₹5,000</strong></li></ul>'
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
    metaTitle: 'ADT-1 Late Fees Calculator (FY 2026-27) — Due Date, Multiplier Slabs & Penalty | CorpLawUpdates',
    metaDescription: 'Calculate MCA fees and late penalties for Form ADT-1 (Auditor Appointment). Get exact Table B multiplier fees (1x to 12x), 15-day statutory due date calculation from AGM/EGM, capital slabs, casual vacancy rules, and Section 403 condonation guidance.',
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
    slug: 'inc-20a',
    formNumber: 'INC-20A',
    formName: 'Commencement of Business',
    aliases: ['inc20a', 'commencement of business', 'bank statement filing'],
    category: 'event',
    filedBy: ['Newly Incorporated Companies'],
    dueDate: 'Within 180 days of incorporation',
    section: 'Section 10A, Companies Act 2013',
    penaltyType: 'multiplier',
    penaltyRate: '2x to 12x normal fee',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    metaTitle: 'INC-20A Fee & Penalty Calculator | Commencement of Business Form',
    metaDescription: 'Calculate the MCA fee and multiplier-based late penalties for filing INC-20A (Declaration for commencement of business).',
    ogDescription: 'Calculate the MCA fee and multiplier-based late penalties for filing INC-20A (Declaration for commencement of business).',
    faqItems: [
      { question: 'What is Form INC-20A?', answer: 'INC-20A is a declaration filed by directors to confirm that subscribers to the Memorandum have paid the value of shares agreed upon, and the company is ready to commence business.' },
      { question: 'When is INC-20A due?', answer: 'It must be filed within 180 days from the date of the company’s incorporation.' },
      { question: 'What is the penalty for late filing of INC-20A?', answer: 'INC-20A is subject to the standard event-based multiplier penalty (up to 12x normal fee). Additionally, failure to file can result in the ROC initiating strike-off proceedings.' },
      { question: 'Can a company start business without INC-20A?', answer: 'No, a company incorporated after November 2018 cannot legally commence business or exercise borrowing powers until INC-20A is filed and approved.' },
      { question: 'What documents are required for INC-20A?', answer: 'The primary document required is the company’s bank statement showing the receipt of subscription money from shareholders.' }
    ],
    relatedForms: ['spice-plus'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form INC-20A</strong> is a pivotal compliance document known as the <em>Declaration for Commencement of Business</em>. Introduced to curb shell companies, this form proves to the ROC that the initial shareholders (subscribers) have actually deposited their promised share capital money into the company’s official bank account.</p>',
      whoMustFile: '<p>Any company having share capital that was incorporated on or after November 2, 2018, is required to file this form. The company’s directors must sign the declaration and attach proof of capital receipt.</p>',
      dueDateExplained: '<p>The form affords a generous window: it must be filed <strong>within 180 days</strong> from the exact date of the company’s incorporation as printed on the Certificate of Incorporation.</p>',
      consequencesOfDelay: '<p>Filing late attracts the standard multiplier penalty (up to 12x the normal fee). However, the real danger is existential: if INC-20A is not filed within 180 days, the ROC possesses the authority to assume the company is not carrying on any business and may unilaterally <strong>strike the company’s name off the register</strong>, effectively shutting it down.</p>',
      workedExample: '<p><strong>Scenario:</strong> A new OPC with ₹1 Lakh capital files INC-20A 100 days after the 180-day deadline expires.</p><ul><li>Normal Concessional Fee: ₹50</li><li>Late Penalty (91 to 180 days delay = 10x fee): ₹500</li><li><strong>Total Liability:</strong> ₹50 + ₹500 = <strong>₹550</strong> (Plus risk of strike-off action)</li></ul>'
    }
  },
  {
    slug: 'dir-12',
    formNumber: 'DIR-12',
    formName: 'Director Changes',
    aliases: ['dir12', 'director appointment', 'director resignation'],
    category: 'event',
    filedBy: ['Private Limited', 'Public Limited', 'OPC'],
    dueDate: 'Within 30 days of the change',
    section: 'Section 168 & 170, Companies Act 2013',
    penaltyType: 'multiplier',
    penaltyRate: '2x to 12x normal fee',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    metaTitle: 'DIR-12 Fee & Penalty Calculator | ROC Director Appointment Fees',
    metaDescription: 'Instantly calculate filing fees and late penalties for Form DIR-12 (Appointment or Resignation of Directors and KMP).',
    ogDescription: 'Instantly calculate filing fees and late penalties for Form DIR-12 (Appointment or Resignation of Directors and KMP).',
    faqItems: [
      { question: 'When is DIR-12 required to be filed?', answer: 'DIR-12 must be filed whenever there is an appointment, resignation, or change in designation of a Director or Key Managerial Personnel (KMP).' },
      { question: 'What is the due date for DIR-12?', answer: 'It must be filed within 30 days from the date of the event (appointment or resignation).' },
      { question: 'Who files DIR-12 when a director resigns?', answer: 'The company is responsible for filing DIR-12 to formally notify the ROC of the resignation. (The resigning director may optionally file DIR-11 to protect themselves).' },
      { question: 'Is the DIR-12 penalty per day or multiplier?', answer: 'DIR-12 uses the multiplier-based penalty system. Delays result in penalties ranging from 2x to 12x the base filing fee depending on the number of days delayed.' },
      { question: 'Do I need a DIR-12 for changing a director to a Managing Director?', answer: 'Yes, a change in designation triggers the requirement to file DIR-12 within 30 days.' }
    ],
    relatedForms: ['dir-3-kyc'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form DIR-12</strong> is the official mechanism used by a company to communicate any changes in its leadership structure to the Registrar of Companies. Whether appointing a new director, accepting a resignation, or changing the designation of a Key Managerial Personnel (KMP), DIR-12 updates the public master data of the company to reflect its current management.</p>',
      whoMustFile: '<p>Every company—regardless of type—must file DIR-12 whenever an individual joins the board, leaves the board, or changes their role within the board.</p>',
      dueDateExplained: '<p>The form is strictly time-bound and must be filed <strong>within 30 days</strong> of the effective date of the appointment or resignation. A board resolution date is typically considered the anchor date for this 30-day countdown.</p>',
      consequencesOfDelay: '<p>Delaying the filing of DIR-12 causes the company\'s master data to become outdated, creating compliance friction with banks and stakeholders. Financially, it attracts a multiplier penalty up to <strong>12 times the base fee</strong> if delayed beyond 180 days.</p>',
      workedExample: '<p><strong>Scenario:</strong> A Private Company with ₹25 Lakhs capital appoints a new director but files DIR-12 20 days late.</p><ul><li>Normal Filing Fee: ₹400</li><li>Late Penalty (16 to 30 days delay = 2x fee): ₹800</li><li><strong>Total Liability:</strong> ₹400 + ₹800 = <strong>₹1,200</strong></li></ul>'
    }
  },
  {
    slug: 'pas-3',
    formNumber: 'PAS-3',
    formName: 'Return of Allotment',
    aliases: ['pas3', 'return of allotment', 'share allotment'],
    category: 'event',
    filedBy: ['Private Limited', 'Public Limited', 'OPC'],
    dueDate: 'Within 30 days of allotment',
    section: 'Section 39(4), Companies Act 2013',
    penaltyType: 'multiplier',
    penaltyRate: '2x to 12x normal fee',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    metaTitle: 'PAS-3 Fee Calculator | Return of Allotment Penalty | CorpLawUpdates',
    metaDescription: 'Calculate exact ROC fees and late filing penalties for Form PAS-3 (Return of Allotment of Shares). Updated for FY 2026-27.',
    ogDescription: 'Calculate exact ROC fees and late filing penalties for Form PAS-3 (Return of Allotment of Shares).',
    faqItems: [
      { question: 'What is Form PAS-3?', answer: 'PAS-3 is a Return of Allotment filed with the ROC to declare that the company has allotted new shares to shareholders.' },
      { question: 'When is PAS-3 due?', answer: 'It must be filed within 30 days from the date of the board meeting where the shares were formally allotted.' },
      { question: 'What happens if PAS-3 is not filed?', answer: 'If not filed, the newly allotted shares will not reflect in the MCA master data, and heavy multiplier penalties will apply upon delayed filing.' },
      { question: 'Is PAS-3 needed for rights issues?', answer: 'Yes, PAS-3 must be filed whenever shares are allotted, whether through a rights issue, private placement, or bonus issue.' },
      { question: 'Does PAS-3 require a valuation report?', answer: 'Yes, if shares are allotted for consideration other than cash or through private placement, a registered valuer’s report must be attached.' }
    ],
    relatedForms: ['dir-12'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form PAS-3</strong> (Return of Allotment) is a crucial filing that a company executes whenever it issues new shares to investors or promoters. It serves as the official declaration to the government documenting who bought the shares, how many were bought, and at what premium or discount, ensuring absolute transparency in corporate fundraising.</p>',
      whoMustFile: '<p>Any company having a share capital that makes an allotment of shares or securities (via private placement, rights issue, or bonus issue) must file PAS-3.</p>',
      dueDateExplained: '<p>The Return of Allotment must be filed <strong>within 30 days</strong> from the date the shares were formally allotted via a board resolution.</p>',
      consequencesOfDelay: '<p>If PAS-3 is delayed, the MCA levies a multiplier-based penalty (up to 12x the normal fee). Furthermore, under Section 39, the company and its defaulting officers can face severe adjudication fines extending up to ₹1,000 per day or ₹1 Lakh, whichever is less, independently of the late filing fee.</p>',
      workedExample: '<p><strong>Scenario:</strong> A Public Company with ₹2 Crore capital files PAS-3 exactly 70 days after the 30-day deadline.</p><ul><li>Normal Filing Fee: ₹600</li><li>Late Penalty (61 to 90 days delay = 6x fee): ₹3,600</li><li><strong>Total Liability:</strong> ₹600 + ₹3,600 = <strong>₹4,200</strong></li></ul>'
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
    metaTitle: 'CHG-1 Late Fees & Ad Valorem Calculator (FY 2026-27) — Section 77 Charge Creation | CorpLawUpdates',
    metaDescription: 'Calculate statutory normal filing fees, Table B multipliers (3x/6x), and ad valorem penalties (0.025%/0.05% capped at ₹1L/₹5L) for Form CHG-1 on MCA V3. Features exact 30-60-120 day statutory timelines, Small Company concessions, and Section 87 condonation roadmap.',
    ogDescription: 'Instant statutory calculation of Form CHG-1 filing fees, 30-60-120 day deadlines, extension multipliers, and ad valorem penalties under Section 77 of the Companies Act, 2013.',
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
    formName: 'MSME Half-Yearly Return',
    aliases: ['msme 1', 'msme half yearly', 'delayed payment return'],
    category: 'event',
    filedBy: ['Specified Companies'],
    dueDate: '30th April & 31st October',
    section: 'Specified Companies (Furnishing of info about payment to micro and small enterprise suppliers) Order',
    penaltyType: 'nil', // Usually no late fee on the portal, but severe adjudication penalty
    penaltyRate: 'Adjudication fine up to ₹10,000',
    normalFeeStructure: 'nil', // No filing fee
    baseFeeSlab: 'nil',
    concessionApplies: false,
    metaTitle: 'MSME-1 Filing Rules & Penalty Calculator | CorpLawUpdates',
    metaDescription: 'Understand the filing requirements, due dates, and severe adjudication penalties for missing the MSME-1 half-yearly return.',
    ogDescription: 'Understand the filing requirements, due dates, and severe adjudication penalties for missing the MSME-1 half-yearly return.',
    faqItems: [
      { question: 'Who is required to file MSME-1?', answer: 'Any "Specified Company" that receives goods or services from a Micro or Small Enterprise and delays payment beyond 45 days must file MSME-1.' },
      { question: 'What are the due dates for MSME-1?', answer: 'The return for the April-September period is due by 31st October. The return for October-March is due by 30th April.' },
      { question: 'Is there a normal MCA filing fee for MSME-1?', answer: 'No, there is zero filing fee for submitting Form MSME-1 on the MCA portal.' },
      { question: 'What is the penalty for not filing MSME-1?', answer: 'While there is no portal-calculated late fee, failure to file attracts an adjudication fine under Section 450 of the Companies Act, which can be ₹10,000 plus ₹1,000 per day of continuing default.' },
      { question: 'Do we need to file MSME-1 if there are no delayed payments?', answer: 'No, MSME-1 is a nil-return exempt form. If your company has no dues to MSMEs exceeding 45 days, you are not required to file it.' }
    ],
    relatedForms: ['aoc-4'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form MSME-1</strong> is a half-yearly return mandated by the MCA to protect the financial interests of Micro and Small Enterprises. Through this form, large corporate buyers are forced to publicly disclose any outstanding dues they owe to MSME suppliers that have been delayed beyond the statutory limit of 45 days.</p>',
      whoMustFile: '<p>All "Specified Companies"—defined as any company that buys from an MSME and whose payment to that MSME exceeds 45 days from the date of acceptance of goods or services—must file this return.</p>',
      dueDateExplained: '<p>The form is filed twice a year. For the half-year ending September 30, the due date is <strong>October 31</strong>. For the half-year ending March 31, the due date is <strong>April 30</strong>.</p>',
      consequencesOfDelay: '<p>Interestingly, the MCA portal does not charge a standard multiplier late fee for MSME-1. However, non-compliance is extremely dangerous. Defaulting companies face adjudication under Section 450 of the Companies Act, resulting in a base fine of ₹10,000, plus a continuing penalty of ₹1,000 per day (capped at ₹2 Lakhs) for the company and its directors.</p>',
      workedExample: '<p><strong>Scenario:</strong> Form MSME-1 is filed 30 days late.</p><ul><li>Normal Filing Fee: ₹0</li><li>Portal Late Fee: ₹0</li><li><strong>Adjudication Risk:</strong> Base ₹10,000 + (30 days × ₹1,000) = <strong>₹40,000 Potential Fine</strong></li></ul>'
    }
  }
]
