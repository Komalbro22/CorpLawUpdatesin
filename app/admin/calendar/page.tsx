'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminCalendarPageRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/admin/compliance')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-[#0c1322]">
      <div className="text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm max-w-sm">
        <div className="w-8 h-8 border-4 border-amber-450 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-200 font-semibold text-sm">Redirecting...</p>
        <p className="text-slate-400 text-xs mt-1">Routing to the unified Compliance Calendar CMS</p>
      </div>
    </div>
  )
}
