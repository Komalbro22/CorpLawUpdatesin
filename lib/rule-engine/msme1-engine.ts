/**
 * MSME Form 1 Statutory Rule Engine
 * 
 * Verified against:
 * - Section 405 of the Companies Act, 2013 & Section 405(4) Adjudication Framework
 * - Specified Companies (Furnishing of Information about Payment to Micro and Small Enterprise Suppliers) Order, 2019
 * - MSMED Act, 2006 (Sections 15, 16, 18, 19, 22, 23, 24)
 * - Section 43B(h) Income Tax Act, 1961 (renumbered Sec 37(2)(g) from TY 2026-27)
 * - RBI Bank Rate (5.50% -> 3× Bank Rate = 16.50% p.a. compound monthly)
 * - MCA V3 Portal 4-category reporting architecture
 * - Real ROC Orders: Natrinai Ventures Ltd (₹9L), Samsung R&D (~₹11.67L)
 */

export type MsmeHalfYear = 'Apr-Sep' | 'Oct-Mar';

export type BuyerEntityType = 
  | 'private_limited'
  | 'public_limited'
  | 'opc'
  | 'section_8'
  | 'small_company'
  | 'producer_company'
  | 'llp'
  | 'partnership_proprietorship';

export type SupplierType =
  | 'micro'
  | 'small'
  | 'medium'
  | 'large'
  | 'trader';

export interface MsmeTransactionSummary {
  // V3 4-Category transaction breakdown
  paidWithin45Days: number;       // Category 1: Paid on time during half-year
  paidAfter45Days: number;        // Category 2: Paid late during half-year (V3 Trigger)
  outstandingWithin45Days: number; // Category 3: Outstanding at period end <= 45 days
  outstandingOver45Days: number;   // Category 4: Outstanding at period end > 45 days (V2+V3 Trigger)
}

export interface Msme1CalculationParams {
  halfYear: MsmeHalfYear;
  financialYear: string; // e.g. "2026-2027" or "2025-2026"
  buyerType: BuyerEntityType;
  numOfficers: number;
  actualFilingDate?: string; // YYYY-MM-DD
  manualDelayDays?: number;
  // Financial exposure parameters
  delayedPrincipalAmount?: number; // Total amount delayed beyond 45 days
  averageDelayDaysForInvoices?: number; // Average delay in paying vendors
  transactions?: MsmeTransactionSummary;
  supplierType?: SupplierType;
  corporateTaxRate?: number; // default 25.17% (Section 115BAA)
}

export interface Msme1CalculationResult {
  halfYear: MsmeHalfYear;
  financialYear: string;
  dueDateStr: string;
  dueDateFormatted: string;
  daysDelayed: number;
  isDelayed: boolean;
  
  // MCA Portal Fee
  portalNormalFee: number;
  portalLateFee: number;
  portalTotalPayable: number;

  // Section 405(4) ROC Adjudication Exposure
  basePenaltyPerEntity: number;
  perDayPenaltyRate: number;
  companyPenalty: number;
  companyPenaltyCap: number;
  officerPenaltyPerOfficer: number;
  officerPenaltyCap: number;
  totalOfficersPenalty: number;
  numOfficers: number;
  totalSection405Exposure: number;
  smallCompanyReliefExposure: number; // Informative Section 446B 50% comparison

  // Layer 2: MSMED Act Section 16 Compound Interest
  rbiBankRate: number;
  msmeInterestRate: number; // 3x Bank Rate = 16.50%
  delayedPrincipal: number;
  penalInterestPayable: number;
  interestTaxDeductible: boolean; // false under Sec 23

  // Layer 3: Income Tax Section 43B(h) Disallowance
  principalDisallowed: number;
  totalTaxDisallowed: number; // Principal + Interest
  estimatedTaxCashOutflow: number; // Disallowance * Tax Rate

  // Applicability & V3 Status
  isBuyerSubjectToSection405: boolean;
  buyerExemptionReason?: string;
  isSupplierCovered: boolean;
  supplierExemptionReason?: string;
  isFilingTriggeredOnV3: boolean;
  v3TriggerReason: string;
  
