'use client'
import { useEffect, useState } from 'react'

// Types
interface CalendarEntry {
  id: string
  category: string
  form_name: string
  compliance: string
  regulation: string
  due_date: string
  due_date_sort: string
  applicable_to: string
  penalty: string
  priority: string
  is_active: boolean
  notes: string
}

const CATEGORIES = ['MCA', 'SEBI', 'RBI-FEMA', 'Income Tax']

const emptyForm: Omit<CalendarEntry, 'id'> = {
  category: 'MCA',
  form_name: '',
  compliance: '',
  regulation: '',
  due_date: '',
  due_date_sort: '',
  applicable_to: '',
  penalty: '',
  priority: 'medium',
  is_active: true,
  notes: '',
}

export default function AdminCalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    const d = await fetch('/api/admin/calendar').then(r => r.json())
    setEntries(d.entries || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.compliance || !form.due_date || !form.category) {
      alert('Category, Compliance and Due Date are required')
      return
    }
    setSaving(true)
    const action = editingId ? 'update' : 'create'
    const body = editingId ? { action, id: editingId, ...form } : { action, ...form }
    const res = await fetch('/api/admin/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      loadEntries()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this compliance entry? This cannot be undone.')) return
    await fetch('/api/admin/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function handleEdit(entry: CalendarEntry) {
    setForm({
      category: entry.category,
      form_name: entry.form_name || '',
      compliance: entry.compliance,
      regulation: entry.regulation || '',
      due_date: entry.due_date,
      due_date_sort: entry.due_date_sort || '',
      applicable_to: entry.applicable_to || '',
      penalty: entry.penalty || '',
      priority: entry.priority || 'medium',
      is_active: entry.is_active,
      notes: entry.notes || '',
    })
    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtered = filter === 'All' ? entries : entries.filter(e => e.category === filter)
  const counts: Record<string, number> = {}
  CATEGORIES.forEach(cat => { counts[cat] = entries.filter(e => e.category === cat).length })

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-slate-400 animate-pulse">Loading compliance calendar...</div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl">
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
        {CATEGORIES.map(cat => (
          <div key={cat} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-navy">{counts[cat] || 0}</div>
            <div className="text-xs text-slate-500 mt-1">{cat}</div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT FORM */}
      {showForm && (
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex justify-between items-center">
            <h2 className="font-bold text-navy">
              {editingId ? '✏️ Edit Entry' : '➕ Add New Compliance Entry'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Category *</label>
              <select value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Form Name</label>
              <input type="text" value={form.form_name}
                onChange={e => setForm(p => ({ ...p, form_name: e.target.value }))}
                placeholder="e.g. MGT-7, AOC-4, DIR-3"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy mb-1">Compliance Description *</label>
              <input type="text" value={form.compliance}
                onChange={e => setForm(p => ({ ...p, compliance: e.target.value }))}
                placeholder="e.g. Annual Return Filing"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Regulation / Section</label>
              <input type="text" value={form.regulation}
                onChange={e => setForm(p => ({ ...p, regulation: e.target.value }))}
                placeholder="e.g. Section 92, Companies Act"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Due Date (Display) *</label>
              <input type="text" value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                placeholder="e.g. 60 days from AGM, 30 June 2026"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Due Date (For Sorting)</label>
              <input type="date" value={form.due_date_sort}
                onChange={e => setForm(p => ({ ...p, due_date_sort: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Applicable To</label>
              <input type="text" value={form.applicable_to}
                onChange={e => setForm(p => ({ ...p, applicable_to: e.target.value }))}
                placeholder="e.g. All companies, Listed companies"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Penalty</label>
              <input type="text" value={form.penalty}
                onChange={e => setForm(p => ({ ...p, penalty: e.target.value }))}
                placeholder="e.g. ₹100/day, ₹50,000"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Priority</label>
              <select value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy mb-1">Notes</label>
              <textarea value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                placeholder="Additional notes or clarifications..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                saved ? 'bg-green-500 text-white' : 'bg-amber-400 hover:bg-amber-500 text-navy'
              }`}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : editingId ? 'Update Entry' : 'Add Entry'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="px-6 py-2 rounded-lg font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-navy text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-navy'
            }`}>
            {cat} {cat !== 'All' ? `(${counts[cat] || 0})` : `(${entries.length})`}
          </button>
        ))}
      </div>

      {/* ENTRIES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-navy">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Form</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Compliance</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Due Date</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Priority</th>
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
                      <span className="text-xs font-bold uppercase text-blue-600">{entry.category}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy">{entry.form_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">{entry.compliance}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{entry.due_date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[entry.priority] || priorityColors.medium}`}>
                        {entry.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEdit(entry)}
                          className="text-amber-600 hover:text-amber-800 text-xs font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(entry.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium">
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
