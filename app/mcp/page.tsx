import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Bot, 
  Cpu, 
  Terminal, 
  Code2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Calculator, 
  Calendar, 
  FileText, 
  Coins, 
  Mail, 
  ArrowRight,
  ExternalLink,
  Layers,
  Zap
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'WebMCP AI Agent Hub — Connect AI Agents to Indian Corporate Law Intelligence',
  description:
    'Official WebMCP (Web Model Context Protocol) documentation for CorpLawUpdates.in. Connect Chrome AI agents, Claude Code, Cursor, and LLMs to 11+ live corporate law tools, statutory fee calculators, compliance calendars, and legal document templates.',
  keywords: [
    'WebMCP',
    'Web Model Context Protocol',
    'AI Agent tools',
    'Chrome WebMCP',
    'MCA AI tool',
    'corporate law API',
    'ROC fee calculator API',
    'compliance calendar API',
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/mcp',
  },
  openGraph: {
    title: 'WebMCP AI Agent Hub | CorpLawUpdates.in',
    description:
      'Official WebMCP tools for Chrome AI and autonomous agents: MCA/SEBI/RBI updates, statutory fee calculators, compliance calendar, and document templates.',
    url: 'https://www.corplawupdates.in/mcp',
    type: 'website',
  },
};

const TOOLS = [
  {
    id: 'search_legal_updates',
    name: 'search_legal_updates',
    icon: Search,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
    description: 'Search Indian corporate law circulars, notifications, and regulatory updates across MCA, SEBI, RBI, NCLT, IBC, and FEMA.',
    method: 'GET',
    endpoint: '/api/search?q={query}&category={regulator}',
    readOnly: true,
    params: [
      { name: 'q', type: 'string', required: true, desc: 'Search keywords (e.g. "DIR-12 late filing", "SEBI LODR")' },
      { name: 'category', type: 'string', required: false, desc: 'Filter by regulator: MCA, SEBI, RBI, NCLT, IBC, FEMA, CCI, LABOUR, IFSCA' },
      { name: 'limit', type: 'number', required: false, desc: 'Number of results (1–10, default 5)' },
    ],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/api/search?q=DIR-12&category=MCA&limit=3"',
    sampleResponse: {
      found: 3,
      query: 'DIR-12',
      results: [
        {
          title: 'MCA Relaxes Additional Fees for Filing Form DIR-12',
          summary: 'Ministry of Corporate Affairs waives additional statutory filing fees for delay in appointment of directors.',
          category: 'MCA',
          date: '2026-03-15',
          url: 'https://www.corplawupdates.in/updates/mca-dir-12-fee-waiver',
        },
      ],
    },
  },
  {
    id: 'calculate_roc_late_fee',
    name: 'calculate_roc_late_fee',
    icon: Calculator,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
    description: 'Calculate ROC statutory filing fee, late additional fee multiplier, and Section 454 adjudication penalty exposure for company forms.',
    method: 'GET',
    endpoint: '/api/calculators/webmcp?form={form}&type={type}&capital={capital}&delay={delay}',
    readOnly: true,
    params: [
      { name: 'form', type: 'string', required: true, desc: 'Form code (AOC-4, MGT-7, DIR-12, DPT-3, BEN-2, INC-20A)' },
      { name: 'type', type: 'string', required: true, desc: 'Company type: Pvt, Public, OPC, Small, Section8' },
      { name: 'capital', type: 'number', required: true, desc: 'Authorized capital in rupees (e.g. 1000000 for ₹10 Lakhs)' },
      { name: 'delay', type: 'number', required: true, desc: 'Delay in days past the statutory due date' },
      { name: 'officers', type: 'number', required: false, desc: 'Officers in default (default 3)' },
    ],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/api/calculators/webmcp?form=AOC-4&type=Pvt&capital=1000000&delay=45"',
    sampleResponse: {
      form: 'AOC-4',
      companyType: 'Pvt',
      authorizedCapitalRupees: 1000000,
      daysDelayed: 45,
      normalFee: 400,
      lateFee: 4500,
      totalPayable: 4900,
      companyPenalty: 50000,
      officerPenalty: 50000,
      totalPenaltyExposure: 100000,
      smallCompanyReliefApplied: false,
    },
  },
  {
    id: 'calculate_llp_late_fee',
    name: 'calculate_llp_late_fee',
    icon: Calculator,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
    description: 'Calculate statutory late filing fees and Section 34/35 penalty for LLP Form 8 or Form 11 per LLP 2nd Amendment Rules 2022.',
    method: 'GET',
    endpoint: '/api/calculators/webmcp-llp?form={form}&type={type}&contribution={contribution}&delay={delay}',
    readOnly: true,
    params: [
      { name: 'form', type: 'string', required: true, desc: 'Form-8 or Form-11' },
      { name: 'type', type: 'string', required: true, desc: 'Regular or Small' },
      { name: 'contribution', type: 'number', required: true, desc: 'Total contribution in rupees (e.g. 500000 for ₹5 Lakhs)' },
      { name: 'delay', type: 'number', required: true, desc: 'Days delayed past due date' },
    ],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/api/calculators/webmcp-llp?form=Form-11&type=Regular&contribution=500000&delay=30"',
    sampleResponse: {
      form: 'Form-11',
      llpType: 'Regular',
      contributionRupees: 500000,
      delayDays: 30,
      normalFee: 100,
      lateFee: 600,
      totalPayable: 700,
      statutoryPenalty: 10000,
    },
  },
  {
    id: 'get_compliance_calendar',
    name: 'get_compliance_calendar',
    icon: Calendar,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50',
    description: 'Query upcoming Indian statutory compliance deadlines across MCA, SEBI, RBI, Income Tax, GST, FEMA, and Labour Laws.',
    method: 'GET',
    endpoint: '/api/compliance/webmcp?regulator={regulator}&month={month}&year={year}',
    readOnly: true,
    params: [
      { name: 'regulator', type: 'string', required: false, desc: 'mca, sebi, rbi, income_tax, gst, fema, cci, nclt, ibc, labor_law' },
      { name: 'month', type: 'number', required: false, desc: 'Month (1–12)' },
      { name: 'year', type: 'number', required: false, desc: 'Year (e.g. 2026)' },
    ],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/api/compliance/webmcp?regulator=mca&month=9&year=2026"',
    sampleResponse: {
      total: 3,
      entries: [
        {
          formName: 'DIR-3 KYC',
          title: 'Annual Director KYC Verification',
          dueDate: '2026-09-30',
          regulator: 'MCA',
          penalty: '₹5,000 one-time late filing fee under Rule 12A',
        },
      ],
    },
  },
  {
    id: 'get_rbi_rates',
    name: 'get_rbi_rates',
    icon: Coins,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50',
    description: 'Get current RBI Repo Rate, Standing Deposit Facility (SDF) rate, Marginal Standing Facility (MSF) rate, and MPC policy stance.',
    method: 'GET',
    endpoint: '/api/rbi/webmcp',
    readOnly: true,
    params: [],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/api/rbi/webmcp"',
    sampleResponse: {
      repoRate: '6.50%',
      sdfRate: '6.25%',
      msfRate: '6.75%',
      bankRate: '6.75%',
      stance: 'Neutral / Withdrawal of Accommodation',
      lastUpdated: '2026-08-10',
    },
  },
  {
    id: 'decode_company_cin',
    name: 'decode_company_cin',
    icon: Cpu,
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50',
    description: 'Decode any 21-digit Indian CIN into 6 statutory dimensions: listing status, NIC industry code, state RoC office, incorporation year, and ownership class.',
    method: 'GET',
    endpoint: '/tools/cin-decoder?cin={cin}',
    readOnly: true,
    params: [
      { name: 'cin', type: 'string', required: true, desc: '21-character Corporate Identification Number (e.g. L21091MH1945PLC004520)' },
    ],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/tools/cin-decoder?cin=L21091MH1945PLC004520"',
    sampleResponse: {
      cin: 'L21091MH1945PLC004520',
      listingStatus: { code: 'L', label: 'Listed Company' },
      nicCode: { code: '21091', industry: 'Manufacture of Motor Vehicles', sectorGroup: 'Manufacturing' },
      state: { code: 'MH', name: 'Maharashtra', rocOffice: 'RoC Mumbai' },
      incorporationYear: 1945,
      companyType: { code: 'PLC', label: 'Public Limited Company' },
      registrationNumber: '004520',
    },
  },
  {
    id: 'search_document_templates',
    name: 'search_document_templates',
    icon: FileText,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50',
    description: 'Search 34+ legal drafting templates (Board Resolutions, NDAs, MoUs, Lease Agreements, Partnership Deeds) formatted per ICSI SS-1.',
    method: 'GET',
    endpoint: '/api/documents/webmcp?q={query}&category={category}&limit={limit}',
    readOnly: true,
    params: [
      { name: 'q', type: 'string', required: false, desc: 'Search keywords (e.g. "board resolution bank loan", "lease agreement")' },
      { name: 'category', type: 'string', required: false, desc: 'board_resolution, commercial_contracts, appointments, agreements, etc.' },
      { name: 'limit', type: 'number', required: false, desc: 'Number of templates to return (1–20, default 10)' },
    ],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/api/documents/webmcp?q=board%20resolution&limit=2"',
    sampleResponse: {
      total: 2,
      templates: [
        {
          id: 'board-resolution-bank-loan',
          name: 'Board Resolution for Availing Bank Loan / Credit Facility',
          slug: 'board-resolution-bank-loan',
          category: 'board_resolution',
          regulationReference: 'Section 179(3)(d) of Companies Act, 2013 read with ICSI SS-1',
          url: 'https://www.corplawupdates.in/documents/board-resolution-bank-loan',
        },
      ],
    },
  },
  {
    id: 'get_document_template',
    name: 'get_document_template',
    icon: FileText,
    color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/50',
    description: 'Get full metadata, statutory authority, and required drafting variable schema for a specific template by slug.',
    method: 'GET',
    endpoint: '/api/documents/webmcp?slug={slug}',
    readOnly: true,
    params: [
      { name: 'slug', type: 'string', required: true, desc: 'URL slug of the template (e.g. "board-resolution-bank-loan")' },
    ],
    sampleCurl: 'curl -s "https://www.corplawupdates.in/api/documents/webmcp?slug=board-resolution-bank-loan"',
    sampleResponse: {
      template: {
        id: 'board-resolution-bank-loan',
        name: 'Board Resolution for Availing Bank Loan / Credit Facility',
        slug: 'board-resolution-bank-loan',
        category: 'board_resolution',
        regulationReference: 'Section 179(3)(d) of Companies Act, 2013 read with ICSI SS-1',
        fields: [
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
          { name: 'loanAmount', label: 'Sanctioned Loan Amount (₹)', type: 'number', required: true },
        ],
        url: 'https://www.corplawupdates.in/documents/board-resolution-bank-loan',
      },
    },
  },
  {
    id: 'subscribe_newsletter',
    name: 'subscribe_newsletter',
    icon: Mail,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
    description: 'Subscribe an email address to the weekly corporate law intelligence digest.',
    method: 'POST',
    endpoint: '/api/subscribe',
    readOnly: false,
    params: [
      { name: 'email', type: 'string', required: true, desc: 'Valid email address to subscribe' },
    ],
    sampleCurl: 'curl -s -X POST "https://www.corplawupdates.in/api/subscribe" -H "Content-Type: application/json" -d \'{"email":"user@example.com"}\'',
    sampleResponse: {
      success: true,
      message: 'Subscribed successfully.',
    },
  },
];

