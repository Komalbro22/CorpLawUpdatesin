import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export async function GET() {
  const manifest = {
    schema_version: '1.0',
    name_for_human: 'CorpLawUpdates.in WebMCP Tools',
    name_for_model: 'corplawupdates',
    description_for_human:
      'India\'s authoritative corporate law intelligence platform tools: MCA/SEBI/RBI updates, ROC fee calculators, compliance calendar, CIN decoder, and legal document drafting templates.',
    description_for_model:
      'Official WebMCP tool catalog for CorpLawUpdates.in. Allows AI agents to search Indian regulatory updates (MCA, SEBI, RBI, NCLT, IBC), calculate statutory late filing fees and Section 454 penalties, query compliance due dates, look up current RBI repo rates, decode 21-digit CINs, search legal drafting templates, and subscribe to weekly digests.',
    homepage: 'https://www.corplawupdates.in',
    documentation_url: 'https://www.corplawupdates.in/mcp',
    contact_email: 'mail@corplawupdates.in',
    tools: [
      {
        name: 'search_legal_updates',
        description:
          'Search CorpLawUpdates.in for Indian corporate law circulars, notifications, and regulatory updates across MCA, SEBI, RBI, NCLT, IBC, and FEMA.',
        endpoint: 'https://www.corplawupdates.in/api/search',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            q: {
              type: 'string',
              description: 'Search keywords (e.g. "DIR-12 late filing" or "SEBI LODR amendment")',
            },
            category: {
              type: 'string',
              description: 'Filter by regulator: MCA, SEBI, RBI, NCLT, IBC, FEMA, CCI, LABOUR, IFSCA',
              enum: ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI', 'LABOUR', 'IFSCA'],
            },
            limit: {
              type: 'number',
              description: 'Number of results to return (1-10, default 5)',
            },
          },
          required: ['q'],
        },
      },
      {
        name: 'calculate_roc_late_fee',
        description:
          'Calculate ROC filing fee, late additional fee, and Section 454 adjudication penalty exposure for company forms (e.g. AOC-4, MGT-7, DIR-12, DPT-3) under Companies Rules 2014.',
        endpoint: 'https://www.corplawupdates.in/api/calculators/webmcp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            form: {
              type: 'string',
              description: 'MCA form code (e.g. AOC-4, MGT-7, DIR-12, DPT-3, BEN-2, INC-20A)',
            },
            type: {
              type: 'string',
              description: 'Company type: Pvt, Public, OPC, Small, Section8',
              enum: ['Pvt', 'Public', 'OPC', 'Small', 'Section8'],
            },
            capital: {
              type: 'number',
              description: 'Authorized capital in rupees (e.g. 1000000 for ₹10 Lakhs)',
            },
            delay: {
              type: 'number',
              description: 'Number of days the filing is delayed past the statutory due date',
            },
            officers: {
              type: 'number',
              description: 'Number of officers in default (default 3, used for penalty calculation)',
            },
          },
          required: ['form', 'type', 'capital', 'delay'],
        },
      },
      {
        name: 'calculate_llp_late_fee',
        description:
          'Calculate statutory late filing fees and Section 34/35 adjudication penalty for LLP Form 8 or Form 11 under LLP 2nd Amendment Rules 2022.',
        endpoint: 'https://www.corplawupdates.in/api/calculators/webmcp-llp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            form: {
              type: 'string',
              description: 'LLP form: Form-8 or Form-11',
              enum: ['Form-8', 'Form-11'],
            },
            type: {
              type: 'string',
              description: 'LLP category: Regular or Small',
              enum: ['Regular', 'Small'],
            },
            contribution: {
              type: 'number',
              description: 'Total capital contribution of the LLP in rupees (e.g. 500000 for ₹5 Lakhs)',
            },
            delay: {
              type: 'number',
              description: 'Number of days delayed past the due date',
            },
            dp: {
              type: 'number',
              description: 'Number of designated partners (default 2)',
            },
          },
          required: ['form', 'type', 'contribution', 'delay'],
        },
      },
      {
        name: 'get_compliance_calendar',
        description:
          'Get upcoming Indian statutory compliance due dates across MCA, SEBI, RBI, Income Tax, GST, FEMA, and Labour Law.',
        endpoint: 'https://www.corplawupdates.in/api/compliance/webmcp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            regulator: {
              type: 'string',
              description: 'Filter by regulator: mca, sebi, rbi, income_tax, gst, fema, cci, nclt, ibc, labor_law, other',
              enum: ['mca', 'sebi', 'rbi', 'income_tax', 'gst', 'fema', 'cci', 'nclt', 'ibc', 'labor_law', 'other'],
            },
            month: {
              type: 'number',
              description: 'Month (1-12). Omit for upcoming 90 days.',
            },
            year: {
              type: 'number',
              description: 'Year (e.g. 2026). Defaults to current year.',
            },
          },
          required: [],
        },
      },
      {
        name: 'get_roc_deadline',
        description:
          'Get the statutory due date, normal fee, and late penalty for a specific ROC/MCA form (AOC-4, MGT-7, DIR-3 KYC, Form 8, Form 11).',
        endpoint: 'https://www.corplawupdates.in/api/compliance/webmcp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            formName: {
              type: 'string',
              description: 'Name of the ROC/LLP form (e.g. AOC-4, MGT-7, DIR-3 KYC, Form 11)',
            },
          },
          required: ['formName'],
        },
      },
      {
        name: 'get_rbi_rates',
        description:
          'Get current RBI Repo Rate, Standing Deposit Facility (SDF) rate, Marginal Standing Facility (MSF) rate, MPC policy stance, and next meeting date.',
        endpoint: 'https://www.corplawupdates.in/api/rbi/webmcp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_article_summary',
        description:
          'Get a structured summary of a specific corporate law update by its slug, including key changes, effective date, quick answer, and regulation reference.',
        endpoint: 'https://www.corplawupdates.in/api/articles/webmcp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              description: 'URL slug of the article (e.g. "mca-aoc-4-filing-deadline-2026")',
            },
          },
          required: ['slug'],
        },
      },
      {
        name: 'decode_company_cin',
        description:
          'Decode any 21-character Indian Corporate Identification Number (CIN) into 6 statutory dimensions: listing status, NIC industry code, state RoC office, incorporation year, and ownership classification.',
        endpoint: 'https://www.corplawupdates.in/tools/cin-decoder',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            cin: {
              type: 'string',
              description: '21-character Corporate Identification Number (e.g. L21091MH1945PLC004520)',
            },
          },
          required: ['cin'],
        },
      },
      {
        name: 'search_document_templates',
        description:
          'Search 34+ Indian corporate legal drafting templates (Board Resolutions, NDAs, MoUs, Lease Agreements, Partnership Deeds) compliant with ICSI Secretarial Standards.',
        endpoint: 'https://www.corplawupdates.in/api/documents/webmcp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            q: {
              type: 'string',
              description: 'Search keywords (e.g. "board resolution bank loan", "lease agreement", "NDA")',
            },
            category: {
              type: 'string',
              description: 'Filter by template category',
              enum: [
                'board_resolution',
                'commercial_contracts',
                'appointments',
                'company_drafts',
                'shareholders_meeting',
                'agreements',
                'mca_forms',
                'notices',
                'banking_finance',
                'real_estate',
              ],
            },
            limit: {
              type: 'number',
              description: 'Maximum number of templates to return (1-20, default 10)',
            },
          },
          required: [],
        },
      },
      {
        name: 'get_document_template',
        description:
          'Get metadata, statutory authority (ICSI SS-1 / Companies Act), and required drafting fields for a specific Indian legal template by slug.',
        endpoint: 'https://www.corplawupdates.in/api/documents/webmcp',
        method: 'GET',
        read_only: true,
        input_schema: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              description: 'URL slug of the document template (e.g. "board-resolution-bank-loan")',
            },
          },
          required: ['slug'],
        },
      },
      {
        name: 'subscribe_newsletter',
        description:
          'Subscribe an email address to the weekly corporate law intelligence digest.',
        endpoint: 'https://www.corplawupdates.in/api/subscribe',
        method: 'POST',
        read_only: false,
        input_schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Valid email address to subscribe (e.g. name@company.com)',
            },
          },
          required: ['email'],
        },
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
