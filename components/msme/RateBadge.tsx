// src/components/msme/RateBadge.tsx
'use client'

import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react'

interface RateBadgeProps {
  bankRate: number
  lastVerifiedHours: number
}

export function RateBadge({ bankRate, lastVerifiedHours }: RateBadgeProps) {
  // Verification Category styling: Verified Today (<=24 hrs), Recent (<=48 hrs), Stale/Manual (>48 hrs)
  if (lastVerifiedHours <= 24) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-status-verified/10 text-status-verified border border-status-verified/25 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-sans">
        <ShieldCheck className="w-3.5 h-3.5" />
        RBI Bank Rate: {bankRate.toFixed(2)}% (Auto-Verified Today)
      </span>
    )
  } else if (lastVerifiedHours <= 48) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-status-warning/10 text-status-warning border border-status-warning/25 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-sans">
        <Clock className="w-3.5 h-3.5" />
        RBI Bank Rate: {bankRate.toFixed(2)}% (Verified {lastVerifiedHours} hrs ago)
      </span>
    )
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 bg-status-error/10 text-status-error border border-status-error/25 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-sans">
        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
        Rate stale ({lastVerifiedHours} hrs old) — Verify at RBI website
      </span>
    )
  }
}
