'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'
import { useToast } from '@/components/Toast'

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
  const { showToast } = useToast()
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
      showToast('Please provide a reason for rejection.', 'error')
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
        showToast(action === 'approve' ? 'Suggestion approved successfully!' : 'Suggestion rejected.', 'success')
        setExpanded(null)
        setEditingApproval(null)
        setAdminNote('')
        await loadSuggestions()
      } else {
        showToast('Failed to update suggestion.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
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
      tab === t ? 'bg-gold text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
    }`

  const typeLabel = (type: string) => {
    if (type === 'new_entry')    return '➕ New Entry'
    if (type === 'error_report') return '⚠️ Error Report'
    return '📝 Update Request'
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
      live:     'bg-green-500/10 text-green-400 border border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
    }
    return `text-xs px-2.5 py-0.5 rounded-full font-semibold border ${map[status] || 'bg-slate-800 text-slate-400 border-slate-750'}`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Community Suggestions</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review and approve user-submitted compliance suggestions
          </p>
        </div>
        <Link
          href="/admin/compliance"
          className="border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm bg-slate-900 hover:bg-slate-800 hover:text-white transition-colors"
        >
          ← Back to Entries
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-950 p-1 border border-slate-800 rounded-xl w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as TabFilter[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tabClass(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                t === 'pending' ? 'bg-red-500 text-white' : 'bg-slate-850 text-slate-350 border border-slate-750'
              }`}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading suggestions...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-card overflow-hidden">
          <EmptyState
            icon={tab === 'pending' ? '✅' : tab === 'approved' ? '👍' : tab === 'rejected' ? '❌' : '📋'}
            title={tab === 'pending' ? 'No pending suggestions' : `No ${tab} suggestions`}
            description={tab === 'pending' ? 'All community suggestions have been reviewed. Great work!' : `No suggestions currently match the "${tab}" filter status.`}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">

              {/* Row summary */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-850/60 transition-colors"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-slate-200">
                    {typeLabel(s.suggestion_type)}
                  </span>
                  {s.form_name && (
                    <span className="font-mono text-xs bg-slate-950 px-2 py-1 rounded text-slate-200 border border-slate-800 font-bold">
                      {s.form_name}
                    </span>
                  )}
                  {s.compliance_entries && (
                    <span className="text-xs text-slate-400">
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
                <div className="border-t border-slate-800/80 p-4 space-y-4 bg-slate-950/20">

                  {/* Submitter info */}
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs">Name</span>
                      <div className="font-semibold text-slate-200">{s.user_name || 'Anonymous'}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Profession</span>
                      <div className="font-semibold text-slate-200">{s.user_profession || '—'}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Email</span>
                      <div className="text-slate-300">{s.user_email}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">City</span>
                      <div className="text-slate-300">{s.user_city || '—'}</div>
                    </div>
                    {s.user_linkedin && (
                      <div className="col-span-2">
                        <span className="text-slate-500 text-xs">LinkedIn</span>
                        <div>
                          <a
                            href={s.user_linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline break-all"
                          >
                            {s.user_linkedin}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error report content */}
                  {s.suggestion_type === 'error_report' && (
                    <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 space-y-2 text-sm">
                      <div>
                        <span className="text-red-400/80 text-xs font-semibold uppercase">Field with error</span>
                        <div className="font-bold text-red-300">{s.error_field || '—'}</div>
                      </div>
                      <div>
                        <span className="text-red-400/80 text-xs font-semibold uppercase">What is wrong</span>
                        <div className="text-red-200">{s.error_description || '—'}</div>
                      </div>
                      <div>
                        <span className="text-red-400/80 text-xs font-semibold uppercase">Suggested correction</span>
                        <div className="text-red-100 font-semibold">{s.suggested_correction || '—'}</div>
                      </div>
                      {s.compliance_entries && (
                        <div className="mt-2 pt-2 border-t border-red-500/20">
                          <span className="text-red-400/60 text-xs">Affects entry:</span>
                          <div className="font-bold text-red-300">
                            {s.compliance_entries.form_name} — {s.compliance_entries.compliance_title}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* New entry content */}
                  {s.suggestion_type === 'new_entry' && (
                    <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-emerald-450 text-xs uppercase font-semibold">Regulator</span>
                          <div className="font-bold text-emerald-300">{s.regulator?.toUpperCase()}</div>
                        </div>
                        <div>
                          <span className="text-emerald-450 text-xs uppercase font-semibold">Form</span>
                          <div className="font-bold text-emerald-300">{s.form_name}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-emerald-450 text-xs uppercase font-semibold">Title</span>
                          <div className="text-slate-200">{s.compliance_title}</div>
                        </div>
                        <div>
                          <span className="text-emerald-450 text-xs uppercase font-semibold">Due Date</span>
                          <div className="text-slate-200">{s.due_date}</div>
                        </div>
                        <div>
                          <span className="text-emerald-450 text-xs uppercase font-semibold">Penalty</span>
                          <div className="text-slate-200">{s.penalty || '—'}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-emerald-450 text-xs uppercase font-semibold">Applicable To</span>
                          <div className="text-slate-200">{s.applicable_to}</div>
                        </div>
                        {s.regulation_reference && (
                          <div className="col-span-2">
                            <span className="text-emerald-450 text-xs uppercase font-semibold">Regulation</span>
                            <div className="text-slate-200">{s.regulation_reference}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin actions — pending only */}
                  {s.status === 'pending' && (
                    <div className="space-y-3">
                      {s.suggestion_type === 'new_entry' && editingApproval === s.id && (
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 space-y-3">
                          <h4 className="font-bold text-amber-400 text-sm">Preview & Edit before adding to Calendar</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-400">Regulator</label>
                              <select value={approvalForm.regulator}
                                onChange={e => setApprovalForm(p => ({ ...p, regulator: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500">
                                <option value="mca" className="bg-slate-900">MCA</option>
                                <option value="sebi" className="bg-slate-900">SEBI</option>
                                <option value="rbi" className="bg-slate-900">RBI</option>
                                <option value="fema" className="bg-slate-900">FEMA</option>
                                <option value="income_tax" className="bg-slate-900">Income Tax</option>
                                <option value="gst" className="bg-slate-900">GST</option>
                                <option value="labor_law" className="bg-slate-900">Labor Law</option>
                                <option value="nclt" className="bg-slate-900">NCLT</option>
                                <option value="other" className="bg-slate-900">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Form Name</label>
                              <input value={approvalForm.form_name}
                                onChange={e => setApprovalForm(p => ({ ...p, form_name: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-slate-400">Title</label>
                              <input value={approvalForm.compliance_title}
                                onChange={e => setApprovalForm(p => ({ ...p, compliance_title: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Due Date</label>
                              <input value={approvalForm.due_date}
                                onChange={e => setApprovalForm(p => ({ ...p, due_date: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Frequency</label>
                              <select value={approvalForm.frequency || 'annual'}
                                onChange={e => setApprovalForm(p => ({ ...p, frequency: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500">
                                {FREQUENCIES.map(f => (
                                  <option key={f.value} value={f.value} className="bg-slate-900">{f.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-slate-400">Applicable To</label>
                              <input value={approvalForm.applicable_to}
                                onChange={e => setApprovalForm(p => ({ ...p, applicable_to: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Penalty</label>
                              <input value={approvalForm.penalty}
                                onChange={e => setApprovalForm(p => ({ ...p, penalty: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Regulation Reference</label>
                              <input value={approvalForm.regulation_reference}
                                onChange={e => setApprovalForm(p => ({ ...p, regulation_reference: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Official Link</label>
                              <input value={approvalForm.official_link || ''}
                                onChange={e => setApprovalForm(p => ({ ...p, official_link: e.target.value }))}
                                placeholder="https://mca.gov.in/..."
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-slate-400">Description (optional)</label>
                              <textarea rows={2} value={approvalForm.description || ''}
                                onChange={e => setApprovalForm(p => ({ ...p, description: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1.5 text-sm mt-0.5 focus:ring-1 focus:ring-amber-500" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-350 mb-1">
                          Admin Note
                          <span className="text-slate-500 font-normal ml-1">(required for rejection)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          placeholder="Optional note for approval, required for rejection..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-600"
                        />
                      </div>
                      <div className="flex gap-3">
                        {s.suggestion_type === 'new_entry' && editingApproval !== s.id ? (
                          <button
                            onClick={() => startApproval(s)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-colors"
                          >
                            ✅ Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(s.id, 'approve', s.suggestion_type === 'new_entry' ? approvalForm : null)}
                            disabled={processing === s.id}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                          >
                            {processing === s.id ? 'Adding to Calendar...' : editingApproval === s.id ? '✅ Confirm — Add to Live Calendar' : '✅ Approve'}
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(s.id, 'reject')}
                          disabled={processing === s.id}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                        >
                          {processing === s.id ? 'Processing...' : '❌ Reject'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reviewed state */}
                  {s.status !== 'pending' && s.admin_note && (
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Admin Note</span>
                      <div className="text-slate-350 mt-1">{s.admin_note}</div>
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
