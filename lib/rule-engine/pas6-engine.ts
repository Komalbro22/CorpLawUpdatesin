/**
 * Form PAS-6 (Reconciliation of Share Capital Audit Report) Statutory Rule Engine
 *
 * Governing Legal Framework:
 * - Section 29, Companies Act, 2013 (Demat mandate)
 * - Rule 9A, Companies (Prospectus and Allotment of Securities) Rules, 2014 (Unlisted Public Companies)
 * - Rule 9B, Companies (Prospectus and Allotment of Securities) Rules, 2014 (Non-Small Private Companies)
 * - G.S.R. 376(E) dated 22 May 2019 (Form PAS-6 introduced, effective 30 Sep 2019)
 * - G.S.R. 880(E) dated 1 Dec 2025 (Small company threshold revised: Paid-up capital <= 10 Cr, Turnover <= 100 Cr)
 * - Companies (Registration Offices and Fees) Rules, 2014 (Table A normal fee & Table B multiplier late fee)
 * - Section 450, Companies Act, 2013 (General Civil Adjudication Penalty for non-filing)
 * - Section 446B, Companies Act, 2013 (50% Concessional Penalty for Startups & Small Companies)
 */

export type HalfYearPeriod = 'apr_sep' | 'oct_mar';

export type CompanyClassification =
  | 'unlisted_public'
  | 'non_small_private'
  | 'section_8'
  | 'holding_subsidiary'
  | 'producer'
  | 'startup'
  | 'small_company'
  | 'nidhi'
  | 'govt_company'
  | 'wholly_owned_sub';

export interface Pas6DelaySlab {
  minDays: number;
  maxDays: number;
  multiplier: number;
  label: string;
}

export const PAS6_DELAY_SLABS: Pas6DelaySlab[] = [
  { minDays: 0, maxDays: 0, multiplier: 0, label: 'On Time (Within 60 days)' },
  { minDays: 1, maxDays: 30, multiplier: 2, label: 'Up to 30 days (2x normal fee)' },
  { minDays: 31, maxDays: 60, multiplier: 4, label: '31 to 60 days (4x normal fee)' },
  { minDays: 61, maxDays: 90, multiplier: 6, label: '61 to 90 days (6x normal fee)' },
  { minDays: 91, maxDays: 180, multiplier: 10, label: '91 to 180 days (10x normal fee)' },
  { minDays: 181, maxDays: Infinity, multiplier: 12, label: 'Beyond 180 days (12x normal fee)' }
];

export interface Pas6ComplianceMilestone {
  step: number;
  action: string;
  deadline: string;
  statutorySection: string;
  description: string;
  isCritical: boolean;
}
export type ComplianceMilestone = Pas6ComplianceMilestone;

export const PAS6_COMPLIANCE_ROADMAP: ComplianceMilestone[] = [
  {
    step: 1,
    action: 'Obtain ISIN from NSDL & CDSL',
    deadline: '4-8 weeks prior to first filing',
    statutorySection: 'Rule 9A(4) & Rule 9B(3)',
    description: 'Appoint a registered Registrar and Transfer Agent (RTA) and obtain 12-digit ISIN for each class of security (Equity, Preference).',
    isCritical: true
  },
  {
    step: 2,
    action: 'Dematerialise Promoter & Director Holdings',
    deadline: 'Before any future issue/transfer',
    statutorySection: 'Rule 9A(4) & Rule 9B(4)',
    description: 'Promoters, directors, and Key Managerial Personnel (KMPs) must hold 100% of their securities in demat form before company issues new shares or buybacks.',
    isCritical: true
  },
  {
    step: 3,
    action: 'Reconcile Depository & Physical Records',
    deadline: 'Half-year end (30 Sep / 31 Mar)',
    statutorySection: 'Rule 9A(8) & Rule 9B(5)',
    description: 'Audit total issued shares against combined balances of CDSL, NSDL, and physical shares. Any mismatch must be reported immediately to depositories.',
    isCritical: true
  },
  {
    step: 4,
    action: 'Audit Certification by Practising CS / CA',
    deadline: 'Within 60 days of half-year end',
    statutorySection: 'Rule 9A(8) Proviso',
    description: 'Form PAS-6 must be digitally certified with DSC by an independent Practising Company Secretary (PCS) or Practising Chartered Accountant (PCA).',
    isCritical: true
  },
  {
    step: 5,
    action: 'Submit e-Form PAS-6 on MCA V3 Portal',
    deadline: '29 Nov (H1) / 30 May (H2)',
    statutorySection: 'Rule 9A(8) read with Section 29',
    description: 'File form on MCA V3 with normal government fee. Straight-Through Processing (STP) auto-approves compliant filings with SRN generation.',
    isCritical: true
  }
];

