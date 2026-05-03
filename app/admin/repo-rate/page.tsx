'use client'

import { useEffect, useState } from 'react'

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
      alert('Repo Rate, Meeting Name and Meeting Date are required')
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
      setTimeout(() => setSaved(false), 3000)
      // Refresh history
      const d = await fetch('/api/admin/repo-rate').then(r => r.json())
      setHistory(d.history || [])
    }
    setSaving(false)
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm('Delete this history entry?')) return
    await fetch('/api/admin/repo-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_history_entry', id }),
    })
    setHistory(prev => prev.filter(e => e.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-slate-400 animate-pulse">Loading repo rate data...</div>
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-navy">🏦 RBI Repo Rate Manager</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update current repo rate after each MPC meeting. Old rate automatically saves to history.
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
          <div key={stat.label} className={`rounded-xl border p-4 text-center ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* UPDATE RATE FORM */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <h2 className="font-bold text-navy">📥 Record New MPC Decision</h2>
          <p className="text-xs text-amber-700 mt-1">Fill this after every RBI MPC meeting. This will update the live page AND save to history automatically.</p>
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
          <button onClick={handleSaveNewRate} disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-colors ${
              saved ? 'bg-green-500 text-white' : 'bg-amber-400 hover:bg-amber-500 text-navy'
            }`}>
            {saving ? 'Saving...' : saved ? '✓ Saved! Live page updated + history recorded' : '💾 Save New MPC Decision'}
          </button>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="font-bold text-navy">📋 Rate History ({history.length} entries)</h2>
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
                    {entry.change_direction === 'cut' ? '⬇️' : entry.change_direction === 'hike' ? '⬆️' : '⏸'} {entry.change_amount}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{entry.stance}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium">
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
