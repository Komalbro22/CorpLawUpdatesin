'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Loader2,
  ScrollText,
  FileSpreadsheet,
  TrendingUp,
  Settings,
  X,
  PlusCircle,
  HelpCircle,
  ArrowUpDown,
  BookOpen
} from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Field {
  id: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'select'
  placeholder?: string
  required: boolean
  help_text?: string
  options?: string[]
}

interface Template {
  id: string
  name: string
  slug: string
  description: string
  category: string
  template_content: string
  fields: Field[]
  regulation_reference: string
  source: string
  last_verified: string
  ai_system_prompt: string
  is_active: boolean
  is_free: boolean
  display_order: number
  usage_count: number
  tags?: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  board_resolution: 'Board Resolutions',
  shareholders_meeting: 'Shareholders Meeting',
  agreements: 'Agreements',
  appointments: 'Appointment Letters',
  mca_forms: 'MCA Form Guides',
  notices: 'Notices',
}

const CATEGORY_COLORS: Record<string, string> = {
  board_resolution: 'bg-blue-50 border-blue-200 text-blue-700   ',
  shareholders_meeting: 'bg-green-50 border-green-200 text-green-700   ',
  agreements: 'bg-purple-50 border-purple-200 text-purple-700   ',
  appointments: 'bg-amber-50 border-amber-200 text-amber-700   ',
  mca_forms: 'bg-red-50 border-red-200 text-red-700   ',
  notices: 'bg-teal-50 border-teal-200 text-teal-700   ',
}

