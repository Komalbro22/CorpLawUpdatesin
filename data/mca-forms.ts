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
    filedBy: ['Private Limited', 'Public Limited', 'OPC', 'Small Company'],
    dueDate: 'Within 60 days of AGM',
    section: 'Section 92, Companies Act 2013',
    penaltyType: 'per_day',
    penaltyRate: '₹100 per day, no upper cap',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    filingGuides: [
      {
        title: "Complete MGT-7 Filing Guide — Step by Step for FY 2024-25",
        slug: "/updates/mgt-7-filing-guide-fy-2024-25",
        publishedDate: "2025-03-15",
        summary: "Step-by-step walkthrough of filing MGT-7 Annual Return, including attachments, certification requirements, and common errors.",
        isOfficial: true
      }
    ],
    metaTitle: 'MGT-7 Late Filing Fee Calculator 2026-27 | Annual Return Penalty | CorpLawUpdates.in',
    metaDescription: 'Calculate exact MGT-7 late filing fees and ₹100/day penalties for Annual Return. Free calculator updated for FY 2026-27. Covers Private, Public, OPC companies.',
    ogDescription: 'Use our free interactive calculator to determine exact late fees and ROC penalties for filing MGT-7 Annual Returns.',
    faqItems: [
      { question: 'What is the penalty for filing MGT-7 late?', answer: 'The penalty for filing MGT-7 late is a strict, uncapped fee of ₹100 per day for every day of delay beyond the due date (usually 60 days from the AGM).' },
      { question: 'Is there any maximum cap on the MGT-7 late fee?', answer: 'No, there is no maximum upper cap on the late fee for MGT-7. The ₹100 per day penalty accumulates continuously until the form is filed.' },
      { question: 'Who is required to file Form MGT-7?', answer: 'Every registered company in India, including Private Limited, Public Limited, and One Person Companies (OPCs), must file their annual return via Form MGT-7 or MGT-7A (for OPCs/Small companies).' },
      { question: 'Can the ROC waive the MGT-7 late fee?', answer: 'The ₹100 per day additional fee is statutorily fixed under the Companies Act. The ROC does not have discretionary power to waive this fee unless under a specific government amnesty scheme like the CFSS.' },
      { question: 'What is the due date for MGT-7?', answer: 'MGT-7 must be filed within 60 days from the date the Annual General Meeting (AGM) is held.' }
    ],
    relatedForms: ['aoc-4', 'dir-12'],
    filedTogetherWith: ['aoc-4'],
    contentSections: {
      whatIsThisForm: '<p>Form MGT-7 is an electronic form provided by the Ministry of Corporate Affairs (MCA) to all incorporated companies in India for filing their <strong>Annual Return</strong>. It contains comprehensive details regarding the company’s shareholding structure, changes in directorships, details of meetings held during the financial year, and remuneration paid to key managerial personnel. Filing this form is a mandatory statutory requirement under Section 92 of the Companies Act, 2013. Maintaining transparency with the Registrar of Companies (ROC) through this form ensures the company remains active and compliant.</p>',
      whoMustFile: '<p>Every company registered under the Companies Act, 2013 (or previous acts) is obligated to file Form MGT-7 annually. This includes Private Limited Companies, Public Limited Companies, Section 8 Companies, and wholly-owned subsidiaries. However, One Person Companies (OPCs) and Small Companies are permitted to file an abridged version of the form known as <strong>Form MGT-7A</strong>.</p>',
      dueDateExplained: '<p>The statutory due date for filing Form MGT-7 is strictly <strong>within 60 days from the date of the Annual General Meeting (AGM)</strong> of the company. Since the AGM must generally be held on or before September 30th of the financial year, the standard deadline for filing MGT-7 naturally falls on or around <strong>November 29th</strong> each year.</p>',
      consequencesOfDelay: '<p>Delaying the filing of MGT-7 attracts severe statutory penalties. Unlike general event-based forms which follow a multiplier cap (e.g., 2x to 12x the normal fee), MGT-7 attracts a strict, uncapped penalty of <strong>₹100 per day</strong> for every single day of default. Furthermore, continuous non-filing for consecutive years can lead to the directors being disqualified under Section 164(2) and the company being struck off the register by the ROC.</p>',
      workedExample: '<p><strong>Scenario:</strong> A Private Limited Company with an authorized capital of ₹5,00,000 files its MGT-7 45 days after the due date.</p><ul><li>Normal Filing Fee (Slab based): ₹400</li><li>Late Penalty: 45 days × ₹100 = ₹4,500</li><li><strong>Total Liability:</strong> ₹400 + ₹4,500 = <strong>₹4,900</strong></li></ul>'
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
    aliases: ['adt1', 'auditor appointment', 'ADT 1'],
    category: 'event',
    filedBy: ['Private Limited', 'Public Limited', 'OPC'],
    dueDate: 'Within 15 days of AGM',
    section: 'Section 139(1), Companies Act 2013',
    penaltyType: 'multiplier',
    penaltyRate: '2x to 12x normal fee',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false,
    metaTitle: 'ADT-1 Penalty & Fee Calculator | Auditor Appointment | CorpLawUpdates',
    metaDescription: 'Calculate MCA fees and late penalties for filing Form ADT-1 (Notice of appointment of auditor). Get exact multiplier-based late fee estimates.',
    ogDescription: 'Calculate MCA fees and late penalties for filing Form ADT-1 (Notice of appointment of auditor).',
    faqItems: [
      { question: 'What is Form ADT-1?', answer: 'Form ADT-1 is filed by a company to notify the Registrar of Companies (ROC) about the appointment of its statutory auditor.' },
      { question: 'What is the due date for ADT-1?', answer: 'It must be filed within 15 days from the date of the Annual General Meeting (AGM) where the auditor was appointed.' },
      { question: 'Does ADT-1 have an uncapped penalty like AOC-4?', answer: 'No, ADT-1 is an event-based form. Its late fee is calculated using a multiplier slab (up to 12x the normal fee), not a per-day penalty.' },
      { question: 'Who is exempt from filing ADT-1?', answer: 'Generally, no active company is exempt. Even newly incorporated companies must appoint an auditor within 30 days and file ADT-1.' },
      { question: 'Can an auditor be appointed for 5 years?', answer: 'Yes, statutory auditors are typically appointed for a term of 5 consecutive years, requiring ADT-1 to be filed upon that 5-year appointment.' }
    ],
    relatedForms: ['aoc-4', 'mgt-7'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form ADT-1</strong> is a mandatory notice filed with the Ministry of Corporate Affairs to officially declare the appointment of a statutory auditor. By filing this form, a company informs the government and public stakeholders that an independent chartered accountant has been assigned to audit its financial records, ensuring corporate transparency.</p>',
      whoMustFile: '<p>Every company registered under the Companies Act—whether private, public, OPC, or Section 8—must file ADT-1 whenever they appoint or re-appoint a statutory auditor at an Annual General Meeting (AGM) or Extraordinary General Meeting (EGM).</p>',
      dueDateExplained: '<p>The form must be filed strictly <strong>within 15 days</strong> of the meeting in which the auditor was appointed. If the auditor was appointed at the AGM on September 30th, ADT-1 must be filed by October 15th.</p>',
      consequencesOfDelay: '<p>Since ADT-1 is an event-based form, delaying its filing triggers a multiplier penalty rather than a daily penalty. If you file 30 days late, you pay 2 times the normal fee. If you delay beyond 180 days, you are penalized with a massive <strong>12 times (12x)</strong> the normal filing fee.</p>',
      workedExample: '<p><strong>Scenario:</strong> A standard Private Company with ₹5 Lakhs capital files ADT-1 exactly 45 days after the due date.</p><ul><li>Normal Filing Fee: ₹300</li><li>Late Penalty (31 to 60 days delay = 4x fee): ₹1,200</li><li><strong>Total Liability:</strong> ₹300 + ₹1,200 = <strong>₹1,500</strong></li></ul>'
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
    formName: 'Charge Creation',
    aliases: ['chg1', 'creation of charge', 'bank loan form'],
    category: 'charge',
    filedBy: ['Private Limited', 'Public Limited'],
    dueDate: 'Within 30 days of charge creation',
    section: 'Section 77, Companies Act 2013',
    penaltyType: 'multiplier', // Technically has an ad-valorem component too
    penaltyRate: 'Ad valorem up to ₹5L + Multiplier',
    normalFeeStructure: 'capital_slab',
    baseFeeSlab: 'standard_company_slab',
    concessionApplies: false, // charges usually don't have OPC concessions in the same way, but let's keep true for standard logic
    metaTitle: 'CHG-1 Fee & Penalty Calculator | Creation of Charge MCA Tool',
    metaDescription: 'Calculate the complex ad valorem penalty and normal fees for delayed filing of CHG-1 (Creation or Modification of Charge).',
    ogDescription: 'Calculate the complex ad valorem penalty and normal fees for delayed filing of CHG-1 (Creation or Modification of Charge).',
    faqItems: [
      { question: 'What is CHG-1 used for?', answer: 'CHG-1 is used to register a charge (like a mortgage or lien) created on the assets of the company in favor of a bank or financial institution.' },
      { question: 'What is the due date for CHG-1?', answer: 'It must be filed within 30 days of the creation or modification of the charge instrument.' },
      { question: 'What is the ad valorem penalty for CHG-1?', answer: 'If CHG-1 is delayed beyond 30 days, an additional ad valorem fee is charged. This is usually 0.05% of the charge amount, capped at ₹5,00,000.' },
      { question: 'Can CHG-1 be filed after 120 days?', answer: 'If delayed beyond 120 days from creation, you must apply to the Central Government for condonation of delay using Form CHG-8 before CHG-1 can be approved.' },
      { question: 'Who pays the fee for CHG-1?', answer: 'The company creating the charge pays the fee. If the company fails, the charge-holder (bank) can file it and recover the fee from the company.' }
    ],
    relatedForms: ['aoc-4'],
    filedTogetherWith: [],
    contentSections: {
      whatIsThisForm: '<p><strong>Form CHG-1</strong> is filed to register the creation or modification of a "Charge" (a lien, mortgage, or security interest) on the assets of a company. When a company takes a loan from a bank and pledges its property or assets as collateral, registering this charge via CHG-1 provides public notice of the bank\'s secured interest.</p>',
      whoMustFile: '<p>Every company that secures a loan by pledging its tangible or intangible assets must file this form to protect the interests of the lending institution.</p>',
      dueDateExplained: '<p>The form must be filed <strong>within 30 days</strong> from the date the loan agreement or instrument creating the charge was officially signed.</p>',
      consequencesOfDelay: '<p>CHG-1 has one of the most punitive delay mechanics. Missing the 30-day window triggers an <strong>Ad Valorem fee</strong> (a percentage based on the loan amount, usually 0.05% capped at ₹5 Lakhs) on top of standard multiplier penalties. A delay beyond 120 days requires a complex Central Government condonation process.</p>',
      workedExample: '<p><strong>Scenario:</strong> A company with ₹10 Lakhs capital delays a CHG-1 filing for a ₹1 Crore loan by 40 days.</p><ul><li>Normal Filing Fee: ₹400</li><li>Ad Valorem Additional Fee (0.05% of 1 Cr): ₹5,000</li><li><strong>Total Liability:</strong> <strong>₹5,400</strong></li></ul>'
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
