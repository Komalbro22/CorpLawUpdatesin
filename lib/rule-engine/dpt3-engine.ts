/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM DPT-3 STATUTORY RETURN OF DEPOSITS & FEE DETERMINATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Authoritative Single Source of Truth (SSOT) for:
 * 1. Form DPT-3 (Annual Return of Deposits and Particulars of Transactions Not
 *    Considered as Deposit under Rule 16 & 16A)
 * 2. MCA21 V3 Portal e-Challan Fee Calculations (Table A Items 5 & 6, Table B Multipliers)
 * 3. MCA General Circular No. 02/2026 (19 June 2026) Fee Waiver for FY 2025-26
 * 4. Dual Statutory Penalties: Rule 21 Procedural Fines vs Section 76A Substantive Penalties
 * 5. Rule 2(1)(c) Master Registry of 18 Excluded Non-Deposit Categories
 *
 * Statutory Authorities & Sources:
 * - Companies Act, 2013: Sections 73, 76, 76A, 403, 446B, 454
 * - Companies (Acceptance of Deposits) Rules, 2014: Rules 2(1)(c), 16, 16A, 21
 * - Companies (Registration Offices and Fees) Rules, 2014: Table A (Items 5 & 6), Table B
 * - MCA General Circular No. 02/2026 dated 19 June 2026 (DPT-3 waiver up to 31 July 2026)
 * - MCA General Circular No. 03/2026 & 04/2026 (CCFS-2026 scheme extensions)
 * - MCA21 V3 Official Instruction Kit: Form DPT-3
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATUTORY CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Dpt3FilingPurpose = 'exempted' | 'deposits' | 'both' | 'one_time_loan' | 'nil';

export type Dpt3CalcMode = 'date' | 'days';

export interface Dpt3TableBSlab {
  tier: string;
  delayRange: string;
  minDays: number;
  maxDays: number;
  multiplier: number;
  multiplierLabel: string;
  statutoryBasis: string;
  guidanceNotes: string;
}

export const DPT3_TABLE_B_SLABS: Dpt3TableBSlab[] = [
  {
    tier: 'Tier 1',
    delayRange: 'Up to 30 days',
    minDays: 1,
    maxDays: 30,
    multiplier: 2,
    multiplierLabel: '2× Normal Fee',
    statutoryBasis: 'Table B, Item B(1), Fees Rules, 2014',
    guidanceNotes: 'Standard initial delay tier for filing within 1 calendar month beyond statutory due date.'
  },
  {
    tier: 'Tier 2',
    delayRange: '31 to 60 days',
    minDays: 31,
    maxDays: 60,
    multiplier: 4,
    multiplierLabel: '4× Normal Fee',
    statutoryBasis: 'Table B, Item B(2), Fees Rules, 2014',
    guidanceNotes: 'Second tier for delay between 1 and 2 months beyond statutory due date.'
  },
  {
    tier: 'Tier 3',
    delayRange: '61 to 90 days',
    minDays: 61,
    maxDays: 90,
    multiplier: 6,
    multiplierLabel: '6× Normal Fee',
    statutoryBasis: 'Table B, Item B(3), Fees Rules, 2014',
    guidanceNotes: 'Third tier for delay between 2 and 3 months. High risk of ROC scrutiny.'
  },
  {
    tier: 'Tier 4',
    delayRange: '91 to 180 days',
    minDays: 91,
    maxDays: 180,
    multiplier: 10,
    multiplierLabel: '10× Normal Fee',
    statutoryBasis: 'Table B, Item B(4), Fees Rules, 2014',
    guidanceNotes: 'Substantial delay (3 to 6 months). Escalated compliance alert.'
  },
  {
    tier: 'Tier 5',
    delayRange: 'More than 180 days',
    minDays: 181,
    maxDays: Infinity,
    multiplier: 12,
    multiplierLabel: '12× Normal Fee',
    statutoryBasis: 'Table B, Item B(5), Fees Rules, 2014',
    guidanceNotes: 'Maximum statutory multiplier under Table B of Fees Rules. Beyond 270 days, Section 403 second proviso condonation may be required.'
  }
];

export interface Dpt3CapitalPreset {
  label: string;
  value: number;
  fee: number;
  statutoryBracket: string;
}

