'use client';

/**
 * WebMCPRegistry — registers all CorpLawUpdates.in AI agent tools via the WebMCP API.
 *
 * WebMCP (Chrome Origin Trial, valid until Nov 17 2026) exposes structured tool
 * definitions to Chrome AI agents so they can interact with this site programmatically
 * instead of relying on DOM scraping or screen-reading.
 *
 * This component is a progressive enhancement: if the browser does not support
 * document.modelContext it exits silently — zero impact on regular users.
 *
 * API reference: https://developer.chrome.com/docs/ai/webmcp/imperative-api
 *
 * Tool inventory (9 tools):
 *   1. search_legal_updates     — Search MCA/SEBI/RBI/NCLT circulars & updates
 *   2. calculate_llp_late_fee   — LLP Form 8 / Form 11 late fee calculation
 *   3. calculate_roc_late_fee   — Company ROC form late fee + penalty exposure
 *   4. get_compliance_calendar  — Upcoming statutory due dates
 *   5. subscribe_newsletter     — Subscribe an email to weekly compliance digest
 *   6. get_article_summary      — Structured summary for a specific article slug
 *   7. get_rbi_rates            — Current RBI repo rate, SDF, MSF, MPC stance
 *   8. get_roc_deadline         — ROC deadline for a named form
 *   9. decode_company_cin       — Decode 21-digit Corporate Identification Number (CIN)
 */

import { useEffect } from 'react';
import { decodeCIN } from '@/lib/cin-decoder';

// ─────────────────────────────────────────────────────────────────────────────
// Type shim — WebMCP is not yet in the standard TypeScript lib
// Uses global WebMCP types defined in types/webmcp.d.ts
type ToolDefinition = WebMCPTool;
type ToolOptions = WebMCPToolOptions;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the active modelContext, preferring document (Chrome 150+) over navigator (Chrome 149 legacy). */
function getModelContext(): ModelContext | null {
  try {
    if (typeof document !== 'undefined' && 'modelContext' in document && document.modelContext) {
      return document.modelContext;
    }
    if (typeof navigator !== 'undefined' && 'modelContext' in navigator) {
      const navLegacy = (navigator as unknown as Record<string, unknown>).modelContext;
      if (navLegacy) return navLegacy as ModelContext;
    }
  } catch {
    // Fail silently if experimental feature flag throws IPC error
  }
  return null;
}

