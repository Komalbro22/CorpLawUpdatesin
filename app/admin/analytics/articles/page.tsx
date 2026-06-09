'use client'

import { useEffect, useState } from 'react'
import {
  Calendar,
  ExternalLink,
  Eye,
  FolderOpen,
  LineChart,
  Loader2,
  Search,
} from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  category: string
  views: number
  status: string
  created_at: string
  published_at: string
}

const CATEGORIES = ['All', 'MCA', 'SEBI', 'RBI', 'IBC', 'FEMA', 'NCLT']

export default function ArticleAnalyticsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filtered, setFiltered] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'views' | 'date' | 'category'>('views')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/analytics/articles')
      .then(r => r.json())
      .then(d => {
        setArticles(d.articles || [])
        setFiltered(d.articles || [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = [...articles]

    if (categoryFilter !== 'All') {
      result = result.filter(a => a.category?.toLowerCase() === categoryFilter.toLowerCase())
    }
    if (statusFilter !== 'All') {
      result = result.filter(a => a.status === statusFilter.toLowerCase())
    }
    if (search) {
      result = result.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()))
    }

    if (sortBy === 'views') result.sort((a, b) => (b.views || 0) - (a.views || 0))
    if (sortBy === 'date')
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sortBy === 'category') result.sort((a, b) => (a.category || '').localeCompare(b.category || ''))

    setFiltered(result)
  }, [articles, sortBy, categoryFilter, statusFilter, search])

  const maxViews = Math.max(...articles.map(a => a.views || 0), 1)
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0)
  const publishedCount = articles.filter(a => a.status === 'published').length

  const categoryColors: Record<string, string> = {
    mca: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    sebi: 'bg-green-500/10 text-green-400 border border-green-500/20',
    rbi: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    ibc: 'bg-red-500/10 text-red-400 border border-red-500/20',
    fema: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    nclt: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-gold" aria-hidden />
        <p className="text-sm font-medium">Loading article analytics…</p>
      </div>
    )
  }

  const sortButtons: { key: 'views' | 'date' | 'category'; label: string; Icon: typeof Eye }[] = [
    { key: 'views', label: 'Views', Icon: Eye },
    { key: 'date', label: 'Date', Icon: Calendar },
    { key: 'category', label: 'Category', Icon: FolderOpen },
  ]

  return (
    <div className="space-y-6 max-w-6xl content-fade-in text-slate-100">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
          <LineChart className="w-7 h-7 text-amber-500" aria-hidden />
          Article performance
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-2xl">
          Sort and filter by database view counts. For session-level analytics, use Google Analytics.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total articles', value: articles.length, color: 'admin-stat-blue' },
          { label: 'Published', value: publishedCount, color: 'admin-stat-emerald' },
          { label: 'Total views (DB)', value: totalViews.toLocaleString('en-IN'), color: 'admin-stat-violet' },
          { label: 'Peak article views', value: maxViews.toLocaleString('en-IN'), color: 'admin-stat-amber' },
        ].map(stat => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 text-center shadow-card ring-1 ring-slate-900/[0.02] ${stat.color}`}
          >
            <div className="text-2xl font-heading font-bold text-white tabular-nums">{stat.value}</div>
            <div className="text-xs font-semibold mt-1 text-slate-300 opacity-90">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search titles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/20 transition-shadow"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            <option value="All">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="flex flex-wrap gap-2">
            {sortButtons.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortBy(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                  sortBy === key
                    ? 'bg-gold text-slate-950 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 opacity-90" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                categoryFilter === cat
                  ? 'bg-gold text-slate-950'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}{' '}
              {cat !== 'All'
                ? `(${articles.filter(a => a.category?.toLowerCase() === cat.toLowerCase()).length})`
                : `(${articles.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-300 font-semibold">
                <th className="text-left px-4 py-3 w-8">#</th>
                <th className="text-left px-4 py-3">Article</th>
                <th className="text-center px-4 py-3 w-24">Category</th>
                <th className="text-center px-4 py-3 w-32">Views</th>
                <th className="text-left px-4 py-3 w-32">Share</th>
                <th className="text-center px-4 py-3 w-28">Published</th>
                <th className="text-center px-4 py-3 w-24">Status</th>
                <th className="text-center px-4 py-3 w-16">Open</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500 font-medium">
                    No articles match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((article, i) => {
                  const barWidth = Math.max(4, Math.round(((article.views || 0) / maxViews) * 100))
                  const catColor =
                    categoryColors[article.category?.toLowerCase()] || 'bg-slate-950 border border-slate-800 text-slate-400'
                  return (
                    <tr
                      key={article.id}
                      className={`transition-colors border-b border-slate-800/40 ${
                        i % 2 === 0 ? 'bg-slate-900/10 hover:bg-slate-800/30' : 'bg-slate-900/30 hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-500 font-medium tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-200 text-sm leading-snug line-clamp-2 max-w-md">
                          {article.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-bold uppercase border ${catColor}`}
                        >
                          {article.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg font-bold text-white tabular-nums">
                          {(article.views || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gold h-2 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-xs tabular-nums">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit',
                            })
                          : new Date(article.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit',
                            })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-semibold ${
                            article.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {article.status === 'published' ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={`/updates/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800/80 text-xs text-slate-400 text-center leading-relaxed">
          Showing {filtered.length} of {articles.length} articles · DB view counts · Pair with Google Analytics
          for audience insights
        </div>
      </div>
    </div>
  )
}
