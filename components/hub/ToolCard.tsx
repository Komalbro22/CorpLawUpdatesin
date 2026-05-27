// src/components/hub/ToolCard.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import type { Tool } from '@/config/tools.config'

interface ToolCardProps { tool: Tool }

export function ToolCard({ tool }: ToolCardProps) {
  // Dynamically retrieve the icon component based on string value
  const IconComponent = (Icons as any)[tool.icon] ?? Icons.FileText

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative bg-[#0d1527]/30 backdrop-blur-lg border border-white/[0.04] rounded-card p-6.5 cursor-pointer hover:border-brand-gold/25 hover:shadow-[0_12px_40px_rgba(7,11,21,0.5),0_0_30px_rgba(201,168,76,0.06)] transition-all duration-350 h-full flex flex-col justify-between overflow-hidden"
      role="link"
    >
      {/* Absolute link mapping the whole card */}
      <Link href={tool.path} className="absolute inset-0 z-10 rounded-card" />
      
      {/* Glowing corner gradient visible on hover */}
      <div 
        className="absolute -top-[30%] -left-[30%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-brand-gold/15 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-[30%] -right-[30%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-indigo-500/10 via-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-20">
        {/* Top Badges & Animated Icon Capsule */}
        <div className="flex items-center justify-between mb-5">
          <div className="p-3 bg-[#070b15] border border-white/[0.05] rounded-lg shadow-[0_2px_15px_rgba(7,11,21,0.8)] group-hover:border-brand-gold/30 group-hover:shadow-[0_0_15px_rgba(201,168,76,0.15)] transition-all duration-350">
            <IconComponent className="w-5 h-5 text-brand-gold group-hover:scale-105 transition-transform" />
          </div>

          <div className="flex gap-2">
            {tool.isBeta && (
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20 shadow-sm">
                BETA
              </span>
            )}
            {tool.isNew && (
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-brand-gold/10 text-brand-gold rounded-md border border-brand-gold/20 shadow-sm">
                NEW
              </span>
            )}
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-white/[0.02] text-slate-400 rounded-md border border-white/[0.04]">
              {tool.estimatedTime}
            </span>
          </div>
        </div>

        {/* Title and subtitle utilizing high-end typography pairings */}
        <h3 className="text-white font-serif font-bold text-lg mb-1 leading-snug group-hover:text-brand-gold transition-colors duration-300">
          {tool.title}
        </h3>
        <p className="text-brand-gold/80 text-xs font-light tracking-wide mb-3 uppercase">
          {tool.subtitle}
        </p>
        <p className="text-slate-350 text-[13px] leading-relaxed mb-6 font-light">
          {tool.description}
        </p>
      </div>

      {/* Footer Area with Pulse Verification and Custom Glow Arrow */}
      <div className="flex items-center justify-between pt-4.5 border-t border-white/[0.03] mt-4 relative z-20 select-none">
        {/* Verification indicator featuring emerald pulse heartbeats */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-light">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </div>
          <span>Statutory Compliance: FY 2026-27</span>
        </div>

        <span className="flex items-center gap-1.5 text-brand-gold text-[11px] font-bold uppercase tracking-widest group-hover:text-amber-300 transition-colors">
          Launch <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </span>
      </div>
    </motion.article>
  )
}