export default function AdminDocumentsPage() {
  const { showToast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'display_order'>('usage')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fields editing sub-state
  const [modalFields, setModalFields] = useState<Field[]>([])

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/documents')
      const json = await res.json()

      if (!res.ok) {
        showToast(json.error || 'Failed to load templates', 'error')
      } else {
        setTemplates(json.templates || [])
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
      showToast('Connection error while fetching templates', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })
      const json = await res.json()
      if (res.ok) {
        setTemplates(prev =>
          prev.map(t => (t.id === id ? { ...t, is_active: !currentStatus } : t))
        )
        showToast(
          `Template "${json.template?.name || 'document'}" set to ${
            !currentStatus ? 'Active' : 'Inactive'
          }`,
          'success'
        )
      } else {
        showToast(json.error || 'Failed to toggle status', 'error')
      }
    } catch (err) {
      showToast('Failed to update template status', 'error')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id))
        showToast(`Template "${name}" deleted successfully`, 'success')
      } else {
        showToast(json.error || 'Failed to delete template', 'error')
      }
    } catch (err) {
      showToast('Error deleting template', 'error')
    }
  }

  const handleOpenEdit = (template: Template) => {
    setEditingTemplate({ ...template })
    setModalFields(template.fields || [])
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingTemplate({
      name: '',
      slug: '',
      description: '',
      category: 'board_resolution',
      template_content: '',
      regulation_reference: '',
      source: '',
      last_verified: new Date().toISOString().split('T')[0],
      ai_system_prompt: 'You are an expert corporate secretary. Refine the legal wording based on Companies Act 2013.',
      is_active: true,
      is_free: true,
      display_order: 0,
      tags: [],
    })
    setModalFields([])
    setIsModalOpen(true)
  }

  const handleAddField = () => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      label: 'New Parameter',
      type: 'text',
      placeholder: 'Enter detail...',
      required: true,
      help_text: '',
    }
    setModalFields([...modalFields, newField])
  }

  const handleRemoveField = (index: number) => {
    setModalFields(modalFields.filter((_, i) => i !== index))
  }

  const handleUpdateField = (index: number, key: keyof Field, value: any) => {
    const updated = [...modalFields]
    if (key === 'options' && typeof value === 'string') {
      updated[index] = {
        ...updated[index],
        [key]: value.split(',').map(s => s.trim()).filter(Boolean),
      }
    } else {
      updated[index] = {
        ...updated[index],
        [key]: value,
      }
    }
    setModalFields(updated)
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return

    setIsSubmitting(true)

    // Form fields validation
    const payload = {
      ...editingTemplate,
      fields: modalFields,
    }

    try {
      const isEdit = !!payload.id
      const url = isEdit
        ? `/api/admin/documents/${payload.id}`
        : '/api/admin/documents'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (res.ok) {
        showToast(
          `Template "${payload.name}" ${isEdit ? 'updated' : 'created'} successfully`,
          'success'
        )
        setIsModalOpen(false)
        setEditingTemplate(null)
        fetchTemplates()
      } else {
        showToast(json.error || 'Failed to save template', 'error')
      }
    } catch (err) {
      showToast('Error saving template', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Statistics calculation
  const totalTemplates = templates.length
  const totalUsage = templates.reduce((acc, t) => acc + (t.usage_count || 0), 0)
  const popularTemplate = [...templates].sort((a, b) => b.usage_count - a.usage_count)[0]

  // Filtering & Sorting
  const filteredTemplates = templates
    .filter(t => {
      const matchesSearch =
        (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.slug || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || t.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'usage') {
        comparison = a.usage_count - b.usage_count
      } else if (sortBy === 'display_order') {
        comparison = a.display_order - b.display_order
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: 'name' | 'usage' | 'display_order') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy font-heading">
            AI Legal Document Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish, edit, and manage dynamic templates used by the AI Legal Document Generator.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Template
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Templates
            </p>
            <h3 className="text-2xl font-bold text-navy mt-1">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
              ) : (
                totalTemplates
              )}
            </h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Generated Docs
            </p>
            <h3 className="text-2xl font-bold text-navy mt-1">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
              ) : (
                totalUsage
              )}
            </h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md col-span-1">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Most Popular
            </p>
            <h3 className="text-base font-bold text-navy mt-1 truncate" title={popularTemplate?.name}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
              ) : popularTemplate ? (
                `${popularTemplate.name} (${popularTemplate.usage_count})`
              ) : (
                'N/A'
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search template name, category, or slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="flex-1 md:flex-none border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('name')}
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Template Name
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </th>
                <th className="p-4">Category</th>
                <th
                  onClick={() => handleSort('usage')}
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Usage
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </th>
                <th className="p-4">Verification</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                      <span className="text-sm font-medium text-slate-400">Loading templates...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ScrollText className="w-10 h-10 text-slate-300" />
                      <span className="text-base font-bold text-navy">No Templates Found</span>
                      <span className="text-sm text-slate-400">
                        Try modifying your query or filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 max-w-sm">
                      <div className="flex items-start gap-2">
                        <div>
                          <h4 className="font-semibold text-navy text-sm group-hover:text-amber-600 transition-colors">
                            {t.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono mt-1 font-medium">
                            /{t.slug}
                          </p>
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                            {t.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          CATEGORY_COLORS[t.category] || 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {CATEGORY_LABELS[t.category] || t.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-navy">
                          {t.usage_count || 0}
                        </span>
                        <span className="text-[10px] text-slate-400">generations</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-medium text-slate-600">
                        {t.regulation_reference ? (
                          <div className="font-semibold text-navy">
                            {t.regulation_reference}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-light">Unspecified regulation</span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Verified: {t.last_verified ? t.last_verified : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(t.id, t.is_active)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          t.is_active
                            ? 'bg-green-50 text-green-700 border border-green-200   '
                            : 'bg-slate-50 text-slate-500 border border-slate-200   '
                        }`}
                      >
                        {t.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {t.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {t.is_active && (
                          <Link
                            href={`/documents/${t.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Test Generator"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Template"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-screen flex flex-col shadow-2xl animate-slide-in overflow-hidden border-l border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-navy font-heading">
                  {editingTemplate.id ? 'Edit Document Template' : 'Create Document Template'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure structural fields, boilerplate template text, and Gemini guidance.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-400 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTemplate} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Section 1: Basic Information */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Basic Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Board Resolution to Open Bank Account"
                        value={editingTemplate.name || ''}
                        onChange={e =>
                          setEditingTemplate(prev => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        URL Slug (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Autogenerated from name if empty"
                        value={editingTemplate.slug || ''}
                        onChange={e =>
                          setEditingTemplate(prev => ({ ...prev, slug: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Category *
                      </label>
                      <select
                        required
                        value={editingTemplate.category || 'board_resolution'}
                        onChange={e =>
                          setEditingTemplate(prev => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTemplate.display_order ?? 0}
                        onChange={e =>
                          setEditingTemplate(prev => ({
                            ...prev,
                            display_order: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Short Description *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Describe what document this template produces and when it should be utilized."
                        value={editingTemplate.description || ''}
                        onChange={e =>
                          setEditingTemplate(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Regulation & Legals */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    🏛️ Legals & Verification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Regulation Reference
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Companies Act 2013, Section 134"
                        value={editingTemplate.regulation_reference || ''}
                        onChange={e =>
                          setEditingTemplate(prev => ({
                            ...prev,
                            regulation_reference: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Source
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ICSI Secretarial Standards (SS-1)"
                        value={editingTemplate.source || ''}
                        onChange={e =>
                          setEditingTemplate(prev => ({ ...prev, source: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Last Verified Date
                      </label>
                      <input
                        type="date"
                        value={editingTemplate.last_verified || ''}
                        onChange={e =>
                          setEditingTemplate(prev => ({
                            ...prev,
                            last_verified: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Dynamic Variables / Form Fields */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      📋 Form Input Fields (Variables)
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Field
                    </button>
                  </div>

                  {modalFields.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                      No parameters added yet. Click &quot;Add Field&quot; to specify form elements for compiling variables.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modalFields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-3"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove Field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Field Key / ID (match &quot;&#123;id&#125;&quot; in template)
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. director_name"
                                value={field.id}
                                onChange={e => handleUpdateField(idx, 'id', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500 text-navy"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Input Label
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Appointed Director Name"
                                value={field.label}
                                onChange={e => handleUpdateField(idx, 'label', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-navy"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Field Input Type
                              </label>
                              <select
                                value={field.type}
                                onChange={e => handleUpdateField(idx, 'type', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-navy"
                              >
                                <option value="text">Single-line Text</option>
                                <option value="textarea">Multi-line Text</option>
                                <option value="date">Calendar Date</option>
                                <option value="select">Dropdown Select</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Placeholder Text
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Enter name..."
                                value={field.placeholder || ''}
                                onChange={e => handleUpdateField(idx, 'placeholder', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-navy"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Help Info / Instructions
                              </label>
                              <input
                                type="text"
                                placeholder="Helpful hint visible near the input..."
                                value={field.help_text || ''}
                                onChange={e => handleUpdateField(idx, 'help_text', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-navy"
                              />
                            </div>

                            {field.type === 'select' && (
                              <div className="md:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                  Dropdown Options (Comma-separated)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Ordinary Resolution, Special Resolution"
                                  value={field.options?.join(', ') || ''}
                                  onChange={e => handleUpdateField(idx, 'options', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-navy"
                                />
                              </div>
                            )}

                            <div className="md:col-span-3 flex items-center gap-2 pt-1.5">
                              <input
                                type="checkbox"
                                id={`required_${field.id}`}
                                checked={field.required}
                                onChange={e => handleUpdateField(idx, 'required', e.target.checked)}
                                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                              />
                              <label htmlFor={`required_${field.id}`} className="text-xs font-semibold text-slate-600">
                                This parameter is strictly required to compile this template.
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 4: Boilerplate Markdown Template */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-navy">
                      Boilerplate Document Content (Markdown Format) *
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Use &quot;&#123;param_id&#125;&quot; placeholders matching your Form Input Fields above.
                    </span>
                  </div>
                  <textarea
                    required
                    rows={12}
                    placeholder="Enter raw template with standard formatting. E.g.
# RESOLVED THAT Mr. {director_name} be appointed as director..."
                    value={editingTemplate.template_content || ''}
                    onChange={e =>
                      setEditingTemplate(prev => ({
                        ...prev,
                        template_content: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 leading-relaxed text-navy"
                  />
                </div>

                {/* Section 5: AI System Guidance */}
                <div className="border-t border-slate-100 pt-6">
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Gemini AI Editor System Prompt *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific guidelines for Gemini to follow when refining generated drafts or clauses in the generator console."
                    value={editingTemplate.ai_system_prompt || ''}
                    onChange={e =>
                      setEditingTemplate(prev => ({
                        ...prev,
                        ai_system_prompt: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-navy"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Template'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
