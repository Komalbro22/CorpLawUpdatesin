import { NextRequest, NextResponse } from 'next/server';
import { calculateCompanyFee } from '@/lib/penaltyCalculator';

// GET /api/calculators/webmcp
// WebMCP tool: calculate_roc_late_fee
// Thin wrapper over the canonical calculateCompanyFee() in lib/penaltyCalculator.ts
// — single source of truth for all fee schedule logic.

const VALID_COMPANY_TYPES = ['Pvt', 'Public', 'OPC', 'Small', 'Section8'] as const;
type CompanyType = typeof VALID_COMPANY_TYPES[number];

const ANNUAL_FORMS = ['MGT-7', 'MGT-7A', 'AOC-4', 'AOC-4-XBRL', 'AOC-4-CFS', 'AOC-4-NBFC'];

const KNOWN_FORMS = [
  ...ANNUAL_FORMS,
  'DIR-3-KYC', 'DIR-12', 'DPT-3', 'BEN-2', 'INC-20A', 'INC-22', 'PAS-3',
  'MGT-14', 'MSME-1', 'PAS-6', 'SH-7', 'ADT-3', 'ADT-1', 'CRA-2', 'CRA-4',
  'AOC-5', 'MGT-15', 'MBP-1',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const form = (searchParams.get('form') ?? '').toUpperCase();
  const companyTypeRaw = searchParams.get('type') ?? '';
  const capitalRaw = searchParams.get('capital') ?? '';
  const delayRaw = searchParams.get('delay') ?? '';
  const officersRaw = searchParams.get('officers') ?? '3';

  // --- Input validation ---
  if (!form) {
    return NextResponse.json(
      { error: 'Missing required param: form (e.g. AOC-4, MGT-7, DIR-12)' },
      { status: 400 }
    );
  }
  if (!VALID_COMPANY_TYPES.includes(companyTypeRaw as CompanyType)) {
    return NextResponse.json(
      { error: `Invalid company type. Must be one of: ${VALID_COMPANY_TYPES.join(', ')}` },
      { status: 400 }
    );
  }
  const capital = parseInt(capitalRaw, 10);
  if (isNaN(capital) || capital < 0) {
    return NextResponse.json(
      { error: 'Invalid capital: must be a non-negative integer in rupees (e.g. 500000 for ₹5L)' },
      { status: 400 }
    );
  }
  const daysDelayed = parseInt(delayRaw, 10);
  if (isNaN(daysDelayed) || daysDelayed < 0) {
    return NextResponse.json(
      { error: 'Invalid delay: must be a non-negative integer (days)' },
      { status: 400 }
    );
  }
  const officers = Math.max(1, Math.min(parseInt(officersRaw, 10) || 3, 50));

  const result = calculateCompanyFee({
    companyType: companyTypeRaw as CompanyType,
    authorizedCapital: capital,
    formId: form,
    dueDate: '',
    actualDate: '',
    daysDelayed,
    officersCount: officers,
    isRepeatDefault: false,
  });

  const needsCondonation =
    daysDelayed > 270 && !ANNUAL_FORMS.includes(form) && form !== 'DIR-3-KYC';

  return NextResponse.json({
    form,
    companyType: companyTypeRaw,
    authorizedCapitalRupees: capital,
    daysDelayed,
    officersCount: officers,
    normalFee: result.normalFee,
    lateFee: result.lateFee,
    totalPayable: result.totalPayable,
    companyPenalty: result.companyPenalty,
    officerPenalty: result.officerPenalty,
    totalPenaltyExposure: result.totalPenaltyExposure,
    smallCompanyReliefApplied: result.isSmallCompanyReliefApplied,
    legalNote: needsCondonation
      ? 'Delay exceeds 270 days — condonation under Section 460/461 Companies Act 2013 may be required before ROC will accept filing.'
      : null,
    unknownFormWarning: KNOWN_FORMS.includes(form)
      ? null
      : `Form "${form}" is not in the standard penalty schedule. Results are best-effort estimates.`,
  });
}
