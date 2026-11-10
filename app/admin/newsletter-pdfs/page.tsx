'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  Upload,
  Download,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  Calendar,
  AlertCircle,
  FileDown,
  X,
  Loader2,
  HardDrive,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { formatDate } from '@/lib/utils'

interface NewsletterPdf {
  id: string
  slug: string
  week_label: string
  week_start: string
  week_end: string
  file_path: string
  file_size_bytes: number
  uploaded_by: string
  download_count: number
  created_at: string
  updated_at: string
  public_url?: string
  direct_storage_url?: string
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB'
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function AdminNewsletterPdfsPage() {
  const { showToast } = useToast()

  const [newsletters, setNewsletters] = useState<NewsletterPdf[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadWeekLabel, setUploadWeekLabel] = useState('')
  const [uploadWeekStart, setUploadWeekStart] = useState('')
  const [uploadWeekEnd, setUploadWeekEnd] = useState('')
  const [uploadSlug, setUploadSlug] = useState('')
  const [submittingUpload, setSubmittingUpload] = useState(false)

  // Replace modal state
  const [replaceTarget, setReplaceTarget] = useState<NewsletterPdf | null>(null)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [submittingReplace, setSubmittingReplace] = useState(false)

  // Edit details modal state
  const [editTarget, setEditTarget] = useState<NewsletterPdf | null>(null)
  const [editWeekLabel, setEditWeekLabel] = useState('')
  const [editWeekStart, setEditWeekStart] = useState('')
  const [editWeekEnd, setEditWeekEnd] = useState('')
  const [submittingEdit, setSubmittingEdit] = useState(false)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<NewsletterPdf | null>(null)
  const [submittingDelete, setSubmittingDelete] = useState(false)

  const fetchNewsletters = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/newsletter-pdfs')
      const json = await res.json()
      if (res.ok && json.success) {
        setNewsletters(json.newsletters || [])
      } else {
        showToast(json.error?.message || 'Failed to load newsletter PDFs', 'error')
      }
    } catch {
      showToast('Network error while loading newsletter PDFs', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchNewsletters()
  }, [fetchNewsletters])

  // Filtered newsletters
  const filtered = useMemo(() => {
    if (!search.trim()) return newsletters
    const q = search.toLowerCase()
    return newsletters.filter(
      n =>
        n.week_label.toLowerCase().includes(q) ||
        n.slug.toLowerCase().includes(q) ||
        n.week_start.includes(q) ||
        n.week_end.includes(q)
    )
  }, [newsletters, search])

  // Summary Metrics
  const stats = useMemo(() => {
    const totalCount = newsletters.length
    const totalDownloads = newsletters.reduce((acc, curr) => acc + (curr.download_count || 0), 0)
    const totalBytes = newsletters.reduce((acc, curr) => acc + (curr.file_size_bytes || 0), 0)
    const latestEdition = newsletters[0] || null
    return {
      totalCount,
      totalDownloads,
      totalBytes,
      latestWeek: latestEdition?.week_label || 'None published',
    }
  }, [newsletters])

