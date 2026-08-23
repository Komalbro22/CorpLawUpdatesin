import { NextRequest, NextResponse } from 'next/server';
import { calculateCompanyFee } from '@/lib/penaltyCalculator';
import { calculateMgt7Compliance } from '@/lib/rule-engine/mgt7-engine';

// GET /api/calculators/webmcp
// WebMCP tool: calculate_roc_late_fee
// Thin wrapper over the canonical calculateCompanyFee() in lib/penaltyCalculator.ts
// and calculateMgt7Compliance() in lib/rule-engine/mgt7-engine.ts
// — single source of truth for all fee schedule logic.

const VALID_COMPANY_TYPES = ['Pvt', 'Public', 'OPC', 'Small', 'Section8', 'Producer', 'Startup'] as const;
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

  // Optional fact parameters for Section 92 / Section 2(85)
  const fyEndRaw = searchParams.get('fyEnd') ?? '2026-03-31';
  const turnoverRaw = searchParams.get('turnover') ?? '';
  const agmTypeRaw = (searchParams.get('agmType') ?? 'subsequent') as 'first' | 'subsequent';
  const agmStatusRaw = (searchParams.get('agmStatus') ?? 'held') as 'held' | 'extended_and_held' | 'not_held';
  const isHolding = searchParams.get('isHolding') === 'true';
  const isSubsidiary = searchParams.get('isSubsidiary') === 'true';
  const isSection8 = searchParams.get('isSection8') === 'true' || companyTypeRaw === 'Section8';

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

  // Dedicated branch for MGT-7 / MGT-7A
  if (form === 'MGT-7' || form === 'MGT-7A') {
    const fyEnd = new Date(fyEndRaw);
    const turnover = turnoverRaw ? parseInt(turnoverRaw, 10) : 0;
    const isOpc = companyTypeRaw === 'OPC';
    const isPrivate = companyTypeRaw === 'Pvt' || companyTypeRaw === 'Small' || companyTypeRaw === 'OPC';
    const isStartup = companyTypeRaw === 'Startup';
    const isProducer = companyTypeRaw === 'Producer';

    const filingDate = new Date();
    // Simulate filing date from delay
    const standardDueDate = new Date(fyEnd);
    standardDueDate.setMonth(standardDueDate.getMonth() + 6);
    standardDueDate.setDate(standardDueDate.getDate() + 60);
    const actualFilingDate = new Date(standardDueDate);
    actualFilingDate.setDate(actualFilingDate.getDate() + daysDelayed);

    const mgtResult = calculateMgt7Compliance({
      formCode: form as 'MGT-7' | 'MGT-7A',
      nominalCapital: capital,
      hasShareCapital: true,
      financialYearEnd: isNaN(fyEnd.getTime()) ? new Date('2026-03-31') : fyEnd,
      agmType: agmTypeRaw,
      agmStatus: agmStatusRaw,
      actualAgmDate: new Date(fyEnd.getFullYear(), fyEnd.getMonth() + 6, 30),
      actualFilingDate,
      officerCount: officers,
      isPrivateCompany: isPrivate,
      isHoldingCompany: isHolding,
      isSubsidiaryCompany: isSubsidiary,
      isSection8Company: isSection8,
      isOnePersonCompany: isOpc,
      isStartupCompany: isStartup,
      isProducerCompany: isProducer,
      turnoverPrecedingFY: isNaN(turnover) ? 0 : turnover,
      paidUpCapital: capital
    });

    return NextResponse.json({
      form,
      companyType: companyTypeRaw,
      authorizedCapitalRupees: capital,
      daysDelayed,
      officersCount: officers,
      normalFee: mgtResult.mcaPortalPayable.normalFilingFee,
      lateFee: mgtResult.mcaPortalPayable.additionalFilingFee,
      totalPayable: mgtResult.mcaPortalPayable.totalPortalPayable,
      companyPenalty: mgtResult.statutoryPenaltyExposure.companyIndicativeMaximumExposure,
      officerPenalty: mgtResult.statutoryPenaltyExposure.officersIndicativeMaximumExposure,
      totalPenaltyExposure: mgtResult.statutoryPenaltyExposure.totalIndicativeMaximumExposure,
      smallCompanyReliefApplied: mgtResult.metadata.section446BEligible,
      smallCompanyAssessment: mgtResult.smallCompanyAssessment,
      pcsCertification: mgtResult.pcsCertification,
      formRoutingRecommendation: mgtResult.metadata.formRoutingRecommendation ?? null,
      legalNote: 'MCA21 portal payable consists of Normal Fee + Additional Fee. Section 92(5) statutory penalty exposure requires formal adjudication under Section 454.',
      unknownFormWarning: null
    });
  }

  const result = calculateCompanyFee({
    companyType: (['Pvt', 'Public', 'OPC', 'Small', 'Section8'].includes(companyTypeRaw) ? companyTypeRaw : 'Pvt') as any,
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
