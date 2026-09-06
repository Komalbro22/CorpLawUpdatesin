/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM DIR-3 KYC STATUTORY DUE DATE & FEE DETERMINATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Authoritative Single Source of Truth (SSOT) for:
 * 1. Form DIR-3 KYC Web (Single Unified Web Form effective 31 March 2026)
 * 2. Triennial Routine KYC Compliance under Rule 12A(1) of Companies
 *    (Appointment and Qualification of Directors) Rules, 2014 (as amended by G.S.R. 943(E))
 * 3. Event-Based Updates under Rule 12A(2) (30-day statutory deadline, ₹500 fee)
 * 4. Statutory Fee Matrix under Item VII of Annexure to Companies (Registration
 *    Offices and Fees) Rules, 2014 (as substituted by G.S.R. 300(E) dated 21 April 2026)
 * 5. DIN Deactivation, Auto-Reactivation via STP, and Section 164(2) Cascading Risk
 *
 * Statutory Authorities & Sources:
 * - Companies Act, 2013: Sections 153–159, 164(2), 167, 403, 448, 449, 454
 * - Companies (Appointment and Qualification of Directors) Rules, 2014: Rule 12A (G.S.R. 943(E))
 * - Companies (Registration Offices and Fees) Rules, 2014: Item VII Annexure (G.S.R. 300(E))
 * - MCA Portal FAQs & ICAI Advisory on Triennial DIR-3 KYC Framework (2026)
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATUTORY CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Dir3KycFilingType = 'routine' | 'change' | 'reactivation';

export type DinStatus = 'active' | 'deactivated';

export type ChangeCategory = 'mobile' | 'email' | 'address' | 'multiple';

export interface DinAllotmentPreset {
  id: string;
  label: string;
  description: string;
  anchorFy: string;
  anchorYearStart: number; // e.g. 2025 for FY 2025-26
  nextDueYear: number;     // year in which April-June window falls
  nextDueWindow: string;   // e.g. "April – 30 June 2028"
  isDueInCurrentFy: boolean; // FY 2026-27 check
}

export const DIN_ALLOTMENT_PRESETS: DinAllotmentPreset[] = [
  {
    id: 'pre_2025',
    label: 'Allotted on or before 31 March 2025',
    description: 'DIN allotted prior to FY 2025-26; KYC filed for FY 2025-26 under transitional rules.',
    anchorFy: 'FY 2024-25 & Prior',
    anchorYearStart: 2024,
    nextDueYear: 2028,
    nextDueWindow: 'April – 30 June 2028',
    isDueInCurrentFy: false
  },
  {
    id: 'fy_2025_26',
    label: 'Allotted during FY 2025-26',
    description: 'DIN allotted between 1 April 2025 and 31 March 2026.',
    anchorFy: 'FY 2025-26',
    anchorYearStart: 2025,
    nextDueYear: 2029,
    nextDueWindow: 'April – 30 June 2029',
    isDueInCurrentFy: false
  },
  {
    id: 'fy_2026_27',
    label: 'Allotted during FY 2026-27 (Current FY)',
    description: 'DIN allotted between 1 April 2026 and 31 March 2027.',
    anchorFy: 'FY 2026-27',
    anchorYearStart: 2026,
    nextDueYear: 2030,
    nextDueWindow: 'April – 30 June 2030',
    isDueInCurrentFy: false
  },
  {
    id: 'fy_2023_24_pending',
    label: 'Old Allotment with Missed Prior Filings',
    description: 'DIN deactivated due to non-filing of previous annual KYC (pre-2026).',
    anchorFy: 'Prior Default',
    anchorYearStart: 2023,
    nextDueYear: 2026,
    nextDueWindow: 'Immediate Filing Required',
    isDueInCurrentFy: true
  }
];

export interface Dir3KycCalculationInput {
  filingType: Dir3KycFilingType;
  dinStatus: DinStatus;
  allotmentPresetId: string;
  customAllotmentDate?: string; // YYYY-MM-DD
  // Change-specific inputs (Rule 12A(2))
  changeCategory?: ChangeCategory;
  changeDate?: string;          // YYYY-MM-DD
  actualFilingDate?: string;    // YYYY-MM-DD
  // Directorship risk flag
  hasCompanyFilingsPending?: boolean; // Blocks company AOC-4/MGT-7
  numberOfChangeFilings?: number;     // default 1
  directorName?: string;
  dinNumber?: string;
}

export interface TriennialCycleInfo {
  anchorFy: string;
  allotmentDateLabel: string;
  nextDueYear: number;
  nextDueDate: string; // e.g. "30 June 2028"
  nextDueWindow: string; // e.g. "April – 30 June 2028"
  isFilingDueThisYear: boolean;
  yearsRemaining: number;
  statutoryRule: string;
}

