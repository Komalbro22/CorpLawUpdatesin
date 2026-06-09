/**
 * ROC Compliance Penalty Calculator Utility Library
 * pure client-side mathematical and date difference calculations
 */

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

  // 1. Normal Filing Fee (based on authorized capital slab)
  let normalFee = 0;
  if (formId === 'DIR-3-KYC') {
    normalFee = 0; // always 0 if on time
  } else {
    if (authorizedCapital <= 100000) {
      normalFee = 200;
    } else if (authorizedCapital <= 500000) {
      normalFee = 300;
    } else if (authorizedCapital <= 2500000) {
      normalFee = 400;
    } else if (authorizedCapital <= 10000000) {
      normalFee = 500;
    } else {
      normalFee = 600;
    }

    // Section 8 company discount: 1/3rd of fee, rounded to nearest 50
    if (companyType === 'Section8') {
      normalFee = Math.round(normalFee / 3 / 50) * 50;
      if (normalFee < 50) normalFee = 50;
    }
  }

  // 2. Late Fee (Additional Fee)
  let lateFee = 0;
  
  // Annual Return / Financial Statement forms & commencement of business (MGT-7, MGT-7A, AOC-4, AOC-4 XBRL, AOC-4 CFS, INC-20A, ADT-1)
  const isAnnualOrFSReturn = [
    'MGT-7',
    'MGT-7A',
    'AOC-4',
    'AOC-4-XBRL',
    'AOC-4-CFS',
    'INC-20A',
    'ADT-1'
  ].includes(formId);

  if (daysDelayed > 0) {
    if (formId === 'DIR-3-KYC') {
      lateFee = 5000; // Flat penalty, no daily rate
    } else if (isAnnualOrFSReturn) {
      lateFee = 100 * daysDelayed; // Flat 100 per day, no cap
    } else {
      // General forms time-multiple slab (DIR-12, MGT-14, PAS-3, INC-22, CHG-1, CHG-4)
      let multiplier = 1;
      if (daysDelayed <= 30) {
        multiplier = 2;
      } else if (daysDelayed <= 60) {
        multiplier = 4;
      } else if (daysDelayed <= 90) {
        multiplier = 6;
      } else if (daysDelayed <= 180) {
        multiplier = 10;
      } else {
        // Beyond 180 days
        multiplier = isRepeatDefault && ['PAS-3', 'INC-22'].includes(formId) ? 18 : 12;
      }
      
      lateFee = normalFee * multiplier;
    }
  }

  // 3. Statutory Penalty (Section 92(5) / 137(3) Adjudication Penalty)
  let companyPenalty = 0;
  let officerPenalty = 0;

  if (daysDelayed > 0) {
    if (formId === 'MGT-7' || formId === 'MGT-7A') {
      // Section 92(5) - MGT-7
      // Company: 10,000 fixed + 100/day continuing -> max 2,00,000
      // Officer: 10,000 fixed + 100/day continuing -> max 50,000 per officer
      companyPenalty = Math.min(10000 + daysDelayed * 100, 200000);
      officerPenalty = Math.min(10000 + daysDelayed * 100, 50000) * officersCount;
    } else if (['AOC-4', 'AOC-4-XBRL', 'AOC-4-CFS'].includes(formId)) {
      // Section 137(3) - AOC-4
      // Company: 1,000/day -> max 10,00,000
      // MD/CFO/Directors: 1,000/day -> max 1,00,000 or 5,00,000
      companyPenalty = Math.min(daysDelayed * 1000, 1000000);
      // Let's assume 1 is MD/CFO (max 5L) and others are standard directors (max 1L)
      if (officersCount > 0) {
        const mdCfoPenalty = Math.min(daysDelayed * 1000, 500000);
        const directorsPenalty = Math.min(daysDelayed * 1000, 100000) * Math.max(0, officersCount - 1);
        officerPenalty = mdCfoPenalty + directorsPenalty;
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

  // 1. Normal Filing Fee (Contribution-based)
  let normalFee = 0;
  if (contribution <= 100000) {
    normalFee = 50;
  } else if (contribution <= 500000) {
    normalFee = 100;
  } else if (contribution <= 1000000) {
    normalFee = 150;
  } else if (contribution <= 2500000) {
    normalFee = 200;
  } else if (contribution <= 10000000) {
    normalFee = 400;
  } else {
    normalFee = 600;
  }

  const isSmallLlp = llpType === 'Small';
  if (isSmallLlp) {
    // Small LLP gets a 50% discount on normal filing fees, rounded to nearest 10
    normalFee = Math.round(normalFee * 0.5 / 10) * 10;
    if (normalFee < 50) normalFee = 50;
  }

  // 2. Additional Fee (Late Fee)
  // ₹100 per day, no cap, per form
  const lateFee = daysDelayed > 0 ? 100 * daysDelayed : 0;

  // 3. LLP Statutory Penalty (Section 34(4) / 35(3) of LLP Act)
  // LLP: ₹100/day, no cap
  // Each DP: ₹100/day, no cap
  const llpPenalty = daysDelayed > 0 ? 100 * daysDelayed : 0;
  const dpPenalty = daysDelayed > 0 ? 100 * daysDelayed * dpCount : 0;

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

  // Step 1: Find Appointed Day
  // If no written agreement: 15 days from date of acceptance
  // If written agreement exists: Agreed date, but capped at 45 days from acceptance
  let appointedDayObj = new Date(acceptDateObj);
  appointedDayObj.setDate(appointedDayObj.getDate() + 15);

  if (agreedPaymentDate) {
    const agreedDateObj = new Date(agreedPaymentDate);
    if (!isNaN(agreedDateObj.getTime())) {
      // Find diff in days between agreed and acceptance
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

  // Step 2: Overdue days
  const daysDelayed = getDaysBetween(appointedDayObj, actualPaymentDate);
  const isOverdue = daysDelayed > 0;

  // Step 3: Interest Rate = 3x Bank Rate
  const interestRate = bankRate * 3; // e.g. 16.65% p.a.
  const monthlyRate = interestRate / 100 / 12;

  // Step 4: Compounding with monthly rests
  let accruedInterest = 0;
  const schedule: CompoundingScheduleItem[] = [];

  if (isOverdue) {
    const completeMonths = Math.floor(daysDelayed / 30);
    const remainingDays = daysDelayed % 30;

    // Calculate schedule month by month
    let runningPrincipal = invoiceAmount;
    let runningInterest = 0;

    for (let m = 1; m <= completeMonths; m++) {
      const interestThisMonth = runningPrincipal * monthlyRate;
      runningInterest += interestThisMonth;
      runningPrincipal = invoiceAmount + runningInterest; // compound it

      schedule.push({
        month: m,
        daysElapsed: m * 30,
        interestThisMonth,
        cumulativeInterest: runningInterest,
        totalPayable: runningPrincipal,
      });
    }

    // Add remaining days fraction
    if (remainingDays > 0) {
      const interestRemaining = runningPrincipal * (monthlyRate * remainingDays / 30);
      runningInterest += interestRemaining;
      runningPrincipal = invoiceAmount + runningInterest;

      schedule.push({
        month: completeMonths + 1,
        daysElapsed: daysDelayed,
        interestThisMonth: interestRemaining,
        cumulativeInterest: runningInterest,
        totalPayable: runningPrincipal,
      });
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
