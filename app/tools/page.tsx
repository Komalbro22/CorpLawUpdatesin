// src/app/tools/page.tsx
import { Suspense } from 'react'
import { TOOLS, CATEGORIES } from '@/config/tools.config'
import { ToolsGrid } from '@/components/hub/ToolsGrid'
import { WhatsAppWidget } from '@/components/hub/WhatsAppWidget'
import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import { ShieldAlert, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Compliance & Legal Interactive Toolbox | CorpLawUpdates.in',
  description: 'Free interactive corporate law tools for CAs, CSs, and startup founders. Features MCA late filing fees calculator, MSME interest calculator, and AI legal drafting co-pilot.',
  alternates: { canonical: 'https://www.corplawupdates.in/tools' }
}

export const revalidate = 300 // Revalidate cache every 5 minutes

async function getWhatsAppCount(): Promise<number> {
  try {
    const { data } = await supabase
      .from('compliance_rates')
      .select('text_value')
      .eq('key', 'whatsapp_member_count')
      .single()
    return parseInt(data?.text_value ?? '0', 10) || 12000
  } catch {
    return 12000
  }
}

export default async function ToolsHubPage() {
  const whatsappCount = await getWhatsAppCount()

  // High-fidelity SEO JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Compliance & Legal Interactive Toolbox | CorpLawUpdates.in",
    "description": "Free interactive corporate law tools for CAs, CSs, and startup founders. Features MCA late filing fees calculator, MSME interest calculator, and AI legal drafting co-pilot.",
    "url": "https://www.corplawupdates.in/tools",
    "numberOfItems": TOOLS.length,
    "itemListElement": TOOLS.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": tool.title,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "url": `https://www.corplawupdates.in${tool.path}`,
        "description": tool.description,
        "author": {
          "@type": "Organization",
          "name": "CorpLawUpdates"
        }
      }
    }))
  }

  return (
    <main className="min-h-screen bg-[#070b15] pb-32 text-white relative overflow-hidden font-sans">
      {/* Server-Side SEO JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Atmospheric Starry Grid Mesh & Radial Gradients (Celestial Workspace Style) */}
      <div 
        className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#070b15] via-[#0b1224] to-[#070b15] pointer-events-none"
        aria-hidden="true"
      />

      {/* Slowly Pulsing Ambient Glow Orbs */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[40%] rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-[140px] pointer-events-none animate-pulse-soft"
        style={{ animationDuration: '8s' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-[30%] -right-[15%] w-[60%] h-[45%] rounded-full bg-gradient-to-tl from-indigo-500/15 to-transparent blur-[140px] pointer-events-none animate-pulse-soft"
        style={{ animationDuration: '12s' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-[10%] left-[20%] w-[50%] h-[35%] rounded-full bg-gradient-to-tr from-brand-gold/5 to-transparent blur-[120px] pointer-events-none animate-pulse-soft"
        style={{ animationDuration: '10s' }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Editorial Premium Hero Header */}
        <section className="relative px-6 pt-24 pb-16 text-center max-w-5xl mx-auto border-b border-white/[0.04]">
          <div className="space-y-6">
            {/* Top Micro-Overline Tag */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase bg-white/[0.02] text-brand-gold border border-brand-gold/15 rounded-md backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse flex-shrink-0" />
              ⚡ STATUTORY COMPLIANCE SUITE 2026
            </span>

            {/* Premium Asymmetric Gradient Header */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-gold/80 leading-[1.08] max-w-4xl mx-auto">
              Interactive Legal &amp; Compliance Hub
            </h1>

            {/* Centered Editorial Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light text-balance">
              Statutorily accurate delayed payment estimators, delay penalty calculators, and generative AI drafting engines engineered for Company Secretaries, Chartered Accountants, and corporate founders.
            </p>

            {/* High-End Technical Statistics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-white/[0.04] text-left">
              <div className="p-3 bg-white/[0.01] backdrop-blur-[2px] rounded-lg border border-white/[0.03]">
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Available Systems</div>
                <div className="text-lg font-serif font-semibold text-white mt-0.5">3 Core Engines</div>
              </div>
              <div className="p-3 bg-white/[0.01] backdrop-blur-[2px] rounded-lg border border-white/[0.03]">
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Verification Rate</div>
                <div className="text-lg font-serif font-semibold text-[#10B981] mt-0.5">100% Verified</div>
              </div>
              <div className="p-3 bg-white/[0.01] backdrop-blur-[2px] rounded-lg border border-white/[0.03]">
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Regulatory Check</div>
                <div className="text-lg font-serif font-semibold text-brand-gold mt-0.5">FY 2026-27 Compliant</div>
              </div>
              <div className="p-3 bg-white/[0.01] backdrop-blur-[2px] rounded-lg border border-white/[0.03]">
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">DPDP Act Compliance</div>
                <div className="text-lg font-serif font-semibold text-slate-350 mt-0.5">Safe &amp; Sovereign</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Main Search & Grid Area */}
            <div className="lg:col-span-3 space-y-12">
              <Suspense fallback={<ToolsGridSkeleton />}>
                <ToolsGrid tools={TOOLS} categories={CATEGORIES} />
              </Suspense>

              {/* Legal Disclaimer & Trust Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-brand-navy/60 to-[#0e172a]/40 border border-white/[0.04] rounded-card p-6 flex flex-col sm:flex-row gap-4 items-start shadow-xl backdrop-blur-md">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold/60" />
                <ShieldAlert className="h-6 w-6 text-brand-gold mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-brand-gold uppercase tracking-widest">
                    Statutory Accuracy &amp; Limitation of Liability Notice
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                    All tools, templates, and mathematical calculators on CorpLawUpdates.in are provided strictly as indicative reference models. While we execute thorough compliance checks to align with the latest 2026 statutory amendments (including the Companies Act, LLP Rules, and MSMED interest rates), these systems do not constitute formal legal or financial advice. Always verify calculations and drafted items with a licensed Company Secretary (CS) or advocate before final execution.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar Panel */}
            <aside className="space-y-6 lg:sticky lg:top-28">
              <WhatsAppWidget memberCount={whatsappCount} />

              {/* Side FAQ Helper Widget */}
              <div className="relative overflow-hidden bg-white/[0.01] border border-white/[0.03] rounded-card p-6 space-y-4 backdrop-blur-md">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/5 blur-xl rounded-full pointer-events-none" />
                <h4 className="text-white font-serif font-medium text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-gold" /> Need Assistance?
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-light">
                  Are you experiencing calculation discrepancies compared to standard MCA portal challans or tribunal interest schedules?
                </p>
                <a
                  href="mailto:support@corplawupdates.in"
                  className="inline-flex items-center text-xs font-bold text-brand-gold hover:underline transition-colors hover:text-amber-300"
                >
                  Email Support Team &rarr;
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}

function ToolsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-56 bg-white/[0.02] rounded-card border border-white/[0.03]" />
      ))}
    </div>
  )
}