export interface ChangeComplianceInfo {
  hasChange: boolean;
  changeCategoryLabel: string;
  changeDate: string | null;
  statutoryDeadline: string | null; // 30 days from change
  daysFromChange: number;
  isWithin30Days: boolean;
  isDelayed: boolean;
  delayDays: number;
  nonResetRuleNote: string;
}

export interface CascadingRiskAssessment {
  hasRisk: boolean;
  riskLevel: 'None' | 'Moderate' | 'Critical';
  title: string;
  description: string;
  companyFilingBlocked: boolean;
  disqualificationRiskSection164: boolean;
  mitigationSteps: string[];
}

export interface Dir3KycCalculationResult {
  input: Dir3KycCalculationInput;
  dinStatus: DinStatus;
  filingType: Dir3KycFilingType;
  
  // Financial computation (G.S.R. 300(E), Item VII)
  baseFee: number;
  lateOrReactivationFee: number;
  changeFee: number;
  totalMcaChallan: number;
  feeRuleCitation: string;
  feeExplanation: string;
  
  // Status badges
  statusBadge: string;
  statusColor: 'green' | 'amber' | 'red' | 'blue';
  actionRequired: string;
  
  // Triennial cycle
  triennialCycle: TriennialCycleInfo;
  
  // Change update (Rule 12A(2))
  changeCompliance: ChangeComplianceInfo;
  
  // Cascading risks (Section 164(2) & 448)
  cascadingRisk: CascadingRiskAssessment;
  
