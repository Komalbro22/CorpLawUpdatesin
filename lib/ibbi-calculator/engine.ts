// lib/ibbi-calculator/engine.ts
import {
  LiquidationFormId,
  CirpFormId,
  FormMetadata,
  IbbiFeeResult,
  LiquidatorFeeResult,
  LiquidatorSlabResult,
} from './types';

export const LIQUIDATION_FORMS: Record<LiquidationFormId, FormMetadata> = {
  'LIQ-1': {
    id: 'LIQ-1',
    name: 'Form LIQ-1',
    title: 'Progress Report & Appointment Intimation',
    description:
      'Quarterly progress report of the liquidation process (submitted within 15 days of quarter end) and intimation of appointment of liquidator (within 7 days).',
    statutoryTimeline: 'Within 15 days from quarter end / 7 days of appointment',
    governingRegulation: 'Regulation 47B read with Regulation 15 of IBBI Liquidation Regulations, 2016',
  },
  'LIQ-2': {
    id: 'LIQ-2',
    name: 'Form LIQ-2',
    title: 'Preliminary Report, Asset Memo & Valuation',
    description:
      'Preliminary report, asset memorandum, valuation summary, and initial list of stakeholders admitted under Section 38.',
    statutoryTimeline: 'Within 75 days from the liquidation commencement date',
    governingRegulation: 'Regulation 47B read with Regulations 13 & 34 of IBBI Liquidation Regulations, 2016',
  },
  'LIQ-3': {
    id: 'LIQ-3',
    name: 'Form LIQ-3',
    title: 'Sale of Assets & Distribution of Proceeds',
    description:
      'Realisation of corporate debtor assets (auction details, reserve vs realized price) and distribution to stakeholders under Section 53 waterfall.',
    statutoryTimeline: 'Within 15 days of completion of sale / distribution event',
    governingRegulation: 'Regulation 47B read with Regulations 32 & 42 of IBBI Liquidation Regulations, 2016',
  },
  'LIQ-4': {
    id: 'LIQ-4',
    name: 'Form LIQ-4',
    title: 'Final Report & Closure / Dissolution',
    description:
      'Final report showing realization, audited statement of receipts and payments, and compliance prior to filing dissolution under Section 54.',
    statutoryTimeline: 'Prior to application for dissolution under Section 54',
    governingRegulation: 'Regulation 47B read with Regulation 45 of IBBI Liquidation Regulations, 2016',
  },
  OTHER: {
    id: 'OTHER',
    name: 'Other Liquidation Form',
    title: 'Statutory Form under Regulation 47B',
    description:
      'Any other statutory electronic filing, return, or disclosure mandated by IBBI under the Liquidation Process Regulations.',
    statutoryTimeline: 'As per applicable IBBI notification',
    governingRegulation: 'Regulation 47B of IBBI (Liquidation Process) Regulations, 2016',
  },
};

