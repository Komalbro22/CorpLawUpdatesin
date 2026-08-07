import React from 'react'

interface CompanyStatusBadgeProps {
  status: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function CompanyStatusBadge({ status, size = 'md' }: CompanyStatusBadgeProps) {
  const cleanStatus = (status || 'Active').trim()
  const lower = cleanStatus.toLowerCase()

  let colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
  let dotColor = 'bg-emerald-500'

  if (lower.includes('struck') || lower.includes('dissolved') || lower.includes('removed')) {
    colorClasses = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
    dotColor = 'bg-rose-500 animate-ping'
  } else if (lower.includes('dormant')) {
    colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
    dotColor = 'bg-amber-500'
  } else if (lower.includes('liquid') || lower.includes('winding')) {
    colorClasses = 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
    dotColor = 'bg-purple-500'
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm font-bold' : 'px-3 py-1 text-xs font-semibold'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses} shadow-sm`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{cleanStatus.toUpperCase()}</span>
    </span>
  )
}
