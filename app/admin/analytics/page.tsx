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
  RefreshCw,
} from 'lucide-react'
import { syncViewsAction } from '@/app/actions/syncViews'

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
  const [isSyncing, setIsSyncing] = useState(false)

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
      color: 'admin-stat-blue',
      text: 'text-slate-900',
      iconBg: 'admin-icon-blue',
    },
    {
      label: 'Subscribers',
      value: overview.totalSubscribers,
      Icon: Mail,
      color: 'admin-stat-emerald',
      text: 'text-slate-900',
      iconBg: 'admin-icon-emerald',
    },
    {
      label: `Total views (${overview.source || 'DB'})`,
      value: overview.totalViews.toLocaleString('en-IN'),
      Icon: Eye,
      color: 'admin-stat-violet',
      text: 'text-slate-900',
      iconBg: 'admin-icon-violet',
    },
    {
      label: 'Active users (30d)',
      value: (overview.activeUsers || 0).toLocaleString('en-IN'),
      Icon: Users,
      color: 'admin-stat-amber',
      text: 'text-slate-900',
      iconBg: 'admin-icon-amber',
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
      color: 'bg-slate-100/40 hover:bg-slate-200/50 border-amber-500/20 text-slate-900 hover:border-amber-500/40',
    },
    {
      href: '/admin/newsletter',
      label: 'Send newsletter',
      desc: `Reach ${overview.totalSubscribers} subscribers`,
      Icon: Mail,
      color: 'bg-slate-100/40 hover:bg-slate-200/50 border-blue-500/20 text-slate-900 hover:border-blue-500/40',
    },
    {
      href: '/admin/settings',
      label: 'Site settings',
      desc: 'Social links, SEO, announcements',
      Icon: Settings,
      color: 'bg-slate-100/40 hover:bg-slate-200/50 border-white/60 text-slate-900 hover:border-slate-700',
    },
    {
      href: '/api/feed.xml',
      label: 'RSS feed',
      desc: 'Open the public feed',
      Icon: Rss,
      color: 'bg-slate-100/40 hover:bg-slate-200/50 border-violet-500/20 text-slate-900 hover:border-violet-500/40',
      target: '_blank',
    },
  ]

  return (
    <div className="space-y-8 content-fade-in text-slate-900">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            High-level traffic and content signals from your database.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              setIsSyncing(true)
              try {
                const res = await syncViewsAction()
                if (res.success) alert(`Success! Synced ${res.syncedCount} batched views to database. Homepage cache cleared.`)
                else alert('Sync failed: ' + res.error)
              } catch {
                alert('Sync failed')
              }
              setIsSyncing(false)
            }}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Views
          </button>
          <Link
            href="/admin/analytics/articles"
            className="inline-flex items-center gap-2 bg-gold hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-colors duration-200"
          >
          <LineChart className="w-4 h-4" aria-hidden />
          Article performance
          <ArrowRight className="w-4 h-4 opacity-80" aria-hidden />
        </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map(card => {
          const Icon = card.Icon
          return (
            <div
              key={card.label}
              className={`rounded-xl p-5 shadow-card ring-1 ring-slate-900/[0.02] ${card.color}`}
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${card.iconBg}`}
              >
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <div className={`text-2xl font-heading font-bold tabular-nums ${card.text}`}>
                {card.value}
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">{card.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <h2 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" aria-hidden />
            Top articles by views
          </h2>
          {topArticles.length === 0 ? (
            <p className="text-slate-500 text-sm">No views data yet.</p>
          ) : (
            <div className="space-y-3">
              {topArticles.map((article, i) => (
                <div key={article.slug} className="flex items-start gap-3">
                  <span className="text-sm font-bold text-slate-500 w-6 flex-shrink-0 tabular-nums pt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/updates/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-slate-800 hover:text-amber-400 line-clamp-2 transition-colors"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wide font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-2 py-0.5">
                        {article.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {(article.views || 0).toLocaleString('en-IN')} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card p-6">
          <h2 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-500" aria-hidden />
            Articles by category
          </h2>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <p className="text-slate-500 text-sm">No published articles yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => {
                  const pct = Math.round((count / totalCatArticles) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-800 uppercase">{cat}</span>
                        <span className="text-slate-500 tabular-nums">
                          {count} · {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden">
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

        <div className="admin-card p-6">
          <h2 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" aria-hidden />
            Recent subscribers
          </h2>
          {recentSubscribers.length === 0 ? (
            <p className="text-slate-500 text-sm">No subscribers yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSubscribers.map(sub => (
                <div
                  key={sub.email}
                  className="flex items-center justify-between py-2 border-b border-white/60 last:border-0 gap-2"
                >
                  <span className="text-sm text-slate-800 font-medium truncate">{sub.email}</span>
                  <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums">
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
                className="inline-flex items-center justify-center gap-1 w-full text-sm text-amber-400 hover:text-amber-300 font-semibold mt-3 py-2 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 transition-colors"
              >
                All subscribers
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>

        <div className="admin-card p-6">
          <h2 className="font-heading font-bold text-slate-900 mb-4">Quick actions</h2>
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
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-white/60 text-slate-800">
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">{action.label}</div>
                    <div className="text-xs text-slate-500 leading-snug">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 ml-auto" aria-hidden />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
