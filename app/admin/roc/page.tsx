'use client'
import { useState, useEffect } from 'react'

export default function AdminROCFormsPage() {
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/roc/forms')
      .then(r => r.json())
      .then(d => setForms(d.forms || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(
    id: string, 
    updates: any
  ) {
    setSaving(true)
    try {
      await fetch('/api/admin/roc/forms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      setForms(prev => prev.map(f => 
        f.id === id ? { ...f, ...updates } : f
      ))
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-8 text-center">
      Loading ROC forms...
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center 
                      justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            ROC Forms Management
          </h1>
          <p className="text-slate-500 text-sm">
            Update fees, dates and descriptions 
            without code changes. Data stored in Supabase2.
          </p>
        </div>
        <div className="text-xs bg-green-100 
                        text-green-700 px-3 py-1.5 
                        rounded-full font-semibold">
          {forms.length} forms in Supabase2
        </div>
      </div>

      <div className="space-y-4">
        {forms.map(form => (
          <div key={form.id}
               className="admin-card-glass rounded-2xl 
                          overflow-hidden">
            <div className="p-4 flex items-center 
                            justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {form.form_code}
                  </span>
                  <span className={`text-xs px-2 py-0.5 
                    rounded-full font-medium
                    ${form.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'}`}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {form.ccfs_eligible && (
                    <span className="text-xs bg-blue-100 
                                     text-blue-700 px-2 
                                     py-0.5 rounded-full">
                      CCFS Eligible
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {form.form_name} · 
                  ₹{form.additional_fee_per_day}/day · 
                  {form.priority} priority
                </p>
                {form.notes && (
                  <p className="text-xs text-amber-600 
                                mt-1">
                    📌 {form.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(
                    editingId === form.id 
                      ? null 
                      : form.id
                  )}
                  className="text-xs bg-slate-100 
                             text-slate-600 px-3 py-1.5 
                             rounded-lg hover:bg-amber-100 
                             hover:text-amber-700">
                  {editingId === form.id 
                    ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {editingId === form.id && (
              <EditFormPanel 
                form={form}
                onSave={(updates) => 
                  handleSave(form.id, updates)
                }
                saving={saving}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function EditFormPanel({ form, onSave, saving }: {
  form: any
  onSave: (updates: any) => void
  saving: boolean
}) {
  const [values, setValues] = useState({
    additional_fee_per_day: 
      form.additional_fee_per_day,
    normal_govt_fee: form.normal_govt_fee,
    flat_late_fee: form.flat_late_fee || '',
    ccfs_eligible: form.ccfs_eligible,
    is_active: form.is_active,
    notes: form.notes || '',
    more_info_url: form.more_info_url || '',
    priority: form.priority,
    last_verified: form.last_verified || '',
  })

  const inputClass = `w-full border border-slate-200 
    rounded-xl px-3 py-2 text-sm focus:outline-none 
    focus:ring-2 focus:ring-amber-400`

  return (
    <div className="border-t border-slate-100 
                    bg-slate-50 p-4 space-y-4">
      <div className="grid grid-cols-2 
                      md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold 
                            text-slate-600 block mb-1">
            Late Fee per Day (₹)
          </label>
          <input type="number"
            value={values.additional_fee_per_day}
            onChange={e => setValues(v => ({
              ...v, 
              additional_fee_per_day: Number(e.target.value)
            }))}
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold 
                            text-slate-600 block mb-1">
            Flat Late Fee (₹)
          </label>
          <input type="number"
            value={values.flat_late_fee}
            onChange={e => setValues(v => ({
              ...v, flat_late_fee: e.target.value
            }))}
            placeholder="Leave blank if daily fee"
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold 
                            text-slate-600 block mb-1">
            Priority
          </label>
          <select
            value={values.priority}
            onChange={e => setValues(v => ({
              ...v, priority: e.target.value
            }))}
            className={inputClass}>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold 
                            text-slate-600 block mb-1">
            More Info URL
          </label>
          <input type="text"
            value={values.more_info_url}
            onChange={e => setValues(v => ({
              ...v, more_info_url: e.target.value
            }))}
            placeholder="/updates/your-article-slug"
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold 
                            text-slate-600 block mb-1">
            Last Verified Date
          </label>
          <input type="date"
            value={values.last_verified}
            onChange={e => setValues(v => ({
              ...v, last_verified: e.target.value
            }))}
            className={inputClass} />
        </div>
        <div className="flex items-center gap-4 pt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox"
              checked={values.ccfs_eligible}
              onChange={e => setValues(v => ({
                ...v, ccfs_eligible: e.target.checked
              }))}
              className="accent-amber-400 w-4 h-4" />
            <span className="text-xs font-semibold 
                             text-slate-600">
              CCFS Eligible
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox"
              checked={values.is_active}
              onChange={e => setValues(v => ({
                ...v, is_active: e.target.checked
              }))}
              className="accent-green-500 w-4 h-4" />
            <span className="text-xs font-semibold 
                             text-slate-600">
              Active
            </span>
          </label>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold 
                          text-slate-600 block mb-1">
          Admin Notes (shown on form card)
        </label>
        <textarea
          value={values.notes}
          onChange={e => setValues(v => ({
            ...v, notes: e.target.value
          }))}
          rows={2}
          placeholder="e.g. Updated for CCFS 2026 — closing July 15"
          className={`${inputClass} resize-none`} />
      </div>
      <button
        onClick={() => onSave(values)}
        disabled={saving}
        className="bg-amber-400 hover:bg-amber-500 
                   text-slate-900 font-bold px-6 py-2.5 
                   rounded-xl text-sm 
                   disabled:opacity-50">
        {saving ? 'Saving...' : '✅ Save Changes'}
      </button>
    </div>
  )
}
