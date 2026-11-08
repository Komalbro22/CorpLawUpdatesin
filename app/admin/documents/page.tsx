'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  FileText,
  Scale,
  ScrollText,
  BarChart3,
  Inbox,
  Sparkles,
  Activity,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Loader2,
  Download,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Clock,
  Upload,
  RefreshCw,
  Archive,
  Eye,
  Check,
  X,
  PlusCircle,
  HelpCircle,
  Layers,
  ArrowUpDown
} from 'lucide-react'
import { useToast } from '@/components/Toast'

// Tabs definition
type TabType =
  | 'sets'
  | 'documents'
  | 'legal-schedule'
  | 'templates'
  | 'analytics'
  | 'feedback'
  | 'review-queue'
  | 'diagnostics'

export default function AdminDocumentsDashboard() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('sets')
  const [loading, setLoading] = useState(true)

  // Tab 1: Sets State
  const [sets, setSets] = useState<any[]>([])
  const [editingSet, setEditingSet] = useState<any | null>(null)
  const [isSetModalOpen, setIsSetModalOpen] = useState(false)

  // Tab 2: Pack Documents State
  const [packDocs, setPackDocs] = useState<any[]>([])
  const [docSearch, setDocSearch] = useState('')
  const [uploadingDoc, setUploadingDoc] = useState<any | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadVersion, setUploadVersion] = useState('v1.1')
  const [isUploading, setIsUploading] = useState(false)

  // Tab 3: Legal Data Schedule State
  const [scheduleItems, setScheduleItems] = useState<any[]>([])
  const [scheduleSearch, setScheduleSearch] = useState('')
  const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState('all')
  const [editingScheduleItem, setEditingScheduleItem] = useState<any | null>(null)
  const [scheduleSourceRef, setScheduleSourceRef] = useState('')
  const [scheduleJsonValue, setScheduleJsonValue] = useState('')
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)

  // Tab 4: Generator Templates State (Existing 34 templates)
  const [templates, setTemplates] = useState<any[]>([])
  const [templateSearch, setTemplateSearch] = useState('')

  // Tab 5: Sets Usage & Generator Token Stats State
  const [usageData, setUsageData] = useState<any | null>(null)
  const [tokenStats, setTokenStats] = useState<any | null>(null)

  // Tab 6: Error Reports Inbox State
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [feedbackFilter, setFeedbackFilter] = useState('all')
  const [attachingChangelogTo, setAttachingChangelogTo] = useState<any | null>(null)
  const [changelogNote, setChangelogNote] = useState('')
  const [changelogRef, setChangelogRef] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.allSettled([
        fetchSets(),
        fetchLegalSchedule(),
        fetchTemplates(),
        fetchUsage(),
        fetchFeedback(),
      ])
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // API Fetchers
  const fetchSets = async () => {
    try {
      const res = await fetch('/api/admin/document-sets')
      const json = await res.json()
      if (json.sets) {
        setSets(json.sets)
        // Also fetch documents for the first set
        if (json.sets.length > 0) {
          const detailRes = await fetch(`/api/admin/document-sets/${json.sets[0].slug}`)
          const detailJson = await detailRes.json()
          if (detailJson.set?.documents) {
            setPackDocs(detailJson.set.documents)
          }
        }
      }
    } catch (e) {}
  }

  const fetchLegalSchedule = async () => {
    try {
      const res = await fetch('/api/admin/document-sets/legal-schedule')
      const json = await res.json()
      if (json.schedule) setScheduleItems(json.schedule)
    } catch (e) {}
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/documents')
      const json = await res.json()
      if (json.templates) setTemplates(json.templates)
    } catch (e) {}
  }

  const fetchUsage = async () => {
    try {
      const [uRes, tRes] = await Promise.allSettled([
        fetch('/api/admin/document-sets/usage'),
        fetch('/api/admin/documents/analytics'),
      ])
      if (uRes.status === 'fulfilled') {
        const uJson = await uRes.value.json()
        setUsageData(uJson)
      }
      if (tRes.status === 'fulfilled') {
        const tJson = await tRes.value.json()
        setTokenStats(tJson)
      }
    } catch (e) {}
  }

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/admin/document-sets/feedback')
      const json = await res.json()
      if (json.feedback) setFeedbackList(json.feedback)
    } catch (e) {}
  }

  // Handlers for Sets
  const handleTogglePublishSet = async (slug: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published'
      const res = await fetch(`/api/admin/document-sets/${slug}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToast(`Set marked as ${newStatus}`, 'success')
        fetchSets()
      } else {
        showToast('Failed to toggle status', 'error')
      }
    } catch (e) {
      showToast('Network error', 'error')
    }
  }

  const handleArchiveSet = async (slug: string) => {
    if (!confirm(`Are you sure you want to archive '${slug}'? It will be removed from listings and sitemap, but never deleted.`)) {
      return
    }
    try {
      const res = await fetch(`/api/admin/document-sets/${slug}/archive`, { method: 'POST' })
      if (res.ok) {
        showToast('Set archived successfully', 'success')
        fetchSets()
      } else {
        showToast('Failed to archive set', 'error')
      }
    } catch (e) {
      showToast('Network error', 'error')
    }
  }

  const handleClearReverificationFlag = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/document-sets/${slug}/clear-flag`, { method: 'POST' })
      if (res.ok) {
        showToast('Re-verification flag cleared', 'success')
        fetchSets()
      } else {
        showToast('Failed to clear flag', 'error')
      }
    } catch (e) {
      showToast('Network error', 'error')
    }
  }

  const handleSaveSet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSet) return

    try {
      const res = await fetch(`/api/admin/document-sets/${editingSet.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSet),
      })
      if (res.ok) {
        showToast('Set saved successfully', 'success')
        setIsSetModalOpen(false)
        fetchSets()
      } else {
        const err = await res.json()
        showToast(err.error || 'Failed to save set', 'error')
      }
    } catch (e) {
      showToast('Network error saving set', 'error')
    }
  }

  // Handlers for Legal Schedule
  const openEditSchedule = (item: any) => {
    setEditingScheduleItem(item)
    setScheduleSourceRef(item.source_reference || '')
    setScheduleJsonValue(JSON.stringify(item.data_value, null, 2))
  }

  const handleSaveSchedule = async () => {
    if (!editingScheduleItem) return

    if (!scheduleSourceRef.trim()) {
      showToast('Mandatory: Source / Instrument reference is required (§11.3 & §11.7)', 'error')
      return
    }

    let parsedJson
    try {
      parsedJson = JSON.parse(scheduleJsonValue)
    } catch (e) {
      showToast('Invalid JSON in value editor', 'error')
      return
    }

    try {
      setIsSavingSchedule(true)
      const res = await fetch(`/api/admin/document-sets/legal-schedule/${editingScheduleItem.id || editingScheduleItem.code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_value: parsedJson,
          source_reference: scheduleSourceRef.trim(),
        }),
      })

      if (res.ok) {
        showToast('Legal schedule value updated. Sets flagged for re-verification.', 'success')
        setEditingScheduleItem(null)
        fetchLegalSchedule()
        fetchSets() // Refresh sets to see the Needs re-verification flag
      } else {
        const err = await res.json()
        showToast(err.error || 'Failed to update schedule item', 'error')
      }
    } catch (e) {
      showToast('Network error saving schedule', 'error')
    } finally {
      setIsSavingSchedule(false)
    }
  }

  // Handlers for Template Upload (§11.2)
  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadingDoc || !selectedFile) {
      showToast('Select a .docx or .pdf file to upload', 'error')
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('spoke_slug', uploadingDoc.spoke_slug)
      formData.append('version', uploadVersion)

      const res = await fetch('/api/admin/document-sets/upload-template', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (res.ok) {
        showToast(json.message || 'Template uploaded successfully', 'success')
        setUploadingDoc(null)
        setSelectedFile(null)
        fetchSets()
      } else {
        showToast(json.error || 'Upload rejected', 'error')
      }
    } catch (e) {
      showToast('Network error uploading template', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  // Handlers for Error Reports / Feedback
  const handleUpdateFeedbackStatus = async (feedbackId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/document-sets/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        showToast(`Feedback marked as ${status}`, 'success')
        fetchFeedback()
      } else {
        showToast('Failed to update status', 'error')
      }
    } catch (e) {
      showToast('Network error', 'error')
    }
  }

  const handleFixFeedbackWithChangelog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attachingChangelogTo) return

    try {
      const res = await fetch(`/api/admin/document-sets/feedback/${attachingChangelogTo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'fixed',
          changelog_entry: {
            change_note: changelogNote,
            instrument_reference: changelogRef || 'Reader report remediation',
          },
        }),
      })

      if (res.ok) {
        showToast('Feedback marked Fixed and attached to set changelog!', 'success')
        setAttachingChangelogTo(null)
        setChangelogNote('')
        setChangelogRef('')
        fetchFeedback()
        fetchSets()
      } else {
        showToast('Failed to fix feedback', 'error')
      }
    } catch (e) {
      showToast('Network error', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner */}
      <div className="border-b border-border bg-card px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Admin Central
              </span>
              <span className="text-xs text-muted-foreground">CorpLawUpdates Document Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Secretarial Documents & Sets Manager
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/documents/director-appointment-set"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              View Live Hub
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-1 overflow-x-auto border-b border-border/60 scrollbar-none">
          {[
            { id: 'sets', label: 'Document Sets (§11.1)', icon: FolderKanban },
            { id: 'documents', label: 'Pack Documents (§11.2)', icon: FileText },
            { id: 'legal-schedule', label: 'Legal Data Schedule (§11.3)', icon: Scale },
            { id: 'templates', label: '34 Generator Templates', icon: ScrollText },
            { id: 'analytics', label: 'Analytics & Usage (§11.4)', icon: BarChart3 },
            { id: 'feedback', label: 'Error Reports Inbox (§11.5)', icon: Inbox },
            { id: 'review-queue', label: 'AI Review Queue (§11.6)', icon: Sparkles },
            { id: 'diagnostics', label: 'Diagnostics (§11.8)', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* ========================================================================= */}
        {/* TAB 1: DOCUMENT SETS (§11.1) */}
        {/* ========================================================================= */}
        {activeTab === 'sets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Configured Document Sets</h2>
                <p className="text-xs text-muted-foreground">
                  Event-based packs of secretarial documents with verified filing sequences and honesty gates.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/30 uppercase font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Set Title & Event</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3">Law As At</th>
                      <th className="px-4 py-3">Review Status</th>
                      <th className="px-4 py-3">Re-verification Flag</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sets.map(s => (
                      <tr key={s.id || s.slug} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="font-bold text-sm text-foreground">{s.title}</div>
                          <div className="text-[11px] text-muted-foreground">
                            Event: {s.event} • Slug: <code className="bg-muted px-1 rounded">{s.slug}</code>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              s.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : s.status === 'archived'
                                ? 'bg-slate-500/10 text-slate-500'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium">{s.version}</td>
                        <td className="px-4 py-3">{s.law_as_at}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              s.reviewer_status === 'signed_off'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {s.reviewer_status === 'signed_off'
                              ? `Signed off by ${s.reviewer_name || 'CS'}`
                              : 'Under professional review'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.needs_reverification ? (
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Needs Re-verification</span>
                              <button
                                onClick={() => handleClearReverificationFlag(s.slug)}
                                className="ml-2 text-[10px] underline hover:text-rose-700"
                                title="Click to clear flag after verifying pages against updated legal schedule"
                              >
                                [Clear]
                              </button>
                            </div>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingSet(s)
                              setIsSetModalOpen(true)
                            }}
                            className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTogglePublishSet(s.slug, s.status)}
                            className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-semibold"
                          >
                            {s.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          {s.status !== 'archived' && (
                            <button
                              onClick={() => handleArchiveSet(s.slug)}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-semibold"
                              title="Archive set per §11.1"
                            >
                              Archive
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PACK DOCUMENTS (§11.2) */}
        {/* ========================================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Pack Documents & Template Uploads</h2>
                <p className="text-xs text-muted-foreground">
                  Manage individual documents of the set, upload new template versions, and keep superseded versions.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search document name / section..."
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/30 uppercase font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Step</th>
                      <th className="px-4 py-3">Document Title</th>
                      <th className="px-4 py-3">Governing Section</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3">Spoke URL</th>
                      <th className="px-4 py-3 text-right">Upload & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {packDocs
                      .filter(d =>
                        !docSearch ||
                        d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
                        d.governing_section.toLowerCase().includes(docSearch.toLowerCase())
                      )
                      .map(d => (
                        <tr key={d.id || d.spoke_slug} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-bold text-muted-foreground">
                            Step {d.step_number}
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {d.title}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {d.governing_section}
                          </td>
                          <td className="px-4 py-3 font-mono font-medium">
                            {d.version}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/documents/${d.spoke_slug}`}
                              target="_blank"
                              className="text-blue-600 dark:text-blue-400 font-mono hover:underline inline-flex items-center gap-1"
                            >
                              /{d.spoke_slug}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setUploadingDoc(d)
                                setSelectedFile(null)
                                setUploadVersion('v1.1')
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
                            >
                              <Upload className="w-3 h-3" />
                              Replace File
                            </button>
                            <a
                              href={`/api/documents/sets/director-appointment/download?doc=${d.spoke_slug}&format=docx`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-semibold"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LEGAL DATA SCHEDULE (§11.3 SINGLE SOURCE OF TRUTH) */}
        {/* ========================================================================= */}
        {activeTab === 'legal-schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Statutory Data Schedule (Single Source of Truth)
                </h2>
                <p className="text-xs text-muted-foreground">
                  All fees, deadlines, and rules live here. Changing a value here automatically flags all affected document sets as &quot;Needs re-verification&quot;.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={scheduleCategoryFilter}
                  onChange={e => setScheduleCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                >
                  <option value="all">All Categories</option>
                  <option value="fee">Fees & Multipliers</option>
                  <option value="deadline">Deadlines</option>
                  <option value="notice_period">Notice Periods</option>
                  <option value="statutory_rule">Statutory Rules</option>
                </select>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search code/label..."
                    value={scheduleSearch}
                    onChange={e => setScheduleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/30 uppercase font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Code & Label</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Governing Section</th>
                      <th className="px-4 py-3">Source / Instrument Reference</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scheduleItems
                      .filter(i => {
                        const matchCat = scheduleCategoryFilter === 'all' || i.category === scheduleCategoryFilter
                        const matchSearch =
                          !scheduleSearch ||
                          i.code.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
                          i.label.toLowerCase().includes(scheduleSearch.toLowerCase())
                        return matchCat && matchSearch
                      })
                      .map(item => (
                        <tr key={item.id || item.code} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">
                            <div className="font-bold text-foreground">{item.label}</div>
                            <code className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                              {item.code}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-foreground max-w-xs truncate">
                            {JSON.stringify(item.data_value)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-[11px] max-w-xs truncate">
                            {item.governing_section}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-[11px] max-w-xs truncate font-mono">
                            {item.source_reference}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openEditSchedule(item)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 34 GENERATOR TEMPLATES (CONSOLIDATED FROM EXISTING MODULE) */}
        {/* ========================================================================= */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">34 Individual Generator Templates</h2>
                <p className="text-xs text-muted-foreground">
                  Interactive AI Studio drafting templates maintained in the system.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates
                .filter(t => !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase()))
                .map(t => (
                  <div key={t.id || t.slug} className="p-4 rounded-xl border border-border bg-card hover:border-slate-400 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase text-[10px]">
                          {t.category}
                        </span>
                        <span>Uses: {t.usage_count || 0}</span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground">{t.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <Link
                        href={`/documents/${t.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Open Generator
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-[10px] text-muted-foreground">Order: {t.display_order}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ANALYTICS & USAGE (§11.4 & REVIEW ITEM 6: SEPARATE PANELS) */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-10">
            {/* PANEL 1: Document Set Downloads & Funnel Usage */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Panel A: Document Set Downloads & Funnel (§11.4)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Privacy-preserving aggregate counters for sets, Word/PDF downloads, and checklist completions.
                  </p>
                </div>
                <a
                  href="/api/admin/document-sets/usage?format=csv"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Usage CSV
                </a>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">Today</span>
                  <span className="text-2xl font-bold text-foreground">
                    {usageData?.summary?.today || 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">Last 7 Days</span>
                  <span className="text-2xl font-bold text-foreground">
                    {usageData?.summary?.last7Days || 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">Last 30 Days</span>
                  <span className="text-2xl font-bold text-foreground">
                    {usageData?.summary?.last30Days || 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">All-Time Downloads</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {usageData?.summary?.allTime || 0}
                  </span>
                </div>
              </div>

              {/* Event Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Event Type Breakdown
                  </h3>
                  <div className="space-y-2 text-xs">
                    {Object.entries(usageData?.eventBreakdown || {}).map(([event, count]) => (
                      <div key={event} className="flex justify-between py-1 border-b border-border/50">
                        <span className="capitalize">{event.replace(/_/g, ' ')}</span>
                        <span className="font-bold">{count as number}</span>
                      </div>
                    ))}
                    {Object.keys(usageData?.eventBreakdown || {}).length === 0 && (
                      <span className="text-muted-foreground">No events recorded yet today.</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Top Downloaded Documents
                  </h3>
                  <div className="space-y-2 text-xs">
                    {(usageData?.topDocuments || []).map((doc: any) => (
                      <div key={doc.slug} className="flex justify-between py-1 border-b border-border/50">
                        <span className="font-mono">{doc.slug}</span>
                        <span className="font-bold">{doc.count}</span>
                      </div>
                    ))}
                    {(usageData?.topDocuments || []).length === 0 && (
                      <span className="text-muted-foreground">Downloads will appear here.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: Generator Token & AI Studio Analytics */}
            <div className="pt-8 border-t border-border">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Panel B: Document Generator Token Analytics & AI Studio Quotas
                </h2>
                <p className="text-xs text-muted-foreground">
                  Daily token consumption and quota stats from the 34 interactive document generator tools.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">Tokens Today</span>
                  <span className="text-2xl font-bold text-foreground">
                    {tokenStats?.overview?.dailyTokensConsumed || 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">Remaining Quota</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {tokenStats?.overview?.remainingTokens || 100000}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">AI Docs Generated Today</span>
                  <span className="text-2xl font-bold text-foreground">
                    {tokenStats?.overview?.aiDocsTodayCount || 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs text-muted-foreground block">Total Docs Lifetime</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {tokenStats?.overview?.docsTotalCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ERROR REPORTS INBOX (§11.5) */}
        {/* ========================================================================= */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Error Reports Inbox (§11.5)</h2>
                <p className="text-xs text-muted-foreground">
                  Reader reports submitted from the &quot;Report an error&quot; link on Document Sets and spokes.
                </p>
              </div>

              <select
                value={feedbackFilter}
                onChange={e => setFeedbackFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="fixed">Fixed</option>
                <option value="wont_fix">Won&apos;t Fix</option>
              </select>
            </div>

            <div className="space-y-3">
              {feedbackList
                .filter(f => feedbackFilter === 'all' || f.status === feedbackFilter)
                .map(f => (
                  <div key={f.id} className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{f.context_title}</span>
                        <span className="text-muted-foreground font-mono">({f.context_url})</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            f.status === 'fixed'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : f.status === 'wont_fix'
                              ? 'bg-slate-500/10 text-slate-500'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <p className="text-sm text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        {f.comment || 'No comment text provided.'}
                      </p>
                      <div className="text-[11px] text-muted-foreground">
                        Reported on: {f.created_at?.split('T')[0]} • User: {f.user_email || 'Anonymous'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {f.status !== 'fixed' && (
                        <button
                          onClick={() => setAttachingChangelogTo(f)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                        >
                          Mark Fixed &amp; Attach Changelog
                        </button>
                      )}
                      {f.status !== 'wont_fix' && (
                        <button
                          onClick={() => handleUpdateFeedbackStatus(f.id, 'wont_fix')}
                          className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold"
                        >
                          Won&apos;t Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              {feedbackList.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  No error reports received yet. Reports filed via &quot;Report an error&quot; on set pages will appear here.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: AI REVIEW QUEUE (§11.6 PHASE 2 PLACEHOLDER) */}
        {/* ========================================================================= */}
        {activeTab === 'review-queue' && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card max-w-2xl mx-auto space-y-4">
            <Sparkles className="w-10 h-10 text-blue-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">AI Clause Review Queue (Phase 2)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In Phase 2, when the Gemini API Clause Customizer drafts variations outside the verified template library, drafts land here for editorial CS review before being downloadable by the public.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              Queue is empty — 0 pending AI drafts
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: DIAGNOSTICS (§11.8) */}
        {/* ========================================================================= */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">System Diagnostics &amp; Health Checks (§11.8)</h2>
              <p className="text-xs text-muted-foreground">
                Automated health checks ensuring high accuracy, valid footers, and active statutory verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Footer Stamp Integrity
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every Word and PDF rendition generated by the pack compiler includes the statutory footer:
                  <code className="block mt-1.5 p-2 bg-muted rounded font-mono text-[10px] text-foreground">
                    CorpLawUpdates.in | Director Appointment Document Set v1.0 | Law as at 7 November 2026 | Draft template for reference — get it reviewed by your company secretary before use or filing.
                  </code>
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verification Freshness (&lt; 90 Days)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All active sets are checked against their last-verified date.
                  {sets.every(s => !s.needs_reverification) ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                      All sets are currently within the 90-day verification window.
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium block mt-1">
                      Warning: One or more sets require re-verification due to legal schedule updates.
                    </span>
                  )}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Download Endpoints Status
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Route <code>/api/documents/sets/director-appointment/download</code> is operational and serving .docx, .pdf, and .zip archives.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Honesty Gate Compliance
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reviewer name is withheld and &quot;Under professional review&quot; is displayed until formal sign-off is toggled by an administrator.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Set Modal */}
      {isSetModalOpen && editingSet && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Edit Document Set: {editingSet.title}</h3>
              <button onClick={() => setIsSetModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSet} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Set Title</label>
                <input
                  type="text"
                  value={editingSet.title}
                  onChange={e => setEditingSet({ ...editingSet, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Quick Answer (40–60 words)</label>
                <textarea
                  rows={3}
                  value={editingSet.quick_answer}
                  onChange={e => setEditingSet({ ...editingSet, quick_answer: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingSet.description}
                  onChange={e => setEditingSet({ ...editingSet, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Reviewer Name (e.g. CS Santosh Sharma)</label>
                  <input
                    type="text"
                    value={editingSet.reviewer_name || ''}
                    placeholder="Leave empty until formal sign-off"
                    onChange={e => setEditingSet({ ...editingSet, reviewer_name: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Reviewer Sign-off Status</label>
                  <select
                    value={editingSet.reviewer_status || 'under_review'}
                    onChange={e => setEditingSet({ ...editingSet, reviewer_status: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-background"
                  >
                    <option value="under_review">Under Professional Review</option>
                    <option value="signed_off">Signed Off</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSetModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Legal Schedule Item Modal */}
      {editingScheduleItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Edit Schedule Item: {editingScheduleItem.label}
              </h3>
              <button onClick={() => setEditingScheduleItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Code</label>
                <code className="block p-2 bg-muted rounded font-mono text-xs">{editingScheduleItem.code}</code>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Source / Instrument Reference <span className="text-rose-500 font-bold">* MANDATORY (§11.3)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MCA Notification G.S.R. 268(E) dated 31-03-2014"
                  value={scheduleSourceRef}
                  onChange={e => setScheduleSourceRef(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-background font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Value (JSON Object)</label>
                <textarea
                  rows={6}
                  value={scheduleJsonValue}
                  onChange={e => setScheduleJsonValue(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-300 text-[11px]">
                <strong>Warning:</strong> Saving this change will automatically flag all active document sets as &quot;Needs re-verification&quot; until checked and cleared by an admin.
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingScheduleItem(null)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {isSavingSchedule && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Schedule Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Template Modal */}
      {uploadingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-foreground">
                Replace Template for: {uploadingDoc.title}
              </h3>
              <button onClick={() => setUploadingDoc(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadTemplate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">New Version Stamp</label>
                <input
                  type="text"
                  value={uploadVersion}
                  onChange={e => setUploadVersion(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background font-mono"
                  placeholder="e.g. v1.1"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Select File (.docx or .pdf only, max 10MB)
                </label>
                <input
                  type="file"
                  accept=".docx,.pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The current version ({uploadingDoc.version}) will be retained as SUPERSEDED for administrative reference (§11.2).
              </p>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadingDoc(null)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Upload &amp; Bump Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Changelog Modal for Error Reports */}
      {attachingChangelogTo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-foreground">
                Mark Fixed &amp; Attach to Set Changelog
              </h3>
              <button onClick={() => setAttachingChangelogTo(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFixFeedbackWithChangelog} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Changelog Note</label>
                <textarea
                  rows={3}
                  placeholder="Describe what was corrected in the template/page..."
                  value={changelogNote}
                  onChange={e => setChangelogNote(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Gazette / Circular / Authority Reference</label>
                <input
                  type="text"
                  placeholder="e.g. MCA Circular No. 05/2026 or Rule 18 clarification"
                  value={changelogRef}
                  onChange={e => setChangelogRef(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAttachingChangelogTo(null)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Confirm Fix &amp; Publish Changelog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
