'use client'

import { useState, useEffect } from 'react'
import { Bell, Send, CheckCircle2, AlertCircle, RefreshCw, Users, ShieldCheck, Zap } from 'lucide-react'

export default function AdminPushNotificationsPage() {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Form State
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/updates')
  const [category, setCategory] = useState('all')

  // Status State
  const [sending, setSending] = useState(false)
  const [testSending, setTestSending] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
    sentCount?: number
    totalTargeted?: number
    failedCount?: number
    prunedCount?: number
    message?: string
  } | null>(null)

  async function fetchStats() {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/admin/push-stats')
      if (res.ok) {
        const data = await res.json()
        setSubscriberCount(data.totalSubscribers || 0)
      } else {
        setSubscriberCount(0)
      }
    } catch {
      setSubscriberCount(0)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  async function handleSendPush(isTest = false) {
    if (!title.trim()) return

    if (isTest) setTestSending(true)
    else setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          url,
          category,
          testOnly: isTest,
        }),
      })

      const data = await res.json()
      setResult(data)
      if (data.success) {
        fetchStats()
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to dispatch push notification' })
    } finally {
      setSending(false)
      setTestSending(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Bell className="w-4 h-4" /> Web Push Control Center
          </p>
          <h1 className="text-2xl font-bold font-heading text-navy dark:text-white mt-1">
            Browser Push Broadcast Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Send real-time browser notifications directly to subscribed legal professionals & executives.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loadingStats}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} /> Refresh Subscriber Count
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Active Subscribers</p>
            <p className="text-2xl font-bold font-heading text-navy dark:text-white mt-0.5">
              {loadingStats ? '...' : subscriberCount?.toLocaleString('en-IN') || 0}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Payload Security</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              VAPID Signed & 4KB Guard
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Delivery Concurrency</p>
            <p className="text-sm font-semibold text-navy dark:text-white mt-1">
              Chunked Batching (50/batch)
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md">
        <h2 className="text-lg font-bold font-heading text-navy dark:text-white mb-5">
          Dispatch New Web Push Broadcast
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); handleSendPush(false) }} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notification Title <span className="text-red-500">*</span> (Max 120 chars)
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. New MCA Circular: Companies Amendment Rules 2026 Issued"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Message Body / Brief Summary (Max 240 chars)
            </label>
            <textarea
              rows={3}
              maxLength={240}
              placeholder="Brief executive summary of the circular or judgment..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Destination Article URL
              </label>
              <input
                type="text"
                placeholder="/updates/mca-companies-rules-2026"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Target Regulator Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">All Subscribers</option>
                <option value="mca">MCA Updates Only</option>
                <option value="sebi">SEBI Circulars Only</option>
                <option value="rbi">RBI Notifications Only</option>
                <option value="nclt">NCLT Orders Only</option>
                <option value="ibc">IBC Updates Only</option>
                <option value="fema">FEMA Guidelines Only</option>
              </select>
            </div>
          </div>

          {/* Result Alert */}
          {result && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                result.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}
            >
              {result.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
              <div className="space-y-1">
                {result.success ? (
                  <>
                    <p className="font-bold text-sm">Push Broadcast Dispatched Successfully!</p>
                    <p>
                      Sent: <strong className="font-mono">{result.sentCount}</strong> / {result.totalTargeted} targeted subscribers.
                    </p>
                    {result.prunedCount ? (
                      <p className="text-slate-500">
                        Pruned {result.prunedCount} stale/revoked subscriber endpoint(s) (410/404).
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="font-bold">{result.error || 'Failed to dispatch push notification.'}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSendPush(true)}
              disabled={testSending || sending || !title.trim()}
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center justify-center gap-2"
            >
              {testSending ? 'Sending Test...' : 'Send Test Notification'}
            </button>

            <button
              type="submit"
              disabled={sending || testSending || !title.trim()}
              className="flex-1 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-white shadow-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Broadcasting Push Notifications...' : 'Broadcast Push Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