export interface Pas6CalculationParams {
  reportingYear: number;
  period: HalfYearPeriod;
  filingDate: string; // YYYY-MM-DD
  authorizedCapital: number;
  issuedSharesCount?: number;
  cdslDematShares?: number;
  nsdlDematShares?: number;
  physicalShares?: number;
  numberOfOfficers?: number;
  companyType?: CompanyClassification;
  isDpiitStartup?: boolean;
}

export interface Pas6CalculationResult {
  reportingYear: number;
  period: HalfYearPeriod;
  periodLabel: string;
  statutoryDueDate: string;
  filingDate: string;
  daysOfDelay: number;
  isDelay: boolean;
  delaySlabLabel: string;
  companyType: CompanyClassification;
  authorizedCapital: number;
  isExempt: boolean;
  exemptionReason?: string;
  
  // Normal & Late Fees
  normalFee: number;
  lateMultiplier: number;
  additionalFee: number;
  totalMcaFee: number;
  
  // Adjudication Penalties (Section 450)
  numberOfOfficers: number;
  companyAdjudicationPenalty: number;
  officerPenaltyPerOfficer: number;
  totalOfficerPenalty: number;
  totalAdjudicationExposure: number;
  totalStatutoryExposure: number;
  isSection446BApplied: boolean;
  
  // Share Reconciliation
  reconciliation: {
    issuedShares: number;
    totalReconciledShares: number;
    cdslShares: number;
    nsdlShares: number;
    physicalShares: number;
    dematPercentage: number;
    physicalPercentage: number;
    hasMismatch: boolean;
    difference: number;
  };
  
  // Itemized breakdown
  breakdown: Array<{
    name: string;
    category: 'MCA Government Fee' | 'Civil Adjudication Penalty' | 'Dematerialisation Reconciliation';
    amount: number;
    basis: string;
    isWaived?: boolean;
  }>;
  
  warnings: string[];
  roadmap: ComplianceMilestone[];
}

/**
 * Computes statutory due date for PAS-6:
 * - H1 (April 1 to September 30): 60 days from 30 Sep = 29 November
 * - H2 (October 1 to March 31): 60 days from 31 Mar = 30 May
 */
export function getPas6DueDate(year: number, period: HalfYearPeriod): string {
  if (period === 'apr_sep') {
    return `${year}-11-29`;
  } else {
    // H2 ends March 31 of year + 1
    return `${year + 1}-05-30`;
  }
}

/**
 * Normal filing fee based on Table A, Items 5 & 6, Companies (Registration Offices and Fees) Rules, 2014.
 */
export function getPas6NormalFee(capital: number): number {
  if (capital < 0) return 0;
  if (capital < 100000) return 200;
  if (capital < 500000) return 300;
  if (capital < 2500000) return 400;
  if (capital < 10000000) return 500;
  return 600;
}

/**
 * Table B multiplier based on days of delay.
 */
export function getPas6LateMultiplier(delayDays: number): { multiplier: number; label: string } {
  if (delayDays <= 0) return { multiplier: 0, label: 'On Time' };
  for (const slab of PAS6_DELAY_SLABS) {
    if (delayDays >= slab.minDays && delayDays <= slab.maxDays) {
      return { multiplier: slab.multiplier, label: slab.label };
    }
  }
  return { multiplier: 12, label: 'Beyond 180 days (12x normal fee)' };
}

