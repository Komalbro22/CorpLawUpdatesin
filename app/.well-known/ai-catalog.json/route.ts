import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export function getAICatalog() {
  return {
    specVersion: '1.0',
    host: {
      displayName: 'CorpLawUpdates.in',
      identifier: 'did:web:corplawupdates.in',
      documentationUrl: 'https://www.corplawupdates.in/mcp',
      logoUrl: 'https://www.corplawupdates.in/icon.png',
    },
    entries: [
      {
        identifier: 'urn:air:corplawupdates.in:mcp:server',
        displayName: 'CorpLawUpdates.in WebMCP Server',
        type: 'application/mcp-server+json',
        url: 'https://www.corplawupdates.in/.well-known/webmcp',
        description: 'Statutory corporate law tools and intelligence WebMCP server covering MCA, SEBI, RBI, NCLT, and IBC.',
        capabilities: [
          'LegalUpdatesSearch',
          'ROCLateFee',
          'LLPLateFee',
          'ComplianceCalendar',
          'CINDecoder',
          'RBIRepoRate',
          'LegalTemplates',
        ],
        representativeQueries: [
          'connect to CorpLawUpdates WebMCP server',
          'corporate law MCP tools for MCA SEBI and RBI',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['webmcp', 'mcp', 'corporate-law', 'mca', 'sebi', 'rbi'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:roc-fee-calculator',
        displayName: 'MCA Company ROC Fee & Section 454 Penalty Calculator',
        type: 'application/json',
        url: 'https://www.corplawupdates.in/api/calculators/webmcp',
        description:
          'Statutory computation of MCA late filing additional fees and Section 454 adjudication penalty exposure for Indian company forms.',
        capabilities: ['ROCLateFee', 'Section454Penalty', 'MCAFiling'],
        representativeQueries: [
          'calculate ROC late filing fee for Form AOC-4',
          'Section 454 penalty calculator for MCA default',
          'estimate MGT-7 additional fee for 90 days delay',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['mca', 'roc', 'late-fee', 'penalty', 'section-454', 'companies-act'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:llp-fee-calculator',
        displayName: 'LLP Form 8 & Form 11 Late Fee and Penalty Calculator',
        type: 'application/json',
        url: 'https://www.corplawupdates.in/api/calculators/webmcp-llp',
        description:
          'Calculates delayed filing additional fees and Section 34/35 adjudication penalties for LLP Form 8 and Form 11 under LLP 2nd Amendment Rules 2022.',
        capabilities: ['LLPLateFee', 'LLPPenalty', 'LLPForm8', 'LLPForm11'],
        representativeQueries: [
          'calculate LLP Form 8 late filing fees',
          'LLP Form 11 Section 35 penalty calculation',
          'delayed filing fee for small LLP in India',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['llp', 'mca', 'form-8', 'form-11', 'llp-act', 'late-fee'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:api:regulatory-search',
        displayName: 'Regulatory Intelligence & Circulars Search API',
        type: 'application/json',
        url: 'https://www.corplawupdates.in/api/search',
        description:
          'Real-time search and statutory summaries of Indian corporate regulatory circulars and notifications across MCA, SEBI, RBI, NCLT, IBC, and FEMA.',
        capabilities: ['RegulatorySearch', 'CircularSummaries', 'ComplianceIntelligence'],
        representativeQueries: [
          'latest MCA circular on general meeting by VC',
          'recent SEBI LODR amendment notifications',
          'RBI circulars on digital lending guidelines',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'circulars', 'notifications'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:compliance-calendar',
        displayName: 'Indian Corporate Statutory Compliance Calendar',
        type: 'application/json',
        url: 'https://www.corplawupdates.in/api/compliance/webmcp',
        description:
          'Upcoming corporate compliance deadlines and filing schedules across MCA, SEBI, RBI, Income Tax, GST, and Labour Laws.',
        capabilities: ['ComplianceCalendar', 'DueDates', 'StatutoryDeadlines'],
        representativeQueries: [
          'what corporate compliances are due this month',
          'MCA filing due dates calendar 2026',
          'SEBI LODR quarterly compliance timeline',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['compliance', 'due-dates', 'calendar', 'mca', 'sebi', 'gst'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:rbi-repo-rates',
        displayName: 'RBI Monetary Policy & Benchmark Repo Rates',
        type: 'application/json',
        url: 'https://www.corplawupdates.in/api/rbi/webmcp',
        description:
          'Authoritative real-time Reserve Bank of India benchmark Repo Rate, SDF, MSF, MPC policy stance, and scheduled meeting dates.',
        capabilities: ['RepoRate', 'RBIPolicy', 'MonetaryPolicy'],
        representativeQueries: [
          'what is the current RBI repo rate',
          'RBI standing deposit facility SDF and MSF rate',
          'next RBI monetary policy committee meeting date',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['rbi', 'repo-rate', 'monetary-policy', 'banking', 'interest-rates'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:cin-decoder',
        displayName: 'Corporate Identification Number (CIN) Statutory Decoder',
        type: 'text/html',
        url: 'https://www.corplawupdates.in/tools/cin-decoder',
        description:
          'Decodes 21-digit Indian Corporate Identification Numbers (CIN) into listing status, NIC economic classification, RoC jurisdiction, registration year, and ownership class.',
        capabilities: ['CINDecoder', 'CompanyVerification', 'MCAIdentification'],
        representativeQueries: [
          'decode 21 digit CIN number',
          'find company state and ROC from CIN',
          'identify company type from corporate identification number',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['cin', 'company-search', 'roc', 'mca', 'nic-code'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:legal-documents',
        displayName: 'Legal Documents & Secretarial Drafting Suite',
        type: 'text/html',
        url: 'https://www.corplawupdates.in/documents',
        description:
          '35+ secretarial drafting templates and statutory agreements formatted per ICSI Secretarial Standards.',
        capabilities: ['SecretarialDrafting', 'BoardResolutions', 'LegalAgreements', 'SH4Deed', 'SLADrafting'],
        representativeQueries: [
          'draft service level agreement under Indian law',
          'Form SH-4 share transfer deed template download',
          'board resolution for bank account opening ICSI format',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['legal-drafting', 'board-resolutions', 'agreements', 'icsi', 'sh4', 'sla'],
      },
    ],
  };
}

export async function GET() {
  const catalog = getAICatalog();

  return NextResponse.json(catalog, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
