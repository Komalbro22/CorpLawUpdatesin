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
    mca: 'bg-blue-100 text-blue-700',
    sebi: 'bg-green-100 text-green-700',
    rbi: 'bg-purple-100 text-purple-700',
    ibc: 'bg-red-100 text-red-700',
    fema: 'bg-teal-100 text-teal-700',
    nclt: 'bg-orange-100 text-orange-700',
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
    <div className="space-y-6 max-w-6xl content-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy flex items-center gap-2">
          <LineChart className="w-7 h-7 text-amber-600" aria-hidden />
          Article performance
        </h1>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-2xl">
          Sort and filter by database view counts. For session-level analytics, use Google Analytics.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total articles', value: articles.length, color: 'bg-blue-50 border-blue-200/90 text-blue-800' },
          { label: 'Published', value: publishedCount, color: 'bg-emerald-50 border-emerald-200/90 text-emerald-800' },
          { label: 'Total views (DB)', value: totalViews.toLocaleString('en-IN'), color: 'bg-violet-50 border-violet-200/90 text-violet-900' },
          { label: 'Peak article views', value: maxViews.toLocaleString('en-IN'), color: 'bg-amber-50 border-amber-200/90 text-amber-900' },
        ].map(stat => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 text-center shadow-card ring-1 ring-slate-900/[0.02] ${stat.color}`}
          >
            <div className="text-2xl font-heading font-bold tabular-nums">{stat.value}</div>
            <div className="text-xs font-semibold mt-1 opacity-90">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 p-4 md:p-5 space-y-3 shadow-card ring-1 ring-slate-900/[0.02]">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search titles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition-shadow"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
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
                    ? 'bg-navy text-white shadow-md shadow-navy/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  ? 'bg-navy text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-card ring-1 ring-slate-900/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/95 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-navy w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Article</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-24">Category</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-32">Views</th>
                <th className="text-left px-4 py-3 font-semibold text-navy w-32">Share</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-28">Published</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-24">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-16">Open</th>
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
                    categoryColors[article.category?.toLowerCase()] || 'bg-slate-100 text-slate-600'
                  return (
                    <tr
                      key={article.id}
                      className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                    >
                      <td className="px-4 py-3 text-slate-400 font-medium tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy text-sm leading-snug line-clamp-2 max-w-md">
                          {article.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${catColor}`}
                        >
                          {article.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg font-bold text-navy tabular-nums">
                          {(article.views || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gold h-2 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 text-xs tabular-nums">
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
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
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
                          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 text-xs font-semibold"
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
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 text-center leading-relaxed">
          Showing {filtered.length} of {articles.length} articles · DB view counts · Pair with Google Analytics
          for audience insights
        </div>
      </div>
    </div>
  )
}
