// lib/ibbi-calculator/types.ts

export type LiquidationFormId = 'LIQ-1' | 'LIQ-2' | 'LIQ-3' | 'LIQ-4' | 'OTHER';

export type CirpFormId =
  | 'CIRP-1'
  | 'CIRP-2'
  | 'CIRP-3'
  | 'CIRP-4'
  | 'CIRP-5'
  | 'CIRP-6'
  | 'CIRP-7'
  | 'IP-1';

export interface FormMetadata {
  id: string;
  name: string;
  title: string;
  description: string;
  statutoryTimeline: string;
  governingRegulation: string;
}

export interface IbbiFeeResult {
  formId: string;
  formName: string;
  dueDate: string;
  submissionDate: string;
  monthsOfDelay: number;
  daysOfDelay: number;
  numberOfForms: number;
  baseFeePerMonth: number; // ₹500
  totalBaseFee: number;
  gstRate: number; // 0.18
  totalGst: number; // ₹90 per month
  totalPayable: number; // ₹590 per month
  isCorrectionOrUpdation: boolean;
  isEligibleForFee: boolean; // due on or before cutoff date
  statutoryAuthority: string;
  circularReference: string;
  statutoryNote: string;
}

export interface LiquidatorSlabResult {
  slabRange: string;
  amountInSlab: number;
  ratePercent: number;
  feeAmount: number;
}

export interface LiquidatorFeeResult {
  realisationAmount: number;
  distributionAmount: number;
  timePeriod: '0-6m' | '6-12m' | '1-2y' | 'above2y';
  realisationSlabs: LiquidatorSlabResult[];
  distributionSlabs: LiquidatorSlabResult[];
  totalRealisationFee: number;
  totalDistributionFee: number;
  totalLiquidatorFee: number;
  gstAmount: number;
  grossPayable: number;
}
