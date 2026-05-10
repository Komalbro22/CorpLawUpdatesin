'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lightbulb, Loader2, Plus } from 'lucide-react'

interface ComplianceEntry {
  id: string
  regulator: string
  form_name: string
  compliance_title: string
  due_date: string
  applicable_to: string
  penalty: string | null
  regulation_reference: string | null
  frequency: string
  is_active: boolean
  is_verified: boolean
  created_by: string | null
  contributor_name: string | null
  contributor_profession: string | null
  correction_count: number
  display_order: number
  created_at: string
}

const REGULATORS = ['mca', 'sebi', 'rbi', 'income_tax', 'fema', 'nclt', 'ibc', 'other']
const FREQUENCIES = ['monthly', 'quarterly', 'half_yearly', 'annual', 'event_based', 'one_time']

const emptyForm = {
  regulator: 'mca',
  form_name: '',
  compliance_title: '',
  due_date: '',
  applicable_to: '',
  penalty: '',
  regulation_reference: '',
  frequency: 'annual',
  display_order: 0,
}

export default function AdminCompliancePage() {
  const [entries, setEntries] = useState<ComplianceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRegulator, setFilterRegulator] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  async function loadEntries() {
    setLoading(true)
    const res = await fetch('/api/admin/compliance')
    const data = await res.json()
    setEntries(data.entries || [])
    setLoading(false)
  }

  async function loadPendingCount() {
    const res = await fetch('/api/admin/compliance/suggestions')
    const data = await res.json()
    const pending = (data.suggestions || []).filter(
      (s: { status: string }) => s.status === 'pending'
    ).length
    setPendingCount(pending)
  }

  useEffect(() => {
    loadEntries()
    loadPendingCount()
  }, [])

  const filtered = entries.filter(e => {
    const matchRegulator = filterRegulator === 'all' || e.regulator === filterRegulator
    const matchSearch =
      !search ||
      e.form_name.toLowerCase().includes(search.toLowerCase()) ||
      e.compliance_title.toLowerCase().includes(search.toLowerCase())
    return matchRegulator && matchSearch
  })

  const total = entries.length
  const community = entries.filter(e => e.created_by?.startsWith('community:')).length

  async function handleSave() {
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/compliance/${editingId}` : '/api/admin/compliance'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm(emptyForm)
        setEditingId(null)
        await loadEntries()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id: string, current: boolean) {
    await fetch(`/api/admin/compliance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    await loadEntries()
  }

  async function handleDelete(id: string) {
    if (!confirm('Soft-delete this entry? It will be hidden from public view.')) return
    await fetch(`/api/admin/compliance/${id}`, { method: 'DELETE' })
    await loadEntries()
  }

  function handleEdit(entry: ComplianceEntry) {
    setForm({
      regulator: entry.regulator,
      form_name: entry.form_name,
      compliance_title: entry.compliance_title,
      due_date: entry.due_date,
      applicable_to: entry.applicable_to,
      penalty: entry.penalty || '',
      regulation_reference: entry.regulation_reference || '',
      frequency: entry.frequency,
      display_order: entry.display_order,
    })
    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-gold" aria-hidden />
        <p className="text-sm font-medium">Loading compliance entries…</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 content-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy">Compliance entries</h1>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Manage deadlines shown on the public compliance calendar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/compliance/suggestions"
            className="relative inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden />
            Suggestions
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setForm(emptyForm)
            }}
            className="inline-flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Add entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 text-center shadow-card ring-1 ring-slate-900/[0.02]">
          <div className="text-2xl font-heading font-bold text-navy tabular-nums">{total}</div>
          <div className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wide">Total</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 text-center shadow-card ring-1 ring-slate-900/[0.02]">
          <div className="text-2xl font-heading font-bold text-amber-700 tabular-nums">{pendingCount}</div>
          <div className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wide">Pending suggestions</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 text-center shadow-card ring-1 ring-slate-900/[0.02]">
          <div className="text-2xl font-heading font-bold text-emerald-700 tabular-nums">{community}</div>
          <div className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wide">Community</div>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-amber-200/80 rounded-2xl p-6 mb-2 shadow-card ring-1 ring-amber-900/5">
          <h2 className="font-heading font-bold text-navy mb-4">
            {editingId ? 'Edit entry' : 'New compliance entry'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Regulator</label>
              <select value={form.regulator} onChange={e => setForm(p => ({ ...p, regulator: e.target.value }))} className={inputClass}>
                {REGULATORS.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Form Name *</label>
              <input type="text" value={form.form_name} onChange={e => setForm(p => ({ ...p, form_name: e.target.value }))} placeholder="e.g. MGT-7" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Compliance Title *</label>
              <input type="text" value={form.compliance_title} onChange={e => setForm(p => ({ ...p, compliance_title: e.target.value }))} placeholder="Annual Return filing for all companies" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date *</label>
              <input type="text" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} placeholder="30 Sep 2026" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
              <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className={inputClass}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Applicable To *</label>
              <input type="text" value={form.applicable_to} onChange={e => setForm(p => ({ ...p, applicable_to: e.target.value }))} placeholder="All companies / Listed entities..." className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Penalty</label>
              <input type="text" value={form.penalty} onChange={e => setForm(p => ({ ...p, penalty: e.target.value }))} placeholder="₹100/day" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Regulation Reference</label>
              <input type="text" value={form.regulation_reference} onChange={e => setForm(p => ({ ...p, regulation_reference: e.target.value }))} placeholder="Section 92 Companies Act" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: Number(e.target.value) }))} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="bg-amber-400 hover:bg-amber-500 text-navy font-bold px-6 py-2 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search form name or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <select
          value={filterRegulator}
          onChange={e => setFilterRegulator(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="all">All Regulators</option>
          {REGULATORS.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
        </select>
        <span className="text-sm text-slate-400 self-center">{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-card ring-1 ring-slate-900/[0.02]">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Regulator</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Form</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Due Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(entry => (
                    <tr key={entry.id} className={!entry.is_active ? 'opacity-40' : ''}>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded uppercase">
                          {entry.regulator}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-navy font-bold">
                        {entry.form_name}
                        {entry.created_by?.startsWith('community:') && (
                          <span className="ml-1 text-[10px] font-bold uppercase text-emerald-600">community</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs">
                        <div className="truncate">{entry.compliance_title}</div>
                        {entry.contributor_name && (
                          <div className="text-xs text-green-600 mt-0.5">✓ {entry.contributor_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{entry.due_date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${entry.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {entry.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button type="button" onClick={() => handleEdit(entry)} className="text-xs font-semibold border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">Edit</button>
                          <button type="button" onClick={() => handleToggle(entry.id, entry.is_active)} className="text-xs font-semibold border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">
                            {entry.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button type="button" onClick={() => handleDelete(entry.id)} className="text-xs font-semibold border border-red-200 text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  )
}
