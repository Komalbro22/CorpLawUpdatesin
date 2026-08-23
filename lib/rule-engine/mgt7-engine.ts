/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MGT-7 & MGT-7A COMPLIANCE, FEE & STATUTORY PENALTY DETERMINATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Authoritative Single Source of Truth (SSOT) for:
 * 1. Form MGT-7 (Annual Return — Companies other than OPCs & Small Companies)
 * 2. Form MGT-7A (Abridged Annual Return — OPCs & Small Companies w.e.f. FY 2020-21)
 *
 * Statutory Authorities & Sources:
 * - Companies Act, 2013: Sections 2(85), 92(1), 92(2), 92(4), 92(5), 96(1), 122(1), 403, 446B, 454
 * - Companies (Management and Administration) Rules, 2014: Rule 11 (amended 05.03.2021 by G.S.R. 159(E))
 * - Companies (Registration Offices and Fees) Rules, 2014: Table A (Items 5 & 6), Table B (Note Item 2)
 * - Companies (Specification of Definition Details) Rules, 2014: Rule 2(1)(t) (as amended by G.S.R. 880(E) dt 01.12.2025)
 * - MCA Official Instruction Kits: e-Form MGT-7 & e-Form MGT-7A (V3 Portal)
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATUTORY FORM DEFINITIONS & RULES
// ─────────────────────────────────────────────────────────────────────────────

export interface FormComplianceRule {
  formCode: 'MGT-7' | 'MGT-7A';
  formName: string;
  governingSection: string;
  governingRule: string;
  applicableEntityDescription: string;
  applicableEntityTypes: string[];
  normalFeeSlabBasis: 'nominal_share_capital';
  normalFeeTable: {
    under1Lakh: number;
    under5Lakh: number;
    under25Lakh: number;
    under1Crore: number;
    oneCroreOrMore: number;
    noShareCapital: number;
  };
  additionalFeePerDay: number;
  statutoryPenaltyBase: number;
  statutoryPenaltyPerDayAfterFirst: number;
  statutoryPenaltyCompanyCap: number;
  statutoryPenaltyOfficerCap: number;
  instructionKitReference: string;
}

export const MGT7_RULE: FormComplianceRule = {
  formCode: 'MGT-7',
  formName: 'Annual Return',
  governingSection: 'Section 92(1), Companies Act, 2013',
  governingRule: 'Rule 11(1), Companies (Management and Administration) Rules, 2014',
  applicableEntityDescription: 'All companies other than One Person Companies (OPCs) and Small Companies',
  applicableEntityTypes: [
    'private_standard',
    'public_unlisted',
    'public_listed',
    'section_8',
    'producer',
    'startup_non_small'
  ],
  normalFeeSlabBasis: 'nominal_share_capital',
  normalFeeTable: {
    under1Lakh: 200,      // Less than ₹1,00,000
    under5Lakh: 300,      // ₹1,00,000 or more but less than ₹5,00,000
    under25Lakh: 400,     // ₹5,00,000 or more but less than ₹25,00,000
    under1Crore: 500,     // ₹25,00,000 or more but less than ₹1,00,00,000
    oneCroreOrMore: 600,  // ₹1,00,00,000 or more
    noShareCapital: 200   // Company not having share capital (Table A, Item 6)
  },
  additionalFeePerDay: 100, // Table B, Note Item 2
  statutoryPenaltyBase: 10000,
  statutoryPenaltyPerDayAfterFirst: 100,
  statutoryPenaltyCompanyCap: 200000,
  statutoryPenaltyOfficerCap: 50000,
  instructionKitReference: 'MCA e-Form MGT-7 Instruction Kit (V3 Portal)'
};