/**
 * Evaluate whether an entity is exempt from PAS-6.
 */
export function evaluatePas6Exemption(
  companyType: CompanyClassification,
  capital: number
): { isExempt: boolean; reason?: string } {
  switch (companyType) {
    case 'small_company':
      return {
        isExempt: true,
        reason: 'Small Companies under Section 2(85) (paid-up capital <= ₹10 Cr, turnover <= ₹100 Cr per G.S.R. 880(E)) are expressly excluded from Rule 9B dematerialisation.'
      };
    case 'nidhi':
      return {
        isExempt: true,
        reason: 'Nidhi Companies are expressly exempted under Rule 9A(11) of the Companies (PAS) Rules, 2014.'
      };
    case 'govt_company':
      return {
        isExempt: true,
        reason: 'Government Companies (>= 51% government ownership) are excluded from both Rule 9A and Rule 9B.'
      };
    case 'wholly_owned_sub':
      return {
        isExempt: true,
        reason: 'Wholly-Owned Subsidiaries of an unlisted public company are excluded from Rule 9A(11).'
      };
    default:
      return { isExempt: false };
  }
}

/**
 * Calculate Section 450 Civil Adjudication Liability:
 * - Company: ₹10,000 base + ₹1,000/day of delay (statutory ceiling ₹2,00,000)
 * - Officers: ₹10,000 base + ₹1,000/day of delay (statutory ceiling ₹50,000 per officer)
 * - Section 446B Concession (Startups, eligible small entities):
 *   50% penalty reduction: Company max ₹25,000; Officer continuing penalty ₹500/day, max ₹50,000.
 */
export function calculateSection450Penalty(
  delayDays: number,
  officerCount: number,
  isSection446BEligible = false
): {
  companyPenalty: number;
  officerPenaltyPerOfficer: number;
  totalOfficerPenalty: number;
  totalAdjudication: number;
  isSection446BApplied: boolean;
} {
  if (delayDays <= 0) {
    return {
      companyPenalty: 0,
      officerPenaltyPerOfficer: 0,
      totalOfficerPenalty: 0,
      totalAdjudication: 0,
      isSection446BApplied: false
    };
  }

  const validOfficers = Math.max(1, officerCount);

  if (isSection446BEligible) {
    // Section 446B: Halves penalties
    const companyBase = 5000;
    const companyPerDay = delayDays * 500;
    const companyPenalty = Math.min(companyBase + companyPerDay, 25000);

    const officerBase = 5000;
    const officerPerDay = delayDays * 500;
    const officerPenaltyPerOfficer = Math.min(officerBase + officerPerDay, 25000);
    const totalOfficerPenalty = officerPenaltyPerOfficer * validOfficers;

    return {
      companyPenalty,
      officerPenaltyPerOfficer,
      totalOfficerPenalty,
      totalAdjudication: companyPenalty + totalOfficerPenalty,
      isSection446BApplied: true
    };
  }

  // Standard Section 450
  const companyBase = 10000;
  const companyPerDay = delayDays * 1000;
  const companyPenalty = Math.min(companyBase + companyPerDay, 200000);

  const officerBase = 10000;
  const officerPerDay = delayDays * 1000;
  const officerPenaltyPerOfficer = Math.min(officerBase + officerPerDay, 50000);
  const totalOfficerPenalty = officerPenaltyPerOfficer * validOfficers;

  return {
    companyPenalty,
    officerPenaltyPerOfficer,
    totalOfficerPenalty,
    totalAdjudication: companyPenalty + totalOfficerPenalty,
    isSection446BApplied: false
  };
}

/**
 * Main calculation engine for Form PAS-6
 */
