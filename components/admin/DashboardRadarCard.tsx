import React from 'react'
import Link from 'next/link'
import { Radio } from 'lucide-react'

export default function DashboardRadarCard() {
  return (
    <Link
      href="/admin/radar"
      className="admin-card-glass p-4 flex flex-col gap-2.5 hover:border-amber-400 hover:shadow-md transition-all duration-300 group hover:-translate-y-1 text-left bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border-amber-200/80"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500 text-white shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
        <Radio className="w-4 h-4 animate-pulse" aria-hidden />
      </div>
      <div>
        <p className="text-slate-900 font-heading font-bold text-sm flex items-center gap-1.5">
          Regulator Radar
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
        </p>
        <p className="text-slate-400 text-xs mt-0.5">Scan last 48h circulars</p>
      </div>
    </Link>
  )
}
