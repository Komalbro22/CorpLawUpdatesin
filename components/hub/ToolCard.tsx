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
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative bg-brand-slate-blue border border-white/10 rounded-card p-6 cursor-pointer hover:border-brand-gold/30 hover:shadow-card-hover transition-shadow duration-300 h-full flex flex-col justify-between"
      role="link"
    >
      <Link href={tool.path} className="absolute inset-0 z-10 rounded-card" />
      
      {/* Gold border gradient on hover */}
      <div className="absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 60%)' }}
      />

      <div>
        {/* Badges & Icon */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 bg-brand-navy border border-white/5 rounded-badge">
            <IconComponent className="w-5 h-5 text-brand-gold" />
          </div>
          {tool.isBeta && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-status-warning/10 text-status-warning rounded-full border border-status-warning/20">
              Beta
            </span>
          )}
          {tool.isNew && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-gold/10 text-brand-gold rounded-full border border-brand-gold/20">
              New
            </span>
          )}
        </div>

        {/* Title and subtitle */}
        <h3 className="text-white font-serif font-bold text-lg mb-1 leading-snug pr-6 group-hover:text-brand-gold transition-colors">
          {tool.title}
        </h3>
        <p className="text-brand-gold/70 text-xs font-medium mb-3">
          {tool.subtitle}
        </p>
        <p className="text-brand-muted text-sm leading-relaxed mb-5">
          {tool.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
        <div className="flex items-center gap-1.5 text-[11px] text-brand-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-status-verified" />
          <span>Verified: {tool.verifiedAsOf}</span>
        </div>
        <span className="flex items-center gap-1 text-brand-gold text-xs font-bold relative z-20">
          Open <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </motion.article>
  )
}
