'use client'

import { useEffect, useRef, useState } from 'react'

interface HomeStatsProps {
  updatesCount: number
  totalViews: number
}

function useCountUp(target: number, duration = 1400, enabled: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled || target === 0) return
    let start: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, enabled])

  return count
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+'
  if (num >= 1_000)     return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K+'
  return num.toString()
}

export default function HomeStats({ updatesCount, totalViews }: HomeStatsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const count1 = useCountUp(updatesCount, 1200, visible)
  const count2 = useCountUp(totalViews,   1400, visible)

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-8 border-t border-white/15 pt-10"
    >
      <div className="text-center">
        <div className="text-3xl md:text-4xl text-white font-bold mb-1 tracking-tight tabular-nums animate-count-up">
          {visible ? formatNumber(count1) : '—'}
        </div>
        <div className="text-slate-400 text-sm font-medium">Articles published</div>
      </div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl text-white font-bold mb-1 tracking-tight tabular-nums animate-count-up">
          {visible ? formatNumber(count2) : '—'}
        </div>
        <div className="text-slate-400 text-sm font-medium">All-time reads</div>
      </div>
    </div>
  )
}
