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
        type: 'application/mcp-server-card+json',
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
        type: 'application/agent-card+json',
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
        identifier: 'urn:air:corplawupdates.in:tool:mgt-7-fee-calculator',
        displayName: 'MGT 7 Annual Return Fee & Late Penalty Calculator',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/mgt-7',
        description:
          'Authoritative calculator for Form MGT-7 and MGT-7A Annual Return: Table A normal base fees (₹200–₹600), ₹100/day uncapped delay fee, 60-day AGM statutory deadline, Form MGT-8 PCS certification applicability, and Section 92(5) ROC penalties.',
        capabilities: ['MGT7Fee', 'MGT7LateFee', 'AnnualReturnCalculator', 'Section92Penalty'],
        representativeQueries: [
          'mgt 7 fee calculator',
          'calculate mgt 7 late filing fee',
          'mgt 7 penalty calculator for delayed annual return',
          'form mgt 7 additional fee for 60 days delay',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['mgt-7', 'mgt7', 'annual-return', 'mca', 'fee-calculator', 'section-92', 'late-fee'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:aoc-4-fee-calculator',
        displayName: 'AOC-4 Fee Calculator — Financial Statements Late Filing Fees',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/aoc-4',
        description:
          'Statutory calculator for Form AOC-4, AOC-4 CFS, and AOC-4 XBRL: Normal base fees (₹200–₹600), statutory ₹100/day delay fees under Section 403, 30-day AGM timeline, and Section 137 ROC non-filing penalties.',
        capabilities: ['AOC4Fee', 'AOC4LateFee', 'FinancialStatementsFee', 'Section137Penalty'],
        representativeQueries: [
          'aoc 4 fee calculator',
          'calculate aoc 4 late filing fee',
          'aoc 4 penalty calculator for delayed filing',
          'form aoc 4 additional fee for 60 days delay',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['aoc-4', 'aoc4', 'financial-statements', 'mca', 'late-fee', 'section-137', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:dir-3-kyc-fee-calculator',
        displayName: 'DIR-3 KYC Fee Calculator — Director KYC ₹5,000 Late Fee',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/dir-3-kyc',
        description:
          'Statutory calculator for Director KYC: Nil fee on or before September 30, flat ₹5,000 statutory delay fee for DIN reactivation under Rule 12A, and DSC vs OTP web filing requirements.',
        capabilities: ['DIR3KYCFee', 'DirectorKYCLateFee', 'DINReactivationFee'],
        representativeQueries: [
          'dir 3 kyc fee calculator',
          'dir 3 kyc late fee calculation',
          'director kyc penalty after september 30',
          'din reactivation fee calculator',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['dir-3-kyc', 'dir3kyc', 'director-kyc', 'mca', 'late-fee', 'din-reactivation', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:adt-1-fee-calculator',
        displayName: 'ADT-1 Fee Calculator — Auditor Appointment ROC Filing Fee',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/adt-1',
        description:
          'Statutory fee calculator for Form ADT-1 auditor appointment: Table A normal fees (₹200–₹600), 2x to 18x stepped delay fees under Section 403, 15-day AGM deadline, and Section 147 auditor penalty exposure.',
        capabilities: ['ADT1Fee', 'AuditorAppointmentFee', 'ADT1LateFee', 'Section139Compliance'],
        representativeQueries: [
          'adt 1 fee calculator',
          'calculate adt 1 late filing fee',
          'form adt 1 additional fee calculator',
          'auditor appointment roc fee for private company',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['adt-1', 'adt1', 'auditor-appointment', 'mca', 'late-fee', 'section-139', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:chg-1-fee-calculator',
        displayName: 'CHG-1 Fee Calculator — Charge Creation & Modification Ad Valorem Fees',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/chg-1',
        description:
          'Authoritative calculator for Form CHG-1 charge registration: Normal fees, Chapter VI 3-tier timeline (30d / 60d / 120d), ad valorem additional fees (0.025%–0.05% of loan amount, cap ₹5 Lakh), and Section 86 prosecution.',
        capabilities: ['CHG1Fee', 'ChargeRegistrationFee', 'AdValoremFee', 'Section77Compliance'],
        representativeQueries: [
          'chg 1 fee calculator',
          'calculate chg 1 late fee and ad valorem fee',
          'form chg 1 fee calculator for bank loan charge',
          'roc charge creation delayed filing fee',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['chg-1', 'chg1', 'charge-creation', 'ad-valorem', 'mca', 'late-fee', 'section-77', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:dir-12-fee-calculator',
        displayName: 'DIR-12 Fee Calculator — Director Changes Late Filing Fees',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/dir-12',
        description:
          'Statutory fee calculator for Form DIR-12 appointment, resignation, or vacation of directors and KMP: Table A normal fees, 2x to 18x stepped delay fees under Section 403, and 30-day statutory timeline.',
        capabilities: ['DIR12Fee', 'DirectorChangeFee', 'DIR12LateFee', 'Section170Compliance'],
        representativeQueries: [
          'dir 12 fee calculator',
          'calculate dir 12 late filing fee',
          'form dir 12 additional fee for director resignation',
          'dir 12 late fee calculator mca',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['dir-12', 'dir12', 'director-appointment', 'resignation', 'mca', 'late-fee', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:pas-3-fee-calculator',
        displayName: 'PAS-3 Fee Calculator — Return of Allotment Late Fees & Penalties',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/pas-3',
        description:
          'Statutory calculator for Form PAS-3 return of allotment of securities: Table A normal fees, 2x to 18x stepped delay fees, 15-day statutory allotment deadline, and Section 42(9) ₹1,000/day penalties (max ₹25 Lakh).',
        capabilities: ['PAS3Fee', 'AllotmentReturnFee', 'PAS3LateFee', 'Section42Penalty'],
        representativeQueries: [
          'pas 3 fee calculator',
          'calculate pas 3 late filing fee',
          'return of allotment late fee calculator mca',
          'pas 3 penalty for delayed allotment return',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['pas-3', 'pas3', 'allotment-of-shares', 'mca', 'late-fee', 'section-42', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:pas-6-fee-calculator',
        displayName: 'PAS-6 Fee Calculator — Share Capital Demat Reconciliation',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/pas-6',
        description:
          'Statutory compliance calculator for Form PAS-6 demat reconciliation of share capital: Half-yearly deadlines (May 30 & Nov 29), Rule 9A/9B applicability, PCS audit certification, and Section 450 penalties.',
        capabilities: ['PAS6Fee', 'DematReconciliation', 'Rule9ACompliance', 'Section450Penalty'],
        representativeQueries: [
          'pas 6 fee calculator',
          'pas 6 late filing fee and penalty',
          'reconciliation of share capital audit fee pas 6',
          'pas 6 due date and delay consequences',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['pas-6', 'pas6', 'demat', 'share-capital', 'mca', 'late-fee', 'rule-9a', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:spice-plus-fee-calculator',
        displayName: 'SPICe+ Fee Calculator — Company Incorporation & Stamp Duty',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/spice-plus',
        description:
          'Statutory fee calculator for Form SPICe+ Part B incorporation: Zero MCA filing fees up to ₹15 Lakh capital, state-wise MoA/AoA electronic stamp duty rates, PAN/TAN fees, and EPFO/ESIC/GST integration.',
        capabilities: ['SPICePlusFee', 'IncorporationFee', 'StampDutyCalculator', 'PANFee'],
        representativeQueries: [
          'spice plus fee calculator',
          'company incorporation fee calculator mca',
          'spice part b roc fee and stamp duty',
          'pvt ltd company registration cost calculator',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['spice-plus', 'spice+', 'incorporation', 'stamp-duty', 'mca', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:dpt-3-fee-calculator',
        displayName: 'DPT-3 Fee Calculator — Return of Deposits Late Filing Fees',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/dpt-3',
        description:
          'Statutory calculator for Form DPT-3 return of deposits and exempted loans: Table A base fees, 2x to 18x stepped delay fees, June 30 statutory deadline, and Section 73/76A corporate penalties.',
        capabilities: ['DPT3Fee', 'DepositReturnFee', 'DPT3LateFee', 'Section73Penalty'],
        representativeQueries: [
          'dpt 3 fee calculator',
          'calculate dpt 3 late filing fee',
          'form dpt 3 additional fee calculator',
          'dpt 3 penalty for delayed deposit return',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['dpt-3', 'dpt3', 'deposits', 'exempted-loans', 'mca', 'late-fee', 'section-73', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:inc-20a-fee-calculator',
        displayName: 'INC-20A Fee Calculator — Commencement of Business Late Fees',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/inc-20a',
        description:
          'Statutory calculator for Form INC-20A commencement of business declaration: Table A base fees, 2x to 18x stepped delay fees, 180-day incorporation deadline, and Section 10A strike-off risk.',
        capabilities: ['INC20AFee', 'CommencementOfBusinessFee', 'INC20ALateFee', 'Section10APenalty'],
        representativeQueries: [
          'inc 20a fee calculator',
          'calculate inc 20a late filing fee',
          'commencement of business late fee calculator',
          'inc 20a penalty after 180 days delay',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['inc-20a', 'inc20a', 'commencement-of-business', 'mca', 'late-fee', 'section-10a', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:msme-1-fee-calculator',
        displayName: 'MSME-1 Fee Calculator — Outstanding Dues Return Half-Yearly',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies/msme-1',
        description:
          'Statutory calculator for Form MSME-1 half-yearly return of outstanding vendor dues exceeding 45 days: Base fees, stepped delay fees, April 30 and October 31 deadlines, and Section 405 ROC penalties.',
        capabilities: ['MSME1Fee', 'MSME1LateFee', 'OutstandingDuesCompliance', 'Section405Penalty'],
        representativeQueries: [
          'msme 1 fee calculator',
          'calculate msme 1 late filing fee',
          'form msme 1 delayed return penalty',
          'msme 1 half yearly return late fee',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['msme-1', 'msme1', 'outstanding-dues', 'mca', 'late-fee', 'section-405', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:msme-interest-calculator',
        displayName: 'MSME Interest Calculator — Section 16 Delayed Payment 3x Bank Rate',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/msme',
        description:
          'Statutory calculator for MSME delayed payments under Section 16 of MSMED Act 2006: Monthly compounding at three times RBI benchmark repo rate for invoices unpaid beyond 45 days.',
        capabilities: ['MSMEInterest', 'Section16Interest', 'DelayedPaymentCalculation', 'CompoundInterest'],
        representativeQueries: [
          'msme interest calculator',
          'calculate msme delayed payment interest section 16',
          'msmed act compound interest 3 times bank rate',
          'msme overdue interest calculator 45 days',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['msme-interest', 'msmed-act', 'section-16', 'delayed-payment', 'repo-rate', 'compound-interest'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:ibbi-fee-calculator',
        displayName: 'IBBI Fee Calculator — Insolvency Late Filing Fees & Liquidation',
        type: 'application/agent-card+json',
        url: 'https://www.corplawupdates.in/tools/fee-calculator/ibbi',
        description:
          'Statutory calculator for IBBI insolvency filings under CIRP Reg 40B, Liquidation Reg 47B, and IP annual regulatory fees with statutory day-count tiers (₹500 to ₹5,000+).',
        capabilities: ['IBBIFee', 'CIRPLateFee', 'LiquidationDelayedFiling', 'IPRegulatoryFee'],
        representativeQueries: [
          'ibbi fee calculator',
          'calculate ibbi late filing fee reg 40b',
          'ibbi liquidation reg 47b delayed fee calculation',
          'insolvency professional delayed return fee',
        ],
        version: '1.0.0',
        updatedAt: '2026-03-25T00:00:00Z',
        tags: ['ibbi', 'ibc', 'insolvency', 'cirp', 'liquidation', 'late-fee', 'fee-calculator'],
      },
      {
        identifier: 'urn:air:corplawupdates.in:tool:llp-fee-calculator',
        displayName: 'LLP Form 8 & Form 11 Late Fee and Penalty Calculator',
        type: 'application/agent-card+json',
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
        type: 'application/agent-card+json',
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
        type: 'application/agent-card+json',
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
        type: 'application/agent-card+json',
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
        type: 'application/agent-card+json',
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
        type: 'application/agent-card+json',
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
