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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" aria-hidden />
        <p className="text-sm font-medium">Loading repo rate data…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl content-fade-in text-slate-200">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-white flex items-center gap-2">
          <Landmark className="w-7 h-7 text-blue-400" aria-hidden />
          RBI Repo Rate Recorder
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Record each MPC outcome. The public repo-rate page and history update together.
        </p>
      </div>

      {/* CURRENT RATE DISPLAY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Repo Rate', value: currentRate.current_repo_rate || '—', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { label: 'SDF Rate', value: currentRate.sdf_rate || '—', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
          { label: 'MSF / Bank Rate', value: currentRate.msf_rate || '—', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
          { label: 'Stance', value: currentRate.mpc_stance || '—', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
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
      <div className="admin-card overflow-hidden">
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-4">
          <h2 className="font-heading font-bold text-white">Record MPC Decision</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Saves current settings to the live page and appends this meeting to history.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">New Repo Rate *</label>
            <input type="text" value={form.repo_rate}
              onChange={e => setForm(p => ({ ...p, repo_rate: e.target.value }))}
              placeholder="e.g. 5.00%"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">SDF Rate</label>
            <input type="text" value={form.sdf_rate}
              onChange={e => setForm(p => ({ ...p, sdf_rate: e.target.value }))}
              placeholder="e.g. 4.75%"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">MSF / Bank Rate</label>
            <input type="text" value={form.msf_rate}
              onChange={e => setForm(p => ({ ...p, msf_rate: e.target.value }))}
              placeholder="e.g. 5.25%"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Policy Stance</label>
            <select value={form.stance}
              onChange={e => setForm(p => ({ ...p, stance: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white">
              <option className="bg-slate-900 text-white">Neutral</option>
              <option className="bg-slate-900 text-white">Accommodative</option>
              <option className="bg-slate-900 text-white">Withdrawal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">MPC Meeting Name *</label>
            <input type="text" value={form.meeting_name}
              onChange={e => setForm(p => ({ ...p, meeting_name: e.target.value }))}
              placeholder="e.g. June 2026 (61st MPC)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Meeting Date *</label>
            <input type="date" value={form.meeting_date}
              onChange={e => setForm(p => ({ ...p, meeting_date: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Rate Change</label>
            <div className="flex gap-2">
              <select value={form.change_direction}
                onChange={e => setForm(p => ({ ...p, change_direction: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white">
                <option className="bg-slate-900 text-white" value="unchanged">No Change</option>
                <option className="bg-slate-900 text-white" value="cut">Rate Cut</option>
                <option className="bg-slate-900 text-white" value="hike">Rate Hike</option>
              </select>
              <input type="text" value={form.change_amount}
                onChange={e => setForm(p => ({ ...p, change_amount: e.target.value }))}
                placeholder="e.g. -0.25%"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Next MPC Meeting Date</label>
            <input type="text" value={form.next_mpc_date}
              onChange={e => setForm(p => ({ ...p, next_mpc_date: e.target.value }))}
              placeholder="e.g. August 5-7, 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-white" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleSaveNewRate}
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-md ${
              saved ? 'bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10'
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
                Save MPC Decision
              </>
            )}
          </button>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="admin-card overflow-hidden">
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-4">
          <h2 className="font-heading font-bold text-white">Rate History ({history.length})</h2>
          <p className="text-xs text-slate-400 mt-1">All entries are shown on the public /rbi/repo-rate page</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Meeting</th>
                <th className="text-center px-4 py-3">Repo Rate</th>
                <th className="text-center px-4 py-3">Change</th>
                <th className="px-4 py-3">Stance</th>
                <th className="text-center px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {history.map((entry, i) => (
                <tr key={entry.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-200">{entry.meeting_name}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-400">{entry.repo_rate}</td>
                  <td className="px-4 py-3 text-center text-slate-300">
                    <span className="inline-flex items-center justify-center gap-1 font-semibold">
                      {entry.change_direction === 'cut' ? (
                        <ArrowDown className="w-4 h-4 text-emerald-400" aria-hidden />
                      ) : entry.change_direction === 'hike' ? (
                        <ArrowUp className="w-4 h-4 text-rose-400" aria-hidden />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-500" aria-hidden />
                      )}
                      <span>{entry.change_amount}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{entry.stance}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-rose-400 hover:text-rose-350 text-xs font-bold transition-colors"
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
