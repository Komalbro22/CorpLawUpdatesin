import {
  getNormalFilingFee,
  getLLPNormalFee,
  getLLPAdditionalFee,
  getLLPForm3BaseFee,
  getLLPForm4BaseFee,
  getLLPForm24BaseFee,
  getLLPChargeBaseFee,
} from './fee-calculator-core';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to calculate days between two dates
export function getDaysBetween(d1: Date | string, d2: Date | string): number {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return 0;
  
  // Set times to midnight for date-only comparison
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  
  const diffTime = date2.getTime() - date1.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// -------------------------------------------------------------
// COMPANY CALCULATOR
// -------------------------------------------------------------

export interface CompanyFeeParams {
  companyType: 'Pvt' | 'Public' | 'OPC' | 'Small' | 'Section8';
  authorizedCapital: number; // raw number
  formId: string;
  dueDate: string;
  actualDate: string;
  daysDelayed: number;
  officersCount: number;
  isRepeatDefault: boolean;
}

export interface CompanyCalculationResult {
  normalFee: number;
  lateFee: number;
  totalPayable: number;
  companyPenalty: number;
  officerPenalty: number;
  totalPenaltyExposure: number;
  isSmallCompanyReliefApplied: boolean;
  days: number;
}

export function calculateCompanyFee(params: CompanyFeeParams): CompanyCalculationResult {
  const {
    companyType,
    authorizedCapital,
    formId,
    daysDelayed,
    officersCount,
    isRepeatDefault,
  } = params;

  // 1. Normal Filing Fee (unified slab — same for all company types per items 5 & 6 Table A)
  let normalFee = 0;
  if (formId === 'DIR-3-KYC') {
    normalFee = 0; // always 0 if on time
  } else {
    normalFee = getNormalFilingFee(authorizedCapital);
  }

  // 2. Late Fee (Additional Fee)
  let lateFee = 0;
  
  // Only MGT-7, MGT-7A, AOC-4 variants attract the flat ₹100/day additional fee under
  // the Companies (Registration Offices & Fees) Second Amendment Rules, 2018.
  // ADT-1, INC-20A and all other general forms use the time-slab multiplier system.
  const isAnnualOrFSReturn = [
    'MGT-7',
    'MGT-7A',
    'AOC-4',
    'AOC-4-XBRL',
    'AOC-4-CFS',
    'AOC-4-NBFC',
  ].includes(formId);

  if (daysDelayed > 0) {
    if (formId === 'DIR-3-KYC') {
      lateFee = 5000; // Flat penalty, no daily rate — Rule 12A
    } else if (isAnnualOrFSReturn) {
      lateFee = 100 * daysDelayed; // ₹100/day, no cap — 2018 amendment
    } else {
      // General forms time-slab multiplier system (DIR-12, MGT-14, PAS-3, INC-22,
      // CHG-1, CHG-4, ADT-1, INC-20A, etc.) — Table B, Companies (Reg Offices & Fees) Rules 2014
      // ADT-1 / Sec 139: first tier (≤15 days) = 1×, then escalates.
      // Note: higher fees for repeat defaults (INC-22/PAS-3) are determined by the Registrar
      // during processing and are NOT computable in advance.
      let multiplier = 0;
      if (daysDelayed <= 15) {
        multiplier = 1;
      } else if (daysDelayed <= 30) {
        multiplier = 2;
      } else if (daysDelayed <= 60) {
        multiplier = 4;
      } else if (daysDelayed <= 90) {
        multiplier = 6;
      } else if (daysDelayed <= 180) {
        multiplier = 10;
      } else if (daysDelayed <= 270) {
        multiplier = 12;
      } else {
        // Beyond 270 days: condonation required (Section 403 second proviso)
        multiplier = 12; // cap at 12× for display; caller should show condonation note
      }

      lateFee = normalFee * multiplier;
    }
  }

  // 3. Statutory Adjudication Penalty (ROC must pass formal adjudication order under Sec 454)
  let companyPenalty = 0;
  let officerPenalty = 0;

  interface PenaltyRules {
    companyBase?: number;
    companyPerDay?: number;
    companyMax?: number;
    officerBase?: number;
    officerPerDay?: number;
    officerMax?: number;
  }

  const formPenaltyRules: Record<string, PenaltyRules> = {
    'MGT-7': { companyBase: 10000, companyPerDay: 100, companyMax: 200000, officerBase: 10000, officerPerDay: 100, officerMax: 50000 },
    'MGT-7A': { companyBase: 10000, companyPerDay: 100, companyMax: 200000, officerBase: 10000, officerPerDay: 100, officerMax: 50000 },
    'AOC-4': { companyBase: 10000, companyPerDay: 100, companyMax: 200000, officerBase: 10000, officerPerDay: 100, officerMax: 50000 },
    'AOC-4-XBRL': { companyBase: 10000, companyPerDay: 100, companyMax: 200000, officerBase: 10000, officerPerDay: 100, officerMax: 50000 },
    'AOC-4-CFS': { companyBase: 10000, companyPerDay: 100, companyMax: 200000, officerBase: 10000, officerPerDay: 100, officerMax: 50000 },
    'DIR-3-KYC': { officerBase: 5000, officerMax: 5000 },
    'DIR-12': { companyBase: 50000, companyPerDay: 500, companyMax: 300000, officerBase: 50000, officerPerDay: 500, officerMax: 100000 },
    'DPT-3': { companyBase: 10000, companyPerDay: 1000, companyMax: 200000, officerBase: 10000, officerPerDay: 1000, officerMax: 50000 },
    'BEN-2': { companyBase: 100000, companyPerDay: 500, companyMax: 500000, officerBase: 25000, officerPerDay: 200, officerMax: 100000 },
    'INC-20A': { companyBase: 50000, companyMax: 50000, officerBase: 0, officerPerDay: 1000, officerMax: 100000 },
    'INC-22': { companyBase: 1000, companyPerDay: 1000, companyMax: 100000, officerBase: 1000, officerPerDay: 1000, officerMax: 100000 },
    'PAS-3': { companyBase: 0, companyPerDay: 1000, companyMax: 100000, officerBase: 0, officerPerDay: 1000, officerMax: 100000 },
    'MGT-14': { companyBase: 10000, companyPerDay: 100, companyMax: 200000, officerBase: 10000, officerPerDay: 100, officerMax: 50000 },
    'MSME-1': { companyBase: 20000, companyPerDay: 1000, companyMax: 300000, officerBase: 20000, officerPerDay: 1000, officerMax: 300000 },
    'PAS-6': { companyBase: 10000, companyPerDay: 1000, companyMax: 200000, officerBase: 10000, officerPerDay: 1000, officerMax: 50000 },
    'SH-7': { companyBase: 1000, companyPerDay: 500, companyMax: 500000, officerBase: 1000, officerPerDay: 500, officerMax: 500000 },
    'ADT-3': { officerBase: 50000, officerPerDay: 500, officerMax: 200000 },
    'CRA-2': { companyBase: 25000, companyPerDay: 1000, companyMax: 500000, officerBase: 10000, officerPerDay: 1000, officerMax: 200000 },
    'CRA-4': { companyBase: 25000, companyPerDay: 1000, companyMax: 500000, officerBase: 10000, officerPerDay: 1000, officerMax: 200000 },
    'AOC-5': { officerBase: 50000, officerMax: 500000 },
    'MGT-15': { companyBase: 100000, companyPerDay: 500, companyMax: 500000, officerBase: 25000, officerPerDay: 500, officerMax: 100000 },
    'MBP-1': { officerBase: 100000, officerMax: 100000 }
  };

  if (daysDelayed > 0) {
    const rules = formPenaltyRules[formId];
    if (rules) {
      // For Section 92 (MGT-7/7A) and Section 137 (AOC-4 family), the ₹100/day applies after the first day
      const isSec92or137 = ['MGT-7', 'MGT-7A', 'AOC-4', 'AOC-4-XBRL', 'AOC-4-CFS'].includes(formId);
      const multDays = isSec92or137 ? Math.max(0, daysDelayed - 1) : daysDelayed;

      if (rules.companyBase !== undefined || rules.companyPerDay !== undefined) {
        let compPenalty = (rules.companyBase || 0) + (rules.companyPerDay || 0) * multDays;
        if (rules.companyMax !== undefined) {
          compPenalty = Math.min(compPenalty, rules.companyMax);
        }
        companyPenalty = compPenalty;
      }
      if (rules.officerBase !== undefined || rules.officerPerDay !== undefined) {
        let offPenalty = (rules.officerBase || 0) + (rules.officerPerDay || 0) * multDays;
        if (rules.officerMax !== undefined) {
          offPenalty = Math.min(offPenalty, rules.officerMax);
        }
        officerPenalty = offPenalty * officersCount;
      }
    }
  }

  // Section 446B small company / OPC / startup / producer relief (50% penalty reduction & statutory caps per officer)
  const isSmallCompanyReliefApplied = ['Small', 'OPC', 'Startup', 'Producer'].includes(companyType);
  if (isSmallCompanyReliefApplied) {
    companyPenalty = Math.min(Math.floor(companyPenalty / 2), 100000);
    // Statutory Section 446B caps officer penalty at ₹1,00,000 per officer in default
    const perOfficer = officersCount > 0 ? Math.floor(officerPenalty / officersCount) : 0;
    const halvedAndCapped = Math.min(Math.floor(perOfficer / 2), 25000);
    officerPenalty = halvedAndCapped * officersCount;
  }

  return {
    normalFee,
    lateFee,
    totalPayable: normalFee + lateFee,
    companyPenalty,
    officerPenalty,
    totalPenaltyExposure: companyPenalty + officerPenalty,
    isSmallCompanyReliefApplied,
    days: daysDelayed,
  };
}

// -------------------------------------------------------------
// LLP CALCULATOR — Form-Specific Compliance & Fee Engine
// -------------------------------------------------------------

export type LlpFormId =
  | 'Form-8-Annual'
  | 'Form-8-Charge'
  | 'Form-11'
  | 'Form-3'
  | 'Form-4'
  | 'Form-5'
  | 'Form-15'
  | 'Form-24'
  // Legacy aliases
  | 'Form-8'
  | 'Form-11';

export type Form3Modality =
  | 'initial'
  | 'modification_no_contrib'
  | 'modification_with_contrib';

export type Form8ChargeModality =
  | 'creation'
  | 'modification'
  | 'satisfaction';

export type Form15Scenario =
  | 'within_local_limits'
  | 'outside_local_limits_within_state'
  | 'interstate_change_roc';

export interface LlpFeeParams {
  formId: LlpFormId | string;
  contribution: number;
  turnover?: number;
  llpType?: 'Regular' | 'Small'; // manual override or backward-compat fallback
  financialYear?: string;        // e.g. '2025-26' for Form 8 / 11
  eventDate?: string;            // 'YYYY-MM-DD' for event forms
  dueDate?: string;              // 'YYYY-MM-DD' (optional, auto-derived if omitted)
  actualDate?: string;           // 'YYYY-MM-DD' (optional filing date)
  daysDelayed?: number;          // explicit delay days
  dpCount?: number;              // default 2
  form3Modality?: Form3Modality;
  cNew?: number;                 // new contribution amount for Form 3 contribution increase
  form8ChargeModality?: Form8ChargeModality;
  form15Scenario?: Form15Scenario;
}

export interface LlpCalculationResult {
  formId: string;
  formName: string;
  normalFee: number;                // Tier 1 Base Normal Filing Fee
  lateFee: number;                  // Tier 2 Additional Filing Fee (Section 69 / Table B)
  incrementalFee: number;           // Tier 3 Incremental Registration Fee (Form 3)
  totalPayable: number;             // Total MCA Portal Amount = Tier 1 + Tier 2 + Tier 3
  llpPenalty: number;               // Statutory Penalty for LLP Entity
  dpPenalty: number;                // Statutory Penalty for Designated Partners
  totalPenaltyExposure: number;     // Tier 4 Indicative Statutory Penalty Exposure
  isSmallLlp: boolean;              // Assessed Small LLP status
  smallLlpAssessmentBasis: string;  // Assessment explanation
  days: number;                     // Days delayed after statutory due date
  dueDate: string;                  // 'YYYY-MM-DD'
  actualDate: string;               // 'YYYY-MM-DD'
  dueDateFormatted: string;         // e.g. "30 Oct 2026"
  filingDateFormatted: string;      // e.g. "15 Dec 2026"
  statutoryAuthority: string;       // Primary legal citation
  penaltyNotice: string;            // Section 76A Notice
  proceduralNotes?: string;         // e.g. Form 24 / Charge procedural notes
  whyExplanation: {
    baseFeeDescription: string;
    multiplierDescription: string;
    incrementalFeeDescription?: string;
    penaltyDescription: string;
  };
}

/**
 * Automatically derive statutory due date based on form, FY, and event parameters
 */
export function getLlpStatutoryDueDate(
  formId: string,
  financialYear?: string,
  eventDate?: string,
  form15Scenario?: Form15Scenario
): { dueDateStr: string; formatted: string } {
  const normForm = formId === 'Form-8' ? 'Form-8-Annual' : formId;

  if (normForm === 'Form-11') {
    // FY close is March 31. T + 60 days -> 30 May of following year.
    let targetYear = 2026;
    if (financialYear) {
      const match = financialYear.match(/(\d{4})-(\d{2,4})/);
      if (match) {
        // e.g. "2025-26" -> closing year is 2026
        targetYear = parseInt(match[1]) + 1;
      } else {
        const singleYear = parseInt(financialYear);
        if (!isNaN(singleYear)) targetYear = singleYear + 1;
      }
    }
    return {
      dueDateStr: `${targetYear}-05-30`,
      formatted: `30 May ${targetYear}`,
    };
  }

  if (normForm === 'Form-8-Annual') {
    // FY close March 31. End of 6 months = Sept 30. T + 30 days -> 30 October of following year.
    let targetYear = 2026;
    if (financialYear) {
      const match = financialYear.match(/(\d{4})-(\d{2,4})/);
      if (match) {
        targetYear = parseInt(match[1]) + 1;
      } else {
        const singleYear = parseInt(financialYear);
        if (!isNaN(singleYear)) targetYear = singleYear + 1;
      }
    }
    return {
      dueDateStr: `${targetYear}-10-30`,
      formatted: `30 Oct ${targetYear}`,
    };
  }

  if (eventDate) {
    const ev = new Date(eventDate);
    if (!isNaN(ev.getTime())) {
      const due = new Date(ev.getTime() + 30 * 24 * 60 * 60 * 1000);
      const y = due.getFullYear();
      const m = String(due.getMonth() + 1).padStart(2, '0');
      const d = String(due.getDate()).padStart(2, '0');
      return {
        dueDateStr: `${y}-${m}-${d}`,
        formatted: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
    }
  }

  // Fallback
  return {
    dueDateStr: '2026-05-30',
    formatted: '30 May 2026',
  };
}

/**
 * Objective Small LLP Evaluator per Section 2(ta) of LLP Act, 2008
 */
export function evaluateSmallLlpStatus(
  contribution: number,
  turnover?: number,
  llpTypeOverride?: 'Regular' | 'Small'
): { isSmallLlp: boolean; assessmentBasis: string } {
  if (turnover !== undefined && turnover !== null && !isNaN(turnover)) {
    const meetsContribution = contribution <= 2500000;
    const meetsTurnover = turnover <= 4000000;
    const isSmall = meetsContribution && meetsTurnover;
    const assessmentBasis = isSmall
      ? 'Qualified as Small LLP (Contribution ≤ ₹25 Lakhs & Turnover ≤ ₹40 Lakhs)'
      : !meetsContribution && !meetsTurnover
      ? 'Regular LLP (Both Contribution > ₹25 Lakhs and Turnover > ₹40 Lakhs)'
      : !meetsContribution
      ? 'Regular LLP (Contribution exceeds statutory threshold of ₹25 Lakhs)'
      : 'Regular LLP (Turnover exceeds statutory threshold of ₹40 Lakhs)';
    return { isSmallLlp: isSmall, assessmentBasis };
  }

  // Fallback to manual selection or contribution threshold
  if (llpTypeOverride) {
    const isSmall = llpTypeOverride === 'Small';
    return {
      isSmallLlp: isSmall,
      assessmentBasis: isSmall
        ? 'Small LLP assessment based on information provided'
        : 'Regular LLP assessment based on information provided',
    };
  }

  const isSmall = contribution <= 2500000;
  return {
    isSmallLlp: isSmall,
    assessmentBasis: isSmall
      ? 'Assessed as Small LLP based on Contribution ≤ ₹25 Lakhs'
      : 'Regular LLP (Contribution > ₹25 Lakhs)',
  };
}

export function calculateLlpFee(params: LlpFeeParams): LlpCalculationResult {
  const {
    formId,
    contribution = 0,
    turnover,
    llpType,
    financialYear = '2025-26',
    eventDate,
    dueDate: customDueDate,
    actualDate,
    daysDelayed: explicitDaysDelayed,
    dpCount = 2,
    form3Modality = 'initial',
    cNew,
    form8ChargeModality = 'creation',
    form15Scenario = 'within_local_limits',
  } = params;

  // 1. Determine Small LLP Status
  const { isSmallLlp, assessmentBasis } = evaluateSmallLlpStatus(contribution, turnover, llpType);

  // 2. Determine Due Date and Days Delayed
  let derivedDueDateStr = customDueDate;
  let formattedDueDate = customDueDate || '';
  if (!derivedDueDateStr) {
    const dueInfo = getLlpStatutoryDueDate(formId, financialYear, eventDate, form15Scenario);
    derivedDueDateStr = dueInfo.dueDateStr;
    formattedDueDate = dueInfo.formatted;
  }

  let delayDays = 0;
  if (explicitDaysDelayed !== undefined && explicitDaysDelayed !== null && !isNaN(explicitDaysDelayed)) {
    delayDays = Math.max(0, explicitDaysDelayed);
  } else if (actualDate && derivedDueDateStr) {
    const dDue = new Date(derivedDueDateStr);
    const dAct = new Date(actualDate);
    if (!isNaN(dDue.getTime()) && !isNaN(dAct.getTime())) {
      dDue.setHours(0, 0, 0, 0);
      dAct.setHours(0, 0, 0, 0);
      delayDays = Math.max(0, Math.ceil((dAct.getTime() - dDue.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }

  const formattedFilingDate = actualDate
    ? new Date(actualDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not Specified';

  // 3. Normalize Form Type
  const normForm = (formId === 'Form-8' ? 'Form-8-Annual' : formId) as LlpFormId;

  // Initialize Tier Results
  let normalFee = 0;
  let lateFee = 0;
  let incrementalFee = 0;
  let llpPenalty = 0;
  let dpPenalty = 0;
  let formName = '';
  let statutoryAuthority = '';
  let proceduralNotes: string | undefined = undefined;
  let baseFeeDesc = '';
  let multiplierDesc = '';
  let incrementalFeeDesc: string | undefined = undefined;

  const section76aProvisoNotice =
    'Section 76A contains a proviso relating to penalty for specified defaults under Sections 34(3)/35(1) where the default is rectified before or within 30 days of the adjudicating officer\'s notice, subject to statutory conditions.';

  switch (normForm) {
    case 'Form-8-Annual': {
      formName = 'Form 8 — Statement of Account & Solvency (Annual Filing)';
      statutoryAuthority = 'Section 34(2) & Section 69, LLP Act, 2008 read with Rule 24 and Annexure-A, LLP Rules, 2009';
      normalFee = getLLPNormalFee(contribution);
      lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, true);
      baseFeeDesc = `Normal Base Filing Fee (Annexure A Table A Item 1 for contribution ₹${contribution.toLocaleString('en-IN')})`;

      if (delayDays > 0) {
        if (delayDays <= 360) {
          multiplierDesc = `Additional Filing Fee under Section 69 / Table B Item 2 (${delayDays} days delay)`;
        } else {
          multiplierDesc = `Additional Filing Fee beyond 360 days: ${isSmallLlp ? '15× + ₹10/day' : '30× + ₹20/day'} uncapped daily rate`;
        }
        const dailyPenaltyRate = isSmallLlp ? 50 : 100; // Section 76A(3) one-half relief for Small LLPs
        llpPenalty = Math.min(dailyPenaltyRate * delayDays, 100000);
        dpPenalty = Math.min(dailyPenaltyRate * delayDays, 50000) * dpCount;
      } else {
        multiplierDesc = 'On-time filing (0 days delay) — ₹0 additional fee';
      }
      break;
    }

    case 'Form-8-Charge': {
      formName = 'Form 8 — Registration / Modification / Satisfaction of Charge';
      statutoryAuthority = 'Section 36 & Section 69, LLP Act, 2008 read with Annexure-A Items 4 & 5 and Table B Item 1, LLP Rules, 2009';
      normalFee = getLLPChargeBaseFee(); // Flat ₹1,000 per document
      lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
      baseFeeDesc = 'Flat document filing fee under Annexure A Items 4 & 5 (₹1,000 per document)';
      
      if (delayDays > 0) {
        multiplierDesc = delayDays <= 360
          ? `Additional Filing Fee under Table B Item 1 (${delayDays} days delay)`
          : `Additional Filing Fee capped at ${isSmallLlp ? '25× (₹25,000)' : '50× (₹50,000)'} for general forms`;
      } else {
        multiplierDesc = 'On-time filing (0 days delay) — ₹0 additional fee';
      }

      proceduralNotes =
        'Notice: Charge filings beyond the statutory 30-day window attract additional filing fees under Annexure A Table B; filings requiring registration under extended periods or rectifications require verification against applicable ROC/RD procedural guidelines.';
      break;
    }

    case 'Form-11': {
      formName = 'Form 11 — Annual Return of LLP';
      statutoryAuthority = 'Section 35(1) & Section 69, LLP Act, 2008 read with Rule 25(1) and Annexure-A, LLP Rules, 2009';
      normalFee = getLLPNormalFee(contribution);
      lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, true);
      baseFeeDesc = `Normal Base Filing Fee (Annexure A Table A Item 1 for contribution ₹${contribution.toLocaleString('en-IN')})`;

      if (delayDays > 0) {
        if (delayDays <= 360) {
          multiplierDesc = `Additional Filing Fee under Section 69 / Table B Item 2 (${delayDays} days delay)`;
        } else {
          multiplierDesc = `Additional Filing Fee beyond 360 days: ${isSmallLlp ? '15× + ₹10/day' : '30× + ₹20/day'} uncapped daily rate`;
        }
        const dailyPenaltyRate = isSmallLlp ? 50 : 100; // Section 76A(3) one-half relief for Small LLPs
        llpPenalty = Math.min(dailyPenaltyRate * delayDays, 100000);
        dpPenalty = Math.min(dailyPenaltyRate * delayDays, 50000) * dpCount;
      } else {
        multiplierDesc = 'On-time filing (0 days delay) — ₹0 additional fee';
      }
      break;
    }

    case 'Form-3': {
      formName = 'Form 3 — Information with Respect to LLP Agreement and Changes Therein';
      statutoryAuthority = 'Section 23(2) & Section 69, LLP Act, 2008 read with Rule 21(1) and Annexure-A Items 1 & 3, LLP Rules, 2009';

      if (form3Modality === 'initial') {
        normalFee = getLLPForm3BaseFee(contribution);
        lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
        baseFeeDesc = `Initial LLP Agreement filing fee (Annexure A Item 3 for contribution ₹${contribution.toLocaleString('en-IN')})`;
      } else if (form3Modality === 'modification_no_contrib') {
        normalFee = getLLPNormalFee(contribution);
        lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
        baseFeeDesc = `Agreement modification filing fee (Annexure A Table A Item 1 for contribution ₹${contribution.toLocaleString('en-IN')})`;
      } else {
        // modification_with_contrib
        normalFee = getLLPNormalFee(contribution);
        const newContrib = cNew || contribution;
        incrementalFee = Math.max(0, getLLPForm3BaseFee(newContrib) - getLLPForm3BaseFee(contribution));
        lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
        baseFeeDesc = `Agreement modification base document fee (Annexure A Table A Item 1)`;
        incrementalFeeDesc = `Incremental registration fee differential for contribution increase (₹${contribution.toLocaleString('en-IN')} → ₹${newContrib.toLocaleString('en-IN')} under Annexure A Item 3)`;
      }

      multiplierDesc = delayDays > 0
        ? (delayDays <= 360
            ? `Additional Filing Fee under Table B Item 1 (${delayDays} days delay)`
            : `Additional Filing Fee capped at ${isSmallLlp ? '25×' : '50×'} for general forms`)
        : 'On-time filing (0 days delay) — ₹0 additional fee';
      break;
    }

    case 'Form-4': {
      formName = 'Form 4 — Notice of Appointment, Cessation & Partner/DP Particulars';
      statutoryAuthority = 'Section 25(2) & Section 69, LLP Act, 2008 read with Rule 10(8) & Rule 21(2) and Annexure-A Item 2, LLP Rules, 2009';
      normalFee = getLLPForm4BaseFee(isSmallLlp);
      lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
      baseFeeDesc = `Flat base fee for Form 4 under Annexure A Item 2 (${isSmallLlp ? 'Small LLP: ₹50' : 'Other LLP: ₹150'})`;
      multiplierDesc = delayDays > 0
        ? (delayDays <= 360
            ? `Additional Filing Fee under Table B Item 1 (${delayDays} days delay)`
            : `Additional Filing Fee capped at ${isSmallLlp ? '25× (₹1,250)' : '50× (₹7,500)'}`)
        : 'On-time filing (0 days delay) — ₹0 additional fee';
      break;
    }

    case 'Form-5': {
      formName = 'Form 5 — Notice for Change of Name';
      statutoryAuthority = 'Section 19 & Section 69, LLP Act, 2008 read with Rule 20 and Annexure-A Table A Item 1, LLP Rules, 2009';
      normalFee = getLLPNormalFee(contribution);
      lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
      baseFeeDesc = `Normal Base Filing Fee (Annexure A Table A Item 1 for contribution ₹${contribution.toLocaleString('en-IN')})`;
      multiplierDesc = delayDays > 0
        ? (delayDays <= 360
            ? `Additional Filing Fee under Table B Item 1 (${delayDays} days delay)`
            : `Additional Filing Fee capped at ${isSmallLlp ? '25×' : '50×'} for general forms`)
        : 'On-time filing (0 days delay) — ₹0 additional fee';
      break;
    }

    case 'Form-15': {
      formName = 'Form 15 — Notice for Change of Place of Registered Office';
      statutoryAuthority = 'Section 13 & Section 69, LLP Act, 2008 read with Rule 17 and Annexure-A Table A Item 1, LLP Rules, 2009';
      normalFee = getLLPNormalFee(contribution);
      lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
      baseFeeDesc = `Normal Base Filing Fee (Annexure A Table A Item 1 for contribution ₹${contribution.toLocaleString('en-IN')})`;
      multiplierDesc = delayDays > 0
        ? (delayDays <= 360
            ? `Additional Filing Fee under Table B Item 1 (${delayDays} days delay)`
            : `Additional Filing Fee capped at ${isSmallLlp ? '25×' : '50×'} for general forms`)
        : 'On-time filing (0 days delay) — ₹0 additional fee';
      break;
    }

    case 'Form-24': {
      formName = 'Form 24 — Application for Striking off the Name of LLP';
      statutoryAuthority = 'Section 75, LLP Act, 2008 read with Rule 37(1) and Annexure-A Item 5, LLP Rules, 2009';
      normalFee = getLLPForm24BaseFee(isSmallLlp);
      lateFee = 0; // Strike off application not subject to late filing multipliers
      baseFeeDesc = `Discrete strike-off application fee under Annexure A Item 5 (${isSmallLlp ? 'Small LLP: ₹500' : 'Other LLP: ₹1,000'})`;
      multiplierDesc = 'Additional Filing Fee is N/A for voluntary strike-off applications';
      proceduralNotes =
        'Form 24 Prerequisites: Must have ceased commercial activity for at least 1 year; no active assets, liabilities, or open charges; up-to-date filing of Form 8 and Form 11 completed up to the financial year of cessation; CA-certified Statement of Account within 30 days of application.';
      break;
    }

    default: {
      formName = 'LLP General Form';
      statutoryAuthority = 'Limited Liability Partnership Act, 2008 & LLP Rules, 2009';
      normalFee = getLLPNormalFee(contribution);
      lateFee = getLLPAdditionalFee(delayDays, normalFee, isSmallLlp, false);
      baseFeeDesc = `Normal Base Filing Fee (Annexure A Table A Item 1)`;
      multiplierDesc = delayDays > 0 ? `Additional Fee (${delayDays} days delay)` : 'On-time filing — ₹0';
      break;
    }
  }

  const penaltyDesc = (llpPenalty > 0 || dpPenalty > 0)
    ? `Indicative statutory adjudication penalty under Section 34(5)/35(2): ₹${llpPenalty.toLocaleString('en-IN')} for LLP Entity + ₹${dpPenalty.toLocaleString('en-IN')} for ${dpCount} Designated Partner(s). Requires formal adjudication under Section 76A.`
    : 'No statutory adjudication penalty exposure.';

  const totalPayable = normalFee + lateFee + incrementalFee;
  const totalPenaltyExposure = llpPenalty + dpPenalty;

  return {
    formId: normForm,
    formName,
    normalFee,
    lateFee,
    incrementalFee,
    totalPayable,
    llpPenalty,
    dpPenalty,
    totalPenaltyExposure,
    isSmallLlp,
    smallLlpAssessmentBasis: assessmentBasis,
    days: delayDays,
    dueDate: derivedDueDateStr,
    actualDate: actualDate || derivedDueDateStr,
    dueDateFormatted: formattedDueDate,
    filingDateFormatted: formattedFilingDate,
    statutoryAuthority,
    penaltyNotice: section76aProvisoNotice,
    proceduralNotes,
    whyExplanation: {
      baseFeeDescription: baseFeeDesc,
      multiplierDescription: multiplierDesc,
      incrementalFeeDescription: incrementalFeeDesc,
      penaltyDescription: penaltyDesc,
    },
  };
}

// -------------------------------------------------------------
// MSME CALCULATORS (MSMED Act, 2006 - Chapter V)
// -------------------------------------------------------------

export const EARLIEST_SUPPORTED_MSME_DATE = '2016-04-05';

export type MethodologyStatus =
  | 'VERIFIED_SECTION_16_MONTHLY_REST_METHOD'
  | 'ILLUSTRATIVE_METHOD'
  | 'LEGAL_VERIFICATION_REQUIRED';

export interface RbiBankRateEntry {
  effectiveFrom: string; // YYYY-MM-DD (inclusive)
  effectiveTo: string;   // YYYY-MM-DD (inclusive, '9999-12-31' for current)
  bankRate: number;      // e.g. 5.50
  statutoryRate: number; // 3 * bankRate, e.g. 16.50
  rbiNotificationReference: string;
  sourceUrl: string;
  verifiedAt: string;
}

/**
 * Verified RBI Bank Rate Dataset — supported from 5 April 2016.
 * Sourced directly from official RBI Monetary Policy Resolutions & Notifications.
 */
export const VERIFIED_RBI_BANK_RATE_DATASET: RbiBankRateEntry[] = [
  {
    effectiveFrom: '2025-12-05',
    effectiveTo: '9999-12-31',
    bankRate: 5.50,
    statutoryRate: 16.50,
    rbiNotificationReference: 'RBI Monetary Policy Resolution December 2025',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2025-06-06',
    effectiveTo: '2025-12-04',
    bankRate: 5.75,
    statutoryRate: 17.25,
    rbiNotificationReference: 'RBI Monetary Policy Resolution June 2025',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2025-04-09',
    effectiveTo: '2025-06-05',
    bankRate: 6.25,
    statutoryRate: 18.75,
    rbiNotificationReference: 'RBI Monetary Policy Resolution April 2025',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2025-02-07',
    effectiveTo: '2025-04-08',
    bankRate: 6.50,
    statutoryRate: 19.50,
    rbiNotificationReference: 'RBI Monetary Policy Resolution February 2025',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2023-02-08',
    effectiveTo: '2025-02-06',
    bankRate: 6.75,
    statutoryRate: 20.25,
    rbiNotificationReference: 'RBI/2022-2023/178 - Monetary Policy Statement February 8, 2023',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=55182',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2022-12-07',
    effectiveTo: '2023-02-07',
    bankRate: 6.50,
    statutoryRate: 19.50,
    rbiNotificationReference: 'RBI/2022-2023/151 - Monetary Policy Statement December 7, 2022',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54823',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2022-09-30',
    effectiveTo: '2022-12-06',
    bankRate: 6.15,
    statutoryRate: 18.45,
    rbiNotificationReference: 'RBI/2022-2023/119 - Monetary Policy Statement September 30, 2022',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54465',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2022-08-05',
    effectiveTo: '2022-09-29',
    bankRate: 5.65,
    statutoryRate: 16.95,
    rbiNotificationReference: 'RBI/2022-2023/102 - Monetary Policy Statement August 5, 2022',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54151',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2022-06-08',
    effectiveTo: '2022-08-04',
    bankRate: 5.15,
    statutoryRate: 15.45,
    rbiNotificationReference: 'RBI/2022-2023/65 - Monetary Policy Statement June 8, 2022',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53828',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2022-05-04',
    effectiveTo: '2022-06-07',
    bankRate: 4.65,
    statutoryRate: 13.95,
    rbiNotificationReference: 'RBI/2022-2023/45 - Off-cycle Monetary Policy Resolution May 4, 2022',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53650',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2020-05-22',
    effectiveTo: '2022-05-03',
    bankRate: 4.25,
    statutoryRate: 12.75,
    rbiNotificationReference: 'RBI/2019-2020/238 - Monetary Policy Statement May 22, 2020',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=49843',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2020-03-27',
    effectiveTo: '2020-05-21',
    bankRate: 4.65,
    statutoryRate: 13.95,
    rbiNotificationReference: 'RBI/2019-2020/186 - Seventh Bi-monthly Monetary Policy Statement March 27, 2020',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=49581',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2019-10-04',
    effectiveTo: '2020-03-26',
    bankRate: 5.40,
    statutoryRate: 16.20,
    rbiNotificationReference: 'RBI/2019-2020/75 - Fourth Bi-monthly Monetary Policy Statement October 4, 2019',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=48316',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2019-08-07',
    effectiveTo: '2019-10-03',
    bankRate: 5.65,
    statutoryRate: 16.95,
    rbiNotificationReference: 'RBI/2019-2020/41 - Third Bi-monthly Monetary Policy Statement August 7, 2019',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=47814',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2019-06-06',
    effectiveTo: '2019-08-06',
    bankRate: 6.00,
    statutoryRate: 18.00,
    rbiNotificationReference: 'RBI/2018-2019/208 - Second Bi-monthly Monetary Policy Statement June 6, 2019',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=47231',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2019-04-04',
    effectiveTo: '2019-06-05',
    bankRate: 6.25,
    statutoryRate: 18.75,
    rbiNotificationReference: 'RBI/2018-2019/158 - First Bi-monthly Monetary Policy Statement April 4, 2019',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=46660',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2019-02-07',
    effectiveTo: '2019-04-03',
    bankRate: 6.50,
    statutoryRate: 19.50,
    rbiNotificationReference: 'RBI/2018-2019/127 - Sixth Bi-monthly Monetary Policy Statement February 7, 2019',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=46237',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2018-08-01',
    effectiveTo: '2019-02-06',
    bankRate: 6.75,
    statutoryRate: 20.25,
    rbiNotificationReference: 'RBI/2018-2019/21 - Third Bi-monthly Monetary Policy Statement August 1, 2018',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=44525',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2018-06-06',
    effectiveTo: '2018-07-31',
    bankRate: 6.50,
    statutoryRate: 19.50,
    rbiNotificationReference: 'RBI/2017-2018/187 - Second Bi-monthly Monetary Policy Statement June 6, 2018',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=44002',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2017-08-02',
    effectiveTo: '2018-06-05',
    bankRate: 6.25,
    statutoryRate: 18.75,
    rbiNotificationReference: 'RBI/2017-2018/35 - Third Bi-monthly Monetary Policy Statement August 2, 2017',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=41261',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2017-04-06',
    effectiveTo: '2017-08-01',
    bankRate: 6.50,
    statutoryRate: 19.50,
    rbiNotificationReference: 'RBI/2016-2017/261 - First Bi-monthly Monetary Policy Statement April 6, 2017',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=40097',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2016-10-04',
    effectiveTo: '2017-04-05',
    bankRate: 6.75,
    statutoryRate: 20.25,
    rbiNotificationReference: 'RBI/2016-2017/79 - Fourth Bi-monthly Monetary Policy Statement October 4, 2016',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=38214',
    verifiedAt: '2026-08-21'
  },
  {
    effectiveFrom: '2016-04-05',
    effectiveTo: '2016-10-03',
    bankRate: 7.00,
    statutoryRate: 21.00,
    rbiNotificationReference: 'RBI/2015-2016/359 - First Bi-monthly Monetary Policy Statement April 5, 2016',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=36654',
    verifiedAt: '2026-08-21'
  }
];

export function getApplicableRbiRate(dateStr: string): RbiBankRateEntry {
  const target = dateStr.slice(0, 10);
  for (const entry of VERIFIED_RBI_BANK_RATE_DATASET) {
    if (target >= entry.effectiveFrom && target <= entry.effectiveTo) {
      return entry;
    }
  }
  if (target > VERIFIED_RBI_BANK_RATE_DATASET[0].effectiveFrom) {
    return VERIFIED_RBI_BANK_RATE_DATASET[0];
  }
  return VERIFIED_RBI_BANK_RATE_DATASET[VERIFIED_RBI_BANK_RATE_DATASET.length - 1];
}

// -------------------------------------------------------------
// SUPPLIER ELIGIBILITY & ACCEPTANCE RESOLUTION MODELS
// -------------------------------------------------------------

export interface SupplierEligibilityInput {
  enterpriseCategory: 'micro' | 'small' | 'medium' | 'large' | 'not_sure';
  registrationType: 'udyam' | 'uam' | 'em_part_2' | 'unregistered' | 'not_sure';
  registrationDate?: string;        // YYYY-MM-DD
  relevantTransactionDate?: string; // YYYY-MM-DD (Neutral: Order / Contract / Supply Date)
  majorActivity: 'manufacturing' | 'services' | 'trading_retail_wholesale' | 'not_sure';
}

export interface SupplierEligibilityOutput {
  status: 'ELIGIBLE' | 'INELIGIBLE' | 'ELIGIBILITY REQUIRES VERIFICATION';
  statusBadge: 'green' | 'red' | 'amber';
  statutoryReason: string;
  warnings: string[];
}

export function evaluateSupplierEligibility(input: SupplierEligibilityInput): SupplierEligibilityOutput {
  const warnings: string[] = [];

  if (input.enterpriseCategory === 'large') {
    return {
      status: 'INELIGIBLE',
      statusBadge: 'red',
      statutoryReason: 'Large enterprises are outside the statutory purview of the MSMED Act, 2006.',
      warnings: []
    };
  }

  if (input.enterpriseCategory === 'medium') {
    return {
      status: 'INELIGIBLE',
      statusBadge: 'red',
      statutoryReason: 'Chapter V (Sections 15–25) delayed payment interest protections apply strictly to Micro and Small enterprises. Medium enterprises cannot claim Section 16 penal interest.',
      warnings: ['Medium enterprises are excluded from filing delayed payment recovery claims before the MSEFC under Section 18.']
    };
  }

  if (input.majorActivity === 'trading_retail_wholesale') {
    return {
      status: 'ELIGIBILITY REQUIRES VERIFICATION',
      statusBadge: 'amber',
      statutoryReason: 'Per Ministry of MSME Office Memorandum No. 5/2(2)/2021-E/P & G/Policy dated July 2, 2021, retail and wholesale traders are eligible for Priority Sector Lending (PSL) benefits only, and their access to Chapter V delayed payment remedies remains contested in judicial precedents.',
      warnings: ['LEGAL VERIFICATION REQUIRED: Facilitation Councils routinely scrutinize delayed payment claims filed by wholesale/retail traders.']
    };
  }

  if (input.registrationType === 'unregistered') {
    return {
      status: 'ELIGIBILITY REQUIRES VERIFICATION',
      statusBadge: 'amber',
      statutoryReason: 'The supplier must hold a valid registration certificate (Udyam / UAM / EM-II) to access MSEFC statutory conciliation and arbitration under Section 18.',
      warnings: ['Unregistered enterprises face jurisdictional objections before Facilitation Councils.']
    };
  }

  if (input.registrationDate && input.relevantTransactionDate) {
    const regDate = new Date(input.registrationDate);
    const txDate = new Date(input.relevantTransactionDate);
    if (regDate > txDate) {
      return {
        status: 'ELIGIBILITY REQUIRES VERIFICATION',
        statusBadge: 'amber',
        statutoryReason: 'Per Supreme Court ruling in Silpi Industries (2021), registration must exist on or before the date of entering into the contract / supply to claim Section 16 statutory benefits.',
        warnings: ['Post-supply Udyam registration does not give retrospective effect to Section 16 interest claims.']
      };
    }
  }

  if (['micro', 'small'].includes(input.enterpriseCategory)) {
    return {
      status: 'ELIGIBLE',
      statusBadge: 'green',
      statutoryReason: 'Eligible as a registered Micro/Small enterprise under Chapter V of the MSMED Act, 2006.',
      warnings: []
    };
  }

  return {
    status: 'ELIGIBILITY REQUIRES VERIFICATION',
    statusBadge: 'amber',
    statutoryReason: 'Incomplete supplier information. Eligibility requires verification against Udyam certificate and supply date.',
    warnings: ['Please verify supplier enterprise category on the official Udyam Registration portal.']
  };
}

export type AcceptanceModality = 'deemed_acceptance' | 'objection_resolved' | 'ineffective_late_objection';

export interface AcceptanceResolutionResult {
  modality: AcceptanceModality;
  effectiveAcceptanceDate: string; // YYYY-MM-DD
  statutoryReason: string;
  isObjectionValid: boolean;
  warnings: string[];
}

export function resolveAcceptanceDate(
  deliveryDateStr: string,
  hasObjection: boolean,
  objectionDateStr?: string,
  objectionResolvedDateStr?: string
): AcceptanceResolutionResult {
  const deliveryDate = new Date(deliveryDateStr);
  
  if (!hasObjection) {
    return {
      modality: 'deemed_acceptance',
      effectiveAcceptanceDate: deliveryDateStr,
      statutoryReason: 'No written objection raised within 15 days; deemed accepted on date of delivery (Section 2(b) Explanation (ii)).',
      isObjectionValid: false,
      warnings: []
    };
  }

  const objectionDate = new Date(objectionDateStr || '');
  const daysToObjection = getDaysBetween(deliveryDate, objectionDate);

  if (daysToObjection <= 15) {
    return {
      modality: 'objection_resolved',
      effectiveAcceptanceDate: objectionResolvedDateStr || deliveryDateStr,
      statutoryReason: `Written objection was raised on day ${daysToObjection} (within statutory 15 days) and resolved on ${objectionResolvedDateStr}. Acceptance occurs on resolution date (Section 2(b) Explanation (i)(b)).`,
      isObjectionValid: true,
      warnings: []
    };
  } else {
    return {
      modality: 'ineffective_late_objection',
      effectiveAcceptanceDate: deliveryDateStr,
      statutoryReason: `Written objection was served ${daysToObjection} days after delivery (exceeding 15 days). Under Section 2(b) Explanation (ii), deemed acceptance legally crystallized on the delivery date.`,
      isObjectionValid: false,
      warnings: ['Objection raised after 15 days is legally ineffective under Section 2(b) to postpone the statutory acceptance date.']
    };
  }
}

// -------------------------------------------------------------
// MONTHLY REST COMPOUNDING ENGINE (Anchor-Preserved)
// -------------------------------------------------------------

export type RateTransitionStrategy = 'daily_prorated' | 'rest_anchor';

export interface CompoundingScheduleItem {
  month: number;
  periodStart: string;
  periodEnd: string;
  daysElapsed: number;
  daysInPeriod: number;
  daysInMonth: number;
  openingPrincipal: number;
  appliedBankRate: number;
  appliedStatutoryRate: number;
  rateDescription: string;
  interestThisMonth: number;
  cumulativeInterest: number;
  totalPayable: number;
  isIllustrativeTransition?: boolean;
}

export interface MsmeInterestParams {
  invoiceAmount: number;
  deliveryDate?: string;             // YYYY-MM-DD
  acceptanceDate?: string;           // Backward compatibility alias for deliveryDate
  hasWrittenObjection?: boolean;
  objectionDate?: string;            // YYYY-MM-DD
  objectionResolvedDate?: string;    // YYYY-MM-DD
  hasAgreement?: boolean;
  agreedPaymentDate?: string;        // YYYY-MM-DD (optional)
  actualPaymentDate: string;         // YYYY-MM-DD
  bankRateOverride?: number | null;  // optional override float
  bankRate?: number;                 // legacy parameter
  rateStrategy?: RateTransitionStrategy;
}

export interface MsmeInterestResult {
  principal: number;
  deliveryDate: string;
  effectiveAcceptanceDate: string;
  acceptanceModality: AcceptanceModality;
  appointedDay: string;              // Day 16: Acceptance + 16 days
  dueDate: string;                   // Statutory Due Date (Day 15 or agreed date <= 45d)
  interestStartDate: string;         // Date interest begins to accrue
  interestStartReason: string;
  statutoryCapApplied: boolean;
  daysDelayed: number;               // Backward compatibility alias for daysPastDueDate
  daysPastDueDate: number;           // Days elapsed beyond the statutory due date
  interestBearingDays: number;       // Number of days in the interest accrual window
  interestAccrualPeriod: { from: string; to: string };
  appliedBankRate: number;           // Active or primary bank rate
  appliedStatutoryRate: number;      // 3x Bank Rate
  accruedInterest: number;
  totalPayable: number;
  schedule: CompoundingScheduleItem[];
  isOverdue: boolean;
  methodologyStatus: MethodologyStatus;
  rateAudit: {
    isHistoricalMultiRate: boolean;
    strategyUsed: RateTransitionStrategy;
    isSubjectToLegalVerification: boolean;
    methodologyStatus: MethodologyStatus;
    statusDisclaimer?: string;
  };
  warnings: string[];
  error?: string;
}

/**
 * UTC-safe ISO date helpers to avoid local machine timezone offsets.
 */
function parseIsoDateUtc(dateStr: string): Date {
  const parts = dateStr.slice(0, 10).split('-');
  return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
}

function addDaysUtc(d: Date, days: number): Date {
  const res = new Date(d.getTime());
  res.setUTCDate(res.getUTCDate() + days);
  return res;
}

function formatIsoDateUtc(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * Calculates the next calendar monthly rest date anchored to the original start day.
 * Eliminates month-end date drift (e.g. Jan 31 -> Feb 28/29 -> Mar 31).
 */
function getNextMonthlyRest(startDate: Date, anchorDay: number, monthIndex: number): Date {
  const baseYear = startDate.getUTCFullYear();
  const baseMonth = startDate.getUTCMonth() + monthIndex;
  
  const targetYear = baseYear + Math.floor(baseMonth / 12);
  const targetMonth = baseMonth % 12;
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  
  const targetDay = Math.min(anchorDay, daysInTargetMonth);
  return new Date(Date.UTC(targetYear, targetMonth, targetDay));
}

export function calculateMsmeInterest(params: MsmeInterestParams): MsmeInterestResult {
  const {
    invoiceAmount,
    hasWrittenObjection = false,
    objectionDate,
    objectionResolvedDate,
    hasAgreement = false,
    agreedPaymentDate,
    actualPaymentDate,
    bankRateOverride = null,
    bankRate,
    rateStrategy = 'rest_anchor',
  } = params;

  const rawDelivery = params.deliveryDate || params.acceptanceDate || '';
  const warnings: string[] = [];

  // Input validation guard for principal amount
  if (
    invoiceAmount === undefined ||
    invoiceAmount === null ||
    typeof invoiceAmount !== 'number' ||
    isNaN(invoiceAmount) ||
    !isFinite(invoiceAmount) ||
    invoiceAmount <= 0
  ) {
    return {
      principal: 0,
      deliveryDate: rawDelivery || '',
      effectiveAcceptanceDate: '',
      acceptanceModality: 'deemed_acceptance',
      appointedDay: '',
      dueDate: '',
      interestStartDate: '',
      interestStartReason: 'Invoice/principal amount must be greater than ₹0.',
      statutoryCapApplied: false,
      daysDelayed: 0,
      daysPastDueDate: 0,
      interestBearingDays: 0,
      interestAccrualPeriod: { from: '', to: '' },
      appliedBankRate: 5.50,
      appliedStatutoryRate: 16.50,
      accruedInterest: 0,
      totalPayable: 0,
      schedule: [],
      isOverdue: false,
      methodologyStatus: 'LEGAL_VERIFICATION_REQUIRED',
      rateAudit: {
        isHistoricalMultiRate: false,
        strategyUsed: rateStrategy,
        isSubjectToLegalVerification: false,
        methodologyStatus: 'LEGAL_VERIFICATION_REQUIRED',
      },
      warnings: ['Invoice/principal amount must be greater than ₹0.'],
      error: 'Invoice/principal amount must be greater than ₹0.',
    };
  }

  // Input validation guard for delivery date
  if (!rawDelivery || isNaN(new Date(rawDelivery).getTime())) {
    return {
      principal: invoiceAmount,
      deliveryDate: '',
      effectiveAcceptanceDate: '',
      acceptanceModality: 'deemed_acceptance',
      appointedDay: '',
      dueDate: '',
      interestStartDate: '',
      interestStartReason: 'Invalid delivery date.',
      statutoryCapApplied: false,
      daysDelayed: 0,
      daysPastDueDate: 0,
      interestBearingDays: 0,
      interestAccrualPeriod: { from: '', to: '' },
      appliedBankRate: 5.50,
      appliedStatutoryRate: 16.50,
      accruedInterest: 0,
      totalPayable: invoiceAmount,
      schedule: [],
      isOverdue: false,
      methodologyStatus: 'LEGAL_VERIFICATION_REQUIRED',
      rateAudit: {
        isHistoricalMultiRate: false,
        strategyUsed: rateStrategy,
        isSubjectToLegalVerification: false,
        methodologyStatus: 'LEGAL_VERIFICATION_REQUIRED',
      },
      warnings: ['A valid Date of Delivery / Acceptance is required.'],
    };
  }

  // Check dataset supported period boundary (5 April 2016 onward)
  if (rawDelivery < EARLIEST_SUPPORTED_MSME_DATE) {
    warnings.push(`Calculation date precedes supported Verified RBI Bank Rate Dataset (5 April 2016 onward).`);
  }

  // 1. Resolve Day of Acceptance
  const acceptanceResolution = resolveAcceptanceDate(
    rawDelivery,
    hasWrittenObjection,
    objectionDate,
    objectionResolvedDate
  );
  const effectiveAcceptDateStr = acceptanceResolution.effectiveAcceptanceDate;
  const effectiveAcceptDateObj = parseIsoDateUtc(effectiveAcceptDateStr);

  // 2. Determine Appointed Day & Due Date
  // Section 2(b): Appointed Day = Day 16 (Acceptance + 16 days)
  const appointedDayObj = addDaysUtc(effectiveAcceptDateObj, 16);

  let dueDateObj = addDaysUtc(effectiveAcceptDateObj, 15);
  let interestStartDateObj = new Date(appointedDayObj.getTime());
  let interestStartReason = '';
  let statutoryCapApplied = false;

  const isAgreementActive = hasAgreement || Boolean(agreedPaymentDate);

  if (isAgreementActive && agreedPaymentDate) {
    const agreedDateObj = parseIsoDateUtc(agreedPaymentDate);
    if (!isNaN(agreedDateObj.getTime())) {
      if (agreedDateObj < effectiveAcceptDateObj) {
        // Invalid agreed date before acceptance -> fallback to statutory 15 days
        dueDateObj = addDaysUtc(effectiveAcceptDateObj, 15);
        interestStartDateObj = new Date(appointedDayObj.getTime());
        interestStartReason = 'Agreed payment date was earlier than acceptance date; defaulted to statutory 15-day due date.';
        warnings.push('Agreed payment date cannot precede acceptance date; statutory default applied.');
      } else {
        const diffDays = getDaysBetween(effectiveAcceptDateStr, agreedPaymentDate);
        if (diffDays > 45) {
          // Statutory 45-day ceiling (Section 15 proviso)
          statutoryCapApplied = true;
          dueDateObj = addDaysUtc(effectiveAcceptDateObj, 45);
          interestStartDateObj = addDaysUtc(dueDateObj, 1); // Day 46
          interestStartReason = `Contractual credit period of ${diffDays} days exceeds statutory 45-day limit (Section 15). Due date capped at Day 45 (${formatIsoDateUtc(dueDateObj)}); interest accrues from Day 46.`;
          warnings.push('Contractual credit period exceeds statutory 45-day ceiling under Section 15 of MSMED Act.');
        } else {
          // Valid contractual agreement <= 45 days
          dueDateObj = new Date(agreedDateObj.getTime());
          interestStartDateObj = addDaysUtc(agreedDateObj, 1); // Day immediately following agreed date
          interestStartReason = `Interest accrues from ${formatIsoDateUtc(interestStartDateObj)} (the day immediately following the agreed payment date of ${agreedPaymentDate}) under Section 16.`;
        }
      }
    } else {
      dueDateObj = addDaysUtc(effectiveAcceptDateObj, 15);
      interestStartDateObj = new Date(appointedDayObj.getTime());
      interestStartReason = 'Payment due before the Appointed Day (Section 15). Interest accrues from the Appointed Day under Section 16.';
    }
  } else {
    // No written agreement: payment due on/before Day 15, interest starts on Appointed Day (Day 16)
    dueDateObj = addDaysUtc(effectiveAcceptDateObj, 15);
    interestStartDateObj = new Date(appointedDayObj.getTime());
    interestStartReason = `No written payment agreement. Payment was due on or before Day 15 (${formatIsoDateUtc(dueDateObj)}). Interest accrues from the Appointed Day (${formatIsoDateUtc(appointedDayObj)}) under Section 16.`;
  }

  // 3. Overdue & Interest-Bearing Days Duration
  const actualPayObj = parseIsoDateUtc(actualPaymentDate);
  let daysPastDueDate = 0;
  let interestBearingDays = 0;
  let interestAccrualPeriod = { from: '', to: '' };

  if (!isNaN(actualPayObj.getTime())) {
    // Days past statutory due date
    daysPastDueDate = getDaysBetween(dueDateObj, actualPayObj);

    // Interest-bearing days (from interestStartDate to actualPaymentDate)
    if (actualPayObj > interestStartDateObj) {
      interestBearingDays = getDaysBetween(interestStartDateObj, actualPayObj);
      interestAccrualPeriod = {
        from: formatIsoDateUtc(interestStartDateObj),
        to: formatIsoDateUtc(actualPayObj),
      };
    }
  }
  const isOverdue = daysPastDueDate > 0 && actualPayObj >= interestStartDateObj;

  // 4. Rate Identification
  let explicitBankRate: number | null = null;
  if (bankRateOverride !== null && bankRateOverride !== undefined) {
    explicitBankRate = Number(bankRateOverride);
  } else if (bankRate !== undefined && bankRate !== null) {
    explicitBankRate = Number(bankRate);
  }

  const baseRateEntry = getApplicableRbiRate(formatIsoDateUtc(interestStartDateObj));
  const primaryBankRate = explicitBankRate !== null ? explicitBankRate : baseRateEntry.bankRate;
  const primaryStatutoryRate = primaryBankRate * 3;

  // 5. Monthly Compounding Rests Execution
  let accruedInterest = 0;
  const schedule: CompoundingScheduleItem[] = [];
  let isHistoricalMultiRate = false;
  let hasMidRestRateTransition = false;

  if (isOverdue && actualPayObj > interestStartDateObj) {
    let runningPrincipal = invoiceAmount;
    let runningInterest = 0;
    let currentDate = new Date(interestStartDateObj.getTime());
    const anchorDay = interestStartDateObj.getUTCDate();
    let monthCount = 0;
    let totalDaysElapsed = 0;

    while (currentDate < actualPayObj) {
      monthCount++;
      const nextMonthRestDate = getNextMonthlyRest(interestStartDateObj, anchorDay, monthCount);
      const periodEnd = nextMonthRestDate < actualPayObj ? nextMonthRestDate : actualPayObj;
      
      const daysInPeriod = getDaysBetween(currentDate, periodEnd);
      if (daysInPeriod <= 0) break;

      const daysInMonth = getDaysBetween(currentDate, nextMonthRestDate);
      let interestThisPeriod = 0;
      let appliedPeriodBankRate = primaryBankRate;
      let appliedPeriodStatutoryRate = primaryStatutoryRate;
      let rateDesc = `${primaryStatutoryRate.toFixed(2)}% p.a. (3x ${primaryBankRate.toFixed(2)}%)`;
      let isIllustrativeTransition = false;

      if (explicitBankRate !== null) {
        // Manual override rate
        const periodFraction = daysInPeriod / daysInMonth;
        const monthlyRate = (primaryStatutoryRate / 100) / 12;
        interestThisPeriod = runningPrincipal * monthlyRate * periodFraction;
      } else {
        // Multi-period historical rate lookup
        const startRateEntry = getApplicableRbiRate(formatIsoDateUtc(currentDate));
        const endRateEntry = getApplicableRbiRate(formatIsoDateUtc(periodEnd));

        if (startRateEntry.bankRate === endRateEntry.bankRate) {
          // Single rate across entire rest
          appliedPeriodBankRate = startRateEntry.bankRate;
          appliedPeriodStatutoryRate = startRateEntry.statutoryRate;
          rateDesc = `${appliedPeriodStatutoryRate.toFixed(2)}% p.a. (3x ${appliedPeriodBankRate.toFixed(2)}%)`;
          if (appliedPeriodBankRate !== baseRateEntry.bankRate) isHistoricalMultiRate = true;

          const periodFraction = daysInPeriod / daysInMonth;
          const monthlyRate = (appliedPeriodStatutoryRate / 100) / 12;
          interestThisPeriod = runningPrincipal * monthlyRate * periodFraction;
        } else {
          // Mid-rest rate transition detected
          isHistoricalMultiRate = true;
          hasMidRestRateTransition = true;

          if (rateStrategy === 'daily_prorated') {
            isIllustrativeTransition = true;
            // Day-prorated sub-period calculation (Illustrative)
            const transitionDateObj = parseIsoDateUtc(endRateEntry.effectiveFrom);
            const daysSeg1 = getDaysBetween(currentDate, transitionDateObj);
            const daysSeg2 = getDaysBetween(transitionDateObj, periodEnd);

            const rate1Monthly = (startRateEntry.statutoryRate / 100) / 12;
            const rate2Monthly = (endRateEntry.statutoryRate / 100) / 12;

            const intSeg1 = runningPrincipal * rate1Monthly * (daysSeg1 / daysInMonth);
            const intSeg2 = runningPrincipal * rate2Monthly * (daysSeg2 / daysInMonth);

            interestThisPeriod = intSeg1 + intSeg2;
            appliedPeriodBankRate = endRateEntry.bankRate;
            appliedPeriodStatutoryRate = endRateEntry.statutoryRate;
            rateDesc = `Split: ${startRateEntry.statutoryRate}% (${daysSeg1}d) + ${endRateEntry.statutoryRate}% (${daysSeg2}d) [Illustrative]`;
          } else {
            // Rest-anchor rate strategy (Default statutory model)
            appliedPeriodBankRate = startRateEntry.bankRate;
            appliedPeriodStatutoryRate = startRateEntry.statutoryRate;
            rateDesc = `${appliedPeriodStatutoryRate.toFixed(2)}% p.a. (Rest Anchor)`;
            const periodFraction = daysInPeriod / daysInMonth;
            const monthlyRate = (appliedPeriodStatutoryRate / 100) / 12;
            interestThisPeriod = runningPrincipal * monthlyRate * periodFraction;
          }
        }
      }

      runningInterest += interestThisPeriod;
      runningPrincipal = invoiceAmount + runningInterest;
      totalDaysElapsed += daysInPeriod;

      schedule.push({
        month: monthCount,
        periodStart: formatIsoDateUtc(currentDate),
        periodEnd: formatIsoDateUtc(periodEnd),
        daysElapsed: totalDaysElapsed,
        daysInPeriod,
        daysInMonth,
        openingPrincipal: runningPrincipal - interestThisPeriod,
        appliedBankRate: appliedPeriodBankRate,
        appliedStatutoryRate: appliedPeriodStatutoryRate,
        rateDescription: rateDesc,
        interestThisMonth: interestThisPeriod,
        cumulativeInterest: runningInterest,
        totalPayable: runningPrincipal,
        isIllustrativeTransition
      });

      currentDate = new Date(nextMonthRestDate.getTime());
    }

    accruedInterest = runningInterest;
  }

  // Determine calculation methodology status
  let methodologyStatus: MethodologyStatus = 'VERIFIED_SECTION_16_MONTHLY_REST_METHOD';
  let statusDisclaimer: string | undefined = undefined;

  if (rateStrategy === 'daily_prorated' && hasMidRestRateTransition) {
    methodologyStatus = 'ILLUSTRATIVE_METHOD';
    statusDisclaimer = 'Illustrative calculation under Daily-Prorated Rate Strategy — legal treatment of intra-rest rate changes requires verification.';
    warnings.push(statusDisclaimer);
  } else if (rateStrategy === 'daily_prorated') {
    methodologyStatus = 'ILLUSTRATIVE_METHOD';
    statusDisclaimer = 'Illustrative calculation under Daily-Prorated Rate Strategy.';
  }

  if (rawDelivery < EARLIEST_SUPPORTED_MSME_DATE) {
    methodologyStatus = 'LEGAL_VERIFICATION_REQUIRED';
  }

  return {
    principal: invoiceAmount,
    deliveryDate: rawDelivery,
    effectiveAcceptanceDate: effectiveAcceptDateStr,
    acceptanceModality: acceptanceResolution.modality,
    appointedDay: formatIsoDateUtc(appointedDayObj),
    dueDate: formatIsoDateUtc(dueDateObj),
    interestStartDate: formatIsoDateUtc(interestStartDateObj),
    interestStartReason,
    statutoryCapApplied,
    daysDelayed: daysPastDueDate,
    daysPastDueDate,
    interestBearingDays,
    interestAccrualPeriod,
    appliedBankRate: primaryBankRate,
    appliedStatutoryRate: primaryStatutoryRate,
    accruedInterest,
    totalPayable: invoiceAmount + accruedInterest,
    schedule,
    isOverdue,
    methodologyStatus,
    rateAudit: {
      isHistoricalMultiRate,
      strategyUsed: rateStrategy,
      isSubjectToLegalVerification: hasMidRestRateTransition && rateStrategy === 'daily_prorated',
      methodologyStatus,
      statusDisclaimer,
    },
    warnings: [...warnings, ...acceptanceResolution.warnings],
  };
}

// -------------------------------------------------------------
// FORM MSME-1 PENALTY CALCULATOR (Section 405(4), Companies Act)
// -------------------------------------------------------------

export interface Msme1Params {
  halfYear: 'Apr-Sep' | 'Oct-Mar';
  financialYear: string;
  actualFilingDate: string;
  daysDelayed: number;
  officersCount: number;
  isSmallCompany: boolean;
}

export interface Msme1Result {
  dueDate: string;
  daysDelayed: number;
  portalLateFee: number;
  companyPenalty: number;
  officerPenalty: number;
  totalPenaltyExposure: number;
  isSmallCompanyReliefApplied: boolean;
}

export function calculateMsme1Penalty(params: Msme1Params): Msme1Result {
  const {
    halfYear,
    financialYear,
    daysDelayed,
    officersCount,
    isSmallCompany,
  } = params;

  const years = financialYear.split('-');
  const startYear = parseInt(years[0]) || 2025;
  let dueDateStr = '';

  if (halfYear === 'Apr-Sep') {
    dueDateStr = `${startYear}-10-31`;
  } else {
    dueDateStr = `${startYear + 1}-04-30`;
  }

  // Section 405(4) of Companies Act, 2013 (Amended):
  // Company: ₹20,000 fixed + ₹1,000 per day continuing -> max ₹3,00,000
  // Officer: ₹20,000 fixed + ₹1,000 per day continuing -> max ₹3,00,000 per officer
  let companyPenalty = 0;
  let officerPenalty = 0;

  if (daysDelayed > 0) {
    companyPenalty = Math.min(20000 + daysDelayed * 1000, 300000);
    officerPenalty = Math.min(20000 + daysDelayed * 1000, 300000) * officersCount;
  }

  // Section 446B relief for Small / OPC
  if (isSmallCompany) {
    companyPenalty = Math.min(Math.floor(companyPenalty / 2), 200000);
    officerPenalty = Math.min(Math.floor(officerPenalty / 2), 100000);
  }

  return {
    dueDate: dueDateStr,
    daysDelayed,
    portalLateFee: 0,
    companyPenalty,
    officerPenalty,
    totalPenaltyExposure: companyPenalty + officerPenalty,
    isSmallCompanyReliefApplied: isSmallCompany,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test-suite adapter exports
// ─────────────────────────────────────────────────────────────────────────────

export interface LLPPenaltyParams {
  contribution: number;
  delayDays: number;
  isSmallLLP: boolean;
  form: string;
}

export function calculateLLPPenalty(params: LLPPenaltyParams) {
  const res = calculateLlpFee({
    llpType: params.isSmallLLP ? 'Small' : 'Regular',
    contribution: params.contribution,
    formId: params.form === 'Form 8' ? 'Form-8' : 'Form-11',
    dueDate: '',
    actualDate: '',
    daysDelayed: params.delayDays,
    dpCount: 2,
  });
  return {
    normalFee: res.normalFee,
    additionalFee: res.lateFee,
    total: res.totalPayable,
    llpPenalty: res.llpPenalty,
    dpPenalty: res.dpPenalty,
    totalPenaltyExposure: res.totalPenaltyExposure,
  };
}

export interface MSMEInterestTestParams {
  invoiceAmount: number;
  acceptanceDate: Date;
  paymentDate: Date;
  writtenAgreement: boolean;
  agreedDate: Date | null;
  bankRate?: number;
}

export function calculateMSMEInterest(params: MSMEInterestTestParams) {
  const res = calculateMsmeInterest({
    invoiceAmount: params.invoiceAmount,
    deliveryDate: params.acceptanceDate.toISOString().split('T')[0],
    hasAgreement: params.writtenAgreement,
    agreedPaymentDate: params.writtenAgreement && params.agreedDate ? params.agreedDate.toISOString().split('T')[0] : '',
    actualPaymentDate: params.paymentDate.toISOString().split('T')[0],
    bankRateOverride: params.bankRate !== undefined ? params.bankRate : null,
  });
  
  let error = undefined;
  if (params.writtenAgreement && params.agreedDate && params.agreedDate < params.acceptanceDate) {
    error = "Agreed date cannot be before acceptance date";
  }

  return {
    appointedDay: res.appointedDay ? new Date(res.appointedDay) : new Date(),
    dueDate: res.dueDate ? new Date(res.dueDate) : new Date(),
    interest: res.accruedInterest,
    annualRateUsed: res.appliedStatutoryRate,
    daysDelayed: res.daysDelayed,
    statutoryCapApplied: res.statutoryCapApplied,
    error,
  };
}
