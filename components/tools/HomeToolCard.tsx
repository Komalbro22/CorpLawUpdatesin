'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ComingSoonModal from '@/components/ComingSoonModal'

export interface HomeToolCardData {
  href: string
  icon: string
  title: string
  desc: string
  badge: string
  badgeColor: string
  isLive?: boolean
}

export default function HomeToolCard({ tool }: { tool: HomeToolCardData }) {
  const [modalOpen, setModalOpen] = useState(false)
  const isComingSoon = tool.badge === 'Coming Soon' || tool.isLive === false

  const inner = (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
            {tool.icon}
          </span>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md ${tool.badgeColor}`}>
            {tool.badge}
          </span>
        </div>
        <h3 className="font-bold text-navy dark:text-slate-100 text-base mb-1.5 group-hover:text-amber-600 transition-colors">
          {tool.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed">{tool.desc}</p>
      </div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {isComingSoon ? 'Coming Soon' : 'Explore Tool'}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </>
  )

  const className =
    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between animate-fade-up text-left w-full'

  if (isComingSoon) {
    return (
      <>
        <button type="button" onClick={() => setModalOpen(true)} className={`${className} cursor-pointer`}>
          {inner}
        </button>
        <ComingSoonModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={tool.title}
          description={tool.desc}
        />
      </>
    )
  }

  return (
    <Link href={tool.href} className={className}>
      {inner}
    </Link>
  )
}
