'use client'

import { useEffect, useRef } from 'react'

interface AdSenseAdProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal'
  responsive?: boolean
  className?: string
  minHeight?: number
}

/**
 * Google AdSense Responsive Display Unit with Anti-CLS (Cumulative Layout Shift) Protection.
 * Pre-reserves layout height with accessible ARIA labeling and regulatory policy compliance.
 */
export default function AdSenseAd({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  minHeight = 280,
}: AdSenseAdProps) {
  const isLoaded = useRef(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !isLoaded.current) {
        // @ts-expect-error adsbygoogle is dynamically populated by AdSense script
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        isLoaded.current = true
      }
    } catch {
      // Gracefully silent if blocked by client ad-blocker
    }
  }, [])

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center transition-all print:hidden ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium py-1 select-none">
        Advertisement
      </span>
      <div className="w-full flex justify-center items-center grow">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: `${minHeight - 24}px` }}
          data-ad-client="ca-pub-8404756575471756"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </aside>
  )
}
