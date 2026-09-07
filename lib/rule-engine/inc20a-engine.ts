/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM INC-20A STATUTORY COMMENCEMENT OF BUSINESS RULE & PENALTY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Authoritative Single Source of Truth (SSOT) for:
 * 1. Form INC-20A (Declaration for Commencement of Business under Section 10A
 *    and Rule 23A of the Companies (Incorporation) Rules, 2014)
 * 2. 180-Day Statutory Deadline from Incorporation Date (Day 0 = CoI Date)
 * 3. MCA21 V3 Portal Filing Fees (Table A Item 5) & Slab Multipliers (Table B 2x to 12x)
 * 4. Section 10A(2) Adjudication Penalties (₹50k Company + ₹1k/day Director, max ₹1L each)
 * 5. Section 446B Lesser Penalties (50% Halving for Small Companies, Startups, OPCs, Producer Co.)
 * 6. Section 10A(1) Operational Freeze & Pre-Filing Borrowing/Contract Voidability
 * 7. Section 10A(3) / Section 248(1)(c) Strike-Off Risk Determination
 * 8. Real ROC Adjudication Benchmark Cases (Pune, Bangalore, Delhi)
 * 9. CCFS-2026 Exclusion Warning (Section 10A defaults are excluded from CCFS amnesty)
 *
 * Statutory Authorities & Sources:
 * - Companies Act, 2013: Sections 10A, 12(2), 164(2), 248(1)(c), 403, 446B, 454(3), 454(8)
 * - Companies (Incorporation) Rules, 2014: Rule 23A
 * - Companies (Registration Offices and Fees) Rules, 2014: Table A (Item 5), Table B
 * - Companies (Amendment) Ordinance, 2018 (effective 2 November 2018) & Amendment Act, 2019
 * - Adjudication Orders: ROC Pune, ROC Bangalore, ROC Delhi (2025–2026)
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATUTORY CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Inc20aCompanyClassification =
  | 'standard_private'
  | 'standard_public'
  | 'opc'
  | 'small_company'
  | 'startup'
  | 'producer'
  | 'section_8'
  | 'no_share_capital';

export interface Inc20aCapitalSlab {
  minCapital: number;
  maxCapital: number;
  baseFee: number;
  bracketLabel: string;
}

export const INC20A_CAPITAL_SLABS: Inc20aCapitalSlab[] = [
  { minCapital: 0, maxCapital: 99999, baseFee: 200, bracketLabel: 'Less than ₹1,00,000' },
  { minCapital: 100000, maxCapital: 499999, baseFee: 300, bracketLabel: '₹1,00,000 to ₹4,99,999' },
  { minCapital: 500000, maxCapital: 2499999, baseFee: 400, bracketLabel: '₹5,00,000 to ₹24,99,999' },
  { minCapital: 2500000, maxCapital: 9999999, baseFee: 500, bracketLabel: '₹25,00,000 to ₹99,99,999' },
  { minCapital: 10000000, maxCapital: Infinity, baseFee: 600, bracketLabel: '₹1,00,00,000 (₹1 Crore) or more' }
];

export interface Inc20aDelaySlab {
  slabId: string;
  delayRange: string;
  minDays: number;
  maxDays: number;
  multiplier: number;
  multiplierLabel: string;
  statutoryBasis: string;
  practicalNotes: string;
}