export function calculatePas6Compliance(params: Pas6CalculationParams): Pas6CalculationResult {
  const {
    reportingYear,
    period,
    filingDate,
    authorizedCapital,
    issuedSharesCount = 100000,
    cdslDematShares = 40000,
    nsdlDematShares = 40000,
    physicalShares = 20000,
    numberOfOfficers = 2,
    companyType = 'unlisted_public',
    isDpiitStartup = false
  } = params;

  // 1. Period & Due Date
  const periodLabel =
    period === 'apr_sep'
      ? `April 1, ${reportingYear} – September 30, ${reportingYear}`
      : `October 1, ${reportingYear} – March 31, ${reportingYear + 1}`;

  const statutoryDueDate = getPas6DueDate(reportingYear, period);

  // 2. Exemption Check
  const exemption = evaluatePas6Exemption(companyType, authorizedCapital);

  // 3. Days of delay
  const dueDateTime = new Date(statutoryDueDate + 'T00:00:00Z').getTime();
  const filingDateTime = new Date(filingDate + 'T00:00:00Z').getTime();
  const diffDays = Math.floor((filingDateTime - dueDateTime) / (1000 * 60 * 60 * 24));
  const daysOfDelay = Math.max(0, diffDays);
  const isDelay = daysOfDelay > 0;

  // 4. Normal & Late MCA Fees
  let normalFee = 0;
  let lateMultiplier = 0;
  let delaySlabLabel = 'Exempt';
  let additionalFee = 0;
  let totalMcaFee = 0;

  if (!exemption.isExempt) {
    normalFee = getPas6NormalFee(authorizedCapital);
    const lateInfo = getPas6LateMultiplier(daysOfDelay);
    lateMultiplier = lateInfo.multiplier;
    delaySlabLabel = lateInfo.label;
    additionalFee = normalFee * lateMultiplier;
    totalMcaFee = normalFee + additionalFee;
  }

  // 5. Section 450 Adjudication Penalty
  const isSection446B =
    isDpiitStartup ||
    companyType === 'startup' ||
    companyType === 'producer';

  const penaltyResult = exemption.isExempt
    ? { companyPenalty: 0, officerPenaltyPerOfficer: 0, totalOfficerPenalty: 0, totalAdjudication: 0, isSection446BApplied: false }
    : calculateSection450Penalty(daysOfDelay, numberOfOfficers, isSection446B);

  const totalStatutoryExposure = totalMcaFee + penaltyResult.totalAdjudication;

  // 6. Share Capital Demat Reconciliation
  const totalReconciledShares = cdslDematShares + nsdlDematShares + physicalShares;
  const difference = totalReconciledShares - issuedSharesCount;
  const hasMismatch = difference !== 0;
  const totalBase = issuedSharesCount > 0 ? issuedSharesCount : totalReconciledShares;
  const dematPercentage =
    totalBase > 0
      ? Number((((cdslDematShares + nsdlDematShares) / totalBase) * 100).toFixed(2))
      : 0;
  const physicalPercentage =
    totalBase > 0
      ? Number(((physicalShares / totalBase) * 100).toFixed(2))
      : 0;

  // 7. Line Item Breakdown
  const breakdown: Pas6CalculationResult['breakdown'] = [];

  if (exemption.isExempt) {
    breakdown.push({
      name: 'Statutory Exemption from PAS-6',
      category: 'MCA Government Fee',
      amount: 0,
      basis: exemption.reason || 'Entity is statutorily exempt',
      isWaived: true
    });
  } else {
    breakdown.push({
      name: 'Normal Filing Fee (Table A)',
      category: 'MCA Government Fee',
      amount: normalFee,
      basis: `Authorised share capital ₹${authorizedCapital.toLocaleString('en-IN')}`
    });

    if (additionalFee > 0) {
      breakdown.push({
        name: `Additional Late Fee (${lateMultiplier}x Multiplier)`,
        category: 'MCA Government Fee',
        amount: additionalFee,
        basis: `${daysOfDelay} days delay past ${statutoryDueDate} (Table B Note Item 2)`
      });
    }

    if (penaltyResult.companyPenalty > 0) {
      breakdown.push({
        name: 'Company Adjudication Exposure (Section 450)',
        category: 'Civil Adjudication Penalty',
        amount: penaltyResult.companyPenalty,
        basis: penaltyResult.isSection446BApplied
          ? `Section 446B relief: ₹5,000 base + ₹500/day (capped at ₹25,000)`
          : `Section 450: ₹10,000 base + ₹1,000/day (capped at ₹2,00,000)`
      });
    }

    if (penaltyResult.totalOfficerPenalty > 0) {
      breakdown.push({
        name: `Officers in Default Exposure (${numberOfOfficers} Officer${numberOfOfficers > 1 ? 's' : ''})`,
        category: 'Civil Adjudication Penalty',
        amount: penaltyResult.totalOfficerPenalty,
        basis: penaltyResult.isSection446BApplied
          ? `₹${penaltyResult.officerPenaltyPerOfficer.toLocaleString('en-IN')} per officer under Section 446B`
          : `₹${penaltyResult.officerPenaltyPerOfficer.toLocaleString('en-IN')} per officer under Section 450 (capped at ₹50,000 each)`
      });
    }

    if (hasMismatch) {
      breakdown.push({
        name: 'Share Reconciliation Discrepancy',
        category: 'Dematerialisation Reconciliation',
        amount: 0,
        basis: `Mismatch of ${Math.abs(difference).toLocaleString('en-IN')} shares between issued capital and depository holdings (Mandatory Rule 9A(8A) notification)`
      });
    }
  }

  // 8. Warnings & Notices
  const warnings: string[] = [];
  if (exemption.isExempt) {
    warnings.push(`ℹ️ Exemption Active: ${exemption.reason}`);
  } else {
    if (isDelay) {
      warnings.push(`⚠️ Filing is Delayed: ${daysOfDelay} days past statutory due date (${statutoryDueDate}). A ${lateMultiplier}x additional fee applies on MCA V3.`);
      warnings.push(`⚖️ Section 450 Risk: The ROC may initiate civil adjudication imposing up to ₹${penaltyResult.companyPenalty.toLocaleString('en-IN')} on company and ₹${penaltyResult.officerPenaltyPerOfficer.toLocaleString('en-IN')} on each director.`);
    } else {
      warnings.push(`✅ Timely Filing: Form is scheduled within the statutory 60-day window. Normal fee of ₹${normalFee} applies.`);
    }

    if (hasMismatch) {
      warnings.push(`🚨 Capital Reconciliation Mismatch: Reconciled shares (${totalReconciledShares.toLocaleString('en-IN')}) do NOT match issued shares (${issuedSharesCount.toLocaleString('en-IN')}). Under Rule 9A(8A), this discrepancy must be flagged to NSDL and CDSL immediately.`);
    }

    if (physicalShares > 0) {
      warnings.push(`ℹ️ Physical Shares Pending: ${physicalShares.toLocaleString('en-IN')} shares (${physicalPercentage}%) remain physical. Under Rule 9A(4) & 9B(4), promoter/director shares MUST be 100% dematerialised before any new issue, rights, or buyback.`);
    }
  }

  return {
    reportingYear,
    period,
    periodLabel,
    statutoryDueDate,
    filingDate,
    daysOfDelay,
    isDelay,
    delaySlabLabel,
    companyType,
    authorizedCapital,
    isExempt: exemption.isExempt,
    exemptionReason: exemption.reason,
    normalFee,
    lateMultiplier,
    additionalFee,
    totalMcaFee,
    numberOfOfficers,
    companyAdjudicationPenalty: penaltyResult.companyPenalty,
    officerPenaltyPerOfficer: penaltyResult.officerPenaltyPerOfficer,
    totalOfficerPenalty: penaltyResult.totalOfficerPenalty,
    totalAdjudicationExposure: penaltyResult.totalAdjudication,
    totalStatutoryExposure,
    isSection446BApplied: penaltyResult.isSection446BApplied,
    reconciliation: {
      issuedShares: issuedSharesCount,
      totalReconciledShares,
      cdslShares: cdslDematShares,
      nsdlShares: nsdlDematShares,
      physicalShares,
      dematPercentage,
      physicalPercentage,
      hasMismatch,
      difference
    },
    breakdown,
    warnings,
    roadmap: PAS6_COMPLIANCE_ROADMAP
  };
}

export function formatInr(val: number): string {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}