  // Professional certification
  professionalCertification: {
    isMandatory: boolean;
    certifyingAuthorities: string[];
    statutorySection: string;
    liabilityNote: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CORE STATUTORY CALCULATION LOGIC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine Financial Year string (e.g., "FY 2025-26") from a JavaScript Date.
 */
export function getFinancialYear(date: Date): { fyString: string; startYear: number; endYear: number } {
  const month = date.getMonth(); // 0-indexed: 0 = Jan, 2 = Mar, 3 = Apr
  const year = date.getFullYear();
  
  if (month >= 3) {
    // April to December
    return {
      fyString: `FY ${year}-${(year + 1).toString().slice(-2)}`,
      startYear: year,
      endYear: year + 1
    };
  } else {
    // January to March
    return {
      fyString: `FY ${year - 1}-${year.toString().slice(-2)}`,
      startYear: year - 1,
      endYear: year
    };
  }
}

/**
 * Format a Date to Indian Standard format DD/MM/YYYY.
 */
export function formatDateIndian(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculate the next Triennial Routine KYC due date under Rule 12A(1).
 * Rule: Routine KYC is due once every 3 consecutive financial years,
 * on or before 30 June of the year immediately following the third financial year.
 */
export function calculateTriennialCycle(
  presetId: string,
  customDateStr?: string
): TriennialCycleInfo {
  const currentFyStartYear = 2026; // Currently FY 2026-27 (as of Sept 2026)
  
  if (customDateStr) {
    const d = new Date(customDateStr);
    if (!isNaN(d.getTime())) {
      const { fyString, startYear } = getFinancialYear(d);
      // Triennial rule: 3 consecutive financial years.
      // Allotted on or before 31 Mar 2025 (FY 24-25 & prior) -> Next due: April - 30 June 2028 (startYear 2024 + 4 = 2028)
      // Allotted FY 2025-26 (startYear 2025) -> Next due: April - 30 June 2029 (startYear 2025 + 4 = 2029)
      // Allotted FY 2026-27 (startYear 2026) -> Next due: April - 30 June 2030 (startYear 2026 + 4 = 2030)
      const nextDueYear = startYear <= 2024 ? 2028 : startYear + 4;
      const yearsRemaining = nextDueYear - currentFyStartYear;
      const isDueThisYear = nextDueYear <= currentFyStartYear;
      
      return {
        anchorFy: fyString,
        allotmentDateLabel: formatDateIndian(d),
        nextDueYear,
        nextDueDate: `30 June ${nextDueYear}`,
        nextDueWindow: `April – 30 June ${nextDueYear}`,
        isFilingDueThisYear: isDueThisYear,
        yearsRemaining: Math.max(0, yearsRemaining),
        statutoryRule: 'Rule 12A(1), Companies (Appointment and Qualification of Directors) Rules, 2014 as amended by G.S.R. 943(E)'
      };
    }
  }
  
  const preset = DIN_ALLOTMENT_PRESETS.find(p => p.id === presetId) || DIN_ALLOTMENT_PRESETS[0];
  const yearsRemaining = preset.nextDueYear - currentFyStartYear;
  
  return {
    anchorFy: preset.anchorFy,
    allotmentDateLabel: preset.label,
    nextDueYear: preset.nextDueYear,
    nextDueDate: preset.id === 'fy_2023_24_pending' ? 'Immediate' : `30 June ${preset.nextDueYear}`,
    nextDueWindow: preset.nextDueWindow,
    isFilingDueThisYear: preset.isDueInCurrentFy,
    yearsRemaining: Math.max(0, yearsRemaining),
    statutoryRule: 'Rule 12A(1), Companies (Appointment and Qualification of Directors) Rules, 2014 as amended by G.S.R. 943(E)'
  };
}

/**
 * Main calculation engine for DIR-3 KYC Web compliance.
 */
export function calculateDir3KycCompliance(input: Dir3KycCalculationInput): Dir3KycCalculationResult {
  const {
    filingType,
    dinStatus,
    allotmentPresetId,
    customAllotmentDate,
    changeCategory = 'mobile',
    changeDate,
    actualFilingDate,
    hasCompanyFilingsPending = false,
    numberOfChangeFilings = 1
  } = input;

  const triennial = calculateTriennialCycle(allotmentPresetId, customAllotmentDate);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Fee Computation under G.S.R. 300(E) (Item VII Annexure)
  // ─────────────────────────────────────────────────────────────────────────
  let baseFee = 0;
  let lateOrReactivationFee = 0;
  let changeFee = 0;
  let feeRuleCitation = 'Item VII, Annexure, Companies (Registration Offices and Fees) Rules, 2014 (G.S.R. 300(E))';
  let feeExplanation = '';
  let statusBadge = '';
  let statusColor: 'green' | 'amber' | 'red' | 'blue' = 'green';
  let actionRequired = '';

  // 1. DIN DEACTIVATED SCENARIO
  if (dinStatus === 'deactivated' || filingType === 'reactivation' || allotmentPresetId === 'fy_2023_24_pending') {
    lateOrReactivationFee = 5000;
    statusBadge = 'DIN Deactivated — ₹5,000 Reactivation Required';
    statusColor = 'red';
    actionRequired = 'File Form DIR-3 KYC Web immediately with ₹5,000 government fee for auto-reactivation via STP.';
    feeExplanation = 'Form filed for reactivation of a deactivated DIN under Item VII attracts a flat statutory fee of ₹5,000. No per-day compounding applies.';
  }
  // 2. CHANGE OF DETAILS SCENARIO (Rule 12A(2))
  else if (filingType === 'change') {
    const filingsCount = Math.max(1, numberOfChangeFilings);
    changeFee = 500 * filingsCount;
    statusBadge = `Change Update Required — ₹${changeFee} Fee`;
    statusColor = 'blue';
    actionRequired = 'File Form DIR-3 KYC Web within 30 days of the change. This filing does NOT reset your 3-year triennial cycle.';
    feeExplanation = `Under Rule 12A(2) read with Item VII, every event-based update of mobile number, email, or address attracts a flat fee of ₹500 per filing.`;
  }
  // 3. ROUTINE TRIENNIAL KYC SCENARIO (Rule 12A(1))
  else {
    if (triennial.isFilingDueThisYear) {
      statusBadge = 'Routine KYC Due This Year — NIL Fee If Filed on Time';
      statusColor = 'amber';
      actionRequired = `File Form DIR-3 KYC Web on or before ${triennial.nextDueDate} to avail NIL government fee.`;
      feeExplanation = 'Routine triennial KYC filed on or before 30 June of the applicable financial year incurs ₹0 (NIL) government fee.';
    } else {
      statusBadge = `Compliant — Next Routine KYC Due in ${triennial.nextDueYear}`;
      statusColor = 'green';
      actionRequired = `No routine KYC required in FY 2026-27. Next compliance window opens in ${triennial.nextDueWindow}.`;
      feeExplanation = `Under G.S.R. 943(E), routine KYC is triennial (every 3 years). No fee or filing is required for FY 2026-27 unless particulars change.`;
    }
  }

  const totalMcaChallan = baseFee + lateOrReactivationFee + changeFee;

  // ─────────────────────────────────────────────────────────────────────────
  // Change Compliance Assessment (Rule 12A(2) 30-Day Rule)
  // ─────────────────────────────────────────────────────────────────────────
  let changeCompliance: ChangeComplianceInfo = {
    hasChange: filingType === 'change',
    changeCategoryLabel:
      changeCategory === 'mobile' ? 'Mobile Number' :
      changeCategory === 'email' ? 'Email Address' :
      changeCategory === 'address' ? 'Residential Address' : 'Multiple Particulars',
    changeDate: null,
    statutoryDeadline: null,
    daysFromChange: 0,
    isWithin30Days: true,
    isDelayed: false,
    delayDays: 0,
    nonResetRuleNote: 'Statutory Directive: Filing a change under Rule 12A(2) updates particulars but does NOT extend or reset the 3-year triennial cycle.'
  };

  if (filingType === 'change' && changeDate) {
    const cDate = new Date(changeDate);
    const fDate = actualFilingDate ? new Date(actualFilingDate) : new Date();
    
    if (!isNaN(cDate.getTime())) {
      const deadlineDate = new Date(cDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const diffTime = fDate.getTime() - cDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const isOver = diffDays > 30;
      
      changeCompliance.changeDate = formatDateIndian(cDate);
      changeCompliance.statutoryDeadline = formatDateIndian(deadlineDate);
      changeCompliance.daysFromChange = Math.max(0, diffDays);
      changeCompliance.isWithin30Days = !isOver;
      changeCompliance.isDelayed = isOver;
      changeCompliance.delayDays = isOver ? diffDays - 30 : 0;
      
      if (isOver) {
        actionRequired = `Delayed filing! Passed the 30-day statutory deadline by ${diffDays - 30} days. File immediately on MCA V3.`;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Cascading Risk Assessment (Section 164(2) & 448)
  // ─────────────────────────────────────────────────────────────────────────
  let riskLevel: 'None' | 'Moderate' | 'Critical' = 'None';
  let riskTitle = 'No Active Compliance Risks Detected';
  let riskDesc = 'DIN is active and compliant with MCA21 records.';
  const mitigationSteps: string[] = [];

  const isDeactivated = dinStatus === 'deactivated' || filingType === 'reactivation' || allotmentPresetId === 'fy_2023_24_pending';

  if (isDeactivated && hasCompanyFilingsPending) {
    riskLevel = 'Critical';
    riskTitle = 'Critical Danger: Company Filings Frozen & Section 164(2) Disqualification Risk';
    riskDesc = 'Your deactivated DIN prevents the company from filing mandatory annual returns (MGT-7/AOC-4). If company filings remain unfiled for 3 continuous years, ALL directors face automatic 5-year disqualification under Section 164(2).';
    mitigationSteps.push('Immediately file Form DIR-3 KYC Web with ₹5,000 fee to auto-reactivate DIN on STP basis.');
    mitigationSteps.push('Once reactivated, digitally sign and submit pending company annual returns (AOC-4 & MGT-7).');
    mitigationSteps.push('Ensure Board passes resolution recording compliance to avert ROC show-cause notices.');
  } else if (isDeactivated) {
    riskLevel = 'Critical';
    riskTitle = 'High Risk: Deactivated DIN Blocks All MCA Filings & Board Appointments';
    riskDesc = 'A deactivated DIN cannot be used for any MCA21 V3 filing, cannot sign financial statements, and bars appointment to any new company or LLP.';
    mitigationSteps.push('File Form DIR-3 KYC Web with ₹5,000 fee on MCA V3.');
    mitigationSteps.push('Verify mobile and email OTPs and attach current address proof.');
  } else if (filingType === 'change' && changeCompliance.isDelayed) {
    riskLevel = 'Moderate';
    riskTitle = 'Notice: Event-Based Change Exceeded 30-Day Statutory Window';
    riskDesc = 'Rule 12A(2) mandates updating altered contact or address particulars within 30 days. Delay may invite ROC scrutiny or communication failures.';
    mitigationSteps.push('File Form DIR-3 KYC Web with ₹500 fee immediately to regularize particulars.');
  }

  const cascadingRisk: CascadingRiskAssessment = {
    hasRisk: riskLevel !== 'None',
    riskLevel,
    title: riskTitle,
    description: riskDesc,
    companyFilingBlocked: isDeactivated,
    disqualificationRiskSection164: isDeactivated && hasCompanyFilingsPending,
    mitigationSteps
  };

  return {
    input,
    dinStatus: isDeactivated ? 'deactivated' : 'active',
    filingType,
    baseFee,
    lateOrReactivationFee,
    changeFee,
    totalMcaChallan,
    feeRuleCitation,
    feeExplanation,
    statusBadge,
    statusColor,
    actionRequired,
    triennialCycle: triennial,
    changeCompliance,
    cascadingRisk,
    professionalCertification: {
      isMandatory: true,
      certifyingAuthorities: ['Chartered Accountant (CA)', 'Company Secretary (CS)', 'Cost Accountant (CMA) in whole-time practice'],
      statutorySection: 'Section 448 & Section 449 of Companies Act, 2013',
      liabilityNote: 'The certifying professional must verify the particulars from original documents. Providing false particulars attracts imprisonment up to 3 years and criminal liability under Sections 448 and 449.'
    }
  };
}