export const MGT7A_RULE: FormComplianceRule = {
  formCode: 'MGT-7A',
  formName: 'Abridged Annual Return for OPCs and Small Companies',
  governingSection: 'Section 92(1) Proviso, Companies Act, 2013',
  governingRule: 'Rule 11(1) Proviso, Companies (Management and Administration) Rules, 2014 (w.e.f. FY 2020-21)',
  applicableEntityDescription: 'One Person Companies (OPCs) and Small Companies as defined under Section 2(85)',
  applicableEntityTypes: [
    'one_person_company',
    'small_company'
  ],
  normalFeeSlabBasis: 'nominal_share_capital',
  normalFeeTable: {
    under1Lakh: 200,      // Less than ₹1,00,000
    under5Lakh: 300,      // ₹1,00,000 or more but less than ₹5,00,000
    under25Lakh: 400,     // ₹5,00,000 or more but less than ₹25,00,000
    under1Crore: 500,     // ₹25,00,000 or more but less than ₹1,00,00,000
    oneCroreOrMore: 600,  // ₹1,00,00,000 or more
    noShareCapital: 200   // Company not having share capital (Table A, Item 6)
  },
  additionalFeePerDay: 100, // Table B, Note Item 2
  statutoryPenaltyBase: 10000,
  statutoryPenaltyPerDayAfterFirst: 100,
  statutoryPenaltyCompanyCap: 200000,
  statutoryPenaltyOfficerCap: 50000,
  instructionKitReference: 'MCA e-Form MGT-7A Instruction Kit (MCA Notification G.S.R. 159(E))'
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. NORMAL FILING FEE ENGINE (TABLE A, ITEMS 5 & 6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the Normal Filing Fee for Form MGT-7 / MGT-7A under Table A (Items 5 & 6)
 * of the Companies (Registration Offices and Fees) Rules, 2014.
 *
 * Exact statutory brackets:
 * - Company without share capital: ₹200 (Item 6)
 * - Nominal capital < ₹1,00,000: ₹200
 * - ₹1,00,000 <= Nominal capital < ₹5,00,000: ₹300
 * - ₹5,00,000 <= Nominal capital < ₹25,00,000: ₹400
 * - ₹25,00,000 <= Nominal capital < ₹1,00,00,000: ₹500
 * - Nominal capital >= ₹1,00,00,000: ₹600
 */
export function calculateNormalFilingFee(
  nominalCapital: number,
  hasShareCapital: boolean = true
): number {
  if (!hasShareCapital) return 200;
  if (nominalCapital < 100000) return 200;    // Less than ₹1,00,000
  if (nominalCapital < 500000) return 300;    // ₹1,00,000 or more but less than ₹5,00,000
  if (nominalCapital < 2500000) return 400;   // ₹5,00,000 or more but less than ₹25,00,000
  if (nominalCapital < 10000000) return 500;  // ₹25,00,000 or more but less than ₹1 crore
  return 600;                                 // ₹1 crore or more (>= ₹1,00,00,000)
}

export function getNormalFeeBasisExplanation(
  nominalCapital: number,
  hasShareCapital: boolean = true
): string {
  if (!hasShareCapital) {
    return 'Fixed fee of ₹200 for company not having share capital (Table A, Item 6, Fees Rules 2014)';
  }
  if (nominalCapital < 100000) {
    return 'Nominal share capital less than ₹1,00,000 → ₹200 (Table A, Item 5, Fees Rules 2014)';
  }
  if (nominalCapital < 500000) {
    return 'Nominal share capital ₹1,00,000 or more but less than ₹5,00,000 → ₹300 (Table A, Item 5, Fees Rules 2014)';
  }
  if (nominalCapital < 2500000) {
    return 'Nominal share capital ₹5,00,000 or more but less than ₹25,00,000 → ₹400 (Table A, Item 5, Fees Rules 2014)';
  }
  if (nominalCapital < 10000000) {
    return 'Nominal share capital ₹25,00,000 or more but less than ₹1 crore → ₹500 (Table A, Item 5, Fees Rules 2014)';
  }
  return 'Nominal share capital ₹1 crore or more → ₹600 (Table A, Item 5, Fees Rules 2014)';
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADDITIONAL FILING FEE ENGINE (TABLE B, NOTE ITEM 2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates Additional Filing Fee for delayed annual returns under Section 92.
 * Flat ₹100 per calendar day of delay beyond the statutory due date.
 */
export function calculateAdditionalFilingFee(daysDelayed: number): number {
  if (daysDelayed <= 0) return 0;
  return daysDelayed * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STATUTORY SECTION 92(5) PENALTY ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface Section92PenaltyResult {
  daysDelayed: number;
  continuingDaysAfterFirst: number;
  standardCompanyPenalty: number;
  standardPerOfficerPenalty: number;
  standardTotalOfficersPenalty: number;
  totalStandardExposure: number;
  companyCapped: boolean;
  officerCapped: boolean;
  formulaDescription: string;
}

/**
 * Computes the statutory adjudication penalty under Section 92(5) of the Companies Act, 2013.
 *
 * Rule: ₹10,000 initial penalty + ₹100/day for each day AFTER the first day of continuing failure.
 * Caps: ₹2,00,000 for Company, ₹50,000 per Officer in default.
 */
export function calculateSection92Penalty(
  daysDelayed: number,
  officerCount: number = 2
): Section92PenaltyResult {
  if (daysDelayed <= 0) {
    return {
      daysDelayed: 0,
      continuingDaysAfterFirst: 0,
      standardCompanyPenalty: 0,
      standardPerOfficerPenalty: 0,
      standardTotalOfficersPenalty: 0,
      totalStandardExposure: 0,
      companyCapped: false,
      officerCapped: false,
      formulaDescription: 'Filed on or before due date. No default under Section 92(5).'
    };
  }

  const continuingDaysAfterFirst = Math.max(0, daysDelayed - 1);
  const rawCompany = 10000 + continuingDaysAfterFirst * 100;
  const rawOfficer = 10000 + continuingDaysAfterFirst * 100;

  const standardCompanyPenalty = Math.min(200000, rawCompany);
  const standardPerOfficerPenalty = Math.min(50000, rawOfficer);
  const standardTotalOfficersPenalty = standardPerOfficerPenalty * Math.max(1, officerCount);
  const totalStandardExposure = standardCompanyPenalty + standardTotalOfficersPenalty;

  return {
    daysDelayed,
    continuingDaysAfterFirst,
    standardCompanyPenalty,
    standardPerOfficerPenalty,
    standardTotalOfficersPenalty,
    totalStandardExposure,
    companyCapped: rawCompany >= 200000,
    officerCapped: rawOfficer >= 50000,
    formulaDescription: `₹10,000 initial base penalty + ${continuingDaysAfterFirst} continuing day(s) after first @ ₹100/day (Section 92(5))`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SMALL COMPANY HISTORICAL REGISTRY & EVALUATOR (SECTION 2(85))
// ─────────────────────────────────────────────────────────────────────────────

export interface SmallCompanyThresholdDefinition {
  eraId: string;
  effectiveFrom: string;           // 'YYYY-MM-DD'
  effectiveTo: string | null;      // 'YYYY-MM-DD' or null if currently active
  maxPaidUpCapital: number;        // In INR
  maxTurnover: number;             // In INR
  notificationReference: string;
  notificationDate: string;
  statutoryWording: string;
}

export const SMALL_COMPANY_HISTORICAL_THRESHOLDS: SmallCompanyThresholdDefinition[] = [
  {
    eraId: 'era-2014',
    effectiveFrom: '2014-04-01',
    effectiveTo: '2021-03-31',
    maxPaidUpCapital: 50_00_000,    // ₹50 Lakhs
    maxTurnover: 2_00_00_000,       // ₹2 Crores
    notificationReference: 'Section 2(85) of the Companies Act, 2013 (Act No. 18 of 2013)',
    notificationDate: '2013-08-29',
    statutoryWording: 'Paid-up share capital does not exceed ₹50 lakh and turnover does not exceed ₹2 crore'
  },
  {
    eraId: 'era-2021',
    effectiveFrom: '2021-04-01',
    effectiveTo: '2022-09-14',
    maxPaidUpCapital: 2_00_00_000,   // ₹2 Crores
    maxTurnover: 20_00_00_000,      // ₹20 Crores
    notificationReference: 'MCA Notification G.S.R. 92(E) — Companies (Specification of Definitions Details) Amendment Rules, 2021',
    notificationDate: '2021-02-01',
    statutoryWording: 'Paid up capital does not exceed ₹2 crore and turnover does not exceed ₹20 crore'
  },
  {
    eraId: 'era-2022',
    effectiveFrom: '2022-09-15',
    effectiveTo: '2025-11-30',
    maxPaidUpCapital: 4_00_00_000,   // ₹4 Crores
    maxTurnover: 40_00_00_000,      // ₹40 Crores
    notificationReference: 'MCA Notification G.S.R. 700(E) — Companies (Specification of Definitions Details) Amendment Rules, 2022',
    notificationDate: '2022-09-15',
    statutoryWording: 'Paid up capital does not exceed ₹4 crore and turnover does not exceed ₹40 crore'
  },
  {
    eraId: 'era-2025-current',
    effectiveFrom: '2025-12-01',
    effectiveTo: null,
    maxPaidUpCapital: 10_00_00_000,  // ₹10 Crores
    maxTurnover: 100_00_00_000,     // ₹100 Crores
    notificationReference: 'MCA Notification G.S.R. 880(E) — Companies (Specification of Definition Details) Amendment Rules, 2025',
    notificationDate: '2025-12-01',
    statutoryWording: 'Paid up capital does not exceed ₹10 crore and turnover does not exceed ₹100 crore'
  }
];

export interface SmallCompanyEvaluationInput {
  isPrivateCompany: boolean;
  isHoldingCompany: boolean;
  isSubsidiaryCompany: boolean;
  isSection8Company: boolean;
  isSpecialActBodyCorporate: boolean;
  paidUpCapital: number;
  turnoverPrecedingFY: number;
  financialYearEndDate: Date; // Evaluation date based on relevant financial year
}

export interface SmallCompanyEvaluationResult {
  isSmallCompany: boolean;
  thresholdApplied: SmallCompanyThresholdDefinition;
  financialYearUsed: string;
  assessmentDate: string;
  disqualificationReason?: string;
  sourceReference: string;
}

/**
 * Evaluates whether a company qualifies as a Small Company under Section 2(85)
 * for the applicable financial year, checking both statutory exclusions and versioned thresholds.
 */
export function evaluateSmallCompanyStatus(
  input: SmallCompanyEvaluationInput
): SmallCompanyEvaluationResult {
  const dateStr = input.financialYearEndDate.toISOString().slice(0, 10);
  const threshold = SMALL_COMPANY_HISTORICAL_THRESHOLDS.find(t => 
    t.effectiveFrom <= dateStr && (!t.effectiveTo || t.effectiveTo >= dateStr)
  ) || SMALL_COMPANY_HISTORICAL_THRESHOLDS[SMALL_COMPANY_HISTORICAL_THRESHOLDS.length - 1];

  const fyYear = input.financialYearEndDate.getFullYear();
  const financialYearUsed = `FY ${fyYear - 1}-${String(fyYear).slice(-2)}`;
  const assessmentDate = dateStr;

  // 1. Statutory Exclusions Evaluation (Provisos to Section 2(85))
  if (!input.isPrivateCompany) {
    return {
      isSmallCompany: false,
      thresholdApplied: threshold,
      financialYearUsed,
      assessmentDate,
      disqualificationReason: 'Not a Private Limited Company (Section 2(85) applies only to private companies)',
      sourceReference: threshold.notificationReference
    };
  }
  if (input.isHoldingCompany) {
    return {
      isSmallCompany: false,
      thresholdApplied: threshold,
      financialYearUsed,
      assessmentDate,
      disqualificationReason: 'Holding company excluded under Section 2(85) proviso (A)',
      sourceReference: 'Section 2(85) proviso (A), Companies Act, 2013'
    };
  }
  if (input.isSubsidiaryCompany) {
    return {
      isSmallCompany: false,
      thresholdApplied: threshold,
      financialYearUsed,
      assessmentDate,
      disqualificationReason: 'Subsidiary company excluded under Section 2(85) proviso (A)',
      sourceReference: 'Section 2(85) proviso (A), Companies Act, 2013'
    };
  }
  if (input.isSection8Company) {
    return {
      isSmallCompany: false,
      thresholdApplied: threshold,
      financialYearUsed,
      assessmentDate,
      disqualificationReason: 'Section 8 company excluded under Section 2(85) proviso (B)',
      sourceReference: 'Section 2(85) proviso (B), Companies Act, 2013'
    };
  }
  if (input.isSpecialActBodyCorporate) {
    return {
      isSmallCompany: false,
      thresholdApplied: threshold,
      financialYearUsed,
      assessmentDate,
      disqualificationReason: 'Company/body corporate governed by special Act excluded under Section 2(85) proviso (C)',
      sourceReference: 'Section 2(85) proviso (C), Companies Act, 2013'
    };
  }

  // 2. Financial Thresholds Evaluation
  const capitalPass = input.paidUpCapital <= threshold.maxPaidUpCapital;
  const turnoverPass = input.turnoverPrecedingFY <= threshold.maxTurnover;

  if (!capitalPass) {
    const maxCr = threshold.maxPaidUpCapital / 10000000;
    return {
      isSmallCompany: false,
      thresholdApplied: threshold,
      financialYearUsed,
      assessmentDate,
      disqualificationReason: `Paid-up share capital (₹${(input.paidUpCapital / 10000000).toFixed(2)} Cr) exceeds statutory threshold of ₹${maxCr} Cr`,
      sourceReference: threshold.notificationReference
    };
  }

  if (!turnoverPass) {
    const maxCr = threshold.maxTurnover / 10000000;
    return {
      isSmallCompany: false,
      thresholdApplied: threshold,
      financialYearUsed,
      assessmentDate,
      disqualificationReason: `Turnover of immediately preceding FY (₹${(input.turnoverPrecedingFY / 10000000).toFixed(2)} Cr) exceeds statutory threshold of ₹${maxCr} Cr`,
      sourceReference: threshold.notificationReference
    };
  }

  return {
    isSmallCompany: true,
    thresholdApplied: threshold,
    financialYearUsed,
    assessmentDate,
    sourceReference: threshold.notificationReference
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SECTION 446B SEPARATE ELIGIBILITY ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface Section446BFacts {
  isOnePersonCompany: boolean;
  isSmallCompany: boolean;
  isStartupCompany: boolean;
  isProducerCompany: boolean;
}

export interface Section446BEligibilityResult {
  eligible: boolean;
  qualifyingClassifications: string[];
  eligibilityReasons: string[];
  reliefCeilingExplanation: string;
}

/**
 * Evaluates Section 446B eligibility independently of form selection.
 * Covers: OPC, Small Company, Start-up Company (DPIIT recognized), Producer Company.
 */
export function evaluateSection446BEligibility(
  facts: Section446BFacts
): Section446BEligibilityResult {
  const qualifyingClassifications: string[] = [];
  const eligibilityReasons: string[] = [];

  if (facts.isOnePersonCompany) {
    qualifyingClassifications.push('One Person Company (OPC)');
    eligibilityReasons.push('One Person Company under Section 2(62) eligible under Section 446B');
  }
  if (facts.isSmallCompany) {
    qualifyingClassifications.push('Small Company');
    eligibilityReasons.push('Small Company under Section 2(85) eligible under Section 446B');
  }
  if (facts.isStartupCompany) {
    qualifyingClassifications.push('Start-up Company');
    eligibilityReasons.push('DPIIT-recognized Start-up Company eligible under Section 446B');
  }
  if (facts.isProducerCompany) {
    qualifyingClassifications.push('Producer Company');
    eligibilityReasons.push('Producer Company under Section 378A / Chapter XXIA eligible under Section 446B');
  }

  const eligible = qualifyingClassifications.length > 0;

  const reliefCeilingExplanation = eligible
    ? `Eligible under Section 446B (${qualifyingClassifications.join(', ')}). Penalty shall not exceed one-half of the penalty specified under Section 92(5), subject to statutory ceilings of ₹1,00,000 for Company and ₹25,000 (effective ceiling) per Officer in default.`
    : 'Not eligible for Section 446B relief. Standard Section 92(5) statutory penalty caps apply.';

  return {
    eligible,
    qualifyingClassifications,
    eligibilityReasons,
    reliefCeilingExplanation
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. DETERMINISTIC AGM & DUE-DATE ENGINE (SECTION 96 & SECTION 92(4))
// ─────────────────────────────────────────────────────────────────────────────

export interface Mgt7DateInput {
  financialYearEnd: Date;                     // e.g. 2026-03-31
  agmType: 'first' | 'subsequent';             // Section 96(1) classification
  agmStatus: 'held' | 'extended_and_held' | 'not_held';
  actualAgmDate?: Date;                        // Required if agmStatus !== 'not_held'
  rocApprovedExtendedLastDate?: Date;          // Subsequent AGM only (max 3 months)
}

export interface Mgt7DueDateOutput {
  standardAgmLastDate: Date;
  effectiveAgmTargetDate: Date;
  statutoryDueDate: Date;
  basisExplanation: string;
  validationError?: string;
}

function formatDateISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Computes statutory MGT-7 / MGT-7A filing due date in accordance with Section 96(1) and Section 92(4).
 */
export function computeMgt7StatutoryDueDate(input: Mgt7DateInput): Mgt7DueDateOutput {
  const fyEnd = new Date(input.financialYearEnd);

  // 1. Establish Standard Statutory AGM Deadline under Section 96(1)
  const standardAgmLastDate = new Date(fyEnd);
  if (input.agmType === 'first') {
    // First AGM: FY End + 9 months (Section 96(1))
    standardAgmLastDate.setMonth(standardAgmLastDate.getMonth() + 9);
  } else {
    // Subsequent AGM: FY End + 6 months (Section 96(1))
    standardAgmLastDate.setMonth(standardAgmLastDate.getMonth() + 6);
  }

  // 2. Validate First AGM ROC Extension Restriction
  if (input.agmType === 'first' && (input.agmStatus === 'extended_and_held' || input.rocApprovedExtendedLastDate)) {
    return {
      standardAgmLastDate,
      effectiveAgmTargetDate: standardAgmLastDate,
      statutoryDueDate: addCalendarDays(standardAgmLastDate, 60),
      basisExplanation: 'Invalid: Section 96(1) third proviso explicitly prohibits ROC extension for First AGM',
      validationError: 'ROC extension cannot be granted for the First Annual General Meeting under Section 96(1) proviso.'
    };
  }

  // 3. Scenario A: AGM Held
  if (input.agmStatus === 'held') {
    if (!input.actualAgmDate || isNaN(input.actualAgmDate.getTime())) {
      return {
        standardAgmLastDate,
        effectiveAgmTargetDate: standardAgmLastDate,
        statutoryDueDate: addCalendarDays(standardAgmLastDate, 60),
        basisExplanation: 'Missing actual AGM date',
        validationError: 'Actual AGM date is required when AGM status is "Held".'
      };
    }
    const dueDate = addCalendarDays(input.actualAgmDate, 60);
    return {
      standardAgmLastDate,
      effectiveAgmTargetDate: input.actualAgmDate,
      statutoryDueDate: dueDate,
      basisExplanation: `60 days from actual ${input.agmType === 'first' ? 'First ' : ''}AGM date (${formatDateISO(input.actualAgmDate)}) per Section 92(4)`
    };
  }

  // 4. Scenario B: Subsequent AGM Extended & Held
  if (input.agmStatus === 'extended_and_held') {
    if (!input.actualAgmDate || isNaN(input.actualAgmDate.getTime())) {
      return {
        standardAgmLastDate,
        effectiveAgmTargetDate: standardAgmLastDate,
        statutoryDueDate: addCalendarDays(standardAgmLastDate, 60),
        basisExplanation: 'Missing actual AGM date for extended meeting',
        validationError: 'Actual AGM date is required when AGM status is "Extended & Held".'
      };
    }
    const dueDate = addCalendarDays(input.actualAgmDate, 60);
    return {
      standardAgmLastDate,
      effectiveAgmTargetDate: input.actualAgmDate,
      statutoryDueDate: dueDate,
      basisExplanation: `60 days from actual extended AGM date (${formatDateISO(input.actualAgmDate)}) pursuant to ROC extension under Section 96(1)`
    };
  }

  // 5. Scenario C: No AGM Held
  // Due date is 60 days from the statutory date on which the AGM ought to have been held
  const effectiveAgmTargetDate = (input.agmType === 'subsequent' && input.rocApprovedExtendedLastDate)
    ? input.rocApprovedExtendedLastDate
    : standardAgmLastDate;

  const dueDate = addCalendarDays(effectiveAgmTargetDate, 60);
  return {
    standardAgmLastDate,
    effectiveAgmTargetDate,
    statutoryDueDate: dueDate,
    basisExplanation: `60 days from statutory deadline on which ${input.agmType === 'first' ? 'First ' : ''}AGM ought to have been held (${formatDateISO(effectiveAgmTargetDate)}) per Section 92(4)`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. PCS CERTIFICATION ENGINE (SECTION 92(2))
// ─────────────────────────────────────────────────────────────────────────────

export interface PcsCertificationInput {
  formCode: 'MGT-7' | 'MGT-7A';
  isListed: boolean;
  paidUpCapital: number;
  turnover: number;
}

export interface PcsCertificationResult {
  pcsCertificationRequired: boolean;
  mgt8Required: boolean;
  basisExplanation: string;
  signatoryNotice: string;
}

export function evaluatePcsCertification(input: PcsCertificationInput): PcsCertificationResult {
  if (input.formCode === 'MGT-7A') {
    return {
      pcsCertificationRequired: false,
      mgt8Required: false,
      basisExplanation: 'Form MGT-7A is statutorily exempted from Company Secretary in Practice certification.',
      signatoryNotice: 'Signable by Director alone (for OPC) or Director and CS (for Small Company).'
    };
  }

  // MGT-8 threshold under Section 92(2) & Rule 11(2):
  // Listed company OR Private/Public company having paid-up capital >= ₹10 Cr OR turnover >= ₹50 Cr
  const isMgt8Eligible = input.isListed || input.paidUpCapital >= 100000000 || input.turnover >= 500000000;

  if (isMgt8Eligible) {
    return {
      pcsCertificationRequired: true,
      mgt8Required: true,
      basisExplanation: 'Section 92(2) & Rule 11(2): Requires certification in Form MGT-8 by a Company Secretary in Practice (Listed Co or Paid-up Capital >= ₹10 Cr or Turnover >= ₹50 Cr).',
      signatoryNotice: 'Must be signed by Director and Company Secretary, accompanied by Certificate in Form MGT-8 from PCS.'
    };
  }

  return {
    pcsCertificationRequired: false,
    mgt8Required: false,
    basisExplanation: 'Standard MGT-7 return signed by Director and Company Secretary (or PCS if company has no full-time CS). Form MGT-8 not mandatory.',
    signatoryNotice: 'Signed by Director and Company Secretary (or CS in Practice if no appointed CS).'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. RELIEF / AMNESTY SCHEMES REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export interface ReliefSchemeDefinition {
  schemeCode: string;
  schemeName: string;
  effectiveFrom: string;
  originalEffectiveTo: string;
  extendedEffectiveTo: string;
  finalEffectiveTo: string;
  extensionSource: string;
  eligibleForms: string[];
  additionalFeeWaiverPercent: number;
  immunityFromAdjudication: boolean;
}

export const MCA_HISTORICAL_RELIEF_SCHEMES: ReliefSchemeDefinition[] = [
  {
    schemeCode: 'CFSS-2020',
    schemeName: 'Companies Fresh Start Scheme, 2020',
    effectiveFrom: '2020-04-01',
    originalEffectiveTo: '2020-09-30',
    extendedEffectiveTo: '2020-12-31',
    finalEffectiveTo: '2020-12-31',
    extensionSource: 'MCA General Circular No. 30/2020 dated 28th September, 2020',
    eligibleForms: ['MGT-7', 'AOC-4'],
    additionalFeeWaiverPercent: 100,
    immunityFromAdjudication: true
  }
];

export function getApplicableReliefScheme(
  formCode: string,
  actualFilingDate: Date
): ReliefSchemeDefinition | null {
  const dateStr = actualFilingDate.toISOString().slice(0, 10);
  const matched = MCA_HISTORICAL_RELIEF_SCHEMES.find(s => 
    s.effectiveFrom <= dateStr && s.finalEffectiveTo >= dateStr && s.eligibleForms.includes(formCode)
  );
  return matched || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPREHENSIVE SINGLE SOURCE OF TRUTH (SSOT) CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface Mgt7ComplianceCalculationInput {
  formCode: 'MGT-7' | 'MGT-7A';
  nominalCapital: number;
  hasShareCapital?: boolean;
  financialYearEnd: Date;                     // e.g. 2026-03-31
  agmType: 'first' | 'subsequent';
  agmStatus: 'held' | 'extended_and_held' | 'not_held';
  actualAgmDate?: Date;
  rocApprovedExtendedLastDate?: Date;
  actualFilingDate: Date;
  officerCount?: number;
  
  // Entity Classification Facts
  isPrivateCompany: boolean;
  isHoldingCompany?: boolean;
  isSubsidiaryCompany?: boolean;
  isSection8Company?: boolean;
  isSpecialActBodyCorporate?: boolean;
  paidUpCapital?: number;
  turnoverPrecedingFY?: number;
  isOnePersonCompany?: boolean;
  isStartupCompany?: boolean;
  isProducerCompany?: boolean;
  isListed?: boolean;
}

export interface Mgt7ComplianceCalculationResult {
  metadata: {
    formCode: 'MGT-7' | 'MGT-7A';
    formName: string;
    financialYear: string;
    agmType: 'first' | 'subsequent';
    agmStatus: 'held' | 'extended_and_held' | 'not_held';
    standardAgmLastDate: string;
    effectiveAgmTargetDate: string;
    statutoryDueDate: string;
    actualFilingDate: string;
    daysDelayed: number;
    continuingDaysAfterFirst: number;
    nominalCapital: number;
    hasShareCapital: boolean;
    companyClassification: string;
    isSmallCompany: boolean;
    section446BEligible: boolean;
    formRoutingRecommendation?: string;
    formRoutingMismatch?: boolean;
  };
  mcaPortalPayable: {
    normalFilingFee: number;
    additionalFilingFee: number;
    totalPortalPayable: number;
    basisNormalFee: string;
    basisAdditionalFee: string;
  };
  statutoryPenaltyExposure: {
    applicable: boolean;
    adjudicationRequired: true;
    adjudicatedAmount: null;
    companyStandardExposure: number;
    officersStandardExposure: number;
    totalStandardExposure: number;
    section446BApplied: boolean;
    companyIndicativeMaximumExposure: number;
    officersIndicativeMaximumExposure: number;
    totalIndicativeMaximumExposure: number;
    reliefCeilingExplanation: string;
    legalNotice: string;
  };
  smallCompanyAssessment: SmallCompanyEvaluationResult;
  pcsCertification: PcsCertificationResult;
  ruleTimeline: {
    feeRuleVersion: string;
    penaltyRuleVersion: string;
    smallCompanyRuleVersion: string;
    activeReliefScheme: string | null;
  };
  whyIsMyFeeBreakdown: {
    title: string;
    description: string;
    items: { label: string; amount: string; note: string }[];
  };
}

/**
 * Canonical, source-auditable function that calculates all MGT-7 and MGT-7A metrics.
 */
export function calculateMgt7Compliance(
  input: Mgt7ComplianceCalculationInput
): Mgt7ComplianceCalculationResult {
  const hasShareCapital = input.hasShareCapital !== false;
  const officerCount = Math.max(1, input.officerCount ?? 2);
  const paidUpCapital = input.paidUpCapital ?? input.nominalCapital;
  const turnoverPrecedingFY = input.turnoverPrecedingFY ?? 0;

  // 1. Evaluate Due Date
  const dueDateResult = computeMgt7StatutoryDueDate({
    financialYearEnd: input.financialYearEnd,
    agmType: input.agmType,
    agmStatus: input.agmStatus,
    actualAgmDate: input.actualAgmDate,
    rocApprovedExtendedLastDate: input.rocApprovedExtendedLastDate
  });

  // 2. Calculate Calendar Days Delayed (Deterministic UTC comparison)
  const dueTime = new Date(dueDateResult.statutoryDueDate).setHours(0, 0, 0, 0);
  const fileTime = new Date(input.actualFilingDate).setHours(0, 0, 0, 0);
  const diffMs = fileTime - dueTime;
  const daysDelayed = Math.max(0, Math.ceil(diffMs / 86400000));

  // 3. Evaluate Small Company Status
  const smallCompanyAssessment = evaluateSmallCompanyStatus({
    isPrivateCompany: input.isPrivateCompany,
    isHoldingCompany: !!input.isHoldingCompany,
    isSubsidiaryCompany: !!input.isSubsidiaryCompany,
    isSection8Company: !!input.isSection8Company,
    isSpecialActBodyCorporate: !!input.isSpecialActBodyCorporate,
    paidUpCapital,
    turnoverPrecedingFY,
    financialYearEndDate: input.financialYearEnd
  });

  // 4. Form Routing Check
  const isOpc = !!input.isOnePersonCompany;
  const isSmall = smallCompanyAssessment.isSmallCompany;
  const qualifiesForMgt7A = isOpc || isSmall;
  
  let formRoutingMismatch = false;
  let formRoutingRecommendation: string | undefined;

  if (input.formCode === 'MGT-7' && qualifiesForMgt7A) {
    formRoutingMismatch = true;
    formRoutingRecommendation = 'This company qualifies as an OPC / Small Company and is eligible to file Form MGT-7A (Abridged Annual Return) under Rule 11.';
  } else if (input.formCode === 'MGT-7A' && !qualifiesForMgt7A) {
    formRoutingMismatch = true;
    formRoutingRecommendation = `This company does not qualify for Form MGT-7A (${smallCompanyAssessment.disqualificationReason || 'Not an OPC or Small Company'}). Form MGT-7 applies.`;
  }

  // 5. Evaluate Section 446B Relief
  const section446B = evaluateSection446BEligibility({
    isOnePersonCompany: isOpc,
    isSmallCompany: isSmall,
    isStartupCompany: !!input.isStartupCompany,
    isProducerCompany: !!input.isProducerCompany
  });

  // 6. Normal Filing Fee & Basis
  const normalFilingFee = calculateNormalFilingFee(input.nominalCapital, hasShareCapital);
  const basisNormalFee = getNormalFeeBasisExplanation(input.nominalCapital, hasShareCapital);

  // 7. Additional Filing Fee & Relief Scheme Check
  const activeRelief = getApplicableReliefScheme(input.formCode, input.actualFilingDate);
  let rawAdditionalFee = calculateAdditionalFilingFee(daysDelayed);
  if (activeRelief) {
    const waiverMult = (100 - activeRelief.additionalFeeWaiverPercent) / 100;
    rawAdditionalFee = Math.round(rawAdditionalFee * waiverMult);
  }
  const additionalFilingFee = rawAdditionalFee;
  const basisAdditionalFee = daysDelayed > 0
    ? `${daysDelayed} calendar day(s) delay @ ₹100/day (Table B Note Item 2, Fees Rules 2014)${activeRelief ? ` [${activeRelief.schemeName} Waiver Applied]` : ''}`
    : 'Filed on or before due date. No additional filing fee applies.';

  const totalPortalPayable = normalFilingFee + additionalFilingFee;

  // 8. Section 92(5) Statutory Penalties & Section 446B Ceilings
  const penalty = calculateSection92Penalty(daysDelayed, officerCount);

  let companyIndicativeMaximumExposure = penalty.standardCompanyPenalty;
  let officersIndicativeMaximumExposure = penalty.standardTotalOfficersPenalty;

  if (section446B.eligible && daysDelayed > 0) {
    // Section 446B: Not more than half, with Company Cap ₹1,00,000 and Per-Officer Cap ₹25,000
    companyIndicativeMaximumExposure = Math.min(100000, Math.floor(penalty.standardCompanyPenalty * 0.5));
    const perOfficerMax = Math.min(25000, Math.floor(penalty.standardPerOfficerPenalty * 0.5));
    officersIndicativeMaximumExposure = perOfficerMax * officerCount;
  }

  const totalIndicativeMaximumExposure = companyIndicativeMaximumExposure + officersIndicativeMaximumExposure;

  // 9. PCS Certification
  const pcsCertification = evaluatePcsCertification({
    formCode: input.formCode,
    isListed: !!input.isListed,
    paidUpCapital,
    turnover: turnoverPrecedingFY
  });

  // 10. Financial Year String
  const fyYear = input.financialYearEnd.getFullYear();
  const financialYear = `FY ${fyYear - 1}-${String(fyYear).slice(-2)}`;

  // 11. Company Classification Label
  let companyClassification = 'Private Limited (Standard)';
  if (isOpc) companyClassification = 'One Person Company (OPC)';
  else if (isSmall) companyClassification = 'Small Company (Section 2(85))';
  else if (input.isProducerCompany) companyClassification = 'Producer Company (Chapter XXIA)';
  else if (input.isStartupCompany) companyClassification = 'Start-up Company (DPIIT Recognized)';
  else if (input.isSection8Company) companyClassification = 'Section 8 Company';
  else if (!input.isPrivateCompany) companyClassification = input.isListed ? 'Listed Public Limited' : 'Unlisted Public Limited';

  // 12. "Why is my fee ₹X?" Detailed Breakdown
  const whyIsMyFeeBreakdown = {
    title: `Fee & Penalty Assessment for ${input.formCode} (${financialYear})`,
    description: `Complete audit trail calculated under Section 92 and Companies (Registration Offices and Fees) Rules.`,
    items: [
      {
        label: 'Normal Government Filing Fee',
        amount: `₹${normalFilingFee.toLocaleString('en-IN')}`,
        note: basisNormalFee
      },
      {
        label: 'Additional Filing Fee (Delay)',
        amount: `₹${additionalFilingFee.toLocaleString('en-IN')}`,
        note: basisAdditionalFee
      },
      {
        label: 'Total MCA21 Portal Payable',
        amount: `₹${totalPortalPayable.toLocaleString('en-IN')}`,
        note: 'Payable via MCA21 e-Challan at the time of form upload.'
      },
      {
        label: 'Indicative Section 92(5) Statutory Penalty Exposure',
        amount: daysDelayed > 0 ? `₹${totalIndicativeMaximumExposure.toLocaleString('en-IN')}` : '₹0',
        note: daysDelayed > 0
          ? `Adjudication required under Section 454. ${section446B.reliefCeilingExplanation}`
          : 'Compliant filing. Zero penalty exposure.'
      }
    ]
  };

  return {
    metadata: {
      formCode: input.formCode,
      formName: input.formCode === 'MGT-7' ? MGT7_RULE.formName : MGT7A_RULE.formName,
      financialYear,
      agmType: input.agmType,
      agmStatus: input.agmStatus,
      standardAgmLastDate: formatDateISO(dueDateResult.standardAgmLastDate),
      effectiveAgmTargetDate: formatDateISO(dueDateResult.effectiveAgmTargetDate),
      statutoryDueDate: formatDateISO(dueDateResult.statutoryDueDate),
      actualFilingDate: formatDateISO(input.actualFilingDate),
      daysDelayed,
      continuingDaysAfterFirst: penalty.continuingDaysAfterFirst,
      nominalCapital: input.nominalCapital,
      hasShareCapital,
      companyClassification,
      isSmallCompany: isSmall,
      section446BEligible: section446B.eligible,
      formRoutingRecommendation,
      formRoutingMismatch
    },
    mcaPortalPayable: {
      normalFilingFee,
      additionalFilingFee,
      totalPortalPayable,
      basisNormalFee,
      basisAdditionalFee
    },
    statutoryPenaltyExposure: {
      applicable: daysDelayed > 0,
      adjudicationRequired: true,
      adjudicatedAmount: null,
      companyStandardExposure: penalty.standardCompanyPenalty,
      officersStandardExposure: penalty.standardTotalOfficersPenalty,
      totalStandardExposure: penalty.totalStandardExposure,
      section446BApplied: section446B.eligible,
      companyIndicativeMaximumExposure,
      officersIndicativeMaximumExposure,
      totalIndicativeMaximumExposure,
      reliefCeilingExplanation: section446B.reliefCeilingExplanation,
      legalNotice: 'DISCLOSURE: Section 92(5) penalties are not collected via MCA21 portal filing fee challans. They represent indicative statutory exposure should the Registrar of Companies initiate formal adjudication proceedings under Section 454.'
    },
    smallCompanyAssessment,
    pcsCertification,
    ruleTimeline: {
      feeRuleVersion: 'Companies (Registration Offices and Fees) Rules, 2014 (Table A Item 5 & Table B Note Item 2)',
      penaltyRuleVersion: 'Companies (Amendment) Act, 2020 (Section 92(5) w.e.f. 21.12.2020 & Section 446B w.e.f. 22.01.2021)',
      smallCompanyRuleVersion: smallCompanyAssessment.thresholdApplied.notificationReference,
      activeReliefScheme: activeRelief ? activeRelief.schemeName : null
    },
    whyIsMyFeeBreakdown
  };
}
