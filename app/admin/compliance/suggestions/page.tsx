'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

interface Suggestion {
  id: string
  suggestion_type: 'new_entry' | 'error_report' | 'update_request'
  status: 'pending' | 'approved' | 'rejected' | 'live'
  user_name: string | null
  user_email: string
  user_profession: string | null
  user_city: string | null
  user_linkedin: string | null
  regulator: string | null
  form_name: string | null
  compliance_title: string | null
  due_date: string | null
  applicable_to: string | null
  penalty: string | null
  regulation_reference: string | null
  error_field: string | null
  error_description: string | null
  suggested_correction: string | null
  frequency: string | null
  admin_note: string | null
  reviewed_at: string | null
  created_at: string
  compliance_entries: {
    form_name: string
    compliance_title: string
    regulator: string
  } | null
}

type TabFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabFilter>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [editingApproval, setEditingApproval] = useState<string | null>(null)
  const [approvalForm, setApprovalForm] = useState({
    regulator: 'mca',
    form_name: '',
    compliance_title: '',
    due_date: '',
    applicable_to: '',
    penalty: '',
    regulation_reference: '',
    frequency: 'annual',
    official_link: '',
    description: '',
  })

  async function loadSuggestions() {
    setLoading(true)
    const res = await fetch('/api/admin/compliance/suggestions')
    const data = await res.json()
    setSuggestions(data.suggestions || [])
    setLoading(false)
  }

  useEffect(() => {
    loadSuggestions()
  }, [])

  const counts = {
    all:      suggestions.length,
    pending:  suggestions.filter(s => s.status === 'pending').length,
    approved: suggestions.filter(s => s.status === 'approved' || s.status === 'live').length,
    rejected: suggestions.filter(s => s.status === 'rejected').length,
  }

  const filtered = suggestions.filter(s => {
    if (tab === 'all')      return true
    if (tab === 'pending')  return s.status === 'pending'
    if (tab === 'approved') return s.status === 'approved' || s.status === 'live'
    if (tab === 'rejected') return s.status === 'rejected'
    return true
  })

  async function handleAction(id: string, action: 'approve' | 'reject', override_data?: Record<string, unknown> | null) {
    if (action === 'reject' && !adminNote.trim()) {
      alert('Please provide a reason for rejection.')
      return
    }
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/compliance/suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          admin_note: adminNote || null,
          override_data: override_data || null
        }),
      })
      if (res.ok) {
        setExpanded(null)
        setEditingApproval(null)
        setAdminNote('')
        await loadSuggestions()
      }
    } finally {
      setProcessing(null)
    }
  }

  function startApproval(s: Suggestion) {
    setEditingApproval(s.id)
    setApprovalForm({
      regulator: s.regulator || 'mca',
      form_name: s.form_name || '',
      compliance_title: s.compliance_title || '',
      due_date: s.due_date || '',
      applicable_to: s.applicable_to || '',
      penalty: s.penalty || '',
      regulation_reference: s.regulation_reference || '',
      frequency: s.frequency || 'annual',
      official_link: '',
      description: '',
    })
  }

  const tabClass = (t: TabFilter) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      tab === t ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100'
    }`

  const typeLabel = (type: string) => {
    if (type === 'new_entry')    return '➕ New Entry'
    if (type === 'error_report') return '⚠️ Error Report'
    return '📝 Update Request'
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending:  'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      live:     'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return `text-xs px-2 py-1 rounded-full font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Community Suggestions</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and approve user-submitted compliance suggestions
          </p>
        </div>
        <Link
          href="/admin/compliance"
          className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50"
        >
          ← Back to Entries
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-50 p-1 rounded-xl w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as TabFilter[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tabClass(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                t === 'pending' ? 'bg-red-500 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading suggestions...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No {tab === 'all' ? '' : tab} suggestions yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

              {/* Row summary */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-slate-700">
                    {typeLabel(s.suggestion_type)}
                  </span>
                  {s.form_name && (
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-navy font-bold">
                      {s.form_name}
                    </span>
                  )}
                  {s.compliance_entries && (
                    <span className="text-xs text-slate-500">
                      re: {s.compliance_entries.form_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-400">
                    {new Date(s.created_at).toLocaleDateString('en-IN')}
                  </span>
                  <span className={statusBadge(s.status)}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                  <span className="text-slate-400 text-sm">{expanded === s.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === s.id && (
                <div className="border-t border-slate-100 p-4 space-y-4">

                  {/* Submitter info */}
                  <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs">Name</span>
                      <div className="font-semibold text-navy">{s.user_name || 'Anonymous'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Profession</span>
                      <div className="font-semibold text-navy">{s.user_profession || '—'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Email</span>
                      <div className="text-slate-600">{s.user_email}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">City</span>
                      <div className="text-slate-600">{s.user_city || '—'}</div>
                    </div>
                    {s.user_linkedin && (
                      <div className="col-span-2">
                        <span className="text-slate-400 text-xs">LinkedIn</span>
                        <div>
                          <a
                            href={s.user_linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline break-all"
                          >
                            {s.user_linkedin}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error report content */}
                  {s.suggestion_type === 'error_report' && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-2 text-sm">
                      <div>
                        <span className="text-red-400 text-xs font-semibold uppercase">Field with error</span>
                        <div className="font-bold text-red-800">{s.error_field || '—'}</div>
                      </div>
                      <div>
                        <span className="text-red-400 text-xs font-semibold uppercase">What is wrong</span>
                        <div className="text-red-900">{s.error_description || '—'}</div>
                      </div>
                      <div>
                        <span className="text-red-400 text-xs font-semibold uppercase">Suggested correction</span>
                        <div className="text-red-900 font-semibold">{s.suggested_correction || '—'}</div>
                      </div>
                      {s.compliance_entries && (
                        <div className="mt-2 pt-2 border-t border-red-100">
                          <span className="text-red-400 text-xs">Affects entry:</span>
                          <div className="font-bold text-red-800">
                            {s.compliance_entries.form_name} — {s.compliance_entries.compliance_title}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* New entry content */}
                  {s.suggestion_type === 'new_entry' && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-green-500 text-xs uppercase font-semibold">Regulator</span>
                          <div className="font-bold text-green-900">{s.regulator?.toUpperCase()}</div>
                        </div>
                        <div>
                          <span className="text-green-500 text-xs uppercase font-semibold">Form</span>
                          <div className="font-bold text-green-900">{s.form_name}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-green-500 text-xs uppercase font-semibold">Title</span>
                          <div className="text-green-900">{s.compliance_title}</div>
                        </div>
                        <div>
                          <span className="text-green-500 text-xs uppercase font-semibold">Due Date</span>
                          <div className="text-green-900">{s.due_date}</div>
                        </div>
                        <div>
                          <span className="text-green-500 text-xs uppercase font-semibold">Penalty</span>
                          <div className="text-green-900">{s.penalty || '—'}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-green-500 text-xs uppercase font-semibold">Applicable To</span>
                          <div className="text-green-900">{s.applicable_to}</div>
                        </div>
                        {s.regulation_reference && (
                          <div className="col-span-2">
                            <span className="text-green-500 text-xs uppercase font-semibold">Regulation</span>
                            <div className="text-green-900">{s.regulation_reference}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin actions — pending only */}
                  {s.status === 'pending' && (
                    <div className="space-y-3">
                      {s.suggestion_type === 'new_entry' && editingApproval === s.id && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                          <h4 className="font-bold text-navy text-sm">Preview & Edit before adding to Calendar</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-500">Regulator</label>
                              <select value={approvalForm.regulator}
                                onChange={e => setApprovalForm(p => ({ ...p, regulator: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5">
                                <option value="mca">MCA</option>
                                <option value="sebi">SEBI</option>
                                <option value="rbi">RBI</option>
                                <option value="fema">FEMA</option>
                                <option value="income_tax">Income Tax</option>
                                <option value="gst">GST</option>
                                <option value="labor_law">Labor Law</option>
                                <option value="nclt">NCLT</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500">Form Name</label>
                              <input value={approvalForm.form_name}
                                onChange={e => setApprovalForm(p => ({ ...p, form_name: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-slate-500">Title</label>
                              <input value={approvalForm.compliance_title}
                                onChange={e => setApprovalForm(p => ({ ...p, compliance_title: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500">Due Date</label>
                              <input value={approvalForm.due_date}
                                onChange={e => setApprovalForm(p => ({ ...p, due_date: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500">Frequency</label>
                              <select value={approvalForm.frequency || 'annual'}
                                onChange={e => setApprovalForm(p => ({ ...p, frequency: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5">
                                {FREQUENCIES.map(f => (
                                  <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-slate-500">Applicable To</label>
                              <input value={approvalForm.applicable_to}
                                onChange={e => setApprovalForm(p => ({ ...p, applicable_to: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500">Penalty</label>
                              <input value={approvalForm.penalty}
                                onChange={e => setApprovalForm(p => ({ ...p, penalty: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500">Regulation Reference</label>
                              <input value={approvalForm.regulation_reference}
                                onChange={e => setApprovalForm(p => ({ ...p, regulation_reference: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500">Official Link</label>
                              <input value={approvalForm.official_link || ''}
                                onChange={e => setApprovalForm(p => ({ ...p, official_link: e.target.value }))}
                                placeholder="https://mca.gov.in/..."
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-slate-500">Description (optional)</label>
                              <textarea rows={2} value={approvalForm.description || ''}
                                onChange={e => setApprovalForm(p => ({ ...p, description: e.target.value }))}
                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mt-0.5" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Admin Note
                          <span className="text-slate-400 font-normal ml-1">(required for rejection)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          placeholder="Optional note for approval, required for rejection..."
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <div className="flex gap-3">
                        {s.suggestion_type === 'new_entry' && editingApproval !== s.id ? (
                          <button
                            onClick={() => startApproval(s)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm"
                          >
                            ✅ Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(s.id, 'approve', s.suggestion_type === 'new_entry' ? approvalForm : null)}
                            disabled={processing === s.id}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
                          >
                            {processing === s.id ? 'Adding to Calendar...' : editingApproval === s.id ? '✅ Confirm — Add to Live Calendar' : '✅ Approve'}
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(s.id, 'reject')}
                          disabled={processing === s.id}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
                        >
                          {processing === s.id ? 'Processing...' : '❌ Reject'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reviewed state */}
                  {s.status !== 'pending' && s.admin_note && (
                    <div className="bg-slate-50 rounded-lg p-3 text-sm">
                      <span className="text-slate-400 text-xs font-semibold uppercase">Admin Note</span>
                      <div className="text-slate-700 mt-1">{s.admin_note}</div>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
