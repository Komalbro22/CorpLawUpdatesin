'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BarChart2,
  Eye,
  FileText,
  LineChart,
  Loader2,
  Mail,
  PenSquare,
  Rss,
  Settings,
  Trophy,
  Users,
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalArticles: number
    totalSubscribers: number
    totalViews: number
    articlesThisWeek: number
    activeUsers?: number
    source?: string
  }
  topArticles: {
    title: string
    slug: string
    views: number
    category: string
    published_at: string
  }[]
  categoryBreakdown: Record<string, number>
  recentSubscribers: {
    email: string
    subscribed_at: string
  }[]
}

const categoryColors: Record<string, string> = {
  mca: 'bg-blue-500',
  sebi: 'bg-green-500',
  rbi: 'bg-purple-500',
  nclt: 'bg-orange-500',
  ibc: 'bg-red-500',
  fema: 'bg-teal-500',
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load analytics')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-gold" aria-hidden />
        <p className="text-sm font-medium">Loading analytics…</p>
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-red-600 p-6 font-medium">{error}</div>
  }

  const { overview, topArticles, categoryBreakdown, recentSubscribers } = data
  const totalCatArticles = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0)

  const overviewCards: {
    label: string
    value: string | number
    Icon: LucideIcon
    color: string
    text: string
    iconBg: string
  }[] = [
    {
      label: 'Total articles',
      value: overview.totalArticles,
      Icon: FileText,
      color: 'bg-blue-50 border-blue-200/90',
      text: 'text-blue-800',
      iconBg: 'bg-white text-blue-600 border border-blue-100',
    },
    {
      label: 'Subscribers',
      value: overview.totalSubscribers,
      Icon: Mail,
      color: 'bg-emerald-50 border-emerald-200/90',
      text: 'text-emerald-800',
      iconBg: 'bg-white text-emerald-600 border border-emerald-100',
    },
    {
      label: `Total views (${overview.source || 'DB'})`,
      value: overview.totalViews.toLocaleString('en-IN'),
      Icon: Eye,
      color: 'bg-violet-50 border-violet-200/90',
      text: 'text-violet-900',
      iconBg: 'bg-white text-violet-600 border border-violet-100',
    },
    {
      label: 'Active users (30d)',
      value: (overview.activeUsers || 0).toLocaleString('en-IN'),
      Icon: Users,
      color: 'bg-amber-50 border-amber-200/90',
      text: 'text-amber-900',
      iconBg: 'bg-white text-amber-700 border border-amber-100',
    },
  ]

  const quickActions: {
    href: string
    label: string
    desc: string
    Icon: LucideIcon
    color: string
    target?: string
  }[] = [
    {
      href: '/admin/articles/new',
      label: 'New article',
      desc: 'Publish a regulatory update',
      Icon: PenSquare,
      color: 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-200/80',
    },
    {
      href: '/admin/newsletter',
      label: 'Send newsletter',
      desc: `Reach ${overview.totalSubscribers} subscribers`,
      Icon: Mail,
      color: 'bg-blue-50/90 hover:bg-blue-100/90 border-blue-200/80',
    },
    {
      href: '/admin/settings',
      label: 'Site settings',
      desc: 'Social links, SEO, announcements',
      Icon: Settings,
      color: 'bg-slate-50 hover:bg-slate-100 border-slate-200/90',
    },
    {
      href: '/api/feed.xml',
      label: 'RSS feed',
      desc: 'Open the public feed',
      Icon: Rss,
      color: 'bg-violet-50/90 hover:bg-violet-100/90 border-violet-200/80',
      target: '_blank',
    },
  ]

  return (
    <div className="space-y-8 content-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            High-level traffic and content signals from your database.
          </p>
        </div>
        <Link
          href="/admin/analytics/articles"
          className="inline-flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-colors duration-200"
        >
          <LineChart className="w-4 h-4" aria-hidden />
          Article performance
          <ArrowRight className="w-4 h-4 opacity-80" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map(card => {
          const Icon = card.Icon
          return (
            <div
              key={card.label}
              className={`rounded-xl border p-5 shadow-card ring-1 ring-slate-900/[0.02] ${card.color}`}
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${card.iconBg}`}
              >
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <div className={`text-2xl font-heading font-bold tabular-nums ${card.text}`}>
                {card.value}
              </div>
              <div className="text-sm text-slate-600 mt-1 font-medium">{card.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-card ring-1 ring-slate-900/[0.02]">
          <h2 className="font-heading font-bold text-navy mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" aria-hidden />
            Top articles by views
          </h2>
          {topArticles.length === 0 ? (
            <p className="text-slate-400 text-sm">No views data yet.</p>
          ) : (
            <div className="space-y-3">
              {topArticles.map((article, i) => (
                <div key={article.slug} className="flex items-start gap-3">
                  <span className="text-sm font-bold text-slate-400 w-6 flex-shrink-0 tabular-nums pt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/updates/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-navy hover:text-amber-700 line-clamp-2 transition-colors"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wide font-bold text-blue-600">
                        {article.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {(article.views || 0).toLocaleString('en-IN')} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-card ring-1 ring-slate-900/[0.02]">
          <h2 className="font-heading font-bold text-navy mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-600" aria-hidden />
            Articles by category
          </h2>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <p className="text-slate-400 text-sm">No published articles yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => {
                  const pct = Math.round((count / totalCatArticles) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-navy uppercase">{cat}</span>
                        <span className="text-slate-500 tabular-nums">
                          {count} · {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${categoryColors[cat] || 'bg-slate-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-card ring-1 ring-slate-900/[0.02]">
          <h2 className="font-heading font-bold text-navy mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" aria-hidden />
            Recent subscribers
          </h2>
          {recentSubscribers.length === 0 ? (
            <p className="text-slate-400 text-sm">No subscribers yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSubscribers.map(sub => (
                <div
                  key={sub.email}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 gap-2"
                >
                  <span className="text-sm text-navy font-medium truncate">{sub.email}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums">
                    {new Date(sub.subscribed_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
              <Link
                href="/admin/subscribers"
                className="inline-flex items-center justify-center gap-1 w-full text-sm text-amber-700 hover:text-amber-900 font-semibold mt-3 py-2 rounded-lg hover:bg-amber-50 transition-colors"
              >
                All subscribers
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-card ring-1 ring-slate-900/[0.02]">
          <h2 className="font-heading font-bold text-navy mb-4">Quick actions</h2>
          <div className="space-y-2">
            {quickActions.map(action => {
              const Icon = action.Icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  target={action.target}
                  rel={action.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-200 ${action.color}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-navy">
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-navy text-sm">{action.label}</div>
                    <div className="text-xs text-slate-500 leading-snug">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-auto" aria-hidden />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
