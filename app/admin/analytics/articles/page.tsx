'use client'

import { useEffect, useState } from 'react'


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
    if (sortBy === 'date') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-slate-400 animate-pulse">Loading article analytics...</div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-navy">📊 Article Performance</h1>
        <p className="text-slate-500 text-sm mt-1">All articles sorted by views. Note: counts from your database — Google Analytics will show higher numbers.</p>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Articles', value: articles.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Published', value: publishedCount, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Total Views (DB)', value: totalViews.toLocaleString(), color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'Top Article Views', value: maxViews.toLocaleString(), color: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border p-4 text-center ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 flex-1 min-w-[200px]"
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="All">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="flex gap-2">
            {(['views', 'date', 'category'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === s ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {s === 'views' ? '👁 Views' : s === 'date' ? '📅 Date' : '📂 Category'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {cat} {cat !== 'All' ? `(${articles.filter(a => a.category?.toLowerCase() === cat.toLowerCase()).length})` : `(${articles.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-navy w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Article</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-24">Category</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-32">Views</th>
                <th className="text-left px-4 py-3 font-semibold text-navy w-32">Bar</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-28">Published</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-24">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-navy w-16">Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No articles found</td></tr>
              ) : (
                filtered.map((article, i) => {
                  const barWidth = Math.max(4, Math.round(((article.views || 0) / maxViews) * 100))
                  const catColor = categoryColors[article.category?.toLowerCase()] || 'bg-slate-100 text-slate-600'
                  return (
                    <tr key={article.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy text-sm leading-snug line-clamp-2 max-w-md">
                          {article.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${catColor}`}>
                          {article.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg font-bold text-navy">{(article.views || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-amber-400 h-2 rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 text-xs">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                          : new Date(article.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {article.status === 'published' ? '✅ Live' : '📝 Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a href={`/updates/${article.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-800 text-xs font-medium">
                          View →
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
          Showing {filtered.length} of {articles.length} articles · Views counted from your database · For real-time analytics use Google Analytics
        </div>
      </div>
    </div>
  )
}
