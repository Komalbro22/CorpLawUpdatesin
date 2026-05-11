'use client'
import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number
    function updateProgress() {
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        setProgress(Math.min(100, pct))
      })
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateProgress)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-slate-200/60 print:hidden"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 relative"
        style={{
          width: `${progress}%`,
          transition: 'width 80ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Glowing tip */}
        {progress > 1 && progress < 100 && (
          <span
            className="progress-tip absolute right-0 top-0 h-full w-[4px] rounded-full bg-amber-300"
            aria-hidden
          />
        )}
      </div>
    </div>
  )
}
