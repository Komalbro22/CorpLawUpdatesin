// src/components/shared/VerifiedBadge.tsx
'use client'

import { ShieldCheck } from 'lucide-react'

interface VerifiedBadgeProps {
  date: string
  practitioner: string
  regNo: string
}

export function VerifiedBadge({ date, practitioner, regNo }: VerifiedBadgeProps) {
  return (
    <div className="flex items-center gap-2.5 bg-brand-navy/60 border border-white/5 rounded-badge px-3 py-2 text-white font-sans">
      <ShieldCheck className="w-4 h-4 text-status-verified shrink-0" />
      <div className="text-[9px] leading-tight">
        <span className="text-brand-muted block font-semibold">
          Practitioner Verified: {date}
        </span>
        <span className="text-brand-gold font-bold block mt-0.5">
          {practitioner} ({regNo})
        </span>
      </div>
    </div>
  )
}
