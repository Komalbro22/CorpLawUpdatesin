// src/app/tools/page.tsx
import { Suspense } from 'react'
import { TOOLS, CATEGORIES } from '@/config/tools.config'
import { ToolsGrid } from '@/components/hub/ToolsGrid'
import { WhatsAppWidget } from '@/components/hub/WhatsAppWidget'
import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import { ShieldAlert, Cpu, HelpCircle } from 'lucide-react'

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

  return (
    <main className="min-h-screen bg-brand-navy pb-24 text-white">
      {/* Premium Hero Section */}
      <section className="relative px-6 py-20 text-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-slate-blue/40 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-[10px] font-bold tracking-widest uppercase bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full">
            ⚡ Professional Compliance Suite
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-5 leading-tight tracking-tight">
            Compliance & Legal Tools Hub
          </h1>
          <p className="text-brand-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Statutorily accurate calculators, delay penalty estimators, and AI-powered document generators designed specifically for Chartered Accountants, Company Secretaries, and startups.
          </p>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main search and grid area */}
          <div className="lg:col-span-3 space-y-12">
            <Suspense fallback={<ToolsGridSkeleton />}>
              <ToolsGrid tools={TOOLS} categories={CATEGORIES} />
            </Suspense>

            {/* Legal Disclaimer & Trust Banner */}
            <div className="bg-brand-slate-blue/40 border border-white/10 rounded-card p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm mt-8">
              <ShieldAlert className="h-6 w-6 text-brand-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-serif font-bold text-brand-gold mb-1.5 uppercase tracking-wider">
                  Statutory Accuracy & Limitation of Liability Notice
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  All tools, templates, and mathematical estimators on CorpLawUpdates.in are provided strictly as indicative reference models. While we execute thorough compliance checks to align with the latest 2026 amendments (including the Companies Act, LLP Rules, and MSMED interest rates), these systems do not constitute professional legal or financial advice. Always verify calculations and draft documents with a licensed Company Secretary (CS) or auditor before final signature execution.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Widget Panel */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <WhatsAppWidget memberCount={whatsappCount} />

              {/* Side FAQ Helper Widget */}
              <div className="bg-brand-slate-blue/30 border border-white/5 rounded-card p-5 space-y-4">
                <h4 className="text-white font-serif font-bold text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-gold" /> Need Support?
                </h4>
                <p className="text-[11px] text-brand-muted leading-normal">
                  Are you experiencing calculation discrepancies compared to standard MCA portal challans or tribunal interest schedules?
                </p>
                <a
                  href="mailto:support@corplawupdates.in"
                  className="inline-flex items-center text-xs font-bold text-brand-gold hover:underline"
                >
                  Email Professional Support
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function ToolsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-56 bg-brand-slate-blue/50 rounded-card" />
      ))}
    </div>
  )
}
