'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function DocumentRetry() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { 
          router.refresh()
          return 8 
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-xl font-medium">Waking up the document generator...</p>
      <p className="text-sm text-slate-500 max-w-md">
        Our document servers enter sleep mode during inactivity to conserve resources. We're warming them up right now. Auto-retrying in {countdown}s.
      </p>
      <button onClick={() => router.refresh()} className="mt-4 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
        Retry now
      </button>
    </div>
  )
}
