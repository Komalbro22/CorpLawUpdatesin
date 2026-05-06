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

const FREQUENCIES = ['monthly', 'quarterly', 'half_yearly', 'annual', 'event_based', 'one_time']

const emptyForm = {
  regulator: 'mca',
  form_name: '',
  compliance_title: '',
  regulation_reference: '',
  due_date: '',
  applicable_to: '',
  penalty: '',
  frequency: 'annual',
  display_order: 0,
  is_active: true,
}

export default function AdminCalendarPage() {
  const [entries, setEntries] = useState<ComplianceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
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
      regulation_reference: entry.regulation_reference || '',
      due_date: entry.due_date,
      applicable_to: entry.applicable_to || '',
      penalty: entry.penalty || '',
      frequency: entry.frequency || 'annual',
      display_order: entry.display_order || 0,
      is_active: entry.is_active,
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
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex justify-between items-center">
            <h2 className="font-bold text-navy">
              {editingId ? '✏️ Edit Entry' : '➕ Add New Compliance Entry'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >✕</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Regulator *</label>
              <select value={form.regulator} onChange={e => setForm(p => ({ ...p, regulator: e.target.value }))} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Form Name</label>
              <input type="text" value={form.form_name} onChange={e => setForm(p => ({ ...p, form_name: e.target.value }))} placeholder="e.g. MGT-7, AOC-4" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy mb-1">Compliance Title *</label>
              <input type="text" value={form.compliance_title} onChange={e => setForm(p => ({ ...p, compliance_title: e.target.value }))} placeholder="e.g. Annual Return Filing" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Regulation / Section</label>
              <input type="text" value={form.regulation_reference} onChange={e => setForm(p => ({ ...p, regulation_reference: e.target.value }))} placeholder="e.g. Section 92, Companies Act" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Due Date *</label>
              <input type="text" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} placeholder="e.g. 30 September 2026" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Applicable To</label>
              <input type="text" value={form.applicable_to} onChange={e => setForm(p => ({ ...p, applicable_to: e.target.value }))} placeholder="e.g. All companies" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Penalty</label>
              <input type="text" value={form.penalty} onChange={e => setForm(p => ({ ...p, penalty: e.target.value }))} placeholder="e.g. ₹100/day" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Frequency</label>
              <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className={inputCls}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: Number(e.target.value) }))} className={inputCls} />
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-amber-400 hover:bg-amber-500 text-navy'}`}
            >
              {saving ? 'Saving...' : saved ? '✓ Saved!' : editingId ? 'Update Entry' : 'Add Entry'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="px-6 py-2 rounded-lg font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
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