export const INC20A_DELAY_SLABS: Inc20aDelaySlab[] = [
  {
    slabId: 'slab-0',
    delayRange: 'On time (within 180 days)',
    minDays: 0,
    maxDays: 0,
    multiplier: 0,
    multiplierLabel: '0× (No Additional Fee)',
    statutoryBasis: 'Rule 23A & Section 10A(1)',
    practicalNotes: 'Filing completed within statutory window. No late fee or adjudication penalty applies.'
  },
  {
    slabId: 'slab-1',
    delayRange: 'Up to 30 days late (Days 181–210)',
    minDays: 1,
    maxDays: 30,
    multiplier: 2,
    multiplierLabel: '2× Normal Fee',
    statutoryBasis: 'Table B, Item B(1), Fees Rules, 2014',
    practicalNotes: 'Initial delay window. Additional fee of 2x normal fee payable on MCA21 portal.'
  },
  {
    slabId: 'slab-2',
    delayRange: '31 to 60 days late (Days 211–240)',
    minDays: 31,
    maxDays: 60,
    multiplier: 4,
    multiplierLabel: '4× Normal Fee',
    statutoryBasis: 'Table B, Item B(2), Fees Rules, 2014',
    practicalNotes: 'Moderate delay. Additional fee of 4x normal fee payable on portal.'
  },
  {
    slabId: 'slab-3',
    delayRange: '61 to 90 days late (Days 241–270)',
    minDays: 61,
    maxDays: 90,
    multiplier: 6,
    multiplierLabel: '6× Normal Fee',
    statutoryBasis: 'Table B, Item B(3), Fees Rules, 2014',
    practicalNotes: 'High risk tier. Additional fee of 6x normal fee. ROC inquiries frequently initiated.'
  },
  {
    slabId: 'slab-4',
    delayRange: '91 to 180 days late (Days 271–360)',
    minDays: 91,
    maxDays: 180,
    multiplier: 10,
    multiplierLabel: '10× Normal Fee',
    statutoryBasis: 'Table B, Item B(4), Fees Rules, 2014',
    practicalNotes: 'Severe delay. Additional fee of 10x normal fee. Statutory adjudication notice likely.'
  },
  {
    slabId: 'slab-5',
    delayRange: 'More than 180 days late (Day 361+)',
    minDays: 181,
    maxDays: Infinity,
    multiplier: 12,
    multiplierLabel: '12× Normal Fee',
    statutoryBasis: 'Table B, Item B(5), Fees Rules, 2014',
    practicalNotes: 'Maximum portal multiplier (12x). Direct strike-off risk under Section 10A(3) / 248(1)(c).'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. REAL ROC ADJUDICATION BENCHMARKS
// ─────────────────────────────────────────────────────────────────────────────

export interface Inc20aRocBenchmarkCase {
  id: string;
  rocOffice: string;
  orderDate: string;
  companyName: string;
  cin: string;
  daysOfDelay: number;
  numDirectors: number;
  companyPenalty: number;
  directorPenaltyEach: number;
  totalAdjudicatedLiability: number;
  section446BApplied: boolean;
  factsAndTakeaways: string;
  statutoryPrecedent: string;
}

export const INC20A_ROC_BENCHMARKS: Inc20aRocBenchmarkCase[] = [
  {
    id: 'roc-pune-2025-stalwart',
    rocOffice: 'ROC Pune',
    orderDate: 'December 2025',
    companyName: 'Stalwart Global Freight Pvt Ltd',
    cin: 'U63090PN2024PTC231456',
    daysOfDelay: 42,
    numDirectors: 2,
    companyPenalty: 50000,
    directorPenaltyEach: 42000,
    totalAdjudicatedLiability: 134000,
    section446BApplied: false,
    factsAndTakeaways: 'Company filed INC-20A with a 42-day delay. It claimed small company status, but was held to be an Indian subsidiary of an overseas group, disqualifying it from Section 2(85) and Section 446B. Full ₹50,000 company fine + ₹1,000/day for 42 days (₹42,000) imposed on both directors personally.',
    statutoryPrecedent: 'Holding/subsidiary relationships disqualify entities from Section 446B benefits regardless of capital size.'
  },
  {
    id: 'roc-bangalore-2026-metropolis',
    rocOffice: 'ROC Bangalore',
    orderDate: 'June 2026',
    companyName: 'Metropolis Technologies India Pvt Ltd',
    cin: 'U72900KA2024PTC198421',
    daysOfDelay: 179,
    numDirectors: 3,
    companyPenalty: 50000,
    directorPenaltyEach: 100000,
    totalAdjudicatedLiability: 350000,
    section446BApplied: false,
    factsAndTakeaways: 'Delay of 179 days beyond the 180-day window. Each of the 3 directors hit the statutory maximum cap of ₹1,00,000 (179 × ₹1,000 = ₹1,79,000 capped at ₹1,00,000). Total personal penalty on officers was ₹3,00,000 + ₹50,000 on company. ROC rejected operational oversight as a ground for leniency.',
    statutoryPrecedent: 'Director per-day penalty caps at ₹1,00,000 per director under standard Section 10A(2).'
  },
  {
    id: 'roc-delhi-2025-day1',
    rocOffice: 'ROC Delhi & Haryana',
    orderDate: 'September 2025',
    companyName: 'Day1 Advisors Pvt Ltd',
    cin: 'U74140DL2024PTC430112',
    daysOfDelay: 59,
    numDirectors: 2,
    companyPenalty: 25000,
    directorPenaltyEach: 24500,
    totalAdjudicatedLiability: 74000,
    section446BApplied: true,
    factsAndTakeaways: 'Company delayed filing by 59 days. Successfully proved qualification as a Small Company under Section 2(85). ROC applied Section 446B relief: halved the company fine from ₹50,000 to ₹25,000, and halved director penalties from ₹1,000/day to ₹500/day (for 49 days beyond threshold = ₹24,500 each for 2 directors).',
    statutoryPrecedent: 'Affirmative benchmark demonstrating that Small Companies obtain exact 50% statutory reduction under Section 446B.'
  },
  {
    id: 'roc-pune-2026-marco',
    rocOffice: 'ROC Pune',
    orderDate: 'June 2026',
    companyName: 'Marco Secure Solutions Ltd',
    cin: 'U74999PN2024PLC230987',
    daysOfDelay: 140,
    numDirectors: 2,
    companyPenalty: 25000,
    directorPenaltyEach: 50000,
    totalAdjudicatedLiability: 125000,
    section446BApplied: true,
    factsAndTakeaways: 'DPIIT-recognized startup delayed filing by 140 days and had also availed an unsecured director loan before filing. Section 446B relief was granted for the Section 10A(2) delay, capping director penalties at ₹50,000 each (instead of ₹1,00,000 max) and ₹25,000 on company. Separate notice was issued for borrowing without filing.',
    statutoryPrecedent: 'DPIIT startups enjoy Section 446B caps (₹50k max per director), but pre-filing borrowings remain ultra vires under Section 10A(1).'
  },
  {
    id: 'roc-pune-2026-dersen',
    rocOffice: 'ROC Pune',
    orderDate: 'April 2026',
    companyName: 'Dersen Systems Pvt Ltd',
    cin: 'U72200PN2024PTC229911',
    daysOfDelay: 120,
    numDirectors: 3,
    companyPenalty: 50000,
    directorPenaltyEach: 100000,
    totalAdjudicatedLiability: 350000,
    section446BApplied: false,
    factsAndTakeaways: 'Company claimed delay was caused by cross-border SWIFT wire transfers and FIRC compliance for foreign subscribers. ROC ruled that administrative or banking delays in remittance do not toll the 180-day deadline. Full ₹50,000 + ₹1,00,000 max cap on each director.',
    statutoryPrecedent: 'Foreign remittance, KYC delays, or FIRC processing times cannot excuse statutory INC-20A default.'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. STATUTORY ATTACHMENTS & CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

export interface Inc20aAttachmentRequirement {
  id: string;
  documentName: string;
  isMandatory: boolean;
  governingRule: string;
  verificationGuidance: string;
  commonDefectReasons: string;
}

export const INC20A_ATTACHMENTS: Inc20aAttachmentRequirement[] = [
  {
    id: 'doc-bank-stmt',
    documentName: 'Bank Statement showing Share Subscription Credit',
    isMandatory: true,
    governingRule: 'Rule 23A(1) of Companies (Incorporation) Rules, 2014',
    verificationGuidance: 'Official bank statement of the newly opened corporate account, showing separate credits received from EACH subscriber named in the MOA, precisely matching the agreed share value.',
    commonDefectReasons: 'Single lump-sum transfer by one promoter for others; cash deposit instead of banking channel transfer; credit date after the date of declaration.'
  },
  {
    id: 'doc-office-photo',
    documentName: 'Registered Office Photographs (Internal & External)',
    isMandatory: true,
    governingRule: 'Section 10A(1)(b) read with Section 12(2) & Rule 25A',
    verificationGuidance: 'Geo-tagged photograph of the exterior showing company nameplate in English & local language with registered address, plus an interior office photo showing at least one director/KMP.',
    commonDefectReasons: 'Blurry photos; missing nameplate with CIN; no director visible inside office; missing latitude/longitude geo-tag.'
  },
  {
    id: 'doc-board-resolution',
    documentName: 'Board Resolution authorising Director to Sign INC-20A',
    isMandatory: true,
    governingRule: 'Secretarial Standard-1 & Section 179(3)',
    verificationGuidance: 'Certified true copy of Board Resolution passed under Section 179 authorising a specific director to sign and submit Form INC-20A on the MCA portal.',
    commonDefectReasons: 'Resolution signed by the same director without authorization; missing date of board meeting; uncertified extract.'
  },
  {
    id: 'doc-regulator-approval',
    documentName: 'Sectoral Regulator Approval / Certificate of Registration',
    isMandatory: false,
    governingRule: 'Proviso to Section 10A(1) & Rule 23A',
    verificationGuidance: 'Required ONLY for companies whose MOA objects involve regulated financial or statutory activities (e.g. NBFC from RBI, Stock Broker/AIF from SEBI, Insurance from IRDAI).',
    commonDefectReasons: 'Commencing regulated activity without unconditional registration; filing provisional letters.'
  },
  {
    id: 'doc-professional-cert',
    documentName: 'Professional Certification (CA / CS / CMA in Whole-Time Practice)',
    isMandatory: true,
    governingRule: 'Rule 23A(2) of Companies (Incorporation) Rules, 2014',
    verificationGuidance: 'Digital Signature Certificate (DSC) and Membership Number of an independent practicing CA, CS, or CMA verifying bank credits and registered office records.',
    commonDefectReasons: 'Expired professional DSC; associate certifying without active COP; conflict of interest.'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. CALCULATION INPUT & OUTPUT INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface Inc20aInput {
  incorporationDate: string; // ISO format 'YYYY-MM-DD'
  filingDate: string;        // ISO format 'YYYY-MM-DD'
  authorizedShareCapital: number;
  companyClassification: Inc20aCompanyClassification;
  isDpiitRecognizedStartup?: boolean;
  isSmallCompanyConfirmed?: boolean;
  hasCommencedBusinessBeforeFiling: boolean;
  numberOfDirectors: number;
}

export interface Inc20aCalculationResult {
  // Dates & Period
  incorporationDate: string;
  filingDate: string;
  statutoryDueDate: string;
  daysAllowed: number; // 180
  daysOfDelay: number;
  isDelay: boolean;
  isExempt: boolean;
  exemptionReason?: string;

  // Capital & Classification
  authorizedShareCapital: number;
  capitalBracketLabel: string;
  companyClassification: Inc20aCompanyClassification;
  isSection446BEligible: boolean;
  section446BReason: string;

  // MCA21 Portal Fees
  baseFilingFee: number;
  delaySlab: Inc20aDelaySlab;
  additionalFeeMultiplier: number;
  additionalLateFee: number;
  totalMcaPortalFee: number;

  // Section 10A(2) Adjudication Liability
  companyPenalty: number;
  perDirectorDailyRate: number;
  perDirectorPenaltyCap: number;
  perDirectorPenalty: number;
  totalOfficersPenalty: number;
  totalAdjudicatedPenalty: number;

  // Aggregate Compliance Liability
  totalFinancialExposure: number; // Portal Fee + Adjudication Liability

  // Statutory Risk Indicators
  operationalFreezeTriggered: boolean;
  strikeOffRiskTriggered: boolean;
  section454EscalationRisk: boolean;
  ccfsSchemeApplicable: boolean;

  // Narrative Guidance & Checklists
  statusBadge: {
    text: string;
    variant: 'success' | 'warning' | 'destructive' | 'neutral';
    description: string;
  };
  statutoryNotice: string;
  nextActionChecklist: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CORE STATUTORY CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates statutory due date, MCA portal late fees, and Section 10A(2) adjudication liabilities.
 */
export function calculateInc20aCompliance(input: Inc20aInput): Inc20aCalculationResult {
  const {
    incorporationDate,
    filingDate,
    authorizedShareCapital,
    companyClassification,
    isDpiitRecognizedStartup = false,
    isSmallCompanyConfirmed = false,
    hasCommencedBusinessBeforeFiling,
    numberOfDirectors = 2
  } = input;

  // 1. Validate Exemption
  const incDateObj = new Date(incorporationDate);
  const cutoffDate = new Date('2018-11-02'); // Section 10A introduced 2 Nov 2018

  if (incDateObj < cutoffDate) {
    return createExemptResult(
      input,
      'Exempt from Section 10A',
      'The company was incorporated prior to 2 November 2018 (the effective date of the Companies (Amendment) Ordinance, 2018). Section 10A does not have retrospective applicability.'
    );
  }

  if (companyClassification === 'no_share_capital') {
    return createExemptResult(
      input,
      'Exempt (No Share Capital)',
      'Section 10A(1)(a) specifically applies only to a "company having a share capital". Companies limited by guarantee without share capital are legally exempt from filing Form INC-20A.'
    );
  }

  // 2. Compute Statutory Due Date (Strictly 180 calendar days from CoI date)
  // Day 0 = incorporation date. Day 180 = statutory due date.
  const statutoryDueDateObj = new Date(incDateObj);
  statutoryDueDateObj.setDate(statutoryDueDateObj.getDate() + 180);
  const statutoryDueDate = statutoryDueDateObj.toISOString().split('T')[0];

  // 3. Compute Delay in Calendar Days
  const filingDateObj = new Date(filingDate);
  const diffTime = filingDateObj.getTime() - statutoryDueDateObj.getTime();
  const rawDelay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysOfDelay = Math.max(0, rawDelay);
  const isDelay = daysOfDelay > 0;

  // 4. Base Fee Determination (Table A, Item 5)
  const capitalSlab = INC20A_CAPITAL_SLABS.find(
    slab => authorizedShareCapital >= slab.minCapital && authorizedShareCapital <= slab.maxCapital
  ) || INC20A_CAPITAL_SLABS[INC20A_CAPITAL_SLABS.length - 1];

  const baseFilingFee = capitalSlab.baseFee;

  // 5. Delay Slab Multiplier Determination (Table B)
  let delaySlab: Inc20aDelaySlab;
  if (!isDelay) {
    delaySlab = INC20A_DELAY_SLABS[0];
  } else if (daysOfDelay <= 30) {
    delaySlab = INC20A_DELAY_SLABS[1];
  } else if (daysOfDelay <= 60) {
    delaySlab = INC20A_DELAY_SLABS[2];
  } else if (daysOfDelay <= 90) {
    delaySlab = INC20A_DELAY_SLABS[3];
  } else if (daysOfDelay <= 180) {
    delaySlab = INC20A_DELAY_SLABS[4];
  } else {
    delaySlab = INC20A_DELAY_SLABS[5];
  }

  const additionalFeeMultiplier = delaySlab.multiplier;
  const additionalLateFee = baseFilingFee * additionalFeeMultiplier;
  const totalMcaPortalFee = baseFilingFee + additionalLateFee;

  // 6. Section 446B Eligibility Determination
  // Eligible: OPC, Small Company per Section 2(85), DPIIT-recognized Startup, Producer Company
  const isSection446BEligible =
    companyClassification === 'opc' ||
    companyClassification === 'small_company' ||
    companyClassification === 'producer' ||
    Boolean(isSmallCompanyConfirmed) ||
    Boolean(isDpiitRecognizedStartup);

  let section446BReason = '';
  if (isSection446BEligible) {
    if (isDpiitRecognizedStartup) {
      section446BReason = 'DPIIT-recognized Start-up Entity: Eligible for 50% statutory penalty relief under Section 446B.';
    } else if (companyClassification === 'opc') {
      section446BReason = 'One Person Company (OPC): Automatically eligible for Section 446B lesser penalty provisions.';
    } else if (companyClassification === 'producer') {
      section446BReason = 'Producer Company: Eligible for Section 446B lesser penalties under the Companies Act, 2013.';
    } else {
      section446BReason = 'Small Company (Section 2(85)): Paid-up capital <= 4 Cr and turnover <= 40 Cr qualifies for 50% lesser penalties.';
    }
  } else {
    section446BReason = 'Standard Company: Standard Section 10A(2) penalties apply. Section 446B relief does not apply.';
  }

  // 7. Section 10A(2) Adjudication Penalties
  // Normal: Company 50,000 flat; Directors 1,000/day capped at 1,00,000 each.
  // Sec 446B: Company 25,000 flat; Directors 500/day capped at 50,000 each.
  let companyPenalty = 0;
  let perDirectorDailyRate = 0;
  let perDirectorPenaltyCap = 0;
  let perDirectorPenalty = 0;
  let totalOfficersPenalty = 0;
  let totalAdjudicatedPenalty = 0;

  const validDirectors = Math.max(1, numberOfDirectors);

  if (isDelay) {
    if (isSection446BEligible) {
      companyPenalty = 25000;
      perDirectorDailyRate = 500;
      perDirectorPenaltyCap = 50000;
      perDirectorPenalty = Math.min(perDirectorPenaltyCap, daysOfDelay * perDirectorDailyRate);
    } else {
      companyPenalty = 50000;
      perDirectorDailyRate = 1000;
      perDirectorPenaltyCap = 100000;
      perDirectorPenalty = Math.min(perDirectorPenaltyCap, daysOfDelay * perDirectorDailyRate);
    }

    totalOfficersPenalty = perDirectorPenalty * validDirectors;
    totalAdjudicatedPenalty = companyPenalty + totalOfficersPenalty;
  }

  // 8. Total Combined Financial Exposure
  const totalFinancialExposure = totalMcaPortalFee + totalAdjudicatedPenalty;

  // 9. Statutory Risk Indicators
  // Operational Freeze: Has the company started business before filing?
  const operationalFreezeTriggered = Boolean(hasCommencedBusinessBeforeFiling && (isDelay || filingDateObj > statutoryDueDateObj));

  // Strike-off risk: Section 10A(3) read with Section 248(1)(c)
  // Initiated if delay > 180 days (i.e. > 360 days from incorporation)
  const strikeOffRiskTriggered = daysOfDelay > 180;

  // Section 454(8) Escalation Risk (relevant once delay is significant or adjudication pending)
  const section454EscalationRisk = daysOfDelay > 60;

  // CCFS-2026 Exclusion Warning
  const ccfsSchemeApplicable = false; // Strictly false for Section 10A

  // 10. Status Badges & Checklists
  let statusBadge: Inc20aCalculationResult['statusBadge'];
  if (!isDelay) {
    statusBadge = {
      text: 'ON-TIME COMPLIANCE',
      variant: 'success',
      description: 'Filing within the 180-day statutory window. Standard portal fee payable.'
    };
  } else if (daysOfDelay <= 60) {
    statusBadge = {
      text: `DELAYED: ${daysOfDelay} DAYS OVERDUE`,
      variant: 'warning',
      description: `Slab multiplier (${delaySlab.multiplierLabel}) + Section 10A(2) statutory adjudication exposure.`
    };
  } else {
    statusBadge = {
      text: `CRITICAL DEFAULT: ${daysOfDelay} DAYS OVERDUE`,
      variant: 'destructive',
      description: 'Severe statutory default. Maximum late fee multiplier + ROC adjudication + Strike-off risk.'
    };
  }

  const statutoryNotice = generateStatutoryNotice({
    isDelay,
    daysOfDelay,
    isSection446BEligible,
    hasCommencedBusinessBeforeFiling,
    strikeOffRiskTriggered
  });

  const nextActionChecklist = generateNextActionChecklist({
    isDelay,
    daysOfDelay,
    operationalFreezeTriggered,
    isSection446BEligible
  });

  return {
    incorporationDate,
    filingDate,
    statutoryDueDate,
    daysAllowed: 180,
    daysOfDelay,
    isDelay,
    isExempt: false,
    authorizedShareCapital,
    capitalBracketLabel: capitalSlab.bracketLabel,
    companyClassification,
    isSection446BEligible,
    section446BReason,
    baseFilingFee,
    delaySlab,
    additionalFeeMultiplier,
    additionalLateFee,
    totalMcaPortalFee,
    companyPenalty,
    perDirectorDailyRate,
    perDirectorPenaltyCap,
    perDirectorPenalty,
    totalOfficersPenalty,
    totalAdjudicatedPenalty,
    totalFinancialExposure,
    operationalFreezeTriggered,
    strikeOffRiskTriggered,
    section454EscalationRisk,
    ccfsSchemeApplicable,
    statusBadge,
    statutoryNotice,
    nextActionChecklist
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. HELPER GENERATORS & FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────

function createExemptResult(
  input: Inc20aInput,
  reasonShort: string,
  reasonDetail: string
): Inc20aCalculationResult {
  return {
    incorporationDate: input.incorporationDate,
    filingDate: input.filingDate,
    statutoryDueDate: 'NOT APPLICABLE',
    daysAllowed: 0,
    daysOfDelay: 0,
    isDelay: false,
    isExempt: true,
    exemptionReason: reasonDetail,
    authorizedShareCapital: input.authorizedShareCapital,
    capitalBracketLabel: 'Exempt from Share Capital Rules',
    companyClassification: input.companyClassification,
    isSection446BEligible: false,
    section446BReason: 'Exempt',
    baseFilingFee: 0,
    delaySlab: INC20A_DELAY_SLABS[0],
    additionalFeeMultiplier: 0,
    additionalLateFee: 0,
    totalMcaPortalFee: 0,
    companyPenalty: 0,
    perDirectorDailyRate: 0,
    perDirectorPenaltyCap: 0,
    perDirectorPenalty: 0,
    totalOfficersPenalty: 0,
    totalAdjudicatedPenalty: 0,
    totalFinancialExposure: 0,
    operationalFreezeTriggered: false,
    strikeOffRiskTriggered: false,
    section454EscalationRisk: false,
    ccfsSchemeApplicable: false,
    statusBadge: {
      text: reasonShort.toUpperCase(),
      variant: 'neutral',
      description: reasonDetail
    },
    statutoryNotice: reasonDetail,
    nextActionChecklist: [
      'Confirm exemption basis in legal board records',
      'Ensure standard Section 12(2) registered office compliance',
      'Maintain Certificate of Incorporation in corporate records'
    ]
  };
}

function generateStatutoryNotice(params: {
  isDelay: boolean;
  daysOfDelay: number;
  isSection446BEligible: boolean;
  hasCommencedBusinessBeforeFiling: boolean;
  strikeOffRiskTriggered: boolean;
}): string {
  if (!params.isDelay) {
    return 'The declaration is being filed within the 180-day statutory window under Section 10A(1)(a). The company is entitled to commence business operations upon obtaining MCA SRN approval.';
  }

  const parts: string[] = [];
  parts.push(
    `Statutory default under Section 10A(2) of the Companies Act, 2013 has occurred with a delay of ${params.daysOfDelay} calendar days.`
  );

  if (params.isSection446BEligible) {
    parts.push(
      'Section 446B relief applies: Statutory adjudication penalties on both company and officers in default are reduced by 50%, subject to board report disclosure.'
    );
  }

  if (params.hasCommencedBusinessBeforeFiling) {
    parts.push(
      'CRITICAL WARNING: Commencing business or exercising borrowing powers prior to filing Form INC-20A violates Section 10A(1). Pre-filing contracts are voidable and loans are unauthorized.'
    );
  }

  if (params.strikeOffRiskTriggered) {
    parts.push(
      'STRIKE-OFF RISK: Delay exceeds 180 days (360 days from incorporation). ROC may initiate name removal and dissolution under Section 10A(3) read with Section 248(1)(c).'
    );
  }

  parts.push(
    'IMPORTANT: Section 10A defaults are EXCLUDED from CCFS-2026 amnesty. Officers must pay personal penalties from personal funds.'
  );

  return parts.join(' ');
}

function generateNextActionChecklist(params: {
  isDelay: boolean;
  daysOfDelay: number;
  operationalFreezeTriggered: boolean;
  isSection446BEligible: boolean;
}): string[] {
  const list = [
    'Verify that subscription money was credited to the corporate bank account directly from all subscribers',
    'Procure official bank statement showing individual subscriber credits matching MOA share amounts',
    'Capture geo-tagged photographs of the registered office (external nameplate with CIN + interior with director)',
    'Pass formal Board Resolution under Section 179 authorising the designated director to sign Form INC-20A',
    'Obtain digital certification from a practicing CA, CS, or CMA with active Certificate of Practice (COP)',
    'File Form INC-20A on MCA V3 portal and discharge the calculated e-Challan fee'
  ];

  if (params.isDelay) {
    list.push('Prepare disclosure note for upcoming Board Report regarding delay under Section 134(5)');
    list.push('Ensure directors remit any adjudicated Section 10A(2) penalties directly from personal funds');
  }

  if (params.operationalFreezeTriggered) {
    list.push('Conduct urgent audit of all pre-filing vendor contracts and bank borrowings to assess ratification options');
  }

  return list;
}

/**
 * Format currency amount in Indian Rupee standard format.
 */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
