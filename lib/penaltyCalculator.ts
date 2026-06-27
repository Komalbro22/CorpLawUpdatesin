/**
 * ROC Compliance Penalty Calculator Utility Library
 * pure client-side mathematical and date difference calculations
 */
import { getNormalFilingFee, getLLPNormalFee, getLLPAdditionalFee } from './fee-calculator-core';

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
    'DPT-3': { companyBase: 5000, companyPerDay: 500, officerBase: 5000, officerPerDay: 500 },
    'BEN-2': { companyBase: 1000000, companyPerDay: 1000, companyMax: 5000000, officerBase: 1000000, officerPerDay: 1000, officerMax: 5000000 },
    'INC-20A': { companyBase: 50000, companyMax: 50000, officerBase: 1000, officerPerDay: 1000, officerMax: 100000 },
    'INC-22': { companyBase: 1000, companyPerDay: 1000, companyMax: 100000, officerBase: 1000, officerPerDay: 1000, officerMax: 100000 },
    'PAS-3': { companyBase: 1000, companyPerDay: 1000, companyMax: 100000, officerBase: 1000, officerPerDay: 1000, officerMax: 100000 },
    'MGT-14': { companyBase: 100000, companyPerDay: 500, companyMax: 2500000, officerBase: 50000, officerPerDay: 500, officerMax: 500000 },
    'MSME-1': { companyBase: 25000, companyPerDay: 500, companyMax: 300000, officerBase: 25000, officerPerDay: 500, officerMax: 300000 },
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
      if (rules.companyBase !== undefined || rules.companyPerDay !== undefined) {
        let compPenalty = (rules.companyBase || 0) + (rules.companyPerDay || 0) * daysDelayed;
        if (rules.companyMax !== undefined) {
          compPenalty = Math.min(compPenalty, rules.companyMax);
        }
        companyPenalty = compPenalty;
      }
      if (rules.officerBase !== undefined || rules.officerPerDay !== undefined) {
        let offPenalty = (rules.officerBase || 0) + (rules.officerPerDay || 0) * daysDelayed;
        if (rules.officerMax !== undefined) {
          offPenalty = Math.min(offPenalty, rules.officerMax);
        }
        officerPenalty = offPenalty * officersCount;
      }
    }
  }

  // Section 446B small company / OPC / startup relief (50% penalty reduction)
  const isSmallCompanyReliefApplied = ['Small', 'OPC'].includes(companyType);
  if (isSmallCompanyReliefApplied) {
    companyPenalty = Math.floor(companyPenalty / 2);
    officerPenalty = Math.floor(officerPenalty / 2);
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
// LLP CALCULATOR
// -------------------------------------------------------------

export interface LlpFeeParams {
  llpType: 'Regular' | 'Small';
  contribution: number;
  formId: 'Form-8' | 'Form-11';
  dueDate: string;
  actualDate: string;
  daysDelayed: number;
  dpCount: number;
}

export interface LlpCalculationResult {
  normalFee: number;
  lateFee: number;
  totalPayable: number;
  llpPenalty: number;
  dpPenalty: number;
  totalPenaltyExposure: number;
  isSmallLlp: boolean;
  days: number;
}

export function calculateLlpFee(params: LlpFeeParams): LlpCalculationResult {
  const {
    llpType,
    contribution,
    formId,
    daysDelayed,
    dpCount,
  } = params;

  // 1. Normal Filing Fee (Contribution-based) — same for ALL LLPs including Small LLP.
  // The concession for Small LLPs is only in the additional-fee (late-fee) multipliers.
  const normalFee = getLLPNormalFee(contribution);

  const isSmallLlp = llpType === 'Small';
  // No 50% discount on normal fee — removed per LLP Amendment Rules 2022.

  // 2. Additional Fee (Late Fee)
  // LLP 2nd Amendment Rules, 2022 (effective April 1, 2022) replaced the old flat ₹100/day
  // with a slab-multiplier system based on the normal filing fee and LLP type.
  // Source: Rule 36 & Annexure-A, LLP Rules 2009 as amended by LLP 2nd Amendment Rules 2022.
  // 2. Additional Fee (Late Fee) — LLP 2nd Amendment Rules 2022 (effective 01.04.2022)
  // Source: Rule 36 & Annexure-A, LLP Rules 2009 as amended by LLP 2nd Amendment Rules 2022.
  // Beyond 360 days: hard cap (25× Small LLP / 50× other LLP). NOT a continuing per-day amount.
  let lateFee = 0;
  if (daysDelayed > 0) {
    lateFee = getLLPAdditionalFee(daysDelayed, normalFee, isSmallLlp);
  }

  // 3. LLP Statutory Adjudication Penalty (ROC passes formal order under Sec 454)
  // LLP Amendment Act 2021, effective April 1, 2022 — Section 34(4) / 35(3):
  // LLP entity:         ₹100/day, maximum cap ₹1,00,000
  // Each Designated Partner: ₹100/day, maximum cap ₹50,000 per DP
  const llpPenalty = daysDelayed > 0 ? Math.min(100 * daysDelayed, 100000) : 0;
  const dpPenalty  = daysDelayed > 0 ? Math.min(100 * daysDelayed, 50000) * dpCount : 0;

  return {
    normalFee,
    lateFee,
    totalPayable: normalFee + lateFee,
    llpPenalty,
    dpPenalty,
    totalPenaltyExposure: llpPenalty + dpPenalty,
    isSmallLlp,
    days: daysDelayed,
  };
}

// -------------------------------------------------------------
// MSME CALCULATORS
// -------------------------------------------------------------

export interface MsmeInterestParams {
  invoiceAmount: number;
  acceptanceDate: string;
  agreedPaymentDate: string; // optional
  actualPaymentDate: string;
  bankRate: number; // default 5.55
}

export interface CompoundingScheduleItem {
  month: number;
  daysElapsed: number;
  interestThisMonth: number;
  cumulativeInterest: number;
  totalPayable: number;
}

export interface MsmeInterestResult {
  principal: number;
  appointedDay: string;
  daysDelayed: number;
  interestRate: number; // 3x Bank Rate
  accruedInterest: number;
  totalPayable: number;
  schedule: CompoundingScheduleItem[];
  isOverdue: boolean;
}

export function calculateMsmeInterest(params: MsmeInterestParams): MsmeInterestResult {
  const {
    invoiceAmount,
    acceptanceDate,
    agreedPaymentDate,
    actualPaymentDate,
    bankRate,
  } = params;

  const acceptDateObj = new Date(acceptanceDate);
  if (isNaN(acceptDateObj.getTime())) {
    return {
      principal: invoiceAmount,
      appointedDay: '',
      daysDelayed: 0,
      interestRate: bankRate * 3,
      accruedInterest: 0,
      totalPayable: invoiceAmount,
      schedule: [],
      isOverdue: false,
    };
  }

  // Step 1: Find Appointed Day (MSMED Act Section 2(b))
  // If no written agreement: acceptanceDate + 15 days (acceptance = day 0)
  // If written agreement: agreed date, but must not exceed 45 days from acceptance.
  // Validation: agreed date cannot be before acceptance date.
  let appointedDayObj = new Date(acceptDateObj);
  appointedDayObj.setDate(appointedDayObj.getDate() + 15); // default: +15 days

  if (agreedPaymentDate) {
    const agreedDateObj = new Date(agreedPaymentDate);
    if (!isNaN(agreedDateObj.getTime())) {
      // Validate: agreed date must not be before acceptance date
      if (agreedDateObj < acceptDateObj) {
        // Invalid — fall back to 15-day default (caller should display an error)
        appointedDayObj = new Date(acceptDateObj);
        appointedDayObj.setDate(appointedDayObj.getDate() + 15);
      } else {
        const diffDays = getDaysBetween(acceptanceDate, agreedPaymentDate);
        if (diffDays > 45) {
          // Cap at 45 days from acceptance
          appointedDayObj = new Date(acceptDateObj);
          appointedDayObj.setDate(appointedDayObj.getDate() + 45);
        } else {
          appointedDayObj = agreedDateObj;
        }
      }
    }
  }

  // Step 2: Overdue days
  const daysDelayed = getDaysBetween(appointedDayObj, actualPaymentDate);
  const isOverdue = daysDelayed > 0;

  // Step 3: Interest Rate = 3× Bank Rate (MSMED Act Section 16)
  const interestRate = bankRate * 3;

  // Step 4: Compounding with actual calendar monthly rests
  // Each "month" ends on the same calendar day of the following month.
  let accruedInterest = 0;
  const schedule: CompoundingScheduleItem[] = [];

  if (isOverdue) {
    const actualPayObj = new Date(actualPaymentDate);
    const annualRate = interestRate / 100;
    let runningPrincipal = invoiceAmount;
    let runningInterest = 0;
    let currentDate = new Date(appointedDayObj);
    let monthCount = 0;
    let totalDaysElapsed = 0;

    while (currentDate < actualPayObj) {
      // Advance to end of this calendar month
      const nextMonthDate = new Date(currentDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

      const periodEnd = nextMonthDate < actualPayObj ? nextMonthDate : actualPayObj;
      const daysInPeriod = getDaysBetween(currentDate, periodEnd);
      if (daysInPeriod <= 0) break;

      // Days in the current calendar month (from currentDate)
      const daysInMonth = getDaysBetween(currentDate, nextMonthDate);
      const periodFraction = daysInPeriod / daysInMonth;
      const monthlyRate = annualRate / 12;
      const interestThisPeriod = runningPrincipal * monthlyRate * periodFraction;

      runningInterest += interestThisPeriod;
      runningPrincipal = invoiceAmount + runningInterest;
      totalDaysElapsed += daysInPeriod;
      monthCount++;

      schedule.push({
        month: monthCount,
        daysElapsed: totalDaysElapsed,
        interestThisMonth: interestThisPeriod,
        cumulativeInterest: runningInterest,
        totalPayable: runningPrincipal,
      });

      currentDate = nextMonthDate;
      if (schedule.length >= 60) break; // safety cap at 60 periods
    }

    accruedInterest = runningInterest;
  }

  return {
    principal: invoiceAmount,
    appointedDay: appointedDayObj.toISOString().split('T')[0],
    daysDelayed,
    interestRate,
    accruedInterest,
    totalPayable: invoiceAmount + accruedInterest,
    schedule: schedule.slice(0, 12), // cap at max 12 items for UI representation
    isOverdue,
  };
}

// MSME-1 calculator
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

  // Determine Due Date
  // Apr-Sep half-year: due Oct 31 of that year
  // Oct-Mar half-year: due Apr 30 of next year
  // Extract year from financialYear (e.g., "2025-26" -> 2025 or 2026)
  const years = financialYear.split('-');
  const startYear = parseInt(years[0]) || 2025;
  let dueDateStr = '';

  if (halfYear === 'Apr-Sep') {
    dueDateStr = `${startYear}-10-31`;
  } else {
    dueDateStr = `${startYear + 1}-04-30`;
  }

  // Section 405(4) of Companies Act:
  // Company: 20,000 fixed + 1,000 per day continuing -> max 3,00,000
  // Officer: 20,000 fixed + 1,000 per day continuing -> max 3,00,000 per officer
  let companyPenalty = 0;
  let officerPenalty = 0;

  if (daysDelayed > 0) {
    companyPenalty = Math.min(20000 + daysDelayed * 1000, 300000);
    officerPenalty = Math.min(20000 + daysDelayed * 1000, 300000) * officersCount;
  }

  // Section 446B relief
  if (isSmallCompany) {
    companyPenalty = Math.floor(companyPenalty / 2);
    officerPenalty = Math.floor(officerPenalty / 2);
  }

  return {
    dueDate: dueDateStr,
    daysDelayed,
    portalLateFee: 0, // always 0
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
    acceptanceDate: params.acceptanceDate.toISOString(),
    agreedPaymentDate: params.writtenAgreement && params.agreedDate ? params.agreedDate.toISOString() : '',
    actualPaymentDate: params.paymentDate.toISOString(),
    bankRate: params.bankRate ?? 5.5,
  });
  
  let error = undefined;
  if (params.writtenAgreement && params.agreedDate && params.agreedDate < params.acceptanceDate) {
    error = "Agreed date cannot be before acceptance date";
  }

  return {
    appointedDay: res.appointedDay ? new Date(res.appointedDay) : new Date(),
    interest: res.accruedInterest,
    annualRateUsed: res.interestRate,
    error,
  };
}
