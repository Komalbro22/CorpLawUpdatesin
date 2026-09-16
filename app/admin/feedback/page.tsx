'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  MessageSquareHeart,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Trash2,
  ExternalLink,
  Mail,
  Check,
  RotateCcw,
  BookOpen,
  Calculator,
  FileText,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/Toast'

interface FeedbackItem {
  id: string
  context_type: 'article' | 'calculator' | 'document'
  context_title: string
  context_url: string
  sentiment: 'positive' | 'negative'
  tags: string[]
  comment: string | null
  user_email: string | null
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

interface Stats {
  total: number
  positive: number
  negative: number
  pending: number
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  article: BookOpen,
  calculator: Calculator,
  document: FileText,
}

export default function AdminFeedbackPage() {
  const { showToast } = useToast()

  const [items, setItems] = useState<FeedbackItem[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, positive: 0, negative: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sentimentFilter, setSentimentFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (sentimentFilter !== 'all') params.set('sentiment', sentimentFilter)

      const res = await fetch(`/api/admin/feedback?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch feedback')
      const data = await res.json()

      setItems(data.items || [])
      setTotalCount(data.total || 0)
      if (data.stats) setStats(data.stats)
    } catch (err: any) {
      console.error(err)
      showToast('Error loading feedback', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, statusFilter, sentimentFilter, showToast])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    setActionLoadingId(id)
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')

      setItems(prev => prev.map(item => (item.id === id ? { ...item, status: newStatus } : item)))
      showToast(`Status updated to ${newStatus}`, 'success')
      // Refresh stats quietly
      fetchFeedback()
    } catch (err: any) {
      showToast('Failed to update status', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback entry?')) return

    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/admin/feedback?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')

      setItems(prev => prev.filter(item => item.id !== id))
      showToast('Feedback deleted', 'success')
      fetchFeedback()
    } catch (err: any) {
      showToast('Failed to delete feedback', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleExportCsv = () => {
    window.open('/api/admin/feedback?export=csv', '_blank')
  }

  const positiveRate =
    stats.total > 0
      ? Math.round((stats.positive / (stats.positive + stats.negative || 1)) * 100)
      : 100

  // Filter items in client for search query
  const displayedItems = items.filter(item => {
    if (!debouncedSearch.trim()) return true
    const q = debouncedSearch.toLowerCase()
    return (
      item.context_title.toLowerCase().includes(q) ||
      (item.comment && item.comment.toLowerCase().includes(q)) ||
      (item.user_email && item.user_email.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
    )
  })

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="size-6 text-amber-600 dark:text-amber-400" />
            <h1 className="text-2xl font-bold text-navy dark:text-white font-heading">
              Reader Feedback & Accuracy Reports
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time reader reviews, clarity feedback, and reported regulatory inaccuracies across updates, calculators, and documents.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:shadow-sm transition-all"
        >
          <Download className="size-4 text-slate-500" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Submissions</span>
            <MessageSquareHeart className="size-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-navy dark:text-white mt-2 tabular-nums">
            {stats.total.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Across all public surfaces</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Clarity & Approval</span>
            <ThumbsUp className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
            {positiveRate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">{stats.positive} helpful & clear votes</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Issues Reported</span>
            <AlertCircle className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 tabular-nums">
            {stats.negative}
          </p>
          <p className="text-xs text-slate-400 mt-1">Requiring editorial check</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Pending Review</span>
            <Clock className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2 tabular-nums">
            {stats.pending}
          </p>
          <p className="text-xs text-slate-400 mt-1">Unprocessed submissions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, keywords, comment, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type */}
            <select
              aria-label="Filter by context type"
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="all">All Surfaces</option>
              <option value="article">Articles Only</option>
              <option value="calculator">Calculators Only</option>
              <option value="document">Documents Only</option>
            </select>

            {/* Sentiment */}
            <select
              aria-label="Filter by sentiment"
              value={sentimentFilter}
              onChange={e => {
                setSentimentFilter(e.target.value)
                setPage(1)
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Helpful Only (Positive)</option>
              <option value="negative">Issues Only (Negative)</option>
            </select>

            {/* Status */}
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Feed */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400 animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Loading reader feedback...
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <MessageSquareHeart className="size-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-navy dark:text-white">No feedback found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || sentimentFilter !== 'all'
              ? 'Try relaxing your filter criteria or search query.'
              : 'As readers use your articles, calculators, and document generators, their feedback will surface here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map(item => {
            const Icon = TYPE_ICONS[item.context_type] || BookOpen
            const isPos = item.sentiment === 'positive'

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Sentiment Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPos
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                      }`}
                    >
                      {isPos ? (
                        <ThumbsUp className="size-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="size-3 text-amber-600 dark:text-amber-400" />
                      )}
                      {isPos ? 'Helpful & Clear' : 'Issue Reported'}
                    </span>

                    {/* Surface Type */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Icon className="size-3 text-slate-500" />
                      {item.context_type.toUpperCase()}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        item.status === 'resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : item.status === 'reviewed'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* Target Content Link */}
                <div>
                  <a
                    href={item.context_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-bold text-navy dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>{item.context_title}</span>
                    <ExternalLink className="size-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  </a>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 break-all">
                    {item.context_url}
                  </p>
                </div>

                {/* Selected Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2.5 py-0.5 rounded-lg font-medium ${
                          isPos
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comment / Note */}
                {item.comment && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                      Reader Comment:
                    </p>
                    <p className="whitespace-pre-wrap">{item.comment}</p>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Optional Email */}
                  {item.user_email ? (
                    <a
                      href={`mailto:${item.user_email}?subject=Regarding your feedback on CorpLawUpdates`}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-colors font-medium"
                    >
                      <Mail className="size-3.5 text-slate-400" />
                      <span>{item.user_email}</span>
                      <span className="text-[10px] text-slate-400">(Click to reply)</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Anonymous feedback</span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {item.status !== 'reviewed' && (
                      <button
                        type="button"
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleStatusChange(item.id, 'reviewed')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <Check className="size-3" />
                        Mark Reviewed
                      </button>
                    )}

                    {item.status !== 'resolved' && (
                      <button
                        type="button"
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleStatusChange(item.id, 'resolved')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-3" />
                        Mark Resolved
                      </button>
                    )}

                    {item.status !== 'pending' && (
                      <button
                        type="button"
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleStatusChange(item.id, 'pending')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                        title="Revert to pending"
                      >
                        <RotateCcw className="size-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                      title="Delete feedback entry"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Simple Pagination */}
          {totalCount > 20 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Showing page {page} of {Math.ceil(totalCount / 20)} ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= Math.ceil(totalCount / 20)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
