// src/components/mca/AmnestyBanner.tsx
'use client'

import { AlertTriangle, ExternalLink } from 'lucide-react'

interface AmnestyBannerProps {
  isActive: boolean
  schemeName?: string
  circularUrl?: string
}

export function AmnestyBanner({ isActive, schemeName, circularUrl }: AmnestyBannerProps) {
  if (!isActive) return null

  const displayName = schemeName || 'CFSS Amnesty Waiver Scheme'
  const displayUrl = circularUrl || 'https://www.mca.gov.in'

  return (
    <div className="p-5 bg-brand-slate-blue border border-status-warning/30 rounded-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md relative overflow-hidden font-sans text-white">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-status-warning/10 to-transparent pointer-events-none" />

      <div className="flex items-start gap-3.5 relative z-10">
        <div className="p-2.5 bg-status-warning/10 border border-status-warning/20 rounded-badge mt-0.5 shrink-0">
          <AlertTriangle className="h-5 w-5 text-status-warning animate-pulse" />
        </div>
        <div>
          <span className="text-xs font-bold text-white block uppercase tracking-wider">
            Active MCA Fee Waiver Scheme Enabled
          </span>
          <h4 className="text-sm font-serif font-bold text-brand-gold mt-0.5">
            {displayName}
          </h4>
          <p className="text-[10px] text-brand-muted leading-relaxed mt-1">
            The Ministry of Corporate Affairs (MCA) has announced an active penalty waiver scheme. Standard daily additional late filing fees (₹100/day) are completely waived under current guidelines.
          </p>
        </div>
      </div>
      
      <a
        href={displayUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-status-warning text-brand-navy font-bold text-xs uppercase tracking-wider rounded-badge hover:bg-status-warning/90 transition-colors shrink-0 relative z-10 shadow-sm"
      >
        View MCA Circular
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}