  // Risk Rating & Checklist
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyStatutoryDeadlines: {
    periodEnd: string;
    filingDeadline: string;
    nextFilingDeadline: string;
  };
  complianceRoadmap: {
    step: number;
    title: string;
    description: string;
    mandatory: boolean;
  }[];
}

export const CURRENT_RBI_BANK_RATE = 5.50; // RBI Press Release MPC Resolution Aug 2026
export const MSME_PENAL_INTEREST_RATE = 3 * CURRENT_RBI_BANK_RATE; // 16.50% p.a.
export const STANDARD_CORPORATE_TAX_RATE = 0.2517; // 25.17% (Base 22% + 10% Surcharge + 4% Cess)

/**
 * Returns statutory due date for MSME Form 1
 * April 1 – September 30 -> 31 October
 * October 1 – March 31 -> 30 April
 */
export function getMsme1DueDate(halfYear: MsmeHalfYear, financialYear: string): { dueDateStr: string; dueDateFormatted: string; periodEnd: string } {
  const parts = financialYear.split('-');
  const startYear = parseInt(parts[0], 10) || 2026;
  
  if (halfYear === 'Apr-Sep') {
    return {
      dueDateStr: `${startYear}-10-31`,
      dueDateFormatted: `31 October ${startYear}`,
      periodEnd: `30 September ${startYear}`
    };
  } else {
    const nextYear = startYear + 1;
    return {
      dueDateStr: `${nextYear}-04-30`,
      dueDateFormatted: `30 April ${nextYear}`,
      periodEnd: `31 March ${nextYear}`
    };
  }
}

/**
 * Computes compound interest under Section 16 of MSMED Act:
 * Compound interest with monthly rests at 3× RBI Bank Rate (16.50% p.a.)
 */
export function calculateSection16Interest(principal: number, delayDays: number, annualRate: number = MSME_PENAL_INTEREST_RATE): number {
  if (principal <= 0 || delayDays <= 0) return 0;
  
  // Compounded with monthly rests: n = delayDays / 30.4167
  const months = delayDays / 30.4166667;
  const monthlyRate = (annualRate / 100) / 12;
  
  // A = P * (1 + r)^n
  const amount = principal * Math.pow(1 + monthlyRate, months);
  const interest = amount - principal;
  return Math.round(interest);
}

/**
 * Evaluates buyer entity and supplier applicability
 */
export function evaluateMsmeApplicability(buyerType: BuyerEntityType, supplierType?: SupplierType): {
  isBuyerCovered: boolean;
  buyerReason?: string;
  isSupplierCovered: boolean;
  supplierReason?: string;
} {
  // LLPs and non-corporate entities are not "companies" under the Companies Act 2013
  if (buyerType === 'llp') {
    return {
      isBuyerCovered: false,
      buyerReason: 'Limited Liability Partnerships (LLPs) are governed by the LLP Act, 2008 and are not "companies" under Section 405 of the Companies Act, 2013.',
      isSupplierCovered: true
    };
  }
  
  if (buyerType === 'partnership_proprietorship') {
    return {
      isBuyerCovered: false,
      buyerReason: 'Sole Proprietorships and Partnership Firms are not companies and are strictly exempt from Section 405 filing obligations.',
      isSupplierCovered: true
    };
  }

  // Supplier checks
  if (supplierType === 'medium') {
    return {
      isBuyerCovered: true,
      isSupplierCovered: false,
      supplierReason: 'Medium Enterprises (investment ≤ ₹50 Cr, turnover ≤ ₹250 Cr) are NOT Micro or Small enterprises. Outstanding dues to Medium vendors do NOT trigger Form MSME-1.'
    };
  }

  if (supplierType === 'large') {
    return {
      isBuyerCovered: true,
      isSupplierCovered: false,
      supplierReason: 'Large Enterprises are not MSEs and are completely excluded from MSME-1 reporting.'
    };
  }

  if (supplierType === 'trader') {
    return {
      isBuyerCovered: true,
      isSupplierCovered: false,
      supplierReason: 'Retail and Wholesale Traders with Udyam registration (OM 02.07.2021) are restricted from Chapter V recovery benefits and do not qualify for MSME-1 mandatory reporting.'
    };
  }

  return {
    isBuyerCovered: true,
    isSupplierCovered: true
  };
}

