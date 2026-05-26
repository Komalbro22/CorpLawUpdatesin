// src/components/hub/WhatsAppWidget.tsx
'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Users, ArrowRight } from 'lucide-react'

interface WhatsAppWidgetProps {
  memberCount: number
}

export function WhatsAppWidget({ memberCount }: WhatsAppWidgetProps) {
  const displayCount = memberCount > 0 ? `${memberCount.toLocaleString()}+` : '12,000+'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-brand-slate-blue border border-white/10 rounded-card p-6 shadow-card overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy via-transparent to-brand-gold/5 pointer-events-none" />

      {/* Main Icon and Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-badge">
          <MessageSquare className="w-5 h-5 text-green-400 animate-pulse" />
        </div>
        <div>
          <h4 className="text-white font-serif font-bold text-base leading-tight">
            Corporate Law Updates
          </h4>
          <p className="text-xs text-brand-gold font-semibold">
            Premium WhatsApp Channel
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-brand-muted text-xs leading-relaxed mb-5 relative z-10">
        Get instant regulatory circulars, compliance calendars, and statutory amendment digests pushed directly to your phone. Zero spam.
      </p>

      {/* Subscriber Badge */}
      <div className="flex items-center gap-2 bg-brand-navy/60 border border-white/5 rounded-badge px-4 py-2 mb-6 relative z-10">
        <Users className="w-4 h-4 text-brand-gold" />
        <span className="text-white text-xs font-bold font-sans">
          {displayCount} Professionals Subscribed
        </span>
      </div>

      {/* Primary Call to Action */}
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href="https://chat.whatsapp.com/your-premium-group-link" // [ACTION REQUIRED: Verify final invite URL]
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-gold text-brand-navy font-bold text-sm rounded-badge hover:bg-brand-gold-light transition-colors shadow-lg shadow-brand-gold/10 relative z-10"
      >
        Join Updates Channel
        <ArrowRight className="w-4 h-4" />
      </motion.a>
    </motion.div>
  )
}
