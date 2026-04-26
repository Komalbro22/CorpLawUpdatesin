'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AnalyticsData {
  overview: {
    totalArticles: number
    totalSubscribers: number
    totalViews: number
    articlesThisWeek: number
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
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { 
        setError('Failed to load analytics')
        setLoading(false) 
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center 
                      min-h-[400px]">
        <div className="text-slate-400 animate-pulse">
          Loading analytics...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-red-500 p-6">{error}</div>
    )
  }

  const { overview, topArticles, 
          categoryBreakdown, recentSubscribers } = data

  const totalCatArticles = Object.values(
    categoryBreakdown
  ).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">
          Analytics & Performance
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Site performance overview
        </p>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Articles', 
            value: overview.totalArticles, 
            icon: '📄',
            color: 'bg-blue-50 border-blue-200',
            text: 'text-blue-700'
          },
          { 
            label: 'Total Subscribers', 
            value: overview.totalSubscribers, 
            icon: '📧',
            color: 'bg-green-50 border-green-200',
            text: 'text-green-700'
          },
          { 
            label: 'Total Views', 
            value: overview.totalViews
              .toLocaleString('en-IN'), 
            icon: '👁️',
            color: 'bg-purple-50 border-purple-200',
            text: 'text-purple-700'
          },
          { 
            label: 'Published This Week', 
            value: overview.articlesThisWeek, 
            icon: '🗓️',
            color: 'bg-amber-50 border-amber-200',
            text: 'text-amber-700'
          },
        ].map((card) => (
          <div key={card.label}
               className={`rounded-xl border p-5 ${card.color}`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className={`text-3xl font-bold ${card.text}`}>
              {card.value}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TOP ARTICLES BY VIEWS */}
        <div className="bg-white rounded-xl border 
                        border-slate-200 p-6">
          <h2 className="font-bold text-navy mb-4 
                         flex items-center gap-2">
            🏆 Top Articles by Views
          </h2>
          {topArticles.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No views data yet. Views increment on 
              each article visit.
            </p>
          ) : (
            <div className="space-y-3">
              {topArticles.map((article, i) => (
                <div key={article.slug}
                     className="flex items-start gap-3">
                  <span className="text-lg font-bold 
                                   text-slate-300 w-6 
                                   flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/updates/${article.slug}`}
                      target="_blank"
                      className="text-sm font-medium 
                                 text-navy hover:text-amber-600 
                                 line-clamp-2"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center 
                                    gap-2 mt-1">
                      <span className="text-xs uppercase 
                                       font-bold text-blue-600">
                        {article.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        · {article.views || 0} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="bg-white rounded-xl border 
                        border-slate-200 p-6">
          <h2 className="font-bold text-navy mb-4 
                         flex items-center gap-2">
            📊 Articles by Category
          </h2>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <p className="text-slate-400 text-sm">
              No published articles yet.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([cat, count]) => {
                  const pct = Math.round(
                    (count / totalCatArticles) * 100
                  )
                  return (
                    <div key={cat}>
                      <div className="flex justify-between 
                                      text-sm mb-1">
                        <span className="font-semibold 
                                         text-navy uppercase">
                          {cat}
                        </span>
                        <span className="text-slate-500">
                          {count} article{count !== 1 
                            ? 's' : ''} · {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 
                                      rounded-full h-2">
                        <div
                          className={`h-2 rounded-full 
                            ${categoryColors[cat] || 
                              'bg-slate-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* RECENT SUBSCRIBERS */}
        <div className="bg-white rounded-xl border 
                        border-slate-200 p-6">
          <h2 className="font-bold text-navy mb-4 
                         flex items-center gap-2">
            📧 Recent Subscribers
          </h2>
          {recentSubscribers.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No subscribers yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentSubscribers.map((sub) => (
                <div key={sub.email}
                     className="flex items-center 
                                justify-between py-2 
                                border-b border-slate-100 
                                last:border-0">
                  <span className="text-sm text-navy 
                                   font-medium truncate 
                                   max-w-[200px]">
                    {sub.email}
                  </span>
                  <span className="text-xs text-slate-400 
                                   flex-shrink-0 ml-2">
                    {new Date(sub.subscribed_at)
                      .toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                  </span>
                </div>
              ))}
              <Link
                href="/admin/subscribers"
                className="block text-center text-sm 
                           text-amber-600 hover:text-amber-700 
                           font-medium mt-3"
              >
                View all subscribers →
              </Link>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-xl border 
                        border-slate-200 p-6">
          <h2 className="font-bold text-navy mb-4 
                         flex items-center gap-2">
            ⚡ Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { 
                href: '/admin/articles/new', 
                label: '✍️ Write New Article',
                desc: 'Publish a new regulatory update',
                color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
              },
              { 
                href: '/admin/newsletter', 
                label: '📨 Send Newsletter',
                desc: `Send to ${overview.totalSubscribers} subscribers`,
                color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
              },
              { 
                href: '/admin/settings', 
                label: '⚙️ Site Settings',
                desc: 'Update social links, WhatsApp channel',
                color: 'bg-green-50 hover:bg-green-100 border-green-200'
              },
              { 
                href: '/api/feed.xml', 
                label: '📡 View RSS Feed',
                desc: 'Check RSS is working correctly',
                color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
                target: '_blank'
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                target={action.target}
                className={`flex items-center gap-3 p-3 
                           rounded-lg border transition-colors
                           ${action.color}`}
              >
                <div>
                  <div className="font-semibold text-navy 
                                  text-sm">
                    {action.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {action.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
