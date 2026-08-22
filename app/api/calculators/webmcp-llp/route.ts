import { NextRequest, NextResponse } from 'next/server';
import { calculateLlpFee, LlpFormId, Form3Modality, Form8ChargeModality, Form15Scenario } from '@/lib/penaltyCalculator';

// GET /api/calculators/webmcp-llp
// WebMCP tool: calculate_llp_late_fee
// Multi-form statutory calculation engine for LLP compliance under LLP Rules 2009 & 2022 amendments.

const VALID_FORMS = [
  'Form-8-Annual',
  'Form-8-Charge',
  'Form-11',
  'Form-3',
  'Form-4',
  'Form-5',
  'Form-15',
  'Form-24',
  'Form-8', // Legacy alias
] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const formRaw = searchParams.get('form') ?? 'Form-11';
  const llpTypeRaw = searchParams.get('type') as 'Regular' | 'Small' | null;
  const contributionRaw = searchParams.get('contribution') ?? '0';
  const turnoverRaw = searchParams.get('turnover');
  const delayRaw = searchParams.get('delay');
  const actualDateRaw = searchParams.get('fileDate') ?? searchParams.get('actualDate') ?? '';
  const eventDateRaw = searchParams.get('eventDate') ?? searchParams.get('event') ?? '';
  const fyRaw = searchParams.get('fy') ?? searchParams.get('financialYear') ?? '2025-26';
  const dpCountRaw = searchParams.get('dp') ?? searchParams.get('dpCount') ?? '2';
  const form3ModalityRaw = (searchParams.get('form3Modality') ?? 'initial') as Form3Modality;
  const cNewRaw = searchParams.get('cNew');
  const form8ChargeModalityRaw = (searchParams.get('form8ChargeModality') ?? 'creation') as Form8ChargeModality;
  const form15ScenarioRaw = (searchParams.get('form15Scenario') ?? 'within_local_limits') as Form15Scenario;

  // Normalize form name
  const normalizeForm = (raw: string): string => {
    const cleaned = raw.replace(/\s/g, '').toUpperCase();
    if (cleaned === '8' || cleaned === 'FORM8' || cleaned === 'FORM-8') return 'Form-8-Annual';
    if (cleaned === '8-ANNUAL' || cleaned === 'FORM-8-ANNUAL' || cleaned === 'FORM8ANNUAL') return 'Form-8-Annual';
    if (cleaned === '8-CHARGE' || cleaned === 'FORM-8-CHARGE' || cleaned === 'FORM8CHARGE') return 'Form-8-Charge';
    if (cleaned === '11' || cleaned === 'FORM11' || cleaned === 'FORM-11') return 'Form-11';
    if (cleaned === '3' || cleaned === 'FORM3' || cleaned === 'FORM-3') return 'Form-3';
    if (cleaned === '4' || cleaned === 'FORM4' || cleaned === 'FORM-4') return 'Form-4';
    if (cleaned === '5' || cleaned === 'FORM5' || cleaned === 'FORM-5') return 'Form-5';
    if (cleaned === '15' || cleaned === 'FORM15' || cleaned === 'FORM-15') return 'Form-15';
    if (cleaned === '24' || cleaned === 'FORM24' || cleaned === 'FORM-24') return 'Form-24';
    return raw;
  };

  const form = normalizeForm(formRaw);

  const contribution = parseFloat(contributionRaw);
  if (isNaN(contribution) || contribution < 0) {
    return NextResponse.json(
      { error: 'Invalid contribution: must be a non-negative number in rupees.' },
      { status: 400 }
    );
  }

  const turnover = turnoverRaw ? parseFloat(turnoverRaw) : undefined;
  const dpCount = Math.max(1, Math.min(parseInt(dpCountRaw, 10) || 2, 100));
  const cNew = cNewRaw ? parseFloat(cNewRaw) : undefined;
  const explicitDelay = delayRaw ? parseInt(delayRaw, 10) : undefined;

  const result = calculateLlpFee({
    formId: form,
    contribution,
    turnover,
    llpType: llpTypeRaw || undefined,
    financialYear: fyRaw,
    eventDate: eventDateRaw || undefined,
    actualDate: actualDateRaw || undefined,
    daysDelayed: explicitDelay,
    dpCount,
    form3Modality: form3ModalityRaw,
    cNew,
    form8ChargeModality: form8ChargeModalityRaw,
    form15Scenario: form15ScenarioRaw,
  });

  return NextResponse.json({
    form: result.formId,
    formName: result.formName,
    isSmallLlp: result.isSmallLlp,
    smallLlpAssessmentBasis: result.smallLlpAssessmentBasis,
    contributionRupees: contribution,
    turnoverRupees: turnover,
    daysDelayed: result.days,
    designatedPartners: dpCount,
    dueDate: result.dueDate,
    actualDate: result.actualDate,
    tier1NormalFee: result.normalFee,
    tier2AdditionalFee: result.lateFee,
    tier3IncrementalFee: result.incrementalFee,
    totalMcaPortalPayable: result.totalPayable,
    tier4StatutoryPenaltyExposure: {
      llpEntityPenalty: result.llpPenalty,
      designatedPartnersPenalty: result.dpPenalty,
      totalAdjudicationExposure: result.totalPenaltyExposure,
      notice: result.penaltyNotice,
    },
    statutoryAuthority: result.statutoryAuthority,
    whyExplanation: result.whyExplanation,
    proceduralNotes: result.proceduralNotes,
    legalDisclaimer:
      'Calculator-generated estimate under the Limited Liability Partnership Act, 2008 & LLP Rules, 2009. Does not constitute an audit, certification, or legal opinion. Official fees are determined by the MCA portal.',
  });
}