export const CIRP_FORMS: Record<CirpFormId, FormMetadata> = {
  'CIRP-1': {
    id: 'CIRP-1',
    name: 'Form CIRP-1',
    title: 'IRP Appointment & Public Announcement',
    description: 'Intimation of appointment of Interim Resolution Professional and details of public announcement.',
    statutoryTimeline: 'Within 7 days of appointment of IRP',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
  'CIRP-2': {
    id: 'CIRP-2',
    name: 'Form CIRP-2',
    title: 'Appointment of Resolution Professional',
    description: 'Confirmation or replacement of IRP as RP by the Committee of Creditors (CoC).',
    statutoryTimeline: 'Within 7 days of appointment / replacement of RP',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
  'CIRP-3': {
    id: 'CIRP-3',
    name: 'Form CIRP-3',
    title: 'Information Memorandum & Valuation Report',
    description: 'Details of Information Memorandum (IM), appointment of registered valuers, and fair & liquidation values.',
    statutoryTimeline: 'Within 14 days of issue of IM to CoC members',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
  'CIRP-4': {
    id: 'CIRP-4',
    name: 'Form CIRP-4',
    title: 'Expression of Interest & Resolution Plans Received',
    description: 'Publication of Form G, list of prospective resolution applicants (PRAs), and request for resolution plans (RFRP).',
    statutoryTimeline: 'Within 7 days of issue of RFRP',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
  'CIRP-5': {
    id: 'CIRP-5',
    name: 'Form CIRP-5',
    title: 'Approval or Rejection of Resolution Plan by CoC',
    description: 'Voting results of the CoC on compliant resolution plans or decision to liquidate.',
    statutoryTimeline: 'Within 7 days of CoC approval/rejection',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
  'CIRP-6': {
    id: 'CIRP-6',
    name: 'Form CIRP-6',
    title: 'Adjudicating Authority (NCLT) Order',
    description: 'Order of NCLT approving resolution plan, rejecting plan, or ordering liquidation under Section 33.',
    statutoryTimeline: 'Within 7 days of receipt of certified NCLT order',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
  'CIRP-7': {
    id: 'CIRP-7',
    name: 'Form CIRP-7',
    title: 'Timeline & Non-Completion Tracker',
    description: 'Intimation of reasons when CIRP extends beyond 180, 270, or 330 days.',
    statutoryTimeline: 'Within 3 days of expiry of 180 / 270 / 330 days',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
  'IP-1': {
    id: 'IP-1',
    name: 'Form IP-1',
    title: 'Half-Yearly Return by Insolvency Professional',
    description: 'Biannual statutory return by registered Insolvency Professional disclosing all active assignments.',
    statutoryTimeline: 'Within 15 days from half-year end (15 April & 15 October)',
    governingRegulation: 'Regulation 40B of IBBI (CIRP) Regulations, 2016',
  },
};

/**
 * Calculates calendar months of delay between statutory due date and submission date.
 * If submission is on or before due date, delay is 0.
 * In IBBI practice, each calendar month or fraction/part thereof is counted as 1 month.
 */
export function calculateMonthsOfDelay(dueDateStr: string, submissionDateStr: string): {
  months: number;
  days: number;
} {
  const dDue = new Date(dueDateStr);
  const dSub = new Date(submissionDateStr);

  if (isNaN(dDue.getTime()) || isNaN(dSub.getTime()) || dSub <= dDue) {
    return { months: 0, days: 0 };
  }

  const diffMs = dSub.getTime() - dDue.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Calendar month calculation:
  // Year & Month difference
  let months =
    (dSub.getFullYear() - dDue.getFullYear()) * 12 +
    (dSub.getMonth() - dDue.getMonth());

  // If the day in submission month is greater than the day in due month, it steps into another month
  if (dSub.getDate() > dDue.getDate()) {
    months += 1;
  }

  // Minimum 1 month of delay if submitted after due date
  months = Math.max(1, months);

  return { months, days };
}

/**
 * Calculates delayed filing fee for Liquidation Forms under Regulation 47B & Circular No. IBBI/LIQ/107/2026
 */
export function calculateLiquidationFee(params: {
  formId: LiquidationFormId;
  dueDate: string;
  submissionDate: string;
  numberOfForms?: number;
  isCorrectionOrUpdation?: boolean;
}): IbbiFeeResult {
  const count = Math.max(1, params.numberOfForms || 1);
  const { months, days } = calculateMonthsOfDelay(params.dueDate, params.submissionDate);
  const meta = LIQUIDATION_FORMS[params.formId] || LIQUIDATION_FORMS.OTHER;

  const CUTOFF_DATE = new Date('2026-09-30');
  const dDue = new Date(params.dueDate);
  const isDueOnOrBeforeCutoff = !isNaN(dDue.getTime()) && dDue <= CUTOFF_DATE;

  const baseFeePerMonth = 500;
  const gstRate = 0.18; // 18% GST under SAC 9991 / 9983

  const totalBaseFee = months * baseFeePerMonth * count;
  const totalGst = Math.round(totalBaseFee * gstRate);
  const totalPayable = totalBaseFee + totalGst;

  let note = '';
  if (months === 0) {
    note = 'Form submitted on or before due date. No delayed filing fee is applicable under Regulation 47B.';
  } else if (params.isCorrectionOrUpdation) {
    note =
      'Circular No. IBBI/LIQ/107/2026 explicitly stipulates that forms submitted after the due date "whether by correction, updation, or otherwise" attract ₹500/month + 18% GST.';
  } else if (!isDueOnOrBeforeCutoff) {
    note =
      'Note: Circular No. IBBI/LIQ/107/2026 specifically commenced levy for forms due on or before 30/09/2026 (30 September 2026). For subsequent periods, the standard ₹500/month fee under Regulation 47B applies upon delay.';
  } else {
    note =
      'Mandatory fee under Regulation 47B read with Circular No. IBBI/LIQ/107/2026. Fee must be deposited via IBBI Portal / Bharatkosh before receipt generation.';
  }

  return {
    formId: meta.id,
    formName: meta.name,
    dueDate: params.dueDate,
    submissionDate: params.submissionDate,
    monthsOfDelay: months,
    daysOfDelay: days,
    numberOfForms: count,
    baseFeePerMonth,
    totalBaseFee,
    gstRate,
    totalGst,
    totalPayable,
    isCorrectionOrUpdation: !!params.isCorrectionOrUpdation,
    isEligibleForFee: isDueOnOrBeforeCutoff,
    statutoryAuthority: 'Insolvency and Bankruptcy Board of India (IBBI)',
    circularReference: 'Circular No. IBBI/LIQ/107/2026 dated 24.09.2026',
    statutoryNote: note,
  };
}

/**
 * Calculates delayed filing fee for CIRP Forms under Regulation 40B
 */
export function calculateCirpFee(params: {
  formId: CirpFormId;
  dueDate: string;
  submissionDate: string;
  numberOfForms?: number;
  isCorrectionOrUpdation?: boolean;
}): IbbiFeeResult {
  const count = Math.max(1, params.numberOfForms || 1);
  const { months, days } = calculateMonthsOfDelay(params.dueDate, params.submissionDate);
  const meta = CIRP_FORMS[params.formId] || CIRP_FORMS['CIRP-1'];

  const baseFeePerMonth = 500;
  const gstRate = 0.18;

  const totalBaseFee = months * baseFeePerMonth * count;
  const totalGst = Math.round(totalBaseFee * gstRate);
  const totalPayable = totalBaseFee + totalGst;

  let note = '';
  if (months === 0) {
    note = 'Form submitted on or before due date. No delayed fee is payable under Regulation 40B.';
  } else if (params.isCorrectionOrUpdation) {
    note =
      'Modification Utility Note: Under Regulation 40B, modifying a CIRP form after the due date attracts ₹500/month + 18% GST until the date of updated submission.';
  } else {
    note =
      'Governed by Regulation 40B of IBBI (Insolvency Resolution Process for Corporate Persons) Regulations, 2016. Delayed filing may impact AFA renewal by IPA.';
  }

  return {
    formId: meta.id,
    formName: meta.name,
    dueDate: params.dueDate,
    submissionDate: params.submissionDate,
    monthsOfDelay: months,
    daysOfDelay: days,
    numberOfForms: count,
    baseFeePerMonth,
    totalBaseFee,
    gstRate,
    totalGst,
    totalPayable,
    isCorrectionOrUpdation: !!params.isCorrectionOrUpdation,
    isEligibleForFee: true,
    statutoryAuthority: 'Insolvency and Bankruptcy Board of India (IBBI)',
    circularReference: 'Regulation 40B read with Circular No. IBBI/CIRP/89/2025',
    statutoryNote: note,
  };
}

/**
 * Liquidator's Remuneration Slabs under Regulation 4(2)(b) of IBBI Liquidation Regulations, 2016
 * Amounts in INR. (e.g. 1 Crore = 10,000,000)
 */
const REALISATION_RATES = {
  '0-6m': [5.0, 3.75, 2.5, 1.25, 0.25],
  '6-12m': [3.75, 2.8, 1.88, 0.94, 0.19],
  '1-2y': [2.5, 1.88, 1.25, 0.63, 0.13],
  above2y: [1.25, 0.94, 0.63, 0.31, 0.06],
};

const DISTRIBUTION_RATES = {
  '0-6m': [2.5, 1.88, 1.25, 0.63, 0.13],
  '6-12m': [1.88, 1.4, 0.94, 0.47, 0.1],
  '1-2y': [1.25, 0.94, 0.63, 0.31, 0.06],
  above2y: [0.63, 0.47, 0.31, 0.16, 0.03],
};

const SLAB_LIMITS = [
  { label: 'On the first ₹1 Crore', max: 10000000 },
  { label: 'On the next ₹9 Crores (₹1 Cr to ₹10 Cr)', max: 90000000 },
  { label: 'On the next ₹40 Crores (₹10 Cr to ₹50 Cr)', max: 400000000 },
  { label: 'On the next ₹50 Crores (₹50 Cr to ₹100 Cr)', max: 500000000 },
  { label: 'On the amount thereafter (> ₹100 Crores)', max: Infinity },
];

function calculateSlabs(
  totalAmount: number,
  rates: number[]
): { slabs: LiquidatorSlabResult[]; totalFee: number } {
  let remaining = Math.max(0, totalAmount);
  const slabs: LiquidatorSlabResult[] = [];
  let totalFee = 0;

  for (let i = 0; i < SLAB_LIMITS.length; i++) {
    const limit = SLAB_LIMITS[i];
    const rate = rates[i];

    if (remaining <= 0) {
      slabs.push({
        slabRange: limit.label,
        amountInSlab: 0,
        ratePercent: rate,
        feeAmount: 0,
      });
      continue;
    }

    const alloc = Math.min(remaining, limit.max);
    const fee = Math.round((alloc * rate) / 100);
    remaining -= alloc;
    totalFee += fee;

    slabs.push({
      slabRange: limit.label,
      amountInSlab: alloc,
      ratePercent: rate,
      feeAmount: fee,
    });
  }

  return { slabs, totalFee };
}

/**
 * Calculates statutory remuneration fee for Liquidator under Regulation 4(2)(b)
 */
export function calculateLiquidatorFee(
  realisationAmount: number,
  distributionAmount: number,
  timePeriod: '0-6m' | '6-12m' | '1-2y' | 'above2y' = '0-6m'
): LiquidatorFeeResult {
  const rResult = calculateSlabs(realisationAmount, REALISATION_RATES[timePeriod]);
  const dResult = calculateSlabs(distributionAmount, DISTRIBUTION_RATES[timePeriod]);

  const totalLiquidatorFee = rResult.totalFee + dResult.totalFee;
  const gstAmount = Math.round(totalLiquidatorFee * 0.18);
  const grossPayable = totalLiquidatorFee + gstAmount;

  return {
    realisationAmount,
    distributionAmount,
    timePeriod,
    realisationSlabs: rResult.slabs,
    distributionSlabs: dResult.slabs,
    totalRealisationFee: rResult.totalFee,
    totalDistributionFee: dResult.totalFee,
    totalLiquidatorFee,
    gstAmount,
    grossPayable,
  };
}