/**
 * Main calculation engine for MSME Form 1
 */
export function calculateMsme1Compliance(params: Msme1CalculationParams): Msme1CalculationResult {
  const {
    halfYear,
    financialYear,
    buyerType,
    numOfficers = 2,
    actualFilingDate,
    manualDelayDays,
    delayedPrincipalAmount = 0,
    averageDelayDaysForInvoices = 60,
    transactions,
    supplierType = 'micro',
    corporateTaxRate = STANDARD_CORPORATE_TAX_RATE
  } = params;

  const { dueDateStr, dueDateFormatted, periodEnd } = getMsme1DueDate(halfYear, financialYear);

  // Determine delay days
  let daysDelayed = 0;
  if (manualDelayDays !== undefined) {
    daysDelayed = Math.max(0, manualDelayDays);
  } else if (actualFilingDate) {
    const due = new Date(dueDateStr);
    const filing = new Date(actualFilingDate);
    const diffTime = filing.getTime() - due.getTime();
    daysDelayed = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const isDelayed = daysDelayed > 0;

  // Section 405(4) Adjudication Penalty
  // Company: ₹20,000 + ₹1,000/day (cap: ₹3,00,000)
  // Each Officer: ₹20,000 + ₹1,000/day (cap: ₹3,00,000)
  const basePenaltyPerEntity = isDelayed ? 20000 : 0;
  const perDayPenaltyRate = 1000;
  const companyPenaltyCap = 300000;
  const officerPenaltyCap = 300000;

  let companyPenalty = 0;
  let officerPenaltyPerOfficer = 0;

  if (isDelayed) {
    companyPenalty = Math.min(basePenaltyPerEntity + (daysDelayed * perDayPenaltyRate), companyPenaltyCap);
    officerPenaltyPerOfficer = Math.min(basePenaltyPerEntity + (daysDelayed * perDayPenaltyRate), officerPenaltyCap);
  }

  const safeOfficerCount = Math.max(0, numOfficers);
  const totalOfficersPenalty = officerPenaltyPerOfficer * safeOfficerCount;
  const totalSection405Exposure = companyPenalty + totalOfficersPenalty;

  // Informative Section 446B 50% comparison (max ₹2L for company, ₹1L for officer)
  const smallCoCompany = Math.min(Math.floor(companyPenalty / 2), 200000);
  const smallCoOfficer = Math.min(Math.floor(officerPenaltyPerOfficer / 2), 100000) * safeOfficerCount;
  const smallCompanyReliefExposure = smallCoCompany + smallCoOfficer;

  // Layer 2: Section 16 MSMED Act Interest
  const effectiveInvoiceDelay = Math.max(0, averageDelayDaysForInvoices);
  const penalInterestPayable = calculateSection16Interest(
    delayedPrincipalAmount,
    effectiveInvoiceDelay,
    MSME_PENAL_INTEREST_RATE
  );

  // Layer 3: Section 43B(h) / Section 37(2)(g) Disallowance
  const principalDisallowed = delayedPrincipalAmount;
  const totalTaxDisallowed = principalDisallowed + penalInterestPayable;
  const estimatedTaxCashOutflow = Math.round(totalTaxDisallowed * corporateTaxRate);

  // Applicability
  const applicability = evaluateMsmeApplicability(buyerType, supplierType);

  // V3 Trigger Detection
  let isFilingTriggeredOnV3 = false;
  let v3TriggerReason = 'No delayed payments recorded. No MSME-1 filing required.';

  if (transactions) {
    if (transactions.outstandingOver45Days > 0) {
      isFilingTriggeredOnV3 = true;
      v3TriggerReason = `Triggered: ₹${transactions.outstandingOver45Days.toLocaleString('en-IN')} remains outstanding beyond 45 days at half-year end.`;
    } else if (transactions.paidAfter45Days > 0) {
      isFilingTriggeredOnV3 = true;
      v3TriggerReason = `Triggered (V3 Trap): Payments of ₹${transactions.paidAfter45Days.toLocaleString('en-IN')} exceeded 45 days during the half-year, even though cleared before period end.`;
    }
  } else if (delayedPrincipalAmount > 0) {
    isFilingTriggeredOnV3 = true;
    v3TriggerReason = `Triggered: Outstanding delayed MSME dues of ₹${delayedPrincipalAmount.toLocaleString('en-IN')} exceed statutory 45-day credit period.`;
  }

  // Risk Rating
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (!applicability.isBuyerCovered) {
    riskLevel = 'LOW';
  } else if (daysDelayed > 90 || totalSection405Exposure >= 300000) {
    riskLevel = 'CRITICAL';
  } else if (daysDelayed > 30 || totalSection405Exposure >= 100000) {
    riskLevel = 'HIGH';
  } else if (daysDelayed > 0 || isFilingTriggeredOnV3) {
    riskLevel = 'MEDIUM';
  }

  // Compliance Roadmap
  const complianceRoadmap = [
    {
      step: 1,
      title: 'Vendor Master Verification & Udyam Audit',
      description: 'Audit vendor list for valid Udyam Registration numbers (UDYAM-XX-00-0000000). Filter out Medium enterprises and wholesale/retail traders.',
      mandatory: true
    },
    {
      step: 2,
      title: 'Invoice Ageing & Acceptance Date Anchor',
      description: 'Calculate 45-day window from the date of physical delivery/acceptance (or 15 days if no written agreement exists). Backdating is strictly blocked.',
      mandatory: true
    },
    {
      step: 3,
      title: 'Reconciliation of V3 4-Category Data',
      description: 'Compile data across: (1) Paid <= 45d, (2) Paid > 45d, (3) Outstanding <= 45d, and (4) Outstanding > 45d along with specific reasons for delay.',
      mandatory: true
    },
    {
      step: 4,
      title: 'Calculate Section 16 Interest & Section 43B(h) Provision',
      description: `Provide for compound interest at 16.50% p.a. (3× 5.50% RBI Bank Rate) with monthly rests and mark non-deductible in tax audit return.`,
      mandatory: delayedPrincipalAmount > 0
    },
    {
      step: 5,
      title: 'MCA V3 Portal Submission with Director DSC',
      description: 'Log into MCA V3 portal under Company e-Filing -> MSME Form 1. Submit with authorized Director DSC. No PCS certification is required (₹0 portal fee).',
      mandatory: isFilingTriggeredOnV3
    },
    {
      step: 6,
      title: 'Reconcile with Financial Statement Disclosures',
      description: 'Ensure MSME dues reported in Form MSME-1 match Note disclosures in the audited balance sheet (Schedule III) to prevent automated ROC scrutiny mismatch.',
      mandatory: true
    }
  ];

  return {
    halfYear,
    financialYear,
    dueDateStr,
    dueDateFormatted,
    daysDelayed,
    isDelayed,
    portalNormalFee: 0,
    portalLateFee: 0,
    portalTotalPayable: 0,
    basePenaltyPerEntity,
    perDayPenaltyRate,
    companyPenalty,
    companyPenaltyCap,
    officerPenaltyPerOfficer,
    officerPenaltyCap,
    totalOfficersPenalty,
    numOfficers: safeOfficerCount,
    totalSection405Exposure,
    smallCompanyReliefExposure,
    rbiBankRate: CURRENT_RBI_BANK_RATE,
    msmeInterestRate: MSME_PENAL_INTEREST_RATE,
    delayedPrincipal: delayedPrincipalAmount,
    penalInterestPayable,
    interestTaxDeductible: false,
    principalDisallowed,
    totalTaxDisallowed,
    estimatedTaxCashOutflow,
    isBuyerSubjectToSection405: applicability.isBuyerCovered,
    buyerExemptionReason: applicability.buyerReason,
    isSupplierCovered: applicability.isSupplierCovered,
    supplierExemptionReason: applicability.supplierReason,
    isFilingTriggeredOnV3,
    v3TriggerReason,
    riskLevel,
    keyStatutoryDeadlines: {
      periodEnd,
      filingDeadline: dueDateFormatted,
      nextFilingDeadline: halfYear === 'Apr-Sep' ? `30 April ${parseInt(financialYear.split('-')[0]) + 1}` : `31 October ${financialYear.split('-')[1] || '2027'}`
    },
    complianceRoadmap
  };
}
