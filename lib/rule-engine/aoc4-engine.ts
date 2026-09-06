/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AOC-4 COMPLIANCE, FEE & STATUTORY PENALTY DETERMINATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Authoritative Single Source of Truth (SSOT) for:
 * 1. Form AOC-4 (Standalone Financial Statements — Non-XBRL, Non-Ind AS)
 * 2. Form AOC-4 CFS (Consolidated Financial Statements under Section 129(3))
 * 3. Form AOC-4 XBRL (eXtensible Business Reporting Language under XBRL Rules 2015)
 * 4. Form AOC-4 NBFC Ind AS (Financial Statements for NBFCs under Ind AS)
 *
 * Statutory Authorities & Sources:
 * - Companies Act, 2013: Sections 2(40), 2(85), 96(1), 129(3), 134, 137(1), 137(2), 137(3), 164(2)(a), 403, 446B, 454
 * - Companies (Accounts) Rules, 2014: Rule 12
 * - Companies (Filing of Documents and Forms in XBRL) Rules, 2015: Rule 3
 * - Companies (Registration Offices and Fees) Rules, 2014: Table A (Items 5 & 6), Table B (Note Item 2)
 * - MCA Official Instruction Kits: e-Forms AOC-4, AOC-4 CFS, AOC-4 XBRL (MCA21 V3 Portal)
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATUTORY FORM DEFINITIONS & RULES
// ─────────────────────────────────────────────────────────────────────────────

export type Aoc4FormVariant = 'AOC-4' | 'AOC-4-CFS' | 'AOC-4-XBRL' | 'AOC-4-NBFC';

