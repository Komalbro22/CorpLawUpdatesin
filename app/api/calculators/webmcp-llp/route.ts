import { NextRequest, NextResponse } from 'next/server';
import { calculateLlpFee } from '@/lib/penaltyCalculator';

// GET /api/calculators/webmcp-llp
// WebMCP tool: calculate_llp_late_fee
// Thin wrapper over the canonical calculateLlpFee() in lib/penaltyCalculator.ts
// — single source of truth for all LLP fee schedule logic (LLP 2nd Amendment Rules 2022).

const VALID_LLP_TYPES = ['Regular', 'Small'] as const;
type LlpType = typeof VALID_LLP_TYPES[number];

const VALID_FORMS = ['Form-8', 'Form-11'] as const;
type LlpFormId = typeof VALID_FORMS[number];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const formRaw = searchParams.get('form') ?? 'Form-11';
  const llpTypeRaw = searchParams.get('type') ?? '';
  const contributionRaw = searchParams.get('contribution') ?? '';
  const delayRaw = searchParams.get('delay') ?? '';
  const dpCountRaw = searchParams.get('dp') ?? '2';

  // --- Input validation ---
  // Normalize form name: accept "form-8", "Form8", "8" → "Form-8"
  const normalizeForm = (raw: string): string => {
    const cleaned = raw.replace(/\s/g, '').toUpperCase();
    if (cleaned === '8' || cleaned === 'FORM8' || cleaned === 'FORM-8') return 'Form-8';
    if (cleaned === '11' || cleaned === 'FORM11' || cleaned === 'FORM-11') return 'Form-11';
    return raw;
  };

  const form = normalizeForm(formRaw) as LlpFormId;
  if (!VALID_FORMS.includes(form)) {
    return NextResponse.json(
      { error: 'Invalid form. Must be Form-8 (Annual Statement) or Form-11 (Annual Return).' },
      { status: 400 }
    );
  }

  if (!VALID_LLP_TYPES.includes(llpTypeRaw as LlpType)) {
    return NextResponse.json(
      { error: 'Invalid llpType. Must be Regular or Small.' },
      { status: 400 }
    );
  }

  const contribution = parseInt(contributionRaw, 10);
  if (isNaN(contribution) || contribution < 0) {
    return NextResponse.json(
      { error: 'Invalid contribution: must be a non-negative integer in rupees (e.g. 500000 for ₹5L).' },
      { status: 400 }
    );
  }

  const daysDelayed = parseInt(delayRaw, 10);
  if (isNaN(daysDelayed) || daysDelayed < 0) {
    return NextResponse.json(
      { error: 'Invalid delay: must be a non-negative integer (days).' },
      { status: 400 }
    );
  }

  const dpCount = Math.max(1, Math.min(parseInt(dpCountRaw, 10) || 2, 100));

  const result = calculateLlpFee({
    llpType: llpTypeRaw as LlpType,
    contribution,
    formId: form,
    dueDate: '',
    actualDate: '',
    daysDelayed,
    dpCount,
  });

  const formDescription = form === 'Form-8'
    ? 'Statement of Account & Solvency (Form 8)'
    : 'Annual Return of LLP (Form 11)';

  return NextResponse.json({
    form,
    formDescription,
    llpType: llpTypeRaw,
    contributionRupees: contribution,
    daysDelayed,
    designatedPartners: dpCount,
    normalFee: result.normalFee,
    lateFee: result.lateFee,
    totalPayable: result.totalPayable,
    llpEntityPenalty: result.llpPenalty,
    designatedPartnersPenalty: result.dpPenalty,
    totalPenaltyExposure: result.totalPenaltyExposure,
    isSmallLlp: result.isSmallLlp,
    legalBasis: 'LLP Rules 2009, Rule 36 & Annexure-A as amended by LLP 2nd Amendment Rules 2022 (w.e.f. 01.04.2022)',
    legalNote: daysDelayed > 360
      ? 'Delay exceeds 360 days. Late fee is capped at the maximum multiplier. Condonation before ROC may be required.'
      : null,
  });
}
