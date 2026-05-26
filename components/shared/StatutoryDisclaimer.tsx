// src/components/shared/StatutoryDisclaimer.tsx
'use client'

import { ShieldAlert } from 'lucide-react'

export function StatutoryDisclaimer() {
  return (
    <div className="bg-brand-slate-blue/30 border border-white/10 rounded-card p-5 flex flex-col sm:flex-row gap-3.5 items-start text-white shadow-sm font-sans">
      <ShieldAlert className="h-5 w-5 text-brand-gold mt-0.5 shrink-0" />
      <div>
        <h5 className="text-[10px] font-bold text-brand-gold uppercase tracking-wider mb-1">
          Statutory Accuracy Disclaimer & Liability Limitation
        </h5>
        <p className="text-[9px] text-brand-muted leading-relaxed">
          All calculations, reference rates, and generated legal drafts are indicative reference models. While we execute strict compliance audits to align estimates with current 2026 guidelines, these results do not constitute formal legal or financial advice. Always verify figures and draft files with a certified Company Secretary (CS) or auditor before execution.
        </p>
      </div>
    </div>
  )
}
