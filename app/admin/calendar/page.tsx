'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  Upload,
  Settings2,
  History,
  RotateCcw,
  AlertTriangle,
  FolderPlus,
  Layers,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  X,
  FileText
} from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Category {
  id: string
  name: string
  slug: string
  colour: string
  icon: string
  sort_order: number
  is_active: boolean
  entry_count?: number
}

interface CalendarEntry {
  id: string
  category_id?: string | null
  category_slug?: string | null
  regulator: string
  form_name: string
  compliance_title: string
  title?: string
  due_date: string
  applicable_to: string
  applies_to?: string
  description?: string | null
  statutory_ref?: string | null
  regulation_reference?: string | null
  penalty_text?: string | null
  penalty?: string | null
  recurrence: string
  frequency?: string
  source_url?: string | null
  official_source_url?: string | null
  official_link?: string | null
  last_verified_at?: string | null
  original_date?: string | null
  is_extended?: boolean
  extension_ref?: string | null
  extension_note?: string | null
  is_active: boolean
  is_live?: boolean
  ever_live?: boolean
  is_deleted?: boolean
  deleted_at?: string | null
  deletion_reason?: string | null
  created_by?: string | null
  updated_at?: string
  // Verification flags
  is_unverified_90_days?: boolean
  is_due_in_7_days?: boolean
  has_no_source?: boolean
}

interface AuditHistoryItem {
  id: string
  key_name: string
  action: string
  timestamp: string
  status: string
  details?: {
    diff?: Record<string, { old: any; new: any }>
    reason?: string
    entry?: any
    [key: string]: any
  }
}

const CATEGORY_COLOUR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
}