export interface Aoc4FormRule {
  formCode: Aoc4FormVariant;
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

export const AOC4_RULE: Aoc4FormRule = {
  formCode: 'AOC-4',
  formName: 'Form for Filing Financial Statement and Other Documents with the Registrar',
  governingSection: 'Section 137(1), Companies Act, 2013',
  governingRule: 'Rule 12(1), Companies (Accounts) Rules, 2014',
  applicableEntityDescription: 'All companies not mandated to file in XBRL and not adopting Ind AS',
  applicableEntityTypes: [
    'private_standard',
    'small_company',
    'one_person_company',
    'section_8',
    'producer',
    'startup_non_xbrl'
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
  instructionKitReference: 'MCA e-Form AOC-4 Instruction Kit (V3 Portal)'
};

export const AOC4_CFS_RULE: Aoc4FormRule = {
  formCode: 'AOC-4-CFS',
  formName: 'Form for Filing Consolidated Financial Statements with the Registrar',
  governingSection: 'Section 129(3) & Section 137(1), Companies Act, 2013',
  governingRule: 'Rule 6 & Rule 12(1), Companies (Accounts) Rules, 2014',
  applicableEntityDescription: 'Mandatory for every company having one or more subsidiaries, joint ventures, or associate companies',
  applicableEntityTypes: [
    'holding_company_cfs',
    'parent_entity'
  ],
  normalFeeSlabBasis: 'nominal_share_capital',
  normalFeeTable: {
    under1Lakh: 200,
    under5Lakh: 300,
    under25Lakh: 400,
    under1Crore: 500,
    oneCroreOrMore: 600,
    noShareCapital: 200
  },
  additionalFeePerDay: 100,
  statutoryPenaltyBase: 10000,
  statutoryPenaltyPerDayAfterFirst: 100,
  statutoryPenaltyCompanyCap: 200000,
  statutoryPenaltyOfficerCap: 50000,
  instructionKitReference: 'MCA e-Form AOC-4 CFS Instruction Kit (V3 Portal)'
};

export const AOC4_XBRL_RULE: Aoc4FormRule = {
  formCode: 'AOC-4-XBRL',
  formName: 'Form for Filing Financial Statement and Other Documents in XBRL',
  governingSection: 'Section 137, Companies Act, 2013',
  governingRule: 'Rule 3, Companies (Filing of Documents and Forms in XBRL) Rules, 2015',
  applicableEntityDescription: 'Listed companies, Indian subsidiaries of listed companies, companies with paid-up capital ≥ ₹5 Cr, or turnover ≥ ₹100 Cr, or Ind AS preparers',
  applicableEntityTypes: [
    'public_listed',
    'listed_subsidiary',
    'high_capital_unlisted',
    'ind_as_preparer'
  ],
  normalFeeSlabBasis: 'nominal_share_capital',
  normalFeeTable: {
    under1Lakh: 200,
    under5Lakh: 300,
    under25Lakh: 400,
    under1Crore: 500,
    oneCroreOrMore: 600,
    noShareCapital: 200
  },
  additionalFeePerDay: 100,
  statutoryPenaltyBase: 10000,
  statutoryPenaltyPerDayAfterFirst: 100,
  statutoryPenaltyCompanyCap: 200000,
  statutoryPenaltyOfficerCap: 50000,
  instructionKitReference: 'MCA e-Form AOC-4 XBRL Instruction Kit (V3 Portal)'
};

export const AOC4_NBFC_RULE: Aoc4FormRule = {
  formCode: 'AOC-4-NBFC',
  formName: 'Form for Filing Financial Statement for NBFCs (Ind AS)',
  governingSection: 'Section 137, Companies Act, 2013',
  governingRule: 'Rule 12(1), Companies (Accounts) Rules, 2014 & Ind AS Framework',
  applicableEntityDescription: 'Non-Banking Financial Companies (NBFCs) adopting Indian Accounting Standards (Ind AS)',
  applicableEntityTypes: [
    'nbfc_ind_as'
  ],
  normalFeeSlabBasis: 'nominal_share_capital',
  normalFeeTable: {
    under1Lakh: 200,
    under5Lakh: 300,
    under25Lakh: 400,
    under1Crore: 500,
    oneCroreOrMore: 600,
    noShareCapital: 200
  },
  additionalFeePerDay: 100,
  statutoryPenaltyBase: 10000,
  statutoryPenaltyPerDayAfterFirst: 100,
  statutoryPenaltyCompanyCap: 200000,
  statutoryPenaltyOfficerCap: 50000,
  instructionKitReference: 'MCA e-Form AOC-4 NBFC (Ind AS) Instruction Kit'
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. NORMAL FILING FEE ENGINE (TABLE A, ITEMS 5 & 6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the Normal Filing Fee for Form AOC-4 (all variants) under Table A (Items 5 & 6)
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
export function calculateAoc4NormalFilingFee(
  nominalCapital: number,
  hasShareCapital: boolean = true
): number {
  if (!hasShareCapital) return 200;
  if (nominalCapital < 100000) return 200;
  if (nominalCapital < 500000) return 300;
  if (nominalCapital < 2500000) return 400;
  if (nominalCapital < 10000000) return 500;
  return 600;
}

export function getAoc4NormalFeeBasisExplanation(
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
    return 'Nominal share capital ₹1,00,000 to ₹4,99,999 → ₹300 (Table A, Item 5, Fees Rules 2014)';
  }
  if (nominalCapital < 2500000) {
    return 'Nominal share capital ₹5,00,000 to ₹24,99,999 → ₹400 (Table A, Item 5, Fees Rules 2014)';
  }
  if (nominalCapital < 10000000) {
    return 'Nominal share capital ₹25,00,000 to ₹99,99,999 → ₹500 (Table A, Item 5, Fees Rules 2014)';
  }
  return 'Nominal share capital ₹1,00,00,000 or more (≥ ₹1 Crore) → ₹600 (Table A, Item 5, Fees Rules 2014)';
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADDITIONAL LATE FILING FEE (TABLE B, NOTE ITEM 2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates Additional Filing Fee for Form AOC-4 under Table B Note Item 2.
 * Flat ₹100 per day of delay from the day following the statutory due date.
 * Strictly uncapped on MCA21 V3 portal.
 */
export function calculateAoc4AdditionalFilingFee(daysDelayed: number): number {
  if (daysDelayed <= 0) return 0;
  return daysDelayed * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STATUTORY CIVIL PENALTIES ENGINE (SECTION 137(3) & SECTION 446B)
// ─────────────────────────────────────────────────────────────────────────────

export interface Section137PenaltyResult {
  standardCompanyPenalty: number;
  standardOfficerPenaltyPerPerson: number;
  standardTotalOfficersPenalty: number;
  standardTotalStatutoryPenalty: number;
  cappedCompany: boolean;
  cappedOfficer: boolean;
  continuingDays: number;
}

/**
 * Calculates civil adjudication penalties under Section 137(3) of Companies Act, 2013:
 * - Company: ₹10,000 base + ₹100 for each continuing day of default, capped at ₹2,00,000.
 * - MD/CFO/Officer in default: ₹10,000 base + ₹100 for each continuing day, capped at ₹50,000 per person.
 */
export function calculateSection137Penalty(
  daysDelayed: number,
  officerCount: number = 2
): Section137PenaltyResult {
  if (daysDelayed <= 0) {
    return {
      standardCompanyPenalty: 0,
      standardOfficerPenaltyPerPerson: 0,
      standardTotalOfficersPenalty: 0,
      standardTotalStatutoryPenalty: 0,
      cappedCompany: false,
      cappedOfficer: false,
      continuingDays: 0
    };
  }

  const continuingDays = Math.max(0, daysDelayed - 1);
  const basePenalty = 10000;
  const rawCompany = basePenalty + (continuingDays * 100);
  const companyPenalty = Math.min(200000, rawCompany);
  const cappedCompany = rawCompany >= 200000;

  const rawOfficer = basePenalty + (continuingDays * 100);
  const officerPenaltyPerPerson = Math.min(50000, rawOfficer);
  const cappedOfficer = rawOfficer >= 50000;

  const totalOfficers = officerPenaltyPerPerson * Math.max(1, officerCount);
  const totalPenalty = companyPenalty + totalOfficers;

  return {
    standardCompanyPenalty: companyPenalty,
    standardOfficerPenaltyPerPerson: officerPenaltyPerPerson,
    standardTotalOfficersPenalty: totalOfficers,
    standardTotalStatutoryPenalty: totalPenalty,
    cappedCompany,
    cappedOfficer,
    continuingDays
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SMALL COMPANY & SECTION 446B EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────

export interface SmallCompanyThresholdDefinition {
  effectiveFrom: string;
  effectiveTo?: string;
  maxPaidUpCapital: number;
  maxTurnover: number;
  notificationReference: string;
}

export const AOC4_SMALL_COMPANY_THRESHOLDS: SmallCompanyThresholdDefinition[] = [
  {
    effectiveFrom: '2025-12-01',
    maxPaidUpCapital: 100000000, // ₹10 Crore
    maxTurnover: 1000000000,     // ₹100 Crore
    notificationReference: 'MCA Notification G.S.R. 880(E) dated 01.12.2025'
  },
  {
    effectiveFrom: '2022-09-15',
    effectiveTo: '2025-11-30',
    maxPaidUpCapital: 40000000,  // ₹4 Crore
    maxTurnover: 400000000,      // ₹40 Crore
    notificationReference: 'MCA Notification G.S.R. 700(E) dated 15.09.2022'
  },
  {
    effectiveFrom: '2021-02-01',
    effectiveTo: '2022-09-14',
    maxPaidUpCapital: 20000000,  // ₹2 Crore
    maxTurnover: 200000000,      // ₹20 Crore
    notificationReference: 'MCA Notification G.S.R. 92(E) dated 01.02.2021'
  }
];

export interface Aoc4SmallCompanyInput {
  isPrivateCompany: boolean;
  isHoldingCompany?: boolean;
  isSubsidiaryCompany?: boolean;
  isSection8Company?: boolean;
  isSpecialActBodyCorporate?: boolean;
  paidUpCapital: number;
  turnoverPrecedingFY: number;
  financialYearEndDate: Date;
}

export interface Aoc4SmallCompanyResult {
  isSmallCompany: boolean;
  thresholdApplied: SmallCompanyThresholdDefinition;
  financialYearUsed: string;
  assessmentDate: string;
  disqualificationReason?: string;
  sourceReference: string;
}

export function evaluateAoc4SmallCompanyStatus(
  input: Aoc4SmallCompanyInput
): Aoc4SmallCompanyResult {
  const dateStr = input.financialYearEndDate.toISOString().slice(0, 10);
  const threshold = AOC4_SMALL_COMPANY_THRESHOLDS.find(t => 
    t.effectiveFrom <= dateStr && (!t.effectiveTo || t.effectiveTo >= dateStr)
  ) || AOC4_SMALL_COMPANY_THRESHOLDS[0];

  const fyYear = input.financialYearEndDate.getFullYear();
  const financialYearUsed = `FY ${fyYear - 1}-${String(fyYear).slice(-2)}`;
  const assessmentDate = dateStr;

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
// 6. CASH FLOW STATEMENT EXEMPTION EVALUATOR (SECTION 2(40))
// ─────────────────────────────────────────────────────────────────────────────

export interface CashFlowExemptionResult {
  isExempt: boolean;
  statutoryBasis: string;
  note: string;
}

export function evaluateCashFlowExemption(
  isOpc: boolean,
  isSmallCompany: boolean,
  isDormantCompany: boolean,
  isStartup: boolean
): CashFlowExemptionResult {
  if (isOpc) {
    return {
      isExempt: true,
      statutoryBasis: 'Section 2(40) Proviso, Companies Act, 2013',
      note: 'One Person Company is statutorily exempt from preparing and attaching a Cash Flow Statement.'
    };
  }
  if (isSmallCompany) {
    return {
      isExempt: true,
      statutoryBasis: 'Section 2(40) Proviso, Companies Act, 2013',
      note: 'Small Company is statutorily exempt from preparing and attaching a Cash Flow Statement.'
    };
  }
  if (isDormantCompany) {
    return {
      isExempt: true,
      statutoryBasis: 'Section 2(40) Proviso & Section 455, Companies Act, 2013',
      note: 'Dormant Company is statutorily exempt from attaching a Cash Flow Statement.'
    };
  }
  if (isStartup) {
    return {
      isExempt: true,
      statutoryBasis: 'MCA Notification G.S.R. 583(E) dated 13.06.2017',
      note: 'Private Start-up Company recognized by DPIIT is exempt from attaching a Cash Flow Statement.'
    };
  }
  return {
    isExempt: false,
    statutoryBasis: 'Section 2(40), Companies Act, 2013',
    note: 'Mandatory: Cash Flow Statement must be prepared and annexed to the financial statements.'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. XBRL APPLICABILITY CHECKER
// ─────────────────────────────────────────────────────────────────────────────

export interface XbrlApplicabilityInput {
  isListed: boolean;
  isIndianSubsidiaryOfListed: boolean;
  paidUpCapital: number;
  turnover: number;
  isIndAsPreparer: boolean;
  isNbfc: boolean;
  isBankingOrInsurance: boolean;
}

export interface XbrlApplicabilityResult {
  mustFileXbrl: boolean;
  applicableFormCode: Aoc4FormVariant;
  reason: string;
  isExemptFromXbrl: boolean;
}

export function evaluateXbrlApplicability(
  input: XbrlApplicabilityInput
): XbrlApplicabilityResult {
  if (input.isBankingOrInsurance) {
    return {
      mustFileXbrl: false,
      applicableFormCode: 'AOC-4',
      reason: 'Banking, Insurance, and Power sector companies are exempted from XBRL filing rules.',
      isExemptFromXbrl: true
    };
  }

  if (input.isNbfc && input.isIndAsPreparer) {
    return {
      mustFileXbrl: false,
      applicableFormCode: 'AOC-4-NBFC',
      reason: 'NBFCs adopting Ind AS file Form AOC-4 NBFC (Ind AS) instead of XBRL.',
      isExemptFromXbrl: true
    };
  }

  if (input.isListed) {
    return {
      mustFileXbrl: true,
      applicableFormCode: 'AOC-4-XBRL',
      reason: 'Mandatory XBRL: Company is listed on a recognized Stock Exchange in India (Rule 3, XBRL Rules 2015).',
      isExemptFromXbrl: false
    };
  }

  if (input.isIndianSubsidiaryOfListed) {
    return {
      mustFileXbrl: true,
      applicableFormCode: 'AOC-4-XBRL',
      reason: 'Mandatory XBRL: Company is an Indian subsidiary of a listed company (Rule 3, XBRL Rules 2015).',
      isExemptFromXbrl: false
    };
  }

  if (input.paidUpCapital >= 50000000) { // ₹5 Crore
    return {
      mustFileXbrl: true,
      applicableFormCode: 'AOC-4-XBRL',
      reason: 'Mandatory XBRL: Paid-up share capital (≥ ₹5 Crore) satisfies Rule 3 threshold.',
      isExemptFromXbrl: false
    };
  }

  if (input.turnover >= 1000000000) { // ₹100 Crore
    return {
      mustFileXbrl: true,
      applicableFormCode: 'AOC-4-XBRL',
      reason: 'Mandatory XBRL: Annual Turnover (≥ ₹100 Crore) satisfies Rule 3 threshold.',
      isExemptFromXbrl: false
    };
  }

  if (input.isIndAsPreparer) {
    return {
      mustFileXbrl: true,
      applicableFormCode: 'AOC-4-XBRL',
      reason: 'Mandatory XBRL: Company preparing financial statements under Companies (Ind AS) Rules, 2015.',
      isExemptFromXbrl: false
    };
  }

  return {
    mustFileXbrl: false,
    applicableFormCode: 'AOC-4',
    reason: 'Standard Non-XBRL AOC-4 applies. Capital < ₹5 Cr, Turnover < ₹100 Cr, Unlisted.',
    isExemptFromXbrl: false
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. DETERMINISTIC DUE-DATE ENGINE (SECTION 137(1) & 3RD PROVISO)
// ─────────────────────────────────────────────────────────────────────────────

export interface Aoc4DateInput {
  financialYearEnd: Date;                     // e.g. 2026-03-31
  isOnePersonCompany: boolean;                // Section 137(1) 3rd proviso: 180 days from FY close
  agmType: 'first' | 'subsequent';             // Section 96(1)
  agmStatus: 'held' | 'extended_and_held' | 'not_held';
  actualAgmDate?: Date;                        // 30 days from actual AGM
  rocApprovedExtendedLastDate?: Date;          // Subsequent AGM only (max 3m ext)
}

export interface Aoc4DueDateOutput {
  standardAgmLastDate: Date;
  effectiveAgmTargetDate: Date;
  statutoryDueDate: Date;
  basisExplanation: string;
  isOpcFiling: boolean;
  validationError?: string;
}

function formatDateISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Computes statutory AOC-4 filing due date in accordance with Section 137(1) and Section 96(1).
 * - OPC: 180 days from closure of financial year (3rd proviso to Section 137(1)).
 * - Non-OPC: 30 days from date of AGM (or 30 days from date AGM ought to have been held).
 */
export function computeAoc4StatutoryDueDate(input: Aoc4DateInput): Aoc4DueDateOutput {
  const fyEnd = new Date(input.financialYearEnd);

  // 1. One Person Company (OPC) Branch
  // Under third proviso to Section 137(1): 180 days from closure of FY
  if (input.isOnePersonCompany) {
    const opcDueDate = addCalendarDays(fyEnd, 180);
    return {
      standardAgmLastDate: fyEnd,
      effectiveAgmTargetDate: fyEnd,
      statutoryDueDate: opcDueDate,
      basisExplanation: `180 days from financial year closure (${formatDateISO(fyEnd)}) per Section 137(1) third proviso (Exempt from AGM under Section 122(1))`,
      isOpcFiling: true
    };
  }

  // 2. Standard Statutory AGM Deadline under Section 96(1)
  const standardAgmLastDate = new Date(fyEnd);
  if (input.agmType === 'first') {
    // First AGM: FY End + 9 months (Section 96(1))
    standardAgmLastDate.setUTCMonth(standardAgmLastDate.getUTCMonth() + 9);
  } else {
    // Subsequent AGM: FY End + 6 months (Section 96(1))
    standardAgmLastDate.setUTCMonth(standardAgmLastDate.getUTCMonth() + 6);
  }

  // 3. Validate First AGM ROC Extension Restriction
  if (input.agmType === 'first' && (input.agmStatus === 'extended_and_held' || input.rocApprovedExtendedLastDate)) {
    return {
      standardAgmLastDate,
      effectiveAgmTargetDate: standardAgmLastDate,
      statutoryDueDate: addCalendarDays(standardAgmLastDate, 30),
      basisExplanation: 'Invalid: Section 96(1) third proviso explicitly prohibits ROC extension for First AGM',
      isOpcFiling: false,
      validationError: 'ROC extension cannot be granted for the First Annual General Meeting under Section 96(1) proviso.'
    };
  }

  // 4. Scenario A: AGM Held
  if (input.agmStatus === 'held') {
    if (!input.actualAgmDate || isNaN(input.actualAgmDate.getTime())) {
      return {
        standardAgmLastDate,
        effectiveAgmTargetDate: standardAgmLastDate,
        statutoryDueDate: addCalendarDays(standardAgmLastDate, 30),
        basisExplanation: 'Missing actual AGM date',
        isOpcFiling: false,
        validationError: 'Actual AGM date is required when AGM status is "Held".'
      };
    }
    const dueDate = addCalendarDays(input.actualAgmDate, 30);
    return {
      standardAgmLastDate,
      effectiveAgmTargetDate: input.actualAgmDate,
      statutoryDueDate: dueDate,
      basisExplanation: `30 days from actual ${input.agmType === 'first' ? 'First ' : ''}AGM date (${formatDateISO(input.actualAgmDate)}) per Section 137(1)`,
      isOpcFiling: false
    };
  }

  // 5. Scenario B: Subsequent AGM Extended & Held
  if (input.agmStatus === 'extended_and_held') {
    if (!input.actualAgmDate || isNaN(input.actualAgmDate.getTime())) {
      return {
        standardAgmLastDate,
        effectiveAgmTargetDate: standardAgmLastDate,
        statutoryDueDate: addCalendarDays(standardAgmLastDate, 30),
        basisExplanation: 'Missing actual AGM date for extended meeting',
        isOpcFiling: false,
        validationError: 'Actual AGM date is required when AGM status is "Extended & Held".'
      };
    }
    const dueDate = addCalendarDays(input.actualAgmDate, 30);
    return {
      standardAgmLastDate,
      effectiveAgmTargetDate: input.actualAgmDate,
      statutoryDueDate: dueDate,
      basisExplanation: `30 days from actual extended AGM date (${formatDateISO(input.actualAgmDate)}) pursuant to ROC extension under Section 96(1)`,
      isOpcFiling: false
    };
  }

  // 6. Scenario C: AGM Not Held
  // Under Section 137(2): 30 days from the latest date by which the AGM ought to have been held
  const effectiveAgmTargetDate = (input.agmType === 'subsequent' && input.rocApprovedExtendedLastDate)
    ? input.rocApprovedExtendedLastDate
    : standardAgmLastDate;

  const dueDate = addCalendarDays(effectiveAgmTargetDate, 30);
  return {
    standardAgmLastDate,
    effectiveAgmTargetDate,
    statutoryDueDate: dueDate,
    basisExplanation: `30 days from statutory deadline on which ${input.agmType === 'first' ? 'First ' : ''}AGM ought to have been held (${formatDateISO(effectiveAgmTargetDate)}) per Section 137(2)`,
    isOpcFiling: false
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. MANDATORY ATTACHMENTS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export interface Aoc4AttachmentItem {
  id: string;
  name: string;
  legalBasis: string;
  isMandatory: boolean;
  appliesTo: string;
  description: string;
}

export const AOC4_ATTACHMENTS: Aoc4AttachmentItem[] = [
  {
    id: 'balance_sheet',
    name: 'Balance Sheet & Notes',
    legalBasis: 'Section 129(1) & Schedule III',
    isMandatory: true,
    appliesTo: 'All Companies',
    description: 'Standalone Balance Sheet signed by Chairperson or 2 Directors including MD, and CFO/Company Secretary.'
  },
  {
    id: 'profit_loss',
    name: 'Statement of Profit and Loss',
    legalBasis: 'Section 129(1) & Schedule III',
    isMandatory: true,
    appliesTo: 'All Companies',
    description: 'Statement of Profit and Loss (or Income & Expenditure Account for Section 8 companies).'
  },
  {
    id: 'cash_flow',
    name: 'Cash Flow Statement',
    legalBasis: 'Section 2(40) Proviso',
    isMandatory: false,
    appliesTo: 'Public & Non-Small Private Companies',
    description: 'Mandatory unless exempt (OPCs, Small Companies, Dormant, and Private Startups are statutorily exempt).'
  },
  {
    id: 'auditors_report',
    name: "Independent Auditor's Report",
    legalBasis: 'Section 143 & CARO 2020',
    isMandatory: true,
    appliesTo: 'All Companies',
    description: "Statutory Auditor's Report along with annexures and CARO 2020 report (if applicable)."
  },
  {
    id: 'boards_report',
    name: "Board's Report & Disclosures",
    legalBasis: 'Section 134',
    isMandatory: true,
    appliesTo: 'All Companies',
    description: "Directors' Report including web link of annual return, CSR policy, internal controls, and state of affairs."
  },
  {
    id: 'agm_notice',
    name: 'Notice of AGM & Explanatory Statement',
    legalBasis: 'Section 101 & Section 102',
    isMandatory: true,
    appliesTo: 'All Companies (except OPCs)',
    description: 'Notice calling the Annual General Meeting along with explanatory statements and attendance slip.'
  },
  {
    id: 'aoc_1',
    name: 'Form AOC-1 (Statement for Subsidiaries / JVs)',
    legalBasis: 'Section 129(3) & Rule 5',
    isMandatory: false,
    appliesTo: 'Companies having subsidiaries / JVs / associates',
    description: 'Salient features of financial statements of subsidiaries, associates, and joint ventures.'
  },
  {
    id: 'csr_report',
    name: 'Annual Report on CSR Activities',
    legalBasis: 'Section 135 & CSR Rules, 2014',
    isMandatory: false,
    appliesTo: 'Net worth ≥ ₹500 Cr, Turnover ≥ ₹1000 Cr, or Net Profit ≥ ₹5 Cr',
    description: 'Annexure containing composition of CSR committee, CSR expenditure, and impact assessment report.'
  },
  {
    id: 'secretarial_audit',
    name: 'Secretarial Audit Report (MR-3)',
    legalBasis: 'Section 204(1)',
    isMandatory: false,
    appliesTo: 'Listed or Public (Capital ≥ ₹50 Cr or Turnover ≥ ₹250 Cr)',
    description: 'Secretarial Audit Report issued by a Practicing Company Secretary.'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPREHENSIVE SINGLE SOURCE OF TRUTH (SSOT) CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface Aoc4ComplianceCalculationInput {
  formCode: Aoc4FormVariant;
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
  isDormantCompany?: boolean;
  isIndianSubsidiaryOfListed?: boolean;
  isIndAsPreparer?: boolean;
  isNbfc?: boolean;
  hasSubsidiariesOrJVs?: boolean;
}

export interface Aoc4ComplianceCalculationResult {
  metadata: {
    formCode: Aoc4FormVariant;
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
  smallCompanyAssessment: Aoc4SmallCompanyResult;
  cashFlowExemption: CashFlowExemptionResult;
  xbrlAssessment: XbrlApplicabilityResult;
  directorsDisqualificationWarning: boolean; // Section 164(2)(a): Default for 3 consecutive years
  ruleTimeline: {
    feeRuleVersion: string;
    penaltyRuleVersion: string;
    smallCompanyRuleVersion: string;
  };
  whyIsMyFeeBreakdown: {
    title: string;
    description: string;
    items: { label: string; amount: string; note: string }[];
  };
}

/**
 * Canonical calculation engine for Form AOC-4 and all its variants.
 */
export function calculateAoc4Compliance(
  input: Aoc4ComplianceCalculationInput
): Aoc4ComplianceCalculationResult {
  const hasShareCapital = input.hasShareCapital !== false;
  const officerCount = Math.max(1, input.officerCount ?? 2);
  const paidUpCapital = input.paidUpCapital ?? input.nominalCapital;
  const turnoverPrecedingFY = input.turnoverPrecedingFY ?? 0;
  const isOpc = !!input.isOnePersonCompany;

  // 1. Evaluate Due Date
  const dueDateResult = computeAoc4StatutoryDueDate({
    financialYearEnd: input.financialYearEnd,
    isOnePersonCompany: isOpc,
    agmType: input.agmType,
    agmStatus: input.agmStatus,
    actualAgmDate: input.actualAgmDate,
    rocApprovedExtendedLastDate: input.rocApprovedExtendedLastDate
  });

  // 2. Calculate Calendar Days Delayed
  const dueTime = new Date(dueDateResult.statutoryDueDate).setHours(0, 0, 0, 0);
  const fileTime = new Date(input.actualFilingDate).setHours(0, 0, 0, 0);
  const diffMs = fileTime - dueTime;
  const daysDelayed = Math.max(0, Math.ceil(diffMs / 86400000));

  // 3. Evaluate Small Company Status
  const smallCompanyAssessment = evaluateAoc4SmallCompanyStatus({
    isPrivateCompany: input.isPrivateCompany,
    isHoldingCompany: !!input.isHoldingCompany,
    isSubsidiaryCompany: !!input.isSubsidiaryCompany,
    isSection8Company: !!input.isSection8Company,
    isSpecialActBodyCorporate: !!input.isSpecialActBodyCorporate,
    paidUpCapital,
    turnoverPrecedingFY,
    financialYearEndDate: input.financialYearEnd
  });

  const isSmall = smallCompanyAssessment.isSmallCompany;

  // 4. Cash Flow Exemption Evaluation
  const cashFlowExemption = evaluateCashFlowExemption(
    isOpc,
    isSmall,
    !!input.isDormantCompany,
    !!input.isStartupCompany
  );

  // 5. XBRL Applicability Evaluation
  const xbrlAssessment = evaluateXbrlApplicability({
    isListed: !!input.isListed,
    isIndianSubsidiaryOfListed: !!input.isIndianSubsidiaryOfListed,
    paidUpCapital,
    turnover: turnoverPrecedingFY,
    isIndAsPreparer: !!input.isIndAsPreparer,
    isNbfc: !!input.isNbfc,
    isBankingOrInsurance: false
  });

  // Form Routing Recommendation & Verification
  let formRoutingMismatch = false;
  let formRoutingRecommendation: string | undefined;

  if (xbrlAssessment.mustFileXbrl && input.formCode !== 'AOC-4-XBRL') {
    formRoutingMismatch = true;
    formRoutingRecommendation = `Mandatory XBRL: Company meets criteria for Form AOC-4 XBRL (${xbrlAssessment.reason}). Standard AOC-4 will be rejected by MCA portal.`;
  } else if (input.hasSubsidiariesOrJVs && input.formCode !== 'AOC-4-CFS' && input.formCode !== 'AOC-4-XBRL') {
    formRoutingMismatch = true;
    formRoutingRecommendation = 'Company has subsidiaries or joint ventures. Form AOC-4 CFS must also be filed in addition to standalone AOC-4 under Section 129(3).';
  }

  // 6. Section 446B Relief Eligibility
  const isStartup = !!input.isStartupCompany;
  const isProducer = !!input.isProducerCompany;
  const section446BEligible = isOpc || isSmall || isStartup || isProducer;

  // 7. Normal Filing Fee & Basis
  const normalFilingFee = calculateAoc4NormalFilingFee(input.nominalCapital, hasShareCapital);
  const basisNormalFee = getAoc4NormalFeeBasisExplanation(input.nominalCapital, hasShareCapital);

  // 8. Additional Late Filing Fee
  const additionalFilingFee = calculateAoc4AdditionalFilingFee(daysDelayed);
  const basisAdditionalFee = daysDelayed > 0
    ? `${daysDelayed} calendar day(s) delay @ ₹100/day (Table B Note Item 2, Fees Rules 2014)`
    : 'Filed on or before statutory due date. No additional late filing fee applies.';

  const totalPortalPayable = normalFilingFee + additionalFilingFee;

  // 9. Section 137(3) Statutory Penalties & Section 446B Ceilings
  const penalty = calculateSection137Penalty(daysDelayed, officerCount);

  let companyIndicativeMaximumExposure = penalty.standardCompanyPenalty;
  let officersIndicativeMaximumExposure = penalty.standardTotalOfficersPenalty;

  if (section446BEligible && daysDelayed > 0) {
    // Section 446B: Not more than half (50% relief), with Company Cap ₹1,00,000 and Officer Cap ₹25,000
    companyIndicativeMaximumExposure = Math.min(100000, Math.floor(penalty.standardCompanyPenalty * 0.5));
    const singleOfficerExposure = Math.min(25000, Math.floor(penalty.standardOfficerPenaltyPerPerson * 0.5));
    officersIndicativeMaximumExposure = singleOfficerExposure * officerCount;
  }

  const totalIndicativeMaximumExposure = companyIndicativeMaximumExposure + officersIndicativeMaximumExposure;

  const reliefCeilingExplanation = section446BEligible
    ? `Eligible under Section 446B (${isOpc ? 'OPC' : isSmall ? 'Small Company' : isStartup ? 'Startup' : 'Producer Co'}). Adjudication penalties capped at 50% statutory amount (Company Cap: ₹1,00,000 | Officer Cap: ₹25,000 per person).`
    : 'Not eligible for Section 446B relief. Standard Section 137(3) penalty caps apply (Company Cap: ₹2,00,000 | Officer Cap: ₹50,000 per person).';

  const directorsDisqualificationWarning = daysDelayed > 1000; // Multi-year non-compliance indicator

  // 10. Rule Timeline & Form Rule
  const ruleDefinition = input.formCode === 'AOC-4-CFS'
    ? AOC4_CFS_RULE
    : input.formCode === 'AOC-4-XBRL'
    ? AOC4_XBRL_RULE
    : input.formCode === 'AOC-4-NBFC'
    ? AOC4_NBFC_RULE
    : AOC4_RULE;

  const fyYear = input.financialYearEnd.getFullYear();
  const financialYear = `FY ${fyYear - 1}-${String(fyYear).slice(-2)}`;

  // Why is my fee breakdown
  const whyIsMyFeeBreakdown = {
    title: 'Why is my Form AOC-4 Fee Calculated This Way?',
    description: `Statutory fee breakdown under Section 137 of the Companies Act, 2013 and Table A / Table B of the Companies (Registration Offices and Fees) Rules, 2014 for ${financialYear}.`,
    items: [
      {
        label: 'Normal Government Filing Fee (Table A, Item 5)',
        amount: `₹${normalFilingFee.toLocaleString('en-IN')}`,
        note: hasShareCapital
          ? `Nominal share capital of ₹${input.nominalCapital.toLocaleString('en-IN')} falls in Table A bracket.`
          : 'Fixed fee of ₹200 for company without share capital.'
      },
      {
        label: 'Additional Filing Fee on MCA V3 (Table B Note Item 2)',
        amount: `₹${additionalFilingFee.toLocaleString('en-IN')}`,
        note: daysDelayed > 0
          ? `${daysDelayed} calendar days delayed from due date (${formatDateISO(dueDateResult.statutoryDueDate)}) computed at ₹100 per day.`
          : 'Zero delay. Form filed within the statutory window.'
      },
      {
        label: 'Total MCA21 Portal Payable',
        amount: `₹${totalPortalPayable.toLocaleString('en-IN')}`,
        note: 'Payable online via MCA21 payment gateway upon form upload.'
      },
      {
        label: 'Section 137(3) Adjudication Exposure (Civil Penalty)',
        amount: daysDelayed > 0 ? `₹${totalIndicativeMaximumExposure.toLocaleString('en-IN')}` : '₹0',
        note: daysDelayed > 0
          ? `${section446BEligible ? '50% Section 446B discounted exposure' : 'Standard exposure'}. Requires formal adjudication order by ROC under Section 454; not collected on MCA challan.`
          : 'No statutory penalty exposure when filed on or before due date.'
      }
    ]
  };

  return {
    metadata: {
      formCode: input.formCode,
      formName: ruleDefinition.formName,
      financialYear,
      agmType: input.agmType,
      agmStatus: input.agmStatus,
      standardAgmLastDate: formatDateISO(dueDateResult.standardAgmLastDate),
      effectiveAgmTargetDate: formatDateISO(dueDateResult.effectiveAgmTargetDate),
      statutoryDueDate: formatDateISO(dueDateResult.statutoryDueDate),
      actualFilingDate: formatDateISO(input.actualFilingDate),
      daysDelayed,
      continuingDaysAfterFirst: Math.max(0, daysDelayed - 1),
      nominalCapital: input.nominalCapital,
      hasShareCapital,
      companyClassification: isOpc
        ? 'One Person Company (OPC)'
        : isSmall
        ? 'Small Company (Section 2(85))'
        : input.isListed
        ? 'Public Limited (Listed)'
        : input.isPrivateCompany
        ? 'Private Limited Company'
        : 'Public Limited Company (Unlisted)',
      isSmallCompany: isSmall,
      section446BEligible,
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
      totalStandardExposure: penalty.standardTotalStatutoryPenalty,
      section446BApplied: section446BEligible,
      companyIndicativeMaximumExposure,
      officersIndicativeMaximumExposure,
      totalIndicativeMaximumExposure,
      reliefCeilingExplanation,
      legalNotice: 'Section 137(3) civil penalties are adjudicated exclusively by the Registrar of Companies (ROC) under Section 454 proceedings. They are separate from MCA21 e-Challan filing fees.'
    },
    smallCompanyAssessment,
    cashFlowExemption,
    xbrlAssessment,
    directorsDisqualificationWarning,
    ruleTimeline: {
      feeRuleVersion: 'Companies (Registration Offices and Fees) Rules, 2014 (Table A Item 5 & Table B Note Item 2)',
      penaltyRuleVersion: 'Section 137(3) as amended by Companies (Amendment) Act, 2020',
      smallCompanyRuleVersion: smallCompanyAssessment.thresholdApplied.notificationReference
    },
    whyIsMyFeeBreakdown
  };
}