export default function WebMCPHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CorpLawUpdates.in WebMCP Tools',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    description:
      'WebMCP tool catalog exposing Indian corporate law regulatory updates, statutory fee calculators, compliance calendars, and legal document drafting templates to AI agents.',
    url: 'https://www.corplawupdates.in/mcp',
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-navy dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-navy dark:text-white font-bold">WebMCP AI Agent Hub</span>
        </nav>

        {/* Hero Header */}
        <header className="relative rounded-3xl bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white p-8 md:p-12 shadow-2xl overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-500/30">
              <Bot className="size-4" aria-hidden="true" />
              <span>W3C & Chrome WebMCP Standard (Origin Trial Ready)</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight leading-tight">
              AI Agent Integration Hub
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              CorpLawUpdates.in natively supports the <strong>Web Model Context Protocol (WebMCP)</strong>. 
              Chrome AI agents, Claude Code, Cursor, and autonomous assistants can interact directly with our 
              live regulatory database, statutory fee calculators, compliance calendars, and 34+ legal drafting templates.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3 text-xs">
              <Link
                href="/.well-known/webmcp"
                target="_blank"
                className="bg-amber-400 hover:bg-amber-500 text-navy font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Terminal className="size-3.5" />
                View WebMCP Manifest (JSON)
              </Link>
              <Link
                href="/llms.txt"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl transition-colors border border-white/10 flex items-center gap-1.5"
              >
                <Code2 className="size-3.5" />
                View llms.txt
              </Link>
              <a
                href="https://github.com/webmachinelearning/webmcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white px-3 py-2 flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                W3C Spec
              </a>
            </div>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
            <Cpu className="size-96 text-white" />
          </div>
        </header>

        {/* Value Prop Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Zap className="size-5" />
            </div>
            <h2 className="font-heading font-bold text-navy dark:text-white text-base">
              Dual Standard Support
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Supports both <strong>Declarative HTML Forms</strong> (native browser invocation) and <strong>Imperative <code>document.modelContext</code></strong> for client-side AI assistants.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="font-heading font-bold text-navy dark:text-white text-base">
              Statutory Accuracy
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every fee formula, penalty calculator, and template variable is verified by Company Secretaries and updated for FY 2026-27 statutory notifications.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Layers className="size-5" />
            </div>
            <h2 className="font-heading font-bold text-navy dark:text-white text-base">
              Zero Latency for Humans
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pure progressive enhancement. Standard browser visitors experience zero overhead, with full CDN edge-caching on all agent discovery endpoints.
            </p>
          </div>
        </div>

        {/* Tools Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy dark:text-white">
                Available WebMCP Tools ({TOOLS.length})
              </h2>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Structured tools registered in <code>document.modelContext</code> and available via REST endpoints.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 w-fit">
              All Tools 100% Free & Open
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  id={t.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`p-2.5 rounded-xl border ${t.color}`}>
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-mono text-sm md:text-base font-bold text-navy dark:text-white">
                          {t.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        t.method === 'GET' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {t.method}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t.readOnly ? 'readOnly' : 'write'}
                      </span>
                    </div>
                  </div>

                  {/* Endpoint */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between overflow-x-auto">
                    <span>{t.endpoint}</span>
                  </div>

                  {/* Parameters Table */}
                  {t.params.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Input Parameters
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                              <th className="py-1.5 pr-4 font-semibold">Parameter</th>
                              <th className="py-1.5 pr-4 font-semibold">Type</th>
                              <th className="py-1.5 pr-4 font-semibold">Required</th>
                              <th className="py-1.5 font-semibold">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                            {t.params.map((p) => (
                              <tr key={p.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="py-1.5 pr-4 font-bold text-navy dark:text-white">{p.name}</td>
                                <td className="py-1.5 pr-4 text-slate-500">{p.type}</td>
                                <td className="py-1.5 pr-4">
                                  {p.required ? (
                                    <span className="text-red-500 font-semibold">yes</span>
                                  ) : (
                                    <span className="text-slate-400">no</span>
                                  )}
                                </td>
                                <td className="py-1.5 font-sans text-slate-600 dark:text-slate-300">{p.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Sample Curl & Output */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sample Request & Response
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs font-mono overflow-x-auto">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">cURL</div>
                        <code>{t.sampleCurl}</code>
                      </div>
                      <div className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">JSON Response</div>
                        <pre className="text-[11px] leading-snug">
                          {JSON.stringify(t.sampleResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Integration Instructions */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 space-y-6">
          <h2 className="text-2xl font-heading font-bold text-navy dark:text-white">
            How AI Agents Connect to CorpLawUpdates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <h3 className="font-heading font-bold text-navy dark:text-white text-base flex items-center gap-2">
                <Bot className="size-4 text-amber-500" />
                1. Chrome AI Agent (WebMCP Native)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When a user visits CorpLawUpdates.in in Chrome with WebMCP enabled, the browser automatically registers all tools in <code>document.modelContext</code>. 
                The browser AI assistant can execute calculations, look up circulars, or decode CINs immediately without screen scraping.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <h3 className="font-heading font-bold text-navy dark:text-white text-base flex items-center gap-2">
                <Terminal className="size-4 text-blue-500" />
                2. Claude Code & Cursor MCP
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Add our REST endpoints to your agent tool definitions or read our <code>/.well-known/webmcp</code> manifest directly. 
                All endpoints return lean, structured JSON with HTTP caching headers to preserve performance.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Navigation CTA */}
        <div className="text-center py-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Have questions or want to partner on AI legal agents?{' '}
            <a href="mailto:mail@corplawupdates.in" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
              Contact us at mail@corplawupdates.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