export default function AdminComplianceCalendarPage() {
  const { showToast } = useToast()

  // Data state
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [flags, setFlags] = useState<{ total_count?: number; unverified_90_days?: number; missing_source?: number; due_in_7_days?: number }>({})

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'active' | 'draft' | 'deleted' | 'all'>('active')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'due_7' | 'unverified' | 'no_source'>('all')

  // Entry Form Modal (Create / Edit)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [entryForm, setEntryForm] = useState({
    form_name: '',
    title: '',
    category_slug: 'mca',
    due_date: '',
    applicable_to: '',
    description: '',
    statutory_ref: '',
    penalty_text: '',
    recurrence: 'monthly',
    source_url: '',
    is_extended: false,
    original_date: '',
    extension_ref: '',
    extension_note: '',
    is_live: true,
  })
  const [savingEntry, setSavingEntry] = useState(false)

  // Categories Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    colour: 'blue',
    icon: 'Building2',
    sort_order: 10,
    is_active: true,
  })
  const [savingCategory, setSavingCategory] = useState(false)

  // History Drawer/Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyEntry, setHistoryEntry] = useState<CalendarEntry | null>(null)
  const [historyItems, setHistoryItems] = useState<AuditHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Delete Dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState<CalendarEntry | null>(null)
  const [deletionReason, setDeletionReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Bulk Import Modal
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importDryRunResult, setImportDryRunResult] = useState<any>(null)
  const [importing, setImporting] = useState(false)

  // Load Categories
  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/calendar/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  // Load Entries
  async function fetchEntries() {
    setLoading(true)
    try {
      let url = `/api/admin/calendar/entries?status=${statusFilter}&limit=300`
      if (selectedCategory && selectedCategory !== 'all') {
        url += `&category=${encodeURIComponent(selectedCategory)}`
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`
      }
      if (verificationFilter === 'due_7') {
        url += `&due_in_days=7`
      } else if (verificationFilter === 'unverified') {
        url += `&verification=unverified`
      } else if (verificationFilter === 'no_source') {
        url += `&verification=missing_source`
      }

      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setEntries(data.entries || [])
        setFlags(data.flags || {})
      } else {
        showToast(data.error || 'Failed to load entries', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading entries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [selectedCategory, statusFilter, verificationFilter, search])

  // Duplicate Check Debounced in Entry Form
  useEffect(() => {
    if (!showEntryModal || !entryForm.form_name || !entryForm.due_date) {
      setDuplicateWarning(null)
      return
    }

    const timer = setTimeout(async () => {
      const trimmedForm = entryForm.form_name.trim().toLowerCase()
      const trimmedDate = entryForm.due_date.trim()
      const dup = entries.find(
        e =>
          e.id !== editingEntry?.id &&
          e.form_name?.trim().toLowerCase() === trimmedForm &&
          e.due_date?.trim().toLowerCase() === trimmedDate.toLowerCase()
      )
      if (dup) {
        setDuplicateWarning(`Warning: An entry for form "${dup.form_name}" with due date "${dup.due_date}" already exists (${dup.compliance_title}).`)
      } else {
        setDuplicateWarning(null)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [entryForm.form_name, entryForm.due_date, showEntryModal, editingEntry, entries])

  // Open Create Entry Modal
  function handleOpenCreateEntry() {
    setEditingEntry(null)
    setDuplicateWarning(null)
    setEntryForm({
      form_name: '',
      title: '',
      category_slug: categories[0]?.slug || 'mca',
      due_date: '',
      applicable_to: '',
      description: '',
      statutory_ref: '',
      penalty_text: '',
      recurrence: 'monthly',
      source_url: '',
      is_extended: false,
      original_date: '',
      extension_ref: '',
      extension_note: '',
      is_live: true,
    })
    setShowEntryModal(true)
  }

  // Open Edit Entry Modal
  function handleOpenEditEntry(entry: CalendarEntry) {
    setEditingEntry(entry)
    setDuplicateWarning(null)
    setEntryForm({
      form_name: entry.form_name || '',
      title: entry.compliance_title || entry.title || '',
      category_slug: entry.category_slug || entry.regulator || 'mca',
      due_date: entry.due_date || '',
      applicable_to: entry.applicable_to || entry.applies_to || '',
      description: entry.description || '',
      statutory_ref: entry.statutory_ref || entry.regulation_reference || '',
      penalty_text: entry.penalty_text || entry.penalty || '',
      recurrence: entry.recurrence || entry.frequency || 'monthly',
      source_url: entry.source_url || entry.official_source_url || entry.official_link || '',
      is_extended: Boolean(entry.is_extended),
      original_date: entry.original_date || '',
      extension_ref: entry.extension_ref || '',
      extension_note: entry.extension_note || '',
      is_live: entry.is_live ?? entry.is_active ?? true,
    })
    setShowEntryModal(true)
  }

  // Save Entry (Create / Update)
  async function handleSaveEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!entryForm.form_name.trim() || !entryForm.title.trim() || !entryForm.due_date.trim() || !entryForm.applicable_to.trim()) {
      showToast('Form name, title, due date, and applicable to are required.', 'error')
      return
    }

    setSavingEntry(true)
    try {
      const url = editingEntry ? `/api/admin/calendar/entries/${editingEntry.id}` : '/api/admin/calendar/entries'
      const method = editingEntry ? 'PATCH' : 'POST'

      const payload: any = {
        form_name: entryForm.form_name.trim(),
        title: entryForm.title.trim(),
        due_date: entryForm.due_date.trim(),
        applicable_to: entryForm.applicable_to.trim(),
        regulator: entryForm.category_slug,
        category_slug: entryForm.category_slug,
        description: entryForm.description.trim() || null,
        statutory_ref: entryForm.statutory_ref.trim() || null,
        penalty_text: entryForm.penalty_text.trim() || null,
        recurrence: entryForm.recurrence,
        source_url: entryForm.source_url.trim() || null,
        is_extended: entryForm.is_extended,
        original_date: entryForm.original_date.trim() || null,
        extension_ref: entryForm.extension_ref.trim() || null,
        extension_note: entryForm.extension_note.trim() || null,
        is_live: entryForm.is_live,
        force: true, // User confirmed via modal
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok) {
        showToast(editingEntry ? 'Deadline updated successfully' : 'Deadline created successfully', 'success')
        setShowEntryModal(false)
        fetchEntries()
        fetchCategories()
      } else {
        showToast(data.error?.message || data.error || data.message || 'Failed to save deadline', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving deadline', 'error')
    } finally {
      setSavingEntry(false)
    }
  }

  // Open History Drawer
  async function handleViewHistory(entry: CalendarEntry) {
    setHistoryEntry(entry)
    setShowHistoryModal(true)
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/admin/calendar/entries/${entry.id}/history`)
      const data = await res.json()
      if (data.success) {
        setHistoryItems(data.history || [])
      } else {
        setHistoryItems([])
      }
    } catch {
      setHistoryItems([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Confirm Delete Entry
  function handleOpenDelete(entry: CalendarEntry) {
    setDeletingEntry(entry)
    setDeletionReason('')
    setShowDeleteDialog(true)
  }

  async function handleConfirmDelete() {
    if (!deletingEntry) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/calendar/entries/${deletingEntry.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deletionReason.trim() || 'Deleted from Admin Panel' }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(data.message || 'Entry deleted', 'success')
        setShowDeleteDialog(false)
        fetchEntries()
        fetchCategories()
      } else {
        showToast(data.error || 'Failed to delete entry', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting entry', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // Restore Soft-Deleted Entry
  async function handleRestoreEntry(entry: CalendarEntry) {
    if (!confirm(`Restore "${entry.form_name} — ${entry.compliance_title}" to the live calendar?`)) return
    try {
      const res = await fetch(`/api/admin/calendar/entries/${entry.id}/restore`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Entry restored to live calendar', 'success')
        fetchEntries()
        fetchCategories()
      } else {
        showToast(data.error || 'Failed to restore', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error restoring entry', 'error')
    }
  }

  // Categories Modal handlers
  function handleOpenCategoriesModal() {
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      slug: '',
      colour: 'blue',
      icon: 'Building2',
      sort_order: (categories.length + 1) * 10,
      is_active: true,
    })
    setShowCategoryModal(true)
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryForm.name.trim()) {
      showToast('Category name is required', 'error')
      return
    }

    setSavingCategory(true)
    try {
      const url = editingCategory ? `/api/admin/calendar/categories/${editingCategory.id}` : '/api/admin/calendar/categories'
      const method = editingCategory ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(editingCategory ? 'Category updated' : 'Category created', 'success')
        setEditingCategory(null)
        setCategoryForm({ name: '', slug: '', colour: 'blue', icon: 'Building2', sort_order: 10, is_active: true })
        fetchCategories()
      } else {
        showToast(data.error?.message || data.error || data.message || 'Failed to save category', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving category', 'error')
    } finally {
      setSavingCategory(false)
    }
  }

  async function handleDeleteCategory(cat: Category) {
    if ((cat.entry_count || 0) > 0) {
      alert(`Cannot delete category "${cat.name}". It contains ${cat.entry_count} entries. Please move the entries to another category first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/calendar/categories/${cat.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        showToast('Category deleted', 'success')
        fetchCategories()
      } else {
        showToast(data.message || data.error || 'Failed to delete category', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting category', 'error')
    }
  }

  // Bulk Import Dry-run & Apply
  async function handleImportDryRun() {
    if (!importText.trim()) {
      showToast('Please paste CSV or JSON content first', 'error')
      return
    }
    setImporting(true)
    try {
      let isJson = false
      let payload: any = {}
      try {
        const parsed = JSON.parse(importText)
        isJson = true
        payload = { entries: Array.isArray(parsed) ? parsed : (parsed.entries || []), dry_run: true }
      } catch {
        payload = { csv: importText, dry_run: true }
      }

      const res = await fetch('/api/admin/calendar/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setImportDryRunResult(data)
        showToast('Dry-run preview generated successfully', 'success')
      } else {
        showToast(data.error || 'Dry run failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to run dry-run', 'error')
    } finally {
      setImporting(false)
    }
  }

  async function handleApplyImport() {
    if (!importDryRunResult || importDryRunResult.summary?.valid_for_insertion === 0) {
      showToast('No valid entries to import', 'error')
      return
    }
    setImporting(true)
    try {
      let payload: any = {}
      try {
        const parsed = JSON.parse(importText)
        payload = { entries: Array.isArray(parsed) ? parsed : (parsed.entries || []), dry_run: false, force: true }
      } catch {
        payload = { csv: importText, dry_run: false, force: true }
      }

      const res = await fetch('/api/admin/calendar/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(data.message || `Imported ${data.imported_count} entries`, 'success')
        setShowImportModal(false)
        setImportText('')
        setImportDryRunResult(null)
        fetchEntries()
        fetchCategories()
      } else {
        showToast(data.error || 'Import failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar size={15} />
            <span>Unified Statutory Compliance System</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Compliance Calendar Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Single database table source of truth. Public page, widgets, and Muse AI stay 100% in sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCategoriesModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <Settings2 size={15} />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => {
              setImportText('')
              setImportDryRunResult(null)
              setShowImportModal(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <Upload size={15} />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={handleOpenCreateEntry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>Add Deadline</span>
          </button>
          <a
            href="/calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>Live /calendar</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Flag / Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setStatusFilter('active')
            setVerificationFilter('all')
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'active' && verificationFilter === 'all'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-300'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Live</div>
          <div className="text-2xl font-bold font-heading mt-1">{flags.total_count ?? entries.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live on public calendar</div>
        </button>

        <button
          onClick={() => setVerificationFilter(verificationFilter === 'due_7' ? 'all' : 'due_7')}
          className={`p-4 rounded-xl border text-left transition-all ${
            verificationFilter === 'due_7'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Clock size={13} />
            <span>Due in 7 Days</span>
          </div>
          <div className="text-2xl font-bold font-heading mt-1 text-emerald-600 dark:text-emerald-400">
            {flags.due_in_7_days ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Urgent deadlines upcoming</div>
        </button>

        <button
          onClick={() => setVerificationFilter(verificationFilter === 'unverified' ? 'all' : 'unverified')}
          className={`p-4 rounded-xl border text-left transition-all ${
            verificationFilter === 'unverified'
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle size={13} />
            <span>Needs Verification</span>
          </div>
          <div className="text-2xl font-bold font-heading mt-1 text-amber-600 dark:text-amber-400">
            {flags.unverified_90_days ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">&gt;90d or no source link</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'deleted' ? 'active' : 'deleted')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'deleted'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-300 ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <Trash2 size={13} />
            <span>Soft-Deleted</span>
          </div>
          <div className="text-2xl font-bold font-heading mt-1 text-rose-600 dark:text-rose-400">
            {statusFilter === 'deleted' ? entries.length : 'Archived'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Click to view/restore</div>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl space-y-4 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Regulators
          </button>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.slug
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({cat.entry_count ?? 0})</span>
              </button>
            )
          })}
        </div>

        {/* Search & Status Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by form (e.g. GSTR-3B, MGT-7), title, section, or penalty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="active">Active Live Only</option>
              <option value="draft">Drafts Only</option>
              <option value="deleted">Soft-Deleted Only</option>
              <option value="all">All (Active &amp; Drafts)</option>
            </select>

            <select
              value={verificationFilter}
              onChange={e => setVerificationFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Verification</option>
              <option value="due_7">Due in 7 Days</option>
              <option value="unverified">&gt;90d Unverified</option>
              <option value="no_source">Missing Source Link</option>
            </select>

            <button
              onClick={fetchEntries}
              title="Refresh"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-amber-500" size={28} />
            <p className="text-sm">Loading compliance deadlines...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <FileText size={36} className="mx-auto mb-2 opacity-30 text-amber-500" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No deadlines match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search to view active deadlines.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Form &amp; Deadline Title</th>
                  <th className="py-3 px-3">Regulator</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Applicable To</th>
                  <th className="py-3 px-3">Penalty / Late Fee</th>
                  <th className="py-3 px-3">Verification &amp; Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {entries.map(entry => {
                  const catColour = CATEGORY_COLOUR_CLASSES[entry.category_slug || 'blue'] || CATEGORY_COLOUR_CLASSES.slate
                  const isDeleted = Boolean(entry.is_deleted)
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isDeleted ? 'opacity-60 bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Form & Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                            {entry.form_name}
                          </span>
                          {entry.is_extended && (
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded-full border border-amber-500/30">
                              Extended
                            </span>
                          )}
                          {entry.is_due_in_7_days && (
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded-full">
                              ⚡ 7 Days
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-2">
                          {entry.compliance_title || entry.title}
                        </p>
                        {entry.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                            {entry.description}
                          </p>
                        )}
                      </td>

                      {/* Regulator / Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${catColour.bg} ${catColour.text} ${catColour.border}`}>
                          {(entry.category_slug || entry.regulator || 'other').toUpperCase()}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {entry.is_extended ? (
                          <div>
                            {entry.original_date && (
                              <span className="line-through text-slate-400 text-[11px] block">
                                {entry.original_date}
                              </span>
                            )}
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {entry.due_date}
                            </span>
                            {entry.extension_ref && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                                {entry.extension_note || `(${entry.extension_ref})`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{entry.due_date}</span>
                        )}
                        <span className="text-[10px] text-slate-400 block capitalize">{entry.recurrence || entry.frequency}</span>
                      </td>

                      {/* Applicable To */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="line-clamp-2">{entry.applicable_to || entry.applies_to || '—'}</p>
                        {entry.statutory_ref && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate font-mono">
                            § {entry.statutory_ref}
                          </span>
                        )}
                      </td>

                      {/* Penalty */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="line-clamp-2 text-rose-700 dark:text-rose-400 text-[11px]">
                          {entry.penalty_text || entry.penalty || '—'}
                        </p>
                      </td>

                      {/* Verification & Source */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          {entry.source_url || entry.official_source_url || entry.official_link ? (
                            <a
                              href={entry.source_url || entry.official_source_url || entry.official_link || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <span>Official Portal</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                              <AlertCircle size={11} />
                              <span>Missing Source</span>
                            </span>
                          )}

                          <div className="text-[10px] text-slate-400">
                            {entry.last_verified_at ? (
                              <span>Verified {new Date(entry.last_verified_at).toLocaleDateString()}</span>
                            ) : (
                              <span className="text-amber-500 font-medium">Unverified</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewHistory(entry)}
                            title="View Audit Change History"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <History size={14} />
                          </button>

                          {isDeleted ? (
                            <button
                              onClick={() => handleRestoreEntry(entry)}
                              title="Restore Entry"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEditEntry(entry)}
                                title="Edit Deadline"
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(entry)}
                                title="Delete Deadline"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. ADD / EDIT ENTRY MODAL */}
      {/* ========================================================================= */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowEntryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-1">
              {editingEntry ? 'Edit Compliance Deadline' : 'Add New Compliance Deadline'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Saved directly to the unified table. Live on /calendar immediately.
            </p>

            {/* Duplicate Guard Warning Banner */}
            {duplicateWarning && (
              <div className="mb-4 bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold">Duplicate Warning: </span>
                  {duplicateWarning}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Form / Return Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GSTR-3B, MGT-7, ECR"
                    value={entryForm.form_name}
                    onChange={e => setEntryForm({ ...entryForm, form_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category / Regulator *
                  </label>
                  <select
                    value={entryForm.category_slug}
                    onChange={e => setEntryForm({ ...entryForm, category_slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name} ({c.slug.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Compliance Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Filing of Monthly Summary Return & Tax Payment"
                  value={entryForm.title}
                  onChange={e => setEntryForm({ ...entryForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20 Nov 2026 or 20th of every month"
                    value={entryForm.due_date}
                    onChange={e => setEntryForm({ ...entryForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recurrence Frequency
                  </label>
                  <select
                    value={entryForm.recurrence}
                    onChange={e => setEntryForm({ ...entryForm, recurrence: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half-Yearly</option>
                    <option value="annual">Annual</option>
                    <option value="one_off">One-Off / Event Based</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Applies To *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Registered taxpayers with aggregate turnover exceeding ₹5 Crore"
                  value={entryForm.applicable_to}
                  onChange={e => setEntryForm({ ...entryForm, applicable_to: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description (1-2 lines)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of what this filing requires..."
                  value={entryForm.description}
                  onChange={e => setEntryForm({ ...entryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Statutory Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Section 39(1) of CGST Act / Rule 61"
                    value={entryForm.statutory_ref}
                    onChange={e => setEntryForm({ ...entryForm, statutory_ref: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Statutory Source URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={entryForm.source_url}
                    onChange={e => setEntryForm({ ...entryForm, source_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Penalty / Late Fee Provision
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹50/day (₹20/day for nil return) up to maximum ₹5,000 + 18% p.a. interest"
                  value={entryForm.penalty_text}
                  onChange={e => setEntryForm({ ...entryForm, penalty_text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Statutory Extension Controls */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-800 dark:text-amber-300">
                  <input
                    type="checkbox"
                    checked={entryForm.is_extended}
                    onChange={e => setEntryForm({ ...entryForm, is_extended: e.target.checked })}
                    className="rounded border-amber-500 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Statutory Deadline Extension Active</span>
                </label>

                {entryForm.is_extended && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Original Due Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 Oct 2026"
                        value={entryForm.original_date}
                        onChange={e => setEntryForm({ ...entryForm, original_date: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Extension Ref / Circular
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Circular No. e-704368"
                        value={entryForm.extension_ref}
                        onChange={e => setEntryForm({ ...entryForm, extension_ref: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Extension Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Extended to 31 Oct 2026"
                        value={entryForm.extension_note}
                        onChange={e => setEntryForm({ ...entryForm, extension_note: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={entryForm.is_live}
                    onChange={e => setEntryForm({ ...entryForm, is_live: e.target.checked })}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Active &amp; Published to Public Calendar</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEntryModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEntry}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingEntry && <RefreshCw size={13} className="animate-spin" />}
                    <span>{editingEntry ? 'Update Deadline' : 'Create Deadline'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CATEGORIES MANAGEMENT MODAL */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-1">
              Manage Compliance Categories
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Categories are stored in <code className="font-mono">compliance_categories</code> table. Categories with entries cannot be deleted.
            </p>

            {/* Existing Categories List */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Slug</th>
                    <th className="py-2.5 px-3">Colour</th>
                    <th className="py-2.5 px-3">Entries</th>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {cat.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{cat.slug}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle" style={{ backgroundColor: cat.colour }} />
                        <span className="capitalize">{cat.colour}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{cat.entry_count ?? 0}</td>
                      <td className="py-2.5 px-3">{cat.sort_order}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setEditingCategory(cat)
                            setCategoryForm({
                              name: cat.name,
                              slug: cat.slug,
                              colour: cat.colour,
                              icon: cat.icon || 'Building2',
                              sort_order: cat.sort_order,
                              is_active: cat.is_active,
                            })
                          }}
                          className="text-slate-500 hover:text-slate-900 mr-2"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-30"
                          disabled={(cat.entry_count || 0) > 0}
                          title={(cat.entry_count || 0) > 0 ? 'Move entries before deleting' : 'Delete category'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add / Edit Category Form */}
            <form onSubmit={handleSaveCategory} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Customs &amp; DGFT"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Slug (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. customs"
                    value={categoryForm.slug}
                    onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Colour
                  </label>
                  <select
                    value={categoryForm.colour}
                    onChange={e => setCategoryForm({ ...categoryForm, colour: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="blue">Blue</option>
                    <option value="cyan">Cyan</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Purple</option>
                    <option value="indigo">Indigo</option>
                    <option value="teal">Teal</option>
                    <option value="emerald">Emerald</option>
                    <option value="rose">Rose</option>
                    <option value="slate">Slate</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null)
                      setCategoryForm({ name: '', slug: '', colour: 'blue', icon: 'Building2', sort_order: 10, is_active: true })
                    }}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Cancel Editing
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="ml-auto px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs flex items-center gap-1"
                >
                  {savingCategory && <RefreshCw size={12} className="animate-spin" />}
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AUDIT CHANGE HISTORY MODAL */}
      {/* ========================================================================= */}
      {showHistoryModal && historyEntry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              <History size={14} />
              <span>Audit Trail</span>
            </div>
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Change History: {historyEntry.form_name}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{historyEntry.compliance_title}</p>

            {loadingHistory ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-amber-500" />
                <p className="text-xs">Loading change log...</p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No individual change log recorded for this entry yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {historyItems.map((item, idx) => (
                  <div key={item.id || idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">
                        {item.action}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Operator: <span className="text-amber-600 font-semibold">{item.key_name || 'admin'}</span>
                    </div>
                    {item.details?.diff && (
                      <div className="mt-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60 font-mono text-[11px] space-y-1">
                        {Object.entries(item.details.diff).map(([field, delta]: [string, any]) => (
                          <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 w-28 shrink-0">{field}:</span>
                            <span className="line-through text-rose-500 text-[10px]">{JSON.stringify(delta.old)}</span>
                            <ArrowRight size={10} className="text-slate-400 shrink-0 hidden sm:inline" />
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">{JSON.stringify(delta.new)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.details?.reason && (
                      <p className="text-[11px] text-slate-500 italic">
                        Reason: {item.details.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SOFT / HARD DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {showDeleteDialog && deletingEntry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-rose-600 font-heading mb-2 flex items-center gap-2">
              <ShieldAlert size={20} />
              <span>Delete Compliance Deadline</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Are you sure you want to delete <strong>{deletingEntry.form_name} — {deletingEntry.compliance_title}</strong>?
            </p>
            <p className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg mb-4">
              {deletingEntry.ever_live === false
                ? 'ℹ️ This draft entry was never published. It will be permanently removed from the database.'
                : '🛡️ Safety Guard Active: This entry was live on the public calendar. It will be SOFT-DELETED (hidden from the public, preserved in database, restorable anytime).'}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for deletion (recorded in audit log):
              </label>
              <input
                type="text"
                placeholder="e.g. Obsolete rule / replaced by Notification No. 36/2026"
                value={deletionReason}
                onChange={e => setDeletionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 disabled:opacity-50"
              >
                {deleting && <RefreshCw size={13} className="animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. BULK IMPORT MODAL WITH DRY-RUN PREVIEW */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-1">
              Bulk Import Compliance Deadlines
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Paste CSV or JSON array. Use Dry-Run to validate and check duplicate warnings before applying.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CSV or JSON Content
                </label>
                <textarea
                  rows={8}
                  placeholder={`CSV Example:\nform_name,title,due_date,applies_to,category,statutory_ref,penalty_text\nGSTR-1,Outward Supplies Monthly,11th of every month,Taxpayers with turnover > 5Cr,gst,Section 37,₹50/day\n\nOr JSON: [{"form_name": "GSTR-1", "title": "Outward Supplies", "due_date": "11th of every month", "applies_to": "All", "category": "gst"}]`}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Dry-run results preview */}
              {importDryRunResult && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Dry-Run Validation Summary:</span>
                    <span className="text-emerald-600">
                      {importDryRunResult.summary?.valid_for_insertion} Valid
                    </span>
                    <span className="text-amber-600">
                      {importDryRunResult.summary?.duplicate_warnings} Duplicates
                    </span>
                    <span className="text-rose-600">
                      {importDryRunResult.summary?.error_count} Errors
                    </span>
                  </div>

                  {importDryRunResult.errors?.length > 0 && (
                    <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg max-h-32 overflow-y-auto">
                      {importDryRunResult.errors.map((err: any, i: number) => (
                        <div key={i}>Row {err.row_index}: {err.error}</div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-slate-500 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-700/50 sticky top-0">
                        <tr>
                          <th className="p-1.5">Row</th>
                          <th className="p-1.5">Form</th>
                          <th className="p-1.5">Due Date</th>
                          <th className="p-1.5">Category</th>
                          <th className="p-1.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {importDryRunResult.preview?.map((p: any) => (
                          <tr key={p.row_index} className={p.is_duplicate ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}>
                            <td className="p-1.5 font-mono">{p.row_index}</td>
                            <td className="p-1.5 font-bold">{p.form_name}</td>
                            <td className="p-1.5">{p.due_date}</td>
                            <td className="p-1.5 uppercase">{p.category}</td>
                            <td className="p-1.5">
                              {p.is_duplicate ? (
                                <span className="text-amber-600 font-semibold">Duplicate Warning</span>
                              ) : (
                                <span className="text-emerald-600 font-semibold">Ready</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleImportDryRun}
                  disabled={importing || !importText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {importing && <RefreshCw size={13} className="animate-spin" />}
                  <span>Run Dry-Run Preview</span>
                </button>

                {importDryRunResult && importDryRunResult.summary?.valid_for_insertion > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    disabled={importing}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {importing && <RefreshCw size={13} className="animate-spin" />}
                    <span>Confirm &amp; Import ({importDryRunResult.summary.valid_for_insertion} Entries)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
