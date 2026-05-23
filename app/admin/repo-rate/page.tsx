'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Landmark, Loader2, Minus, Save } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface RateEntry {
  id: string
  repo_rate: string
  sdf_rate: string
  msf_rate: string
  stance: string
  meeting_name: string
  meeting_date: string
  change_amount: string
  change_direction: string
}

export default function AdminRepoRatePage() {
  const { showToast } = useToast()
  const [history, setHistory] = useState<RateEntry[]>([])
  const [currentRate, setCurrentRate] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    repo_rate: '',
    sdf_rate: '',
    msf_rate: '',
    stance: 'Neutral',
    meeting_name: '',
    meeting_date: '',
    change_amount: '',
    change_direction: 'unchanged',
    next_mpc_date: '',
  })

  useEffect(() => {
    fetch('/api/admin/repo-rate')
      .then(r => r.json())
      .then(d => {
        setHistory(d.history || [])
        setCurrentRate(d.currentRate || {})
        setForm(prev => ({
          ...prev,
          repo_rate: d.currentRate?.current_repo_rate || '',
          sdf_rate: d.currentRate?.sdf_rate || '',
          msf_rate: d.currentRate?.msf_rate || '',
          stance: d.currentRate?.mpc_stance || 'Neutral',
          next_mpc_date: d.currentRate?.next_mpc_date || '',
        }))
        setLoading(false)
      })
  }, [])

  async function handleSaveNewRate() {
    if (!form.repo_rate || !form.meeting_name || !form.meeting_date) {
      showToast('Repo Rate, Meeting Name and Meeting Date are required fields.', 'error')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/repo-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_current_rate', ...form }),
    })
    if (res.ok) {
      setSaved(true)
      showToast('MPC decision saved and live page updated!', 'success')
      setTimeout(() => setSaved(false), 3000)
      // Refresh history
      const d = await fetch('/api/admin/repo-rate').then(r => r.json())
      setHistory(d.history || [])
    } else {
      showToast('Failed to save MPC decision.', 'error')
    }
    setSaving(false)
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm('Delete this history entry?')) return
    const res = await fetch('/api/admin/repo-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_history_entry', id }),
    })
    if (res.ok) {
      showToast('History entry deleted successfully.', 'success')
      setHistory(prev => prev.filter(e => e.id !== id))
    } else {
      showToast('Failed to delete history entry.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-gold" aria-hidden />
        <p className="text-sm font-medium">Loading repo rate data…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl content-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy flex items-center gap-2">
          <Landmark className="w-7 h-7 text-blue-700" aria-hidden />
          RBI repo rate
        </h1>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          Record each MPC outcome. The public repo-rate page and history update together.
        </p>
      </div>

      {/* CURRENT RATE DISPLAY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Repo Rate', value: currentRate.current_repo_rate || '—', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'SDF Rate', value: currentRate.sdf_rate || '—', color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'MSF / Bank Rate', value: currentRate.msf_rate || '—', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'Stance', value: currentRate.mpc_stance || '—', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map(stat => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 text-center shadow-card ring-1 ring-slate-900/[0.02] ${stat.color}`}
          >
            <div className="text-2xl font-heading font-bold">{stat.value}</div>
            <div className="text-xs font-semibold mt-1 opacity-85">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* UPDATE RATE FORM */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-card ring-1 ring-slate-900/[0.02]">
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-4">
          <h2 className="font-heading font-bold text-navy">Record MPC decision</h2>
          <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
            Saves current settings to the live page and appends this meeting to history.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">New Repo Rate *</label>
            <input type="text" value={form.repo_rate}
              onChange={e => setForm(p => ({ ...p, repo_rate: e.target.value }))}
              placeholder="e.g. 5.00%"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">SDF Rate</label>
            <input type="text" value={form.sdf_rate}
              onChange={e => setForm(p => ({ ...p, sdf_rate: e.target.value }))}
              placeholder="e.g. 4.75%"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">MSF / Bank Rate</label>
            <input type="text" value={form.msf_rate}
              onChange={e => setForm(p => ({ ...p, msf_rate: e.target.value }))}
              placeholder="e.g. 5.25%"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Policy Stance</label>
            <select value={form.stance}
              onChange={e => setForm(p => ({ ...p, stance: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option>Neutral</option>
              <option>Accommodative</option>
              <option>Withdrawal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">MPC Meeting Name *</label>
            <input type="text" value={form.meeting_name}
              onChange={e => setForm(p => ({ ...p, meeting_name: e.target.value }))}
              placeholder="e.g. June 2026 (61st MPC)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Meeting Date *</label>
            <input type="date" value={form.meeting_date}
              onChange={e => setForm(p => ({ ...p, meeting_date: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Rate Change</label>
            <div className="flex gap-2">
              <select value={form.change_direction}
                onChange={e => setForm(p => ({ ...p, change_direction: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="unchanged">No Change</option>
                <option value="cut">Rate Cut</option>
                <option value="hike">Rate Hike</option>
              </select>
              <input type="text" value={form.change_amount}
                onChange={e => setForm(p => ({ ...p, change_amount: e.target.value }))}
                placeholder="e.g. -0.25%"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Next MPC Meeting Date</label>
            <input type="text" value={form.next_mpc_date}
              onChange={e => setForm(p => ({ ...p, next_mpc_date: e.target.value }))}
              placeholder="e.g. August 5-7, 2026"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleSaveNewRate}
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm ${
              saved ? 'bg-emerald-600 text-white' : 'bg-gold hover:bg-amber-400 text-navy'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : saved ? (
              'Saved — live page updated'
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden />
                Save MPC decision
              </>
            )}
          </button>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-card ring-1 ring-slate-900/[0.02]">
        <div className="bg-slate-50/95 border-b border-slate-200 px-6 py-4">
          <h2 className="font-heading font-bold text-navy">Rate history ({history.length})</h2>
          <p className="text-xs text-slate-500 mt-1">All entries are shown on the public /rbi/repo-rate page</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-navy">Meeting</th>
                <th className="text-center px-4 py-3 font-semibold text-navy">Repo Rate</th>
                <th className="text-center px-4 py-3 font-semibold text-navy">Change</th>
                <th className="text-left px-4 py-3 font-semibold text-navy">Stance</th>
                <th className="text-center px-4 py-3 font-semibold text-navy">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, i) => (
                <tr key={entry.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-navy">{entry.meeting_name}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{entry.repo_rate}</td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    <span className="inline-flex items-center justify-center gap-1">
                      {entry.change_direction === 'cut' ? (
                        <ArrowDown className="w-4 h-4 text-emerald-600" aria-hidden />
                      ) : entry.change_direction === 'hike' ? (
                        <ArrowUp className="w-4 h-4 text-red-600" aria-hidden />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-400" aria-hidden />
                      )}
                      <span>{entry.change_amount}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{entry.stance}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
