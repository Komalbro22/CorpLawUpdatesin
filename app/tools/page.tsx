import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { tools } from '@/config/tools.config'
import { Scale, TrendingUp, Sparkles, ArrowRight, BookOpen, ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Compliance & Legal Interactive Toolbox | CorpLawUpdates.in',
  description: 'Free interactive corporate law tools for CA, CS, and business owners. Includes MCA late filing fee calculator, MSME delayed payment interest calculator, and AI legal drafting co-pilot.',
  alternates: { canonical: 'https://www.corplawupdates.in/tools' }
}

const iconMap: Record<string, React.ReactNode> = {
  scale: <Scale className="h-6 w-6 text-amber-500" />,
  'trending-up': <TrendingUp className="h-6 w-6 text-amber-500" />,
  sparkles: <Sparkles className="h-6 w-6 text-amber-500" />,
}

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Hero Section */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200/50 uppercase tracking-widest mb-4">
            ⚡ Professional Compliance Suite
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-navy font-bold tracking-tight mb-4">
            Free Legal & Regulatory Toolbox
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-base leading-relaxed">
            Statutory calculators, interest estimators, and AI-powered document generators designed specifically for Chartered Accountants, Company Secretaries, and growing Indian startups.
          </p>
        </div>

        {/* Dynamic Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tools.map((tool) => (
            <div 
              key={tool.slug}
              className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100/50">
                    {iconMap[tool.icon] || <BookOpen className="h-6 w-6 text-amber-500" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Verified: 2026
                  </span>
                </div>
                
                <h2 className="font-heading text-xl text-navy font-bold group-hover:text-amber-600 transition-colors mb-2">
                  {tool.title}
                </h2>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {tool.category}
                </span>
                <Link 
                  href={tool.path}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Open Tool
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer & Trust Banner */}
        <div className="bg-slate-100/70 border border-slate-200/60 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
          <ShieldAlert className="h-6 w-6 text-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-navy mb-1.5 uppercase tracking-wider">
              Statutory Accuracy & Limitation of Liability Notice
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              All tools, templates, and mathematical estimators on CorpLawUpdates.in are provided strictly as indicative reference models. While we execute thorough compliance checks to align with the latest 2026 amendments (including the Companies Act, LLP Rules, and MSMED interest rates), these systems do not constitute professional legal or financial advice. Always verify calculations and draft documents with a licensed Company Secretary (CS) or auditor before final signature execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