  // Handle Copy Branded Link
  const handleCopyLink = async (item: NewsletterPdf) => {
    const link = item.public_url || `${window.location.origin}/newsletters/${item.slug}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(item.id)
      showToast('Branded URL copied to clipboard!', 'success')
      setTimeout(() => setCopiedId(null), 2500)
    } catch {
      showToast('Failed to copy link', 'error')
    }
  }

  // Handle Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      showToast('Please select a PDF file to upload', 'error')
      return
    }
    if (!uploadWeekLabel.trim()) {
      showToast('Please provide a Week Label (e.g. 2 – 8 November 2026)', 'error')
      return
    }
    if (!uploadWeekStart || !uploadWeekEnd) {
      showToast('Please specify both Week Start and Week End dates', 'error')
      return
    }

    setSubmittingUpload(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      fd.append('week_label', uploadWeekLabel.trim())
      fd.append('week_start', uploadWeekStart)
      fd.append('week_end', uploadWeekEnd)
      if (uploadSlug.trim()) {
        fd.append('slug', uploadSlug.trim())
      }

      const res = await fetch('/api/admin/newsletter-pdfs', {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()

      if (res.ok && json.success) {
        showToast('Weekly briefing PDF uploaded successfully!', 'success')
        setShowUploadModal(false)
        setUploadFile(null)
        setUploadWeekLabel('')
        setUploadWeekStart('')
        setUploadWeekEnd('')
        setUploadSlug('')
        fetchNewsletters()
      } else {
        showToast(json.error?.message || 'Upload failed', 'error')
      }
    } catch {
      showToast('Network error during upload', 'error')
    } finally {
      setSubmittingUpload(false)
    }
  }

  // Handle Replace Submit
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replaceTarget || !replaceFile) {
      showToast('Please select a replacement PDF file', 'error')
      return
    }

    setSubmittingReplace(true)
    try {
      const fd = new FormData()
      fd.append('file', replaceFile)

      const res = await fetch(`/api/admin/newsletter-pdfs/${replaceTarget.id}`, {
        method: 'PATCH',
        body: fd,
      })
      const json = await res.json()

      if (res.ok && json.success) {
        showToast('PDF file replaced. Public link retained with updated cache.', 'success')
        setReplaceTarget(null)
        setReplaceFile(null)
        fetchNewsletters()
      } else {
        showToast(json.error?.message || 'Replacement failed', 'error')
      }
    } catch {
      showToast('Network error during file replace', 'error')
    } finally {
      setSubmittingReplace(false)
    }
  }

  // Handle Edit Details Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return

    setSubmittingEdit(true)
    try {
      const payload: Record<string, string> = {}
      if (editWeekLabel.trim()) payload.week_label = editWeekLabel.trim()
      if (editWeekStart) payload.week_start = editWeekStart
      if (editWeekEnd) payload.week_end = editWeekEnd

      const res = await fetch(`/api/admin/newsletter-pdfs/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (res.ok && json.success) {
        showToast('Edition details updated successfully!', 'success')
        setEditTarget(null)
        fetchNewsletters()
      } else {
        showToast(json.error?.message || 'Update failed', 'error')
      }
    } catch {
      showToast('Network error while saving details', 'error')
    } finally {
      setSubmittingEdit(false)
    }
  }

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return

    setSubmittingDelete(true)
    try {
      const res = await fetch(`/api/admin/newsletter-pdfs/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()

      if (res.ok && json.success) {
        showToast('Newsletter PDF deleted successfully.', 'success')
        setDeleteTarget(null)
        fetchNewsletters()
      } else {
        showToast(json.error?.message || 'Delete failed', 'error')
      }
    } catch {
      showToast('Network error while deleting entry', 'error')
    } finally {
      setSubmittingDelete(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto content-fade-in text-slate-900 dark:text-slate-100">
      {/* ─── Top Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileDown className="size-6 text-amber-500" aria-hidden="true" />
            Weekly Newsletter PDFs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Host weekly corporate law PDF digests natively on corplawupdates.in. Instant preview, branded links, and automated agent uploads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/newsletters"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            View Public Archive
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Upload className="size-4" aria-hidden="true" />
            Upload New Briefing
          </button>
        </div>
      </div>

      {/* ─── Summary Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Hosted Briefings</span>
            <FileText className="size-4 text-blue-500" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
            {stats.totalCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active weekly editions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total PDF Downloads</span>
            <Download className="size-4 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
            {stats.totalDownloads.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct clicks &amp; downloads</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Storage Consumed</span>
            <HardDrive className="size-4 text-purple-500" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
            {formatBytes(stats.totalBytes)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across Supabase storage</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Latest Edition</span>
            <Calendar className="size-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {stats.latestWeek}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Most recent weekly release</p>
        </div>
      </div>

      {/* ─── Search & Table Card ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by week, date, or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            onClick={fetchNewsletters}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3">Week Edition</th>
                <th className="px-4 py-3">Dates Covered</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-center">Downloads</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="size-6 animate-spin mx-auto text-amber-500 mb-2" aria-hidden="true" />
                    <span>Loading newsletter PDFs...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    {search ? 'No editions match your search query.' : 'No weekly newsletter PDFs uploaded yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const isCopied = copiedId === item.id
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {item.week_label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          /newsletters/{item.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <span>{formatDate(item.week_start)} – {formatDate(item.week_end)}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {formatBytes(item.file_size_bytes)}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {(item.download_count || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        <div>{formatDate(item.created_at)}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.uploaded_by}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Copy Branded Link */}
                          <button
                            onClick={() => handleCopyLink(item)}
                            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Copy branded public link"
                          >
                            {isCopied ? (
                              <Check className="size-4 text-emerald-500" aria-hidden="true" />
                            ) : (
                              <Copy className="size-4" aria-hidden="true" />
                            )}
                          </button>

                          {/* Preview PDF */}
                          <a
                            href={`/newsletters/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            title="Open in browser viewer"
                          >
                            <ExternalLink className="size-4" aria-hidden="true" />
                          </a>

                          {/* Replace File */}
                          <button
                            onClick={() => setReplaceTarget(item)}
                            className="p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                            title="Replace PDF file (keeps URL)"
                          >
                            <RefreshCw className="size-4" aria-hidden="true" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditTarget(item)
                              setEditWeekLabel(item.week_label)
                              setEditWeekStart(item.week_start)
                              setEditWeekEnd(item.week_end)
                            }}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            title="Delete edition"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL: Upload New PDF ─── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="size-4 text-amber-500" aria-hidden="true" />
                Upload Weekly Briefing PDF
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select PDF File (Max 10 MB) *
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={e => {
                    const f = e.target.files?.[0] || null
                    setUploadFile(f)
                    if (f && !uploadSlug) {
                      setUploadSlug(f.name.replace(/\.pdf$/i, '').toLowerCase())
                    }
                  }}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-navy hover:file:bg-amber-400 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-800"
                />
                {uploadFile && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Selected: {uploadFile.name} ({formatBytes(uploadFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Week Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder='e.g. "2 – 8 November 2026"'
                  value={uploadWeekLabel}
                  onChange={e => setUploadWeekLabel(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Week Start *
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadWeekStart}
                    onChange={e => setUploadWeekStart(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Week End *
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadWeekEnd}
                    onChange={e => setUploadWeekEnd(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Slug (Optional)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono text-[11px]">/newsletters/</span>
                  <input
                    type="text"
                    placeholder="weekly-briefing-2026-11-09"
                    value={uploadSlug}
                    onChange={e => setUploadSlug(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUpload}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  {submittingUpload ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload & Publish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Replace File ─── */}
      {replaceTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="size-4 text-amber-500" aria-hidden="true" />
                Replace PDF File
              </h2>
              <button
                onClick={() => setReplaceTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Target Edition: {replaceTarget.week_label}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  URL: /newsletters/{replaceTarget.slug}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Uploading a replacement will overwrite the existing asset in Supabase storage while keeping the exact same public URL. Readers will receive the latest version immediately with timestamp cache-busting.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Choose New PDF File (Max 10 MB) *
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={e => setReplaceFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-navy hover:file:bg-amber-400 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReplaceTarget(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReplace || !replaceFile}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  {submittingReplace ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Replacing...
                    </>
                  ) : (
                    'Replace File'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Edit Details ─── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                Edit Edition Details
              </h2>
              <button
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Week Label
                </label>
                <input
                  type="text"
                  required
                  value={editWeekLabel}
                  onChange={e => setEditWeekLabel(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Week Start
                  </label>
                  <input
                    type="date"
                    required
                    value={editWeekStart}
                    onChange={e => setEditWeekStart(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Week End
                  </label>
                  <input
                    type="date"
                    required
                    value={editWeekEnd}
                    onChange={e => setEditWeekEnd(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  {submittingEdit ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Delete Confirmation ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="size-6 shrink-0" aria-hidden="true" />
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                Delete Newsletter PDF?
              </h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Are you sure you want to permanently delete the PDF for <strong>{deleteTarget.week_label}</strong>? This will remove the file from Supabase storage and delete its entry. Any links pointing to this slug will 404.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submittingDelete}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {submittingDelete ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
