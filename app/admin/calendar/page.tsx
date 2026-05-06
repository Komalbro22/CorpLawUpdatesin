'use client'
import { useEffect, useState } from 'react'

interface ComplianceEntry {
  id: string
  regulator: string
  form_name: string
  compliance_title: string
  regulation_reference: string | null
  due_date: string
  applicable_to: string
  penalty: string | null
  frequency: string
  is_active: boolean
  is_verified: boolean
  contributor_name: string | null
  display_order: number
}

const CATEGORIES = [
  { value: 'mca',        label: 'MCA' },
  { value: 'sebi',       label: 'SEBI' },
  { value: 'rbi',        label: 'RBI' },
  { value: 'income_tax', label: 'Income Tax' },
  { value: 'fema',       label: 'FEMA' },
  { value: 'nclt',       label: 'NCLT' },
  { value: 'ibc',        label: 'IBC' },
  { value: 'other',      label: 'Other' },
]

const FREQUENCIES = [
  { value: 'monthly',       label: 'Monthly' },
  { value: 'quarterly',     label: 'Quarterly' },
  { value: 'half_yearly',   label: 'Half Yearly' },
  { value: 'annual',        label: 'Annual' },
  { value: 'every_2_years', label: 'Every 2 Years' },
  { value: 'every_3_years', label: 'Every 3 Years' },
  { value: 'every_5_years', label: 'Every 5 Years' },
  { value: 'event_based',   label: 'Event Based' },
  { value: 'one_time',      label: 'One Time' },
]

const emptyForm = {
  regulator: 'mca',
  form_name: '',
  compliance_title: '',
  due_date: '',
  applicable_to: '',
  penalty: '',
  regulation_reference: '',
  official_link: '',
  description: '',
  frequency: 'annual',
  display_order: 0,
  is_active: true,
  is_verified: true,
}

export default function AdminCalendarPage() {
  const [entries, setEntries] = useState<ComplianceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    setLoading(true)
    const res = await fetch('/api/admin/compliance')
    const data = await res.json()
    setEntries(data.entries || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.compliance_title || !form.due_date || !form.regulator) {
      alert('Regulator, Compliance Title and Due Date are required')
      return
    }
    setSaving(true)
    const url = editingId ? `/api/admin/compliance/${editingId}` : '/api/admin/compliance'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadEntries()
    } else {
      const err = await res.json()
      alert('Error: ' + (err.error || 'Failed to save'))
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Soft-delete this entry? It will be hidden from public view.')) return
    await fetch(`/api/admin/compliance/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function handleEdit(entry: ComplianceEntry) {
    setForm({
      regulator: entry.regulator,
      form_name: entry.form_name || '',
      compliance_title: entry.compliance_title,
      due_date: entry.due_date,
      applicable_to: entry.applicable_to || '',
      penalty: entry.penalty || '',
      regulation_reference: entry.regulation_reference || '',
      official_link: (entry as unknown as Record<string,string>)['official_link'] || '',
      description: (entry as unknown as Record<string,string>)['description'] || '',
      frequency: entry.frequency || 'annual',
      display_order: entry.display_order || 0,
      is_active: entry.is_active,
      is_verified: entry.is_verified,
    })
    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.regulator === filter)

  const stats = CATEGORIES.map(cat => ({
    label: cat.label,
    count: entries.filter(e => e.regulator === cat.value).length,
  }))

  const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-slate-400 animate-pulse">Loading compliance calendar...</div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">📅 Compliance Calendar Manager</h1>
          <p className="text-slate-500 text-sm mt-1">
            Add, edit or remove compliance deadlines. Changes reflect on live calendar immediately.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}
          className="bg-amber-400 hover:bg-amber-500 text-navy px-4 py-2 rounded-lg font-semibold text-sm"
        >
          + Add New Entry
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-navy">{s.count}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy text-lg">
              {editingId ? '✏️ Edit Entry' : '➕ Add New Compliance Entry'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Regulator *</label>
              <select value={form.regulator} onChange={e => setForm(p => ({ ...p, regulator: e.target.value }))} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Form Name</label>
              <input type="text" value={form.form_name} onChange={e => setForm(p => ({ ...p, form_name: e.target.value }))} placeholder="e.g. MGT-7, AOC-4" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Compliance Title *</label>
              <input type="text" value={form.compliance_title} onChange={e => setForm(p => ({ ...p, compliance_title: e.target.value }))} placeholder="e.g. Annual Return Filing" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date *</label>
              <input type="text" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} placeholder="e.g. 30 September 2026" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
              <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className={inputCls}>
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Applicable To *</label>
              <input type="text" value={form.applicable_to} onChange={e => setForm(p => ({ ...p, applicable_to: e.target.value }))} placeholder="e.g. All companies / Listed entities / LLPs" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Penalty</label>
              <input type="text" value={form.penalty} onChange={e => setForm(p => ({ ...p, penalty: e.target.value }))} placeholder="e.g. ₹100/day or ₹5,000 flat" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Regulation Reference</label>
              <input type="text" value={form.regulation_reference} onChange={e => setForm(p => ({ ...p, regulation_reference: e.target.value }))} placeholder="e.g. Section 92, Companies Act 2013" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Official Link</label>
              <input type="url" value={(form as Record<string,unknown>)['official_link'] as string || ''} onChange={e => setForm(p => ({ ...p, official_link: e.target.value }))} placeholder="https://mca.gov.in/..." className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: Number(e.target.value) }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea rows={2} value={(form as Record<string,unknown>)['description'] as string || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional longer description..." className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_active !== false} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-amber-400" />
                  Active (visible on public calendar)
                </label>
              </div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={(form as Record<string,unknown>)['is_verified'] !== false} onChange={e => setForm(p => ({ ...p, is_verified: e.target.checked }))} className="w-4 h-4 accent-amber-400" />
                  Verified (removes pending badge)
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="border border-slate-300 text-slate-600 px-5 py-2.5 rounded-lg text-sm font-semibold">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="bg-amber-400 hover:bg-amber-500 text-navy font-bold px-8 py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </div>
      )}
      {/* FILTER TABS */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: 'all', label: 'All' }, ...CATEGORIES].map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat.value
                ? 'bg-navy text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-navy'
            }`}
          >
            {cat.label}{' '}
            {cat.value === 'all'
              ? `(${entries.length})`
              : `(${entries.filter(e => e.regulator === cat.value).length})`}
          </button>
        ))}
      </div>

      {/* ENTRIES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-navy">Regulator</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Form</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Compliance Title</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Due Date</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-navy">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No entries found. Click &quot;+ Add New Entry&quot; to add one.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, i) => (
                  <tr key={entry.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold uppercase bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {entry.regulator.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy font-mono text-xs">
                      {entry.form_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">
                      <div className="truncate">{entry.compliance_title}</div>
                      {entry.contributor_name && (
                        <div className="text-xs text-green-600 mt-0.5">✓ {entry.contributor_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{entry.due_date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        entry.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {entry.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
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
    </div>
  )
}
