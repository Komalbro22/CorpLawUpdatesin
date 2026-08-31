'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Building2, ShieldCheck, Landmark, Scale, AlertTriangle, Globe, Newspaper } from 'lucide-react'
import { canOptimizeImage } from '@/lib/image-utils'

interface ArticleImageProps {
  src?: string | null
  alt: string
  category?: string | null
  priority?: boolean
  className?: string
}

const REGULATOR_THEMES: Record<string, { bg: string; icon: typeof Building2; label: string }> = {
  MCA: { bg: 'from-blue-900 via-slate-900 to-slate-950', icon: Building2, label: 'Ministry of Corporate Affairs' },
  SEBI: { bg: 'from-emerald-900 via-slate-900 to-slate-950', icon: ShieldCheck, label: 'Securities and Exchange Board' },
  RBI: { bg: 'from-violet-900 via-slate-900 to-slate-950', icon: Landmark, label: 'Reserve Bank of India' },
  NCLT: { bg: 'from-amber-900 via-slate-900 to-slate-950', icon: Scale, label: 'National Company Law Tribunal' },
  IBC: { bg: 'from-red-900 via-slate-900 to-slate-950', icon: AlertTriangle, label: 'Insolvency & Bankruptcy Code' },
  FEMA: { bg: 'from-teal-900 via-slate-900 to-slate-950', icon: Globe, label: 'Foreign Exchange Management' },
}

export default function ArticleImage({ src, alt, category, priority = false, className = '' }: ArticleImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageSrc, setImageSrc] = useState(src)

  const catKey = (category || 'MCA').toUpperCase()
  const theme = REGULATOR_THEMES[catKey] || { bg: 'from-navy via-slate-900 to-slate-950', icon: Newspaper, label: 'Corporate Law Update' }
  const IconComponent = theme.icon

  if (!imageSrc) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${theme.bg} flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 flex items-center justify-center text-amber-400 shadow-md">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300/90 font-heading">
            {catKey} OFFICIAL GAZETTE BRIEF
          </span>
          <span className="text-[11px] font-medium text-slate-300 line-clamp-1 max-w-[90%]">
            {theme.label}
          </span>
        </div>
      </div>
    )
  }

  const optimizable = canOptimizeImage(imageSrc)

  return (
    <div className={`relative w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-10" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        unoptimized={!optimizable}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          if (imageSrc !== '/images/og-default.png') {
            setImageSrc('/images/og-default.png')
          }
        }}
        className={`object-cover object-center motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'
        }`}
      />
    </div>
  )
}
