'use client'

import React, { useState, useEffect } from 'react'
import {
  Loader2,
  RefreshCw,
  Clock,
  Cpu,
  FileText,
  Users,
  ShieldAlert,
  Save,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Overview {
  dailyTokensConsumed: number
  dailyTokenQuota: number
  remainingTokens: number
  refreshTimeSeconds: number
  docsTodayCount: number
  aiDocsTodayCount: number
  standardDocsTodayCount: number
}

interface LastGen {
  template_name: string
  created_at: string
  total_tokens: number
  generation_type: string
}

interface ClientStat {
  ip: string
  count: number
  tokens: number
}

interface TemplateStat {
  name: string
  count: number
}

interface Settings {
  maxRequests: string
  maxTokens: string
  whitelistedIps: string
}

export default function DocumentAnalyticsPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [overview, setOverview] = useState<Overview | null>(null)
  const [lastGen, setLastGen] = useState<LastGen | null>(null)
  const [topClients, setTopClients] = useState<ClientStat[]>([])
  const [topTemplates, setTopTemplates] = useState<TemplateStat[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Settings editing state
  const [maxRequests, setMaxRequests] = useState('50')
  const [maxTokens, setMaxTokens] = useState('100000')
  const [whitelistedIps, setWhitelistedIps] = useState('127.0.0.1')
  const [savingSettings, setSavingSettings] = useState(false)

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError('')
    try {
      const res = await fetch('/api/admin/documents/analytics')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load document analytics')
        showToast(data.error || 'Failed to load analytics', 'error')
      } else {
        setOverview(data.overview)
        setLastGen(data.lastGeneration)
        setTopClients(data.topClients || [])
        setTopTemplates(data.topTemplates || [])
        setTimeLeft(data.overview.refreshTimeSeconds)
        
        // Populate settings inputs
        if (data.settings) {
          setMaxRequests(data.settings.maxRequests)
          setMaxTokens(data.settings.maxTokens)
          setWhitelistedIps(data.settings.whitelistedIps)
        }
      }
    } catch (err) {
      console.error(err)
      setError('Connection error')
      showToast('Failed to connect to API', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Poll every 60 seconds
    const interval = setInterval(() => fetchData(true), 60000)
    return () => clearInterval(interval)
  }, [])

  // Client-side timer countdown
  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)

    try {
      const payloads = [
        { key: 'max_requests_per_ip_daily', value: maxRequests },
        { key: 'max_tokens_per_ip_daily', value: maxTokens },
        { key: 'whitelisted_ips', value: whitelistedIps }
      ]

      // Save each setting to the admin settings endpoint
      const promises = payloads.map(payload =>
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )

      const results = await Promise.all(promises)
      const allOk = results.every(res => res.ok)

      if (allOk) {
        showToast('IP rate-limiting settings saved successfully', 'success')
      } else {
        showToast('Failed to save some rate-limiting settings', 'error')
      }
    } catch (err) {
      showToast('Error saving rate-limiting settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Loading document analytics...</p>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="p-6 text-red-500 font-medium admin-card border border-red-500/20 bg-red-500/[0.02]">
        <h2 className="text-lg font-bold mb-2">Error Loading Analytics</h2>
        <p>{error || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => fetchData()}
          className="mt-4 inline-flex items-center gap-2 bg-slate-100 border border-white/60 text-slate-800 px-4 py-2 rounded-lg text-sm hover:bg-slate-100"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const pct = Math.min(100, Math.round((overview.dailyTokensConsumed / overview.dailyTokenQuota) * 100))

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Document Generation & Token Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track real-time AI quota usage, client requests, rate-limiting, and whitelist configurations.
          </p>
        </div>
        
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-850 text-slate-800 px-4 py-2 rounded-xl text-sm transition-all focus:outline-none disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Primary Quota Gauge */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-500" />
              Daily Gemini API Quota Usage
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reflects the accumulated prompt + completion tokens used by AI models today.
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatINR(overview.dailyTokensConsumed)}
            </span>
            <span className="text-xs text-slate-500 ml-1">
              / {formatINR(overview.dailyTokenQuota)} tokens ({pct}%)
            </span>
          </div>
        </div>

        {/* Progress gauge with ARIA */}
        <div className="space-y-1">
          <progress
            value={overview.dailyTokensConsumed}
            max={overview.dailyTokenQuota}
            className="w-full h-3 rounded-full overflow-hidden bg-slate-50 appearance-none [&::-webkit-progress-bar]:bg-slate-50 [&::-webkit-progress-value]:bg-amber-400 [&::-moz-progress-bar]:bg-amber-400"
            role="progressbar"
            aria-valuenow={overview.dailyTokensConsumed}
            aria-valuemin={0}
            aria-valuemax={overview.dailyTokenQuota}
            aria-label="Daily token usage"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-850">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Remaining Tokens</span>
            <p className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
              {formatINR(overview.remainingTokens)}
            </p>
          </div>
          
          <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-850 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Quota Refresh In</span>
              <Clock className="w-3.5 h-3.5 text-amber-500/80" />
            </div>
            <p className="text-lg font-bold text-amber-400 mt-1 font-mono tabular-nums">
              {timeLeft !== null && timeLeft > 0 ? formatTime(timeLeft) : '00:00:00'}
            </p>
          </div>

          <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-850">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Generations</span>
            <p className="text-lg font-bold text-blue-400 mt-1 tabular-nums">
              {overview.aiDocsTodayCount}
            </p>
          </div>

          <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-850">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Standard Substitution</span>
            <p className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
              {overview.standardDocsTodayCount}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Last Generation + Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Last Generation */}
        <div className="lg:col-span-5 admin-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Latest Generation Activity
            </h3>
            
            {lastGen ? (
              <div className="space-y-4">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-850 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Document Template</span>
                    <span className="text-sm font-semibold text-slate-800">{lastGen.template_name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Method</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border mt-0.5 ${
                        lastGen.generation_type === 'ai' 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {lastGen.generation_type}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tokens Used</span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {lastGen.generation_type === 'ai' ? formatINR(lastGen.total_tokens) : '0 (Substitute)'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Timestamp</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(lastGen.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/30 border border-dashed border-slate-850 rounded-xl p-8 text-center text-slate-500 text-xs">
                No document generations logged yet.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850 text-xs text-slate-500">
            * Standard substitutions bypass key limit checks and consume 0 tokens.
          </div>
        </div>

        {/* Right Side: Rate Limit Settings */}
        <div className="lg:col-span-7 admin-card p-6">
          <h3 className="text-base font-bold font-heading text-slate-900 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            IP Rate-Limiting & Whitelist
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Configure default request limits per IP to protect your rotated developer keys from quota abuse.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-350 mb-1.5">
                  Max AI Requests Per IP / Daily
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={maxRequests}
                  onChange={e => setMaxRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-350 mb-1.5">
                  Max AI Tokens Per IP / Daily
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={maxTokens}
                  onChange={e => setMaxTokens(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-350 mb-1.5 flex items-center gap-1">
                Whitelisted Testing IPs
                <span className="text-[10px] text-slate-500 font-normal uppercase">(exempt from rate limits)</span>
              </label>
              <input
                type="text"
                value={whitelistedIps}
                onChange={e => setWhitelistedIps(e.target.value)}
                placeholder="e.g. 127.0.0.1, 192.168.1.100"
                className="w-full px-3 py-2 bg-slate-50 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed">
                Provide a comma-separated list of client IP addresses. Useful for staging/verification tests.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-1.5 btn-vibrant-amber text-white font-bold px-4 py-2 rounded-lg text-xs shadow-md transition-all disabled:opacity-60"
              >
                {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Aggregate Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Top Clients */}
        <div className="admin-card p-6">
          <h3 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            Top Active Clients (IP Addresses)
          </h3>
          
          {topClients.length === 0 ? (
            <div className="bg-slate-50/30 border border-dashed border-slate-850 rounded-xl p-8 text-center text-slate-500 text-xs">
              No client logs found.
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-850 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-850 text-slate-500 font-bold">
                    <th className="p-3">Client IP</th>
                    <th className="p-3">Total Generates</th>
                    <th className="p-3 text-right">Tokens Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {topClients.map(client => (
                    <tr key={client.ip} className="hover:bg-slate-100/40">
                      <td className="p-3 font-mono text-slate-700">
                        {client.ip}
                        {whitelistedIps.split(',').map(s=>s.trim()).includes(client.ip) && (
                          <span className="ml-2 bg-emerald-950/50 text-emerald-400 border border-emerald-800/20 text-[9px] px-1.5 py-0.5 rounded font-sans font-bold">
                            Whitelist
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-350">{client.count} times</td>
                      <td className="p-3 text-slate-800 text-right font-bold tabular-nums">
                        {formatINR(client.tokens)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Templates */}
        <div className="admin-card p-6">
          <h3 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-500" />
            Most Popular Document Templates
          </h3>
          
          {topTemplates.length === 0 ? (
            <div className="bg-slate-50/30 border border-dashed border-slate-850 rounded-xl p-8 text-center text-slate-500 text-xs">
              No document templates generated yet.
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-850 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-850 text-slate-500 font-bold">
                    <th className="p-3">Template Name</th>
                    <th className="p-3 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {topTemplates.map(tpl => (
                    <tr key={tpl.name} className="hover:bg-slate-100/40">
                      <td className="p-3 text-slate-700 font-medium">{tpl.name}</td>
                      <td className="p-3 text-slate-800 text-right font-bold tabular-nums">
                        {tpl.count} drafts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