export const DPT3_CAPITAL_PRESETS: Dpt3CapitalPreset[] = [
  { label: '< ₹1 Lakh', value: 90000, fee: 200, statutoryBracket: 'Less than ₹1,00,000' },
  { label: '₹1L – ₹5L', value: 100000, fee: 300, statutoryBracket: '₹1,00,000 to ₹4,99,999' },
  { label: '₹5L – ₹25L', value: 1000000, fee: 400, statutoryBracket: '₹5,00,000 to ₹24,99,999' },
  { label: '₹25L – ₹1Cr', value: 5000000, fee: 500, statutoryBracket: '₹25,00,000 to ₹99,99,999' },
  { label: '≥ ₹1 Crore', value: 10000000, fee: 600, statutoryBracket: '₹1,00,00,000 or more' }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. RULE 2(1)(c) MASTER EXCLUSIONS REGISTRY (18 STATUTORY CATEGORIES)
// ─────────────────────────────────────────────────────────────────────────────

export interface Rule21cExclusionItem {
  id: number;
  subClause: string;
  title: string;
  shortDescription: string;
  detailedConditions: string;
  auditPointer: string;
  commonlyReported: boolean;
}

export const RULE_2_1_C_EXCLUSIONS: Rule21cExclusionItem[] = [
  {
    id: 1,
    subClause: 'Rule 2(1)(c)(i)',
    title: 'Government & Statutory Receipts',
    shortDescription: 'Any amount received from Central/State Government, local authority, or statutory body.',
    detailedConditions: 'Includes any amount received from the Central Government, State Government, or any amount received from any other source whose repayment is guaranteed by the Central or State Government.',
    auditPointer: 'Verify government sanction orders, guarantee letters, and treasury allocation notes.',
    commonlyReported: false
  },
  {
    id: 2,
    subClause: 'Rule 2(1)(c)(ii)',
    title: 'Foreign Governments & International Bodies',
    shortDescription: 'Receipts from foreign governments, international banks, or multilateral institutions.',
    detailedConditions: 'Receipts from foreign governments, foreign or international banks, multilateral financial institutions, export credit agencies, or foreign authorities subject to FEMA/FCRA compliance.',
    auditPointer: 'Verify Form FC-GPR/FC-TRS, RBI approval letters, and FEMA reporting acknowledgements.',
    commonlyReported: false
  },
  {
    id: 3,
    subClause: 'Rule 2(1)(c)(iii)',
    title: 'Bank & Financial Institution Borrowings',
    shortDescription: 'Any loan or facility received from banking companies, SBI, RRBs, or notified public FIs.',
    detailedConditions: 'Any loan or facility received from banking companies, SBI or its subsidiary banks, regional rural banks, co-operative banks, or notified public financial institutions under Section 2(72).',
    auditPointer: 'Check bank sanction letters, charge registration in Form CHG-1, and audited bank confirmation balance.',
    commonlyReported: true
  },
  {
    id: 4,
    subClause: 'Rule 2(1)(c)(vi)',
    title: 'Inter-Corporate Borrowings (ICDs)',
    shortDescription: 'Any amount received by a company from another company (holding, subsidiary, associate, or third party).',
    detailedConditions: 'Any amount received by a company from any other company. Complies with Section 186 loan limits and market-rate interest benchmarks.',
    auditPointer: 'Verify Board resolution under Section 179(3), Section 186 register (MBP-2), and confirmation from lender company.',
    commonlyReported: true
  },
  {
    id: 5,
    subClause: 'Rule 2(1)(c)(viii)',
    title: 'Director Loans (with Written Declaration)',
    shortDescription: 'Amounts received from a person who was a director at the time of receipt with non-borrowed declaration.',
    detailedConditions: 'Must furnish a written declaration to the company at the time of giving loan that the amount is not given out of funds acquired by him by borrowing or accepting loans/deposits from others. Company must disclose this in Board\'s Report.',
    auditPointer: 'Crucial: Obtain written declaration from director dated on or before the loan disbursement date. Disclose explicitly in Board Report.',
    commonlyReported: true
  },
  {
    id: 6,
    subClause: 'Rule 2(1)(c)(viii) Proviso',
    title: 'Relative of Director (Private Companies Only)',
    shortDescription: 'Amounts received from a relative of a director of a private company, subject to own-funds declaration.',
    detailedConditions: 'Applicable ONLY to Private Limited Companies. Relative must furnish a written declaration that the amount is from own funds and not borrowed. Relative as defined in Section 2(77).',
    auditPointer: 'Verify director relative definition under Section 2(77) and verify non-borrowed funds declaration letter.',
    commonlyReported: true
  },
  {
    id: 7,
    subClause: 'Rule 2(1)(c)(xviia)',
    title: 'Convertible Notes by DPIIT Startups',
    shortDescription: 'Amount of ₹25 Lakhs or more received by a startup in a single tranche against convertible notes.',
    detailedConditions: 'Recognized DPIIT startup issuing convertible notes for ₹25 Lakhs or more in a single tranche, repayable or convertible into equity within 10 years from the date of issue (extended from 5 to 10 years in 2020).',
    auditPointer: 'Verify DPIIT startup recognition certificate, convertible note agreement, and 10-year maturity schedule.',
    commonlyReported: true
  },
  {
    id: 8,
    subClause: 'Rule 2(1)(c)(iv)',
    title: 'Commercial Paper (CP)',
    shortDescription: 'Amounts raised by the issue of commercial paper or other money market instruments per RBI guidelines.',
    detailedConditions: 'Issued in accordance with the guidelines or regulations issued by the Reserve Bank of India for commercial paper.',
    auditPointer: 'Verify IPA certificates, credit rating certificate, and RBI reporting slips.',
    commonlyReported: false
  },
  {
    id: 9,
    subClause: 'Rule 2(1)(c)(ixa)',
    title: 'Secured Bonds & Debentures',
    shortDescription: 'Bonds or debentures secured by a first charge on tangible assets of the company.',
    detailedConditions: 'Must be secured by a charge on assets referred to in Schedule III having market value not less than the issue amount, with maturity period not exceeding 10 years.',
    auditPointer: 'Check debenture trust deed, valuation certificate, and Form CHG-9 charge registration on MCA.',
    commonlyReported: true
  },
  {
    id: 10,
    subClause: 'Rule 2(1)(c)(ixb)',
    title: 'Compulsorily Convertible Debentures (CCDs)',
    shortDescription: 'Unsecured debentures compulsorily convertible into equity shares within 10 years.',
    detailedConditions: 'Unsecured debentures compulsorily convertible into equity shares of the company within a period not exceeding 10 years.',
    auditPointer: 'Verify investment agreement terms confirming compulsory conversion (non-optional) within 10 years.',
    commonlyReported: true
  },
  {
    id: 11,
    subClause: 'Rule 2(1)(c)(vii)',
    title: 'Share Application Money Pending Allotment',
    shortDescription: 'Application money received for securities, provided allotment is completed within 60 days of receipt.',
    detailedConditions: 'If securities are not allotted within 60 days from the date of receipt, the amount must be refunded within 15 days thereafter. If not refunded within 15 days, it is treated as a DEPOSIT on the 75th day.',
    auditPointer: 'Strict audit: calculate exact calendar days between receipt and PAS-3 allotment. If >75 days, reclassify as Section 73 Deposit!',
    commonlyReported: true
  },
  {
    id: 12,
    subClause: 'Rule 2(1)(c)(xii)(a)',
    title: 'Customer Advances for Goods or Services',
    shortDescription: 'Advance received in ordinary course of business for supply of goods/services appropriated within 365 days.',
    detailedConditions: 'Must be appropriated against supply of goods or services within a period of 365 days from the date of receipt. Advances held beyond 365 days become DEPOSITS unless subject to legal proceedings.',
    auditPointer: 'Ageing analysis of customer advance ledger: ensure no unadjusted credit balances older than 365 days.',
    commonlyReported: true
  },
  {
    id: 13,
    subClause: 'Rule 2(1)(c)(xii)(b)',
    title: 'Security Deposits & Performance Guarantees',
    shortDescription: 'Security deposits received for performance of a contract for supply of goods or provision of services.',
    detailedConditions: 'Received as security deposit for performance of the contract for supply of goods or provision of services under written agreement.',
    auditPointer: 'Review underlying vendor/customer contracts specifying security deposit terms and warranty durations.',
    commonlyReported: true
  },
  {
    id: 14,
    subClause: 'Rule 2(1)(c)(xii)(d)',
    title: 'Advance for Immovable Capital Assets',
    shortDescription: 'Advance received in connection with consideration for an immovable property under written agreement.',
    detailedConditions: 'Advance received under written agreement for consideration of immovable property, provided it is adjusted in accordance with terms of the agreement.',
    auditPointer: 'Inspect registered agreement to sell, stamp duty, and property title documents.',
    commonlyReported: false
  },
  {
    id: 15,
    subClause: 'Rule 2(1)(c)(xiii)',
    title: 'Promoters Unsecured Subordinated Loans',
    shortDescription: 'Brought in pursuance of the stipulation of any lending financial institution or bank.',
    detailedConditions: 'Brought in by promoters themselves or their relatives in pursuance of the stipulation of a bank or FI. Exemption available only till loans of bank/FI are fully repaid.',
    auditPointer: 'Verify bank sanction condition requiring promoter equity/unsecured loan infusion and subordination undertaking.',
    commonlyReported: true
  },
  {
    id: 16,
    subClause: 'Rule 2(1)(c)(xiv)',
    title: 'Nidhi Company Receipts',
    shortDescription: 'Amounts accepted by a Nidhi company from its members in accordance with rules under Section 406.',
    detailedConditions: 'Accepted in accordance with Nidhi Rules, 2014 by companies declared as Nidhi under Section 406.',
    auditPointer: 'Check NDH-4 approval order and compliance with 10% member deposit ratio.',
    commonlyReported: false
  },
  {
    id: 17,
    subClause: 'Rule 2(1)(c)(x)',
    title: 'Employee Security Deposits',
    shortDescription: 'Non-interest-bearing amount received from an employee not exceeding annual salary under contract.',
    detailedConditions: 'Amount received from an employee not exceeding his annual salary under contract of employment with the company in the nature of non-interest-bearing security deposit.',
    auditPointer: 'Verify employment contract, employee CTC breakdown, and non-interest payment verification.',
    commonlyReported: false
  },
  {
    id: 18,
    subClause: 'Rule 2(1)(c)(xi)',
    title: 'Trust & Mutual Fund Receipts',
    shortDescription: 'Amounts received in trust, subscriptions to mutual funds, CIS, or approved pension funds.',
    detailedConditions: 'Any non-interest-bearing amount received and held in trust; or amounts received as subscription to collective investment schemes, mutual funds, or pension funds approved by SEBI/PFRDA.',
    auditPointer: 'Inspect SEBI registration, trust deed, and dedicated escrow bank accounts.',
    commonlyReported: false
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. TABLE A NORMAL BASE FILING FEE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the normal filing fee for Form DPT-3 under Table A (Items 5 & 6)
 * of the Companies (Registration Offices and Fees) Rules, 2014.
 *
 * Slabs:
 * - Company without share capital: flat ₹200 (Item 6)
 * - Nominal capital < ₹1,00,000: ₹200
 * - ₹1,00,000 to ₹4,99,999: ₹300
 * - ₹5,00,000 to ₹24,99,999: ₹400
 * - ₹25,00,000 to ₹99,99,999: ₹500
 * - ₹1,00,00,000 or more: ₹600
 */
export function calculateDpt3NormalFilingFee(
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

export function getDpt3NormalFeeExplanation(
  nominalCapital: number,
  hasShareCapital: boolean = true
): string {
  if (!hasShareCapital) {
    return 'Company without share capital: Flat ₹200 prescribed under Table A, Item 6, Fees Rules, 2014.';
  }
  if (nominalCapital < 100000) {
    return 'Nominal share capital less than ₹1,00,000 → ₹200 (Table A, Item 5, Fees Rules, 2014)';
  }
  if (nominalCapital < 500000) {
    return 'Nominal share capital ₹1,00,000 to ₹4,99,999 → ₹300 (Table A, Item 5, Fees Rules, 2014)';
  }
  if (nominalCapital < 2500000) {
    return 'Nominal share capital ₹5,00,000 to ₹24,99,999 → ₹400 (Table A, Item 5, Fees Rules, 2014)';
  }
  if (nominalCapital < 10000000) {
    return 'Nominal share capital ₹25,00,000 to ₹99,99,999 → ₹500 (Table A, Item 5, Fees Rules, 2014)';
  }
  return 'Nominal share capital ₹1,00,00,000 or more (≥ ₹1 Crore) → ₹600 (Table A, Item 5, Fees Rules, 2014)';
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TABLE B DELAY MULTIPLIER ENGINE (NOT ₹100/DAY)
// ─────────────────────────────────────────────────────────────────────────────

export interface Dpt3MultiplierResult {
  multiplier: number;
  slabIndex: number;
  slabRange: string;
  isMaxTier: boolean;
  requiresSection403CondonationNotice: boolean;
}

/**
 * Returns the Table B additional late fee multiplier based on days of delay.
 * Multiplier is applied directly to the Table A Normal Fee:
 * - 0 days: 0×
 * - 1 to 30 days: 2×
 * - 31 to 60 days: 4×
 * - 61 to 90 days: 6×
 * - 91 to 180 days: 10×
 * - More than 180 days: 12×
 */
export function getDpt3TableBMultiplier(daysDelayed: number): Dpt3MultiplierResult {
  if (daysDelayed <= 0) {
    return {
      multiplier: 0,
      slabIndex: -1,
      slabRange: 'Timely (0 days)',
      isMaxTier: false,
      requiresSection403CondonationNotice: false
    };
  }
  if (daysDelayed <= 30) {
    return {
      multiplier: 2,
      slabIndex: 0,
      slabRange: 'Up to 30 days',
      isMaxTier: false,
      requiresSection403CondonationNotice: false
    };
  }
  if (daysDelayed <= 60) {
    return {
      multiplier: 4,
      slabIndex: 1,
      slabRange: '31 to 60 days',
      isMaxTier: false,
      requiresSection403CondonationNotice: false
    };
  }
  if (daysDelayed <= 90) {
    return {
      multiplier: 6,
      slabIndex: 2,
      slabRange: '61 to 90 days',
      isMaxTier: false,
      requiresSection403CondonationNotice: false
    };
  }
  if (daysDelayed <= 180) {
    return {
      multiplier: 10,
      slabIndex: 3,
      slabRange: '91 to 180 days',
      isMaxTier: false,
      requiresSection403CondonationNotice: false
    };
  }
  return {
    multiplier: 12,
    slabIndex: 4,
    slabRange: 'More than 180 days',
    isMaxTier: true,
    requiresSection403CondonationNotice: daysDelayed > 270
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DATE ARITHMETIC & CIRCULAR 02/2026 WAIVER ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface Dpt3DateCalculationInput {
  financialYear: string;           // e.g. "2025-26", "2024-25", "2026-27"
  calcMode: Dpt3CalcMode;
  filingDate?: string;             // YYYY-MM-DD
  directDelayDays?: number;
}

export interface Dpt3DateCalculationResult {
  statutoryDueDate: string;        // YYYY-MM-DD
  waiverEndDate: string | null;    // YYYY-MM-DD (e.g. 2026-07-31 for FY 25-26)
  effectiveDelayDays: number;
  isWaivedUnderCircular: boolean;
  actualFilingDateDisplay: string;
  delayComputationExplanation: string;
}

function parseYmd(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function formatYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Evaluates DPT-3 statutory due dates and Circular 02/2026 fee-waiver window.
 *
 * CRITICAL RULE NUANCE (MCA Circular 02/2026):
 * 1. For FY 2025-26: Statutory due date is 30 June 2026.
 * 2. Filings between 1 July 2026 and 31 July 2026: Waived (delay = 0, additional fee = 0).
 * 3. Filings on or after 1 August 2026: Delay is calculated from ORIGINAL due date (30 June 2026),
 *    NOT from the extended date of 31 July 2026!
 */
export function computeDpt3DatesAndDelay(
  input: Dpt3DateCalculationInput
): Dpt3DateCalculationResult {
  const isFY202526 = input.financialYear === '2025-26';
  const startYear = parseInt(input.financialYear.slice(0, 4), 10);
  const dueYear = isNaN(startYear) ? 2026 : startYear + 1;
  const statutoryDueDate = `${dueYear}-06-30`;
  const waiverEndDate = isFY202526 ? '2026-07-31' : null;

  if (input.calcMode === 'days') {
    const delay = Math.max(0, input.directDelayDays ?? 0);
    return {
      statutoryDueDate,
      waiverEndDate,
      effectiveDelayDays: delay,
      isWaivedUnderCircular: false,
      actualFilingDateDisplay: `+${delay} Calendar Days Delay`,
      delayComputationExplanation: delay === 0
        ? 'Filed on or before statutory due date.'
        : `Direct delay input of ${delay} days beyond statutory due date (${statutoryDueDate}).`
    };
  }

  // Date-based calculation
  const filingYmd = input.filingDate || formatYmd(new Date());
  const filingUtc = parseYmd(filingYmd);
  const dueUtc = parseYmd(statutoryDueDate);

  // Timely filing
  if (filingUtc <= dueUtc) {
    return {
      statutoryDueDate,
      waiverEndDate,
      effectiveDelayDays: 0,
      isWaivedUnderCircular: false,
      actualFilingDateDisplay: filingYmd,
      delayComputationExplanation: `Timely filing on or before statutory due date (${statutoryDueDate}).`
    };
  }

  // Circular 02/2026 Waiver window (1 July 2026 to 31 July 2026 for FY 2025-26)
  if (isFY202526 && waiverEndDate) {
    const waiverUtc = parseYmd(waiverEndDate);
    if (filingUtc <= waiverUtc) {
      return {
        statutoryDueDate,
        waiverEndDate,
        effectiveDelayDays: 0,
        isWaivedUnderCircular: true,
        actualFilingDateDisplay: filingYmd,
        delayComputationExplanation: `Filed within the MCA General Circular No. 02/2026 fee-waiver relief window (up to 31 July 2026) due to the MCA Data Centre fire on 5 June 2026. Normal fee payable; additional late fee waived.`
      };
    }
  }

  // Delayed filing post-waiver or other FY:
  // Statutory delay is counted from the day after due date (1 July)
  const diffMs = filingUtc.getTime() - dueUtc.getTime();
  const rawDelayDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const explanation = isFY202526
    ? `Filed on ${filingYmd} (after Circular 02/2026 waiver deadline of 31 July 2026). Pursuant to Fees Rules Table B, delay is calculated from the original due date of 30 June 2026 (${rawDelayDays} days delay).`
    : `Filed on ${filingYmd}, which is ${rawDelayDays} days beyond statutory due date (${statutoryDueDate}).`;

  return {
    statutoryDueDate,
    waiverEndDate,
    effectiveDelayDays: rawDelayDays,
    isWaivedUnderCircular: false,
    actualFilingDateDisplay: filingYmd,
    delayComputationExplanation: explanation
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DUAL PENALTIES: RULE 21 PROCEDURAL FINES VS SECTION 76A SUBSTANTIVE
// ─────────────────────────────────────────────────────────────────────────────

export interface Dpt3Rule21PenaltyResult {
  companyBaseFine: number;
  officersBaseFine: number;
  officerCount: number;
  continuingDailyRate: number;
  continuingDays: number;
  continuingFineTotal: number;
  totalRule21Exposure: number;
  statutoryBasis: string;
  adjudicationNote: string;
}

export interface Dpt3Section76APenaltyResult {
  isApplicable: boolean;
  companyMinFine: string;
  companyMaxFine: string;
  officersImprisonment: string;
  officersFine: string;
  penalInterestRate: string;
  conditionNote: string;
  statutoryBasis: string;
}

/**
 * Calculates civil procedural fine exposure under Rule 21 of the Deposit Rules:
 * - Company: Fine up to ₹5,000
 * - Officers in default: Fine up to ₹5,000 per officer
 * - Continuing default: Fine up to ₹500 per day for every day during which the default continues.
 */
export function calculateDpt3Rule21Penalty(
  daysDelayed: number,
  officerCount: number = 2
): Dpt3Rule21PenaltyResult {
  const safeOfficers = Math.max(1, officerCount);
  if (daysDelayed <= 0) {
    return {
      companyBaseFine: 0,
      officersBaseFine: 0,
      officerCount: safeOfficers,
      continuingDailyRate: 500,
      continuingDays: 0,
      continuingFineTotal: 0,
      totalRule21Exposure: 0,
      statutoryBasis: 'Rule 21, Companies (Acceptance of Deposits) Rules, 2014',
      adjudicationNote: 'No delay; Rule 21 penalty exposure is ₹0.'
    };
  }

  const companyBase = 5000;
  const officersBase = safeOfficers * 5000;
  const continuing = daysDelayed * 500;
  const total = companyBase + officersBase + continuing;

  return {
    companyBaseFine: companyBase,
    officersBaseFine: officersBase,
    officerCount: safeOfficers,
    continuingDailyRate: 500,
    continuingDays: daysDelayed,
    continuingFineTotal: continuing,
    totalRule21Exposure: total,
    statutoryBasis: 'Rule 21, Companies (Acceptance of Deposits) Rules, 2014',
    adjudicationNote: 'Rule 21 penalties are not collected at MCA V3 e-Challan checkout. They represent civil liability in formal adjudication proceedings conducted by the Registrar of Companies under Section 454.'
  };
}

/**
 * Evaluates substantive penalty exposure under Section 76A of Companies Act, 2013.
 * Section 76A applies ONLY if a company accepts deposits in contravention of Sections 73/76
 * or fails to repay deposits within the stipulated time.
 */
export function evaluateDpt3Section76AExposure(
  filingPurpose: Dpt3FilingPurpose,
  hasActualDeposits: boolean = false
): Dpt3Section76APenaltyResult {
  const involvesDeposits = filingPurpose === 'deposits' || filingPurpose === 'both' || hasActualDeposits;

  if (!involvesDeposits) {
    return {
      isApplicable: false,
      companyMinFine: 'Not Applicable',
      companyMaxFine: 'Not Applicable',
      officersImprisonment: 'None (Exempted Receipts Only)',
      officersFine: 'None',
      penalInterestRate: 'N/A',
      conditionNote: 'The company reports only exempted transactions under Rule 2(1)(c) (such as director loans, inter-corporate borrowings, or customer advances). Section 76A does not apply unless receipts are legally recharacterized as unauthorized public deposits.',
      statutoryBasis: 'Section 76A, Companies Act, 2013'
    };
  }

  return {
    isApplicable: true,
    companyMinFine: '₹ 1 Crore or 2× the deposit amount (whichever is lower)',
    companyMaxFine: '₹ 10 Crore',
    officersImprisonment: 'Imprisonment up to 7 years',
    officersFine: '₹ 25 Lakhs to ₹ 2 Crore',
    penalInterestRate: '18% per annum penal interest on matured unpaid deposits',
    conditionNote: 'Severe liability triggered if deposits are accepted from public/members without satisfying Section 73/76 statutory credit rating, deposit repayment reserve (20%), or deposit insurance requirements.',
    statutoryBasis: 'Section 76A read with Sections 73 & 76, Companies Act, 2013'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AUDITOR CERTIFICATE & ATTACHMENT RULES
// ─────────────────────────────────────────────────────────────────────────────

export interface Dpt3AuditorCertAssessment {
  isMandatory: boolean;
  statusBadge: string;
  legalProvision: string;
  ruleExplanation: string;
  mandatoryAttachments: string[];
  optionalAttachments: string[];
}

export function evaluateDpt3AuditorCert(
  filingPurpose: Dpt3FilingPurpose
): Dpt3AuditorCertAssessment {
  if (filingPurpose === 'deposits' || filingPurpose === 'both') {
    return {
      isMandatory: true,
      statusBadge: 'Mandatory Attachment',
      legalProvision: 'Rule 16, Companies (Acceptance of Deposits) Rules, 2014',
      ruleExplanation: 'A certificate from the statutory auditor of the company certifying the deposit figures and compliance with deposit conditions MUST be attached to Form DPT-3 on MCA21 V3.',
      mandatoryAttachments: [
        'Auditor\'s Certificate on Return of Deposits (Rule 16)',
        'Copy of Trust Deed / Deposit Charge Instrument (if secured)',
        'List of Depositors with names, addresses, and amounts deposited'
      ],
      optionalAttachments: [
        'Credit Rating Certificate (for eligible public companies under Section 76)',
        'Deposit Insurance Contract / Policy Document (if applicable)'
      ]
    };
  }

  if (filingPurpose === 'one_time_loan') {
    return {
      isMandatory: false,
      statusBadge: 'Not Mandatory',
      legalProvision: 'Rule 16A(3), Companies (Acceptance of Deposits) Rules, 2014',
      ruleExplanation: 'For the historic one-time return of outstanding loans/receipts not considered as deposits, an auditor certificate was recommended but not strictly hard-blocked on the portal.',
      mandatoryAttachments: [
        'Schedule of outstanding receipts / borrowings'
      ],
      optionalAttachments: [
        'Auditor statement of reconciliation (optional)'
      ]
    };
  }

  // Exempted receipts or Nil return
  return {
    isMandatory: false,
    statusBadge: 'Exempt / Not Mandatory',
    legalProvision: 'Rule 16A, Companies (Acceptance of Deposits) Rules, 2014 & MCA V3 Kit',
    ruleExplanation: 'For reporting particulars of transactions not considered as deposit under Rule 2(1)(c) (such as director loans, customer advances, or inter-corporate loans), an Auditor\'s Certificate is NOT mandatory on MCA21 V3 portal.',
    mandatoryAttachments: [
      'Copy of Board resolution / loan agreements (if required by ROC query)'
    ],
    optionalAttachments: [
      'Auditor\'s certificate (optional best practice)',
      'Written declarations by directors under Rule 2(1)(c)(viii)'
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. NET WORTH & DEPOSIT CEILING ADVISOR (SECTIONS 73 & 76)
// ─────────────────────────────────────────────────────────────────────────────

export interface Dpt3DepositCeilingAdvice {
  companyType: 'eligible_public' | 'other_public' | 'private_standard' | 'private_startup_exempt';
  statutoryLimitDescription: string;
  maxDepositPercentage: number;
  netWorthBasisNote: string;
  exemptionCriteria: string[];
}

export function getDpt3DepositCeilings(
  isPrivate: boolean,
  isStartup: boolean,
  meets3Conditions: boolean,
  netWorthInCrores: number = 0,
  turnoverInCrores: number = 0
): Dpt3DepositCeilingAdvice {
  const netWorthBasisNote = 'Net worth must be taken from the latest audited balance sheet prior to the return date (e.g., for FY 2025-26 return, use audited balance sheet as on 31 March 2025).';

  if (isPrivate) {
    if (isStartup) {
      return {
        companyType: 'private_startup_exempt',
        statutoryLimitDescription: 'No Limit on acceptance of deposits from members for the first 10 years from incorporation (DPIIT Recognized Startup). Only annual reporting in DPT-3 is required.',
        maxDepositPercentage: Infinity,
        netWorthBasisNote,
        exemptionCriteria: [
          'Recognized as startup by DPIIT',
          'Period not exceeding 10 years from date of incorporation',
          'Must file DPT-3 annually disclosing member deposits'
        ]
      };
    }
    if (meets3Conditions) {
      return {
        companyType: 'private_startup_exempt',
        statutoryLimitDescription: 'No Limit on acceptance of deposits from members. Private company qualifies under 3-condition exemption notification G.S.R. 464(E). Only annual reporting in DPT-3 is required.',
        maxDepositPercentage: Infinity,
        netWorthBasisNote,
        exemptionCriteria: [
          'Not an associate or a subsidiary company of any other company',
          'Borrowings from banks/FIs/bodies corporate is less than 2× paid-up capital OR ₹50 Crore (whichever is lower)',
          'No subsisting default in the repayment of such borrowings at the time of accepting deposits'
        ]
      };
    }
    return {
      companyType: 'private_standard',
      statutoryLimitDescription: 'Up to 100% of aggregate of Paid-up Share Capital, Free Reserves, and Securities Premium Account from members under Section 73(2).',
      maxDepositPercentage: 100,
      netWorthBasisNote,
      exemptionCriteria: [
        'Standard private company limit: 100% of (Capital + Free Reserves + Sec Premium)'
      ]
    };
  }

  // Public Company
  const isEligible = netWorthInCrores >= 100 || turnoverInCrores >= 500;
  if (isEligible) {
    return {
      companyType: 'eligible_public',
      statutoryLimitDescription: 'Eligible Public Company (Net Worth ≥ ₹100 Cr OR Turnover ≥ ₹500 Cr): Can accept deposits up to 35% of (Capital + Free Reserves + Sec Premium) [Max 10% from members + Max 25% from public]. Requires Special Resolution and credit rating.',
      maxDepositPercentage: 35,
      netWorthBasisNote,
      exemptionCriteria: [
        'Net Worth ≥ ₹100 Crore OR Turnover ≥ ₹500 Crore',
        'Credit rating obtained from recognized rating agency',
        'Deposit Repayment Reserve of 20% maintained in scheduled bank'
      ]
    };
  }

  return {
    companyType: 'other_public',
    statutoryLimitDescription: 'Non-Eligible Public Company: Can accept deposits ONLY from members up to 35% of aggregate of Paid-up Share Capital, Free Reserves, and Securities Premium Account. Public deposits strictly barred.',
    maxDepositPercentage: 35,
    netWorthBasisNote,
    exemptionCriteria: [
      'Cannot accept deposits from public',
      'Member deposits capped at 35% of (Capital + Free Reserves + Sec Premium)'
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. MASTER COMPLIANCE ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────────────────

export interface Dpt3ComplianceCalculationInput {
  companyName?: string;
  nominalCapital: number;
  hasShareCapital?: boolean;
  filingPurpose: Dpt3FilingPurpose;
  financialYear: string;
  calcMode: Dpt3CalcMode;
  filingDate?: string;
  directDelayDays?: number;
  officerCount?: number;
  hasActualDeposits?: boolean;
}

export interface Dpt3ComplianceCalculationResult {
  metadata: {
    companyName: string;
    formCode: 'DPT-3';
    formName: string;
    filingPurpose: Dpt3FilingPurpose;
    filingPurposeLabel: string;
    financialYear: string;
    calcMode: Dpt3CalcMode;
    nominalCapital: number;
    hasShareCapital: boolean;
    statutoryDueDate: string;
    waiverEndDate: string | null;
    actualFilingDateDisplay: string;
    effectiveDelayDays: number;
    isWaivedUnderCircular: boolean;
    officerCount: number;
    statutoryWarning: string;
  };
  mcaPortalPayable: {
    normalFilingFee: number;
    tableBMultiplier: number;
    tableBSlabRange: string;
    additionalLateFee: number;
    totalPortalPayable: number;
    normalFeeBasis: string;
    additionalFeeBasis: string;
    challanTimingNotice: string;
  };
  rule21ProceduralFine: Dpt3Rule21PenaltyResult;
  section76ASubstantivePenalty: Dpt3Section76APenaltyResult;
  auditorCertificate: Dpt3AuditorCertAssessment;
  tableBSlabComparison: {
    slabRange: string;
    multiplierLabel: string;
    calculatedFeeForCompany: number;
    isActive: boolean;
  }[];
  criticalReminders: {
    noRevisionNotice: string;
    netWorthSourceNotice: string;
    llpNonApplicabilityNotice: string;
    ccfs2026Notice: string;
  };
}

/**
 * Authoritative Master Orchestrator for Form DPT-3.
 * Computes exact portal fees, delay multipliers, circular waivers,
 * Rule 21 procedural fines, and statutory reminders.
 */
export function calculateDpt3Compliance(
  input: Dpt3ComplianceCalculationInput
): Dpt3ComplianceCalculationResult {
  const hasShareCapital = input.hasShareCapital !== false;
  const officerCount = Math.max(1, input.officerCount ?? 2);
  const companyName = input.companyName?.trim() || 'Corporate Entity';

  // 1. Date & Delay Computation
  const dateResult = computeDpt3DatesAndDelay({
    financialYear: input.financialYear,
    calcMode: input.calcMode,
    filingDate: input.filingDate,
    directDelayDays: input.directDelayDays
  });

  // 2. Normal Base Fee
  const normalFee = calculateDpt3NormalFilingFee(input.nominalCapital, hasShareCapital);
  const normalFeeBasis = getDpt3NormalFeeExplanation(input.nominalCapital, hasShareCapital);

  // 3. Multiplier & Late Fee
  const multiplierResult = getDpt3TableBMultiplier(dateResult.effectiveDelayDays);
  const multiplier = dateResult.isWaivedUnderCircular ? 0 : multiplierResult.multiplier;
  const additionalLateFee = dateResult.isWaivedUnderCircular ? 0 : normalFee * multiplier;
  const totalPortalPayable = normalFee + additionalLateFee;

  let additionalFeeBasis = '';
  if (dateResult.isWaivedUnderCircular) {
    additionalFeeBasis = 'Additional late fee waived under MCA General Circular No. 02/2026 (filed within relief window up to 31 July 2026).';
  } else if (dateResult.effectiveDelayDays === 0) {
    additionalFeeBasis = 'Timely filing on or before statutory due date; ₹0 additional fee.';
  } else {
    additionalFeeBasis = `Table B multiplier of ${multiplier}× normal fee (₹${normalFee}) for ${dateResult.effectiveDelayDays} day(s) delay.`;
  }

  // 4. Rule 21 Fine Exposure
  const rule21Penalty = calculateDpt3Rule21Penalty(dateResult.effectiveDelayDays, officerCount);

  // 5. Section 76A Substantive Exposure
  const section76APenalty = evaluateDpt3Section76AExposure(
    input.filingPurpose,
    input.hasActualDeposits
  );

  // 6. Auditor Certificate Assessment
  const auditorCert = evaluateDpt3AuditorCert(input.filingPurpose);

  // 7. Filing Purpose Label
  let purposeLabel = 'Particulars of transactions not considered as deposit (Rule 2(1)(c))';
  if (input.filingPurpose === 'deposits') {
    purposeLabel = 'Return of Deposits (Sections 73 & 76)';
  } else if (input.filingPurpose === 'both') {
    purposeLabel = 'Return of Deposits & Exempted Receipts (Rule 2(1)(c))';
  } else if (input.filingPurpose === 'one_time_loan') {
    purposeLabel = 'One-time Return for outstanding loan/receipt not considered as deposit (Rule 16A(3))';
  } else if (input.filingPurpose === 'nil') {
    purposeLabel = 'Nil Return (Best Governance Practice)';
  }

  // 8. Slabs comparison for company's capital
  const tableBSlabComparison = DPT3_TABLE_B_SLABS.map((slab, idx) => ({
    slabRange: slab.delayRange,
    multiplierLabel: slab.multiplierLabel,
    calculatedFeeForCompany: normalFee * slab.multiplier,
    isActive: multiplierResult.slabIndex === idx && dateResult.effectiveDelayDays > 0 && !dateResult.isWaivedUnderCircular
  }));

  return {
    metadata: {
      companyName,
      formCode: 'DPT-3',
      formName: 'Form DPT-3: Return of Deposits and Particulars of Transactions Not Considered as Deposit',
      filingPurpose: input.filingPurpose,
      filingPurposeLabel: purposeLabel,
      financialYear: input.financialYear,
      calcMode: input.calcMode,
      nominalCapital: input.nominalCapital,
      hasShareCapital,
      statutoryDueDate: dateResult.statutoryDueDate,
      waiverEndDate: dateResult.waiverEndDate,
      actualFilingDateDisplay: dateResult.actualFilingDateDisplay,
      effectiveDelayDays: dateResult.effectiveDelayDays,
      isWaivedUnderCircular: dateResult.isWaivedUnderCircular,
      officerCount,
      statutoryWarning: multiplierResult.requiresSection403CondonationNotice
        ? 'WARNING: Filing delay exceeds 270 days. Second proviso to Section 403 may require prior condonation from the Central Government / Regional Director before filing.'
        : ''
    },
    mcaPortalPayable: {
      normalFilingFee: normalFee,
      tableBMultiplier: multiplier,
      tableBSlabRange: multiplierResult.slabRange,
      additionalLateFee,
      totalPortalPayable,
      normalFeeBasis,
      additionalFeeBasis,
      challanTimingNotice: 'Payable via MCA21 V3 e-Challan / Net Banking / UPI immediately upon form upload.'
    },
    rule21ProceduralFine: rule21Penalty,
    section76ASubstantivePenalty: section76APenalty,
    auditorCertificate: auditorCert,
    tableBSlabComparison,
    criticalReminders: {
      noRevisionNotice: 'Form DPT-3 cannot be revised once uploaded on MCA21 V3. If an error is discovered post-filing, the company must petition the ROC to mark the filing defective and file a fresh form.',
      netWorthSourceNotice: 'Net worth figures must be derived from the latest audited balance sheet prior to the return date (e.g. for FY 2025-26, use the audited balance sheet of 31 March 2025).',
      llpNonApplicabilityNotice: 'LLPs do NOT file Form DPT-3. DPT-3 is strictly prescribed for companies registered under the Companies Act, 2013. LLPs file Form 8 and Form 11.',
      ccfs2026Notice: 'CCFS-2026 amnesty scheme is valid until 15 September 2026 (MCA General Circular No. 04/2026). While primarily for AOC-4, MGT-7, and ADT-1, companies with past pending filings should review ROC circular directions.'
    }
  };
}