function safeRegister(ctx: ModelContext, def: ToolDefinition, opts: ToolOptions): void {
  try {
    ctx.registerTool(def, opts);
  } catch (err) {
    // Non-fatal — silently skip if a tool fails to register (e.g. schema validation error)
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WebMCP] Failed to register tool "${def.name}":`, err);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function WebMCPRegistry() {
  useEffect(() => {
    // 1. Guard against non-browser environments
    if (typeof window === 'undefined') return;

    // 2. Guard against non-matching hostnames (e.g. apex domain corplawupdates.in, preview URLs, localhost)
    if (window.location.hostname !== 'www.corplawupdates.in' && window.location.hostname !== 'localhost') return;

    const ctx = getModelContext();
    if (!ctx) return; // Browser doesn't support WebMCP — exit silently

    const controller = new AbortController();
    const { signal } = controller;

    // ── Tool 1: search_legal_updates ─────────────────────────────────────────
    safeRegister(ctx, {
      name: 'search_legal_updates',
      description:
        'Search CorpLawUpdates.in for Indian corporate law circulars, notifications, and regulatory updates. ' +
        'Covers MCA, SEBI, RBI, NCLT, IBC, and FEMA. Returns matching articles with titles, summaries, and URLs.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keywords (e.g. "DIR-12 late filing" or "SEBI LODR amendment")',
          },
          regulator: {
            type: 'string',
            description: 'Filter by regulator: MCA, SEBI, RBI, NCLT, IBC, FEMA, CCI, or LABOUR',
            enum: ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI', 'LABOUR'],
          },
          maxResults: {
            type: 'number',
            description: 'Number of results to return (1–10, default 5)',
          },
        },
        required: ['query'],
      },
      execute: async (args) => {
        const params = new URLSearchParams();
        params.set('q', String(args.query ?? ''));
        if (args.regulator) params.set('category', String(args.regulator));
        params.set('type', 'articles');
        params.set('limit', String(Math.min(Math.max(Number(args.maxResults) || 5, 1), 10)));

        const res = await fetch(`/api/search?${params}`);
        if (!res.ok) return { error: 'Search failed. Please try again.' };
        const data = await res.json();

        const results = (data.results ?? []).slice(0, Number(args.maxResults) || 5);
        if (!results.length) return { found: 0, message: 'No results found for your query.' };

        return {
          found: results.length,
          query: args.query,
          results: results.map((r: Record<string, unknown>) => ({
            title: r.title,
            summary: r.summary,
            category: r.category,
            date: r.date,
            url: r.url ?? `https://www.corplawupdates.in/updates/${r.slug}`,
          })),
        };
      },
    }, { signal, readOnlyHint: true, untrustedContentHint: true });

    // ── Tool 2: calculate_llp_late_fee ───────────────────────────────────────
    safeRegister(ctx, {
      name: 'calculate_llp_late_fee',
      description:
        'Calculate statutory late filing fees and adjudication penalty for LLP Form 8 (Statement of Account) ' +
        'or Form 11 (Annual Return) under LLP Rules 2009 as amended by LLP 2nd Amendment Rules 2022 (w.e.f. 01.04.2022).',
      inputSchema: {
        type: 'object',
        properties: {
          formId: {
            type: 'string',
            description: 'LLP form to calculate: Form-8 or Form-11',
            enum: ['Form-8', 'Form-11'],
          },
          llpType: {
            type: 'string',
            description: 'LLP category: Regular or Small',
            enum: ['Regular', 'Small'],
          },
          contributionRupees: {
            type: 'number',
            description: 'Total capital contribution of the LLP in rupees (e.g. 500000 for ₹5 Lakhs)',
          },
          delayDays: {
            type: 'number',
            description: 'Number of days the filing is delayed past the due date',
          },
          designatedPartners: {
            type: 'number',
            description: 'Number of designated partners (default 2, used for penalty calculation)',
          },
        },
        required: ['formId', 'llpType', 'contributionRupees', 'delayDays'],
      },
      execute: async (args) => {
        const params = new URLSearchParams({
          form: String(args.formId ?? 'Form-11'),
          type: String(args.llpType ?? 'Regular'),
          contribution: String(Number(args.contributionRupees) || 0),
          delay: String(Number(args.delayDays) || 0),
          dp: String(Number(args.designatedPartners) || 2),
        });

        const res = await fetch(`/api/calculators/webmcp-llp?${params}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { error: (err as { error?: string }).error ?? 'Calculation failed.' };
        }
        return res.json();
      },
    }, { signal, readOnlyHint: true });

    // ── Tool 3: calculate_roc_late_fee ───────────────────────────────────────
    safeRegister(ctx, {
      name: 'calculate_roc_late_fee',
      description:
        'Calculate ROC filing fee, late additional fee, and Section 454 adjudication penalty for a ' +
        'company form (e.g. AOC-4, MGT-7, DIR-12, DPT-3) under the Companies (Registration Offices & Fees) Rules 2014.',
      inputSchema: {
        type: 'object',
        properties: {
          formCode: {
            type: 'string',
            description: 'MCA form code (e.g. AOC-4, MGT-7, DIR-12, DPT-3, BEN-2, INC-20A)',
          },
          companyType: {
            type: 'string',
            description: 'Company type: Pvt, Public, OPC, Small, or Section8',
            enum: ['Pvt', 'Public', 'OPC', 'Small', 'Section8'],
          },
          authorizedCapitalRupees: {
            type: 'number',
            description: 'Authorized capital in rupees (e.g. 1000000 for ₹10 Lakhs)',
          },
          delayDays: {
            type: 'number',
            description: 'Number of days the filing is delayed past the due date',
          },
          officersCount: {
            type: 'number',
            description: 'Number of officers in default (default 3, used for penalty calculation)',
          },
        },
        required: ['formCode', 'companyType', 'authorizedCapitalRupees', 'delayDays'],
      },
      execute: async (args) => {
        const params = new URLSearchParams({
          form: String(args.formCode ?? ''),
          type: String(args.companyType ?? 'Pvt'),
          capital: String(Number(args.authorizedCapitalRupees) || 0),
          delay: String(Number(args.delayDays) || 0),
          officers: String(Number(args.officersCount) || 3),
        });

        const res = await fetch(`/api/calculators/webmcp?${params}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { error: (err as { error?: string }).error ?? 'Calculation failed.' };
        }
        return res.json();
      },
    }, { signal, readOnlyHint: true });

    // ── Tool 4: get_compliance_calendar ─────────────────────────────────────
    safeRegister(ctx, {
      name: 'get_compliance_calendar',
      description:
        'Get upcoming Indian statutory compliance due dates from the CorpLawUpdates compliance calendar. ' +
        'Covers MCA, SEBI, RBI, Income Tax, GST, FEMA, NCLT, and Labour Law deadlines.',
      inputSchema: {
        type: 'object',
        properties: {
          regulator: {
            type: 'string',
            description: 'Filter by regulator: mca, sebi, rbi, income_tax, gst, fema, cci, nclt, ibc, labor_law, other',
            enum: ['mca', 'sebi', 'rbi', 'income_tax', 'gst', 'fema', 'cci', 'nclt', 'ibc', 'labor_law', 'other'],
          },
          month: {
            type: 'number',
            description: 'Month to fetch (1–12). Omit for next 90 days.',
          },
          year: {
            type: 'number',
            description: 'Year (e.g. 2026). Defaults to current year.',
          },
        },
        required: [],
      },
      execute: async (args) => {
        const params = new URLSearchParams();
        if (args.regulator) params.set('regulator', String(args.regulator));
        if (args.month) params.set('month', String(args.month));
        if (args.year) params.set('year', String(args.year));

        const res = await fetch(`/api/compliance/webmcp?${params}`);
        if (!res.ok) return { error: 'Failed to fetch compliance calendar.' };
        return res.json();
      },
    }, { signal, readOnlyHint: true });

    // ── Tool 5: subscribe_newsletter ─────────────────────────────────────────
    safeRegister(ctx, {
      name: 'subscribe_newsletter',
      description:
        'Subscribe an email address to the CorpLawUpdates weekly compliance digest newsletter. ' +
        'Subscribers receive MCA, SEBI, RBI, and NCLT updates every Monday.',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Valid email address to subscribe (e.g. name@example.com)',
          },
        },
        required: ['email'],
      },
      execute: async (args) => {
        const email = String(args.email ?? '').trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { success: false, message: 'Please provide a valid email address.' };
        }

        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(() => ({ message: 'Unknown error.' }));
        return {
          success: res.ok,
          message: (data as { message?: string }).message ?? (res.ok ? 'Subscribed successfully.' : 'Subscription failed.'),
        };
      },
    }, { signal, readOnlyHint: false });

    // ── Tool 6: get_article_summary ──────────────────────────────────────────
    safeRegister(ctx, {
      name: 'get_article_summary',
      description:
        'Get a structured summary of a specific CorpLawUpdates article by its URL slug. ' +
        'Returns title, key changes, effective date, quick answer, and regulation reference.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'URL slug of the article (e.g. "mca-aoc-4-filing-deadline-2026")',
          },
        },
        required: ['slug'],
      },
      execute: async (args) => {
        const slug = String(args.slug ?? '').trim().toLowerCase();
        const res = await fetch(`/api/articles/webmcp?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { error: (err as { error?: string }).error ?? `Article "${slug}" not found.` };
        }
        return res.json();
      },
    }, { signal, readOnlyHint: true, untrustedContentHint: true });

    // ── Tool 7: get_rbi_rates ────────────────────────────────────────────────
    safeRegister(ctx, {
      name: 'get_rbi_rates',
      description:
        'Get the current RBI Repo Rate, Standing Deposit Facility (SDF) rate, Marginal Standing Facility (MSF) rate, ' +
        'MPC policy stance, and next MPC meeting date from CorpLawUpdates.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      execute: async () => {
        const res = await fetch('/api/rbi/webmcp');
        if (!res.ok) return { error: 'Failed to fetch RBI rate data.' };
        return res.json();
      },
    }, { signal, readOnlyHint: true });

    // ── Tool 8: get_roc_deadline ─────────────────────────────────────────────
    safeRegister(ctx, {
      name: 'get_roc_deadline',
      description:
        'Get the statutory due date, normal fee, and late penalty for a specific ROC/MCA form ' +
        '(e.g. AOC-4, MGT-7, DIR-3 KYC, Form 8, Form 11) from the CorpLawUpdates compliance calendar.',
      inputSchema: {
        type: 'object',
        properties: {
          formName: {
            type: 'string',
            description: 'Name of the ROC/LLP form (e.g. "AOC-4", "MGT-7", "DIR-3 KYC", "Form 11")',
          },
        },
        required: ['formName'],
      },
      execute: async (args) => {
        const formName = String(args.formName ?? '').trim();
        if (!formName) return { error: 'Please provide a form name.' };

        try {
          const res = await fetch(
            `/api/compliance/webmcp?regulator=mca&q=${encodeURIComponent(formName)}`
          );
          if (!res.ok) throw new Error('fetch failed');
          const data = await res.json() as { entries?: Array<Record<string, unknown>> };
          const match = (data.entries ?? []).find(
            (e) =>
              String(e.formName ?? '').toLowerCase().includes(formName.toLowerCase()) ||
              String(e.title ?? '').toLowerCase().includes(formName.toLowerCase())
          );

          if (!match) {
            return {
              message: `No exact compliance entry found for "${formName}". Visit the full calendar:`,
              calendarUrl: 'https://www.corplawupdates.in/calendar',
            };
          }

          return {
            formName: match.formName,
            title: match.title,
            dueDate: match.dueDate,
            regulator: match.regulator,
            penalty: match.penalty,
            regulationRef: match.regulationRef,
            calendarUrl: 'https://www.corplawupdates.in/calendar',
          };
        } catch {
          return {
            message: `Could not find ROC deadline for "${formName}". Visit the full calendar:`,
            calendarUrl: 'https://www.corplawupdates.in/calendar',
          };
        }
      },
    }, { signal, readOnlyHint: true });

    // ── Tool 9: decode_company_cin ───────────────────────────────────────────
    safeRegister(ctx, {
      name: 'decode_company_cin',
      description:
        'Decode any 21-character Indian Corporate Identification Number (CIN) into 6 official statutory dimensions: ' +
        'listing status (Listed/Unlisted), 5-digit NIC industry classification, state RoC jurisdiction, incorporation year, ' +
        'ownership class (PLC/PTC/FLC/GOI/NPL), and RoC registration serial number.',
      inputSchema: {
        type: 'object',
        properties: {
          cin: {
            type: 'string',
            description: '21-character Corporate Identification Number (e.g. L21091MH1945PLC004520)',
          },
        },
        required: ['cin'],
      },
      execute: async (args) => {
        const cinStr = String(args.cin ?? '').trim().toUpperCase();
        const breakdown = decodeCIN(cinStr);
        if (!breakdown) {
          return { error: 'Invalid CIN format. Must be a 21-character Indian Corporate Identification Number.' };
        }
        return breakdown;
      },
    }, { signal, readOnlyHint: true });

    // Cleanup — AbortController is the correct lifecycle mechanism
    return () => {
      try {
        controller.abort('WebMCPRegistry unmounted');
      } catch {
        // Silently ignore abort signal errors on unmount
      }
    };
  }, []);

  return null; // Renders nothing — purely a side-effect component
}
