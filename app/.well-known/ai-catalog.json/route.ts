import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export async function GET() {
  const catalog = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    name: 'CorpLawUpdates.in AI Tool Catalog',
    description: 'Machine-readable catalog of corporate law tools, statutory calculators, and intelligence APIs for AI agents.',
    version: '1.0.0',
    capabilities: [
      {
        id: 'regulatory_intelligence',
        name: 'Regulatory Updates Search',
        description: 'Real-time MCA, SEBI, RBI, NCLT, and IBC circular summaries.',
        url: 'https://www.corplawupdates.in/updates',
        api: 'https://www.corplawupdates.in/api/search',
      },
      {
        id: 'roc_late_fee_calculator',
        name: 'Company ROC Fee & Section 454 Penalty Calculator',
        description: 'Statutory calculation of late filing fees and Section 454 adjudication penalty exposure for MCA company forms.',
        url: 'https://www.corplawupdates.in/tools/fee-calculator',
        api: 'https://www.corplawupdates.in/api/calculators/webmcp',
      },
      {
        id: 'llp_late_fee_calculator',
        name: 'LLP Late Fee & Penalty Calculator',
        description: 'Calculates delayed filing additional fees and Section 34/35 penalty for LLP Form 8 and Form 11.',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/llp',
        api: 'https://www.corplawupdates.in/api/calculators/webmcp-llp',
      },
      {
        id: 'compliance_calendar',
        name: 'Statutory Compliance Calendar',
        description: 'Upcoming corporate filing deadlines across MCA, SEBI, RBI, Income Tax, GST, and Labour Laws.',
        url: 'https://www.corplawupdates.in/calendar',
        api: 'https://www.corplawupdates.in/api/compliance/webmcp',
      },
      {
        id: 'rbi_repo_rates',
        name: 'RBI Monetary Policy & Repo Rates',
        description: 'Current Repo Rate, SDF, MSF, MPC policy stance, and scheduled meeting dates.',
        url: 'https://www.corplawupdates.in/tools/repo-rate',
        api: 'https://www.corplawupdates.in/api/rbi/webmcp',
      },
      {
        id: 'cin_decoder',
        name: 'Corporate Identification Number (CIN) Decoder',
        description: 'Decodes 21-digit CINs into 6 statutory dimensions: listing status, NIC code, RoC jurisdiction, year, and legal class.',
        url: 'https://www.corplawupdates.in/tools/cin-decoder',
        api: 'https://www.corplawupdates.in/tools/cin-decoder',
      },
      {
        id: 'legal_documents',
        name: 'Legal Document Drafting Templates',
        description: '34+ secretarial drafting templates (Board Resolutions, NDAs, MoUs, Lease Agreements) formatted per ICSI SS-1.',
        url: 'https://www.corplawupdates.in/documents',
        api: 'https://www.corplawupdates.in/api/documents/webmcp',
      },
    ],
    webmcp: {
      manifest: 'https://www.corplawupdates.in/.well-known/webmcp',
      documentation: 'https://www.corplawupdates.in/mcp',
      llms_txt: 'https://www.corplawupdates.in/llms.txt',
    },
  };

  return NextResponse.json(catalog, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
