'use client'

import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart2,
  ExternalLink,
  Globe,
  Landmark,
  Loader2,
  Megaphone,
  Search,
  Share2,
  Shield,
} from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Setting {
  key: string
  value: string | null
  label: string
  description: string
}

const settingGroups: { id: string; title: string; Icon: LucideIcon; keys: string[] }[] = [
  {
    id: 'social',
    title: 'Social Media & Channels',
    Icon: Share2,
    keys: ['whatsapp_channel', 'telegram_channel', 'linkedin_url', 'twitter_url', 'instagram_url'],
  },
  {
    id: 'site',
    title: 'Site Content Settings',
    Icon: Globe,
    keys: ['site_tagline', 'contact_email', 'newsletter_footer'],
  },
  {
    id: 'announcement',
    title: 'Announcement Bar Content',
    Icon: Megaphone,
    keys: ['announcement_bar', 'announcement_bar_url'],
  },
  {
    id: 'rbi',
    title: 'RBI Policy Rates Info',
    Icon: Landmark,
    keys: [
      'current_repo_rate',
      'current_repo_rate_date',
      'next_mpc_date',
      'mpc_stance',
      'sdf_rate',
      'msf_rate',
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & SEO Trackers',
    Icon: BarChart2,
    keys: ['google_analytics_id', 'microsoft_clarity_id', 'google_search_console'],
  },
  {
    id: 'rate_limiting',
    title: 'AI Usage & Rate Limits',
    Icon: Shield,
    keys: ['max_requests_per_ip_daily', 'max_tokens_per_ip_daily', 'whitelisted_ips'],
  },
]

const urlKeys = [
  'whatsapp_channel',
  'telegram_channel',
  'linkedin_url',
  'twitter_url',
  'instagram_url',
  'announcement_bar_url',
]

const textareaKeys = [
  'announcement_bar',
  'newsletter_footer',
  'site_tagline',
]

export default function SettingsPage() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<Record<string, Setting>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [indexNowLoading, setIndexNowLoading] = useState(false)
  const [indexNowResult, setIndexNowResult] = useState('')
  const [googleIndexingLoading, setGoogleIndexingLoading] = useState(false)
  const [googleIndexingResult, setGoogleIndexingResult] = useState('')
  const [googleTestUrl, setGoogleTestUrl] = useState('')
  const [googleTestLoading, setGoogleTestLoading] = useState(false)
  const [googleTestResult, setGoogleTestResult] = useState('')
  const [revalidateLoading, setRevalidateLoading] = useState(false)
  const [revalidateResult, setRevalidateResult] = useState('')

  async function handleIndexNowSubmit() {
    setIndexNowLoading(true)
    setIndexNowResult('')
    try {
      const res = await fetch(
        '/api/admin/indexnow',
        { method: 'POST' }
      )
      const data = await res.json()
      if (!res.ok) {
        setIndexNowResult(data.error || 'Request failed')
        showToast(data.error || 'IndexNow request failed', 'error')
        return
      }
      setIndexNowResult(
        `Submitted ${data.count} URLs successfully!`
      )
      showToast('URLs submitted to IndexNow', 'success')
    } catch {
      setIndexNowResult('Failed - check console')
      showToast('IndexNow submission failed', 'error')
    } finally {
      setIndexNowLoading(false)
    }
  }

  async function handleGoogleIndexingSubmit() {
    setGoogleIndexingLoading(true)
    setGoogleIndexingResult('')
    try {
      const res = await fetch('/api/admin/google-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setGoogleIndexingResult(data.error || 'Request failed')
        showToast(data.error || 'Google Indexing request failed', 'error')
        return
      }
      setGoogleIndexingResult(
        `Submitted ${data.successCount} of ${data.count} URLs to Googlebot (${data.webSubPinged ? 'WebSub notified' : ''})`
      )
      showToast('URLs pushed to Google Indexing API', 'success')
    } catch {
      setGoogleIndexingResult('Failed - check console')
      showToast('Google Indexing submission failed', 'error')
    } finally {
      setGoogleIndexingLoading(false)
    }
  }

  async function handleGoogleSingleUrlSubmit() {
    if (!googleTestUrl.trim()) return
    setGoogleTestLoading(true)
    setGoogleTestResult('')
    try {
      const res = await fetch('/api/admin/google-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: googleTestUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setGoogleTestResult(data.message || data.error || 'Submission failed')
        showToast(data.message || 'Google Indexing submission failed', 'error')
        return
      }
      setGoogleTestResult(`Success: ${data.message || 'Googlebot crawl scheduled'}`)
      showToast('URL submitted to Google Indexing API', 'success')
    } catch {
      setGoogleTestResult('Error connecting to API')
      showToast('Request failed', 'error')
    } finally {
      setGoogleTestLoading(false)
    }
  }

  async function handleRevalidateSubmit() {
    setRevalidateLoading(true)
    setRevalidateResult('')
    try {
      const res = await fetch('/api/admin/revalidate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setRevalidateResult(data.error || 'Request failed')
        showToast(data.error || 'Cache update failed', 'error')
        return
      }
      setRevalidateResult('Popular section updated successfully!')
      showToast('Homepage cache revalidated', 'success')
    } catch {
      setRevalidateResult('Failed - check console')
      showToast('Cache revalidation failed', 'error')
    } finally {
      setRevalidateLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        const map: Record<string, Setting> = {}
        const vals: Record<string, string> = {}
        d.settings?.forEach((s: Setting) => {
          map[s.key] = s
          vals[s.key] = s.value || ''
        })
        setSettings(map)
        setValues(vals)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load settings')
        setLoading(false)
      })
  }, [])

  async function saveSetting(key: string) {
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] }),
      })
      if (res.ok) {
        setSaved(prev => ({ ...prev, [key]: true }))
        showToast('Setting saved', 'success')
        setTimeout(() => {
          setSaved(prev => ({ ...prev, [key]: false }))
        }, 2500)
      } else {
        showToast('Could not save setting', 'error')
      }
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" aria-hidden />
        <p className="text-sm font-medium">Loading settings...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-rose-500 p-6">{error}</div>
  }

  return (
    <div className="space-y-8 max-w-3xl content-fade-in text-slate-800">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          Social links, announcements, RBI rates, and SEO identifiers. Changes apply on save - no
          deployment required.
        </p>
      </div>

      {settingGroups.map((group) => {
        const GroupIcon = group.Icon
        return (
        <div key={group.id} className="admin-card overflow-hidden">
          <div className="bg-slate-50/50 border-b border-white/60 px-6 py-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-white/60 text-slate-700 shrink-0">
              <GroupIcon className="w-4 h-4" aria-hidden />
            </span>
            <h2 className="font-heading font-bold text-slate-900">{group.title}</h2>
          </div>
          <div className="divide-y divide-slate-200/50">
            {group.keys.map((key) => {
              const setting = settings[key]
              if (!setting) return null
              const isUrl = urlKeys.includes(key)
              const isTextarea = textareaKeys.includes(key)

              return (
                <div key={key} className="px-6 py-5">
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    {setting.label}
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    {setting.description}
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      {isTextarea ? (
                        <textarea
                          value={values[key] || ''}
                          onChange={e =>
                            setValues(prev => ({ ...prev, [key]: e.target.value }))
                          }
                          rows={2}
                          className="w-full bg-slate-50 border border-white/60 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow"
                          placeholder={`Enter ${setting.label}...`}
                        />
                      ) : (
                        <input
                          type={isUrl ? 'url' : 'text'}
                          value={values[key] || ''}
                          onChange={e =>
                            setValues(prev => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full bg-slate-50 border border-white/60 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow"
                          placeholder={isUrl ? 'https://' : `Enter ${setting.label}...`}
                        />
                      )}
                      {isUrl && values[key] && values[key].startsWith('https://') && (
                        <a
                          href={values[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline mt-2 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" aria-hidden />
                          Preview Link
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => saveSetting(key)}
                      disabled={saving[key]}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 min-w-[5.5rem] inline-flex items-center justify-center gap-1.5 ${saved[key]
                          ? 'bg-emerald-600 text-white'
                          : 'btn-vibrant-amber text-white shadow-md shadow-amber-500/10'
                        } disabled:opacity-60`}
                    >
                      {saving[key] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                          Save
                        </>
                      ) : saved[key] ? (
                        'Saved'
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )
      })}

      {/* Homepage Cache Management */}
      <div className="admin-card overflow-hidden">
        <div className="bg-slate-50/50 border-b border-white/60 px-6 py-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-white/60 text-slate-700 shrink-0">
            <Search className="w-4 h-4" aria-hidden />
          </span>
          <h2 className="font-heading font-bold text-slate-900">Homepage Cache Management</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Forces Next.js to recalculate and update the "Popular this week" section on the homepage based on current Supabase traffic metrics.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRevalidateSubmit}
              disabled={revalidateLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm animate-none"
            >
              {revalidateLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Updating...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 opacity-90" aria-hidden />
                  Update Popular Section
                </>
              )}
            </button>
            {revalidateResult && (
              <span className={`text-sm font-bold ${revalidateResult.includes('failed') ? 'text-rose-500' : 'text-emerald-400'}`}>
                {revalidateResult}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            The popular section updates automatically every 24 hours. Use this button to refresh the cache immediately after any traffic spikes or database updates.
          </p>
        </div>
      </div>

      {/* IndexNow Section */}
      <div className="admin-card overflow-hidden">
        <div className="bg-slate-50/50 border-b border-white/60 px-6 py-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-white/60 text-slate-700 shrink-0">
            <Search className="w-4 h-4" aria-hidden />
          </span>
          <h2 className="font-heading font-bold text-slate-900">IndexNow (Bing & Search Partners)</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Submit published article URLs to Bing, Yandex, and other IndexNow participants for faster discovery.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleIndexNowSubmit}
              disabled={indexNowLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-900 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm animate-none"
            >
              {indexNowLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Submitting...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 opacity-90" aria-hidden />
                  Submit All URLs
                </>
              )}
            </button>
            {indexNowResult && (
              <span className="text-sm text-emerald-400 font-bold">
                {indexNowResult}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            New articles are submitted automatically 
            when published. Use this button to 
            resubmit all articles at once.
          </p>
        </div>
      </div>

      {/* Google Indexing API & WebSub Section */}
      <div className="admin-card overflow-hidden">
        <div className="bg-slate-50/50 border-b border-white/60 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 shrink-0">
              <Globe className="w-4 h-4" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading font-bold text-slate-900">Google Indexing API & WebSub Hub</h2>
              <p className="text-xs text-slate-500">Accelerated Googlebot crawl requests & Google News RSS push</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-750 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live & Connected
          </span>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="text-sm text-slate-700 leading-relaxed space-y-1">
            <p>
              Directly triggers Google’s <strong>Indexing API v3</strong> to request an immediate Googlebot visit, while simultaneously notifying Google’s <strong>PubSubHubbub (WebSub)</strong> hub for Google News / Discover feed updates.
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Service Account: analytics-viewer@corplawupdates.iam.gserviceaccount.com (Quota: 200 URLs/day)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleIndexingSubmit}
              disabled={googleIndexingLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
            >
              {googleIndexingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Pushing to Google...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 opacity-90" aria-hidden />
                  Push Recent Updates (Top 20)
                </>
              )}
            </button>
            {googleIndexingResult && (
              <span className="text-sm text-emerald-600 font-semibold">
                {googleIndexingResult}
              </span>
            )}
          </div>

          {/* Single URL test input */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Push or Inspect a Specific URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={googleTestUrl}
                onChange={(e) => setGoogleTestUrl(e.target.value)}
                placeholder="/updates/slug or full https://... URL"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGoogleSingleUrlSubmit}
                disabled={googleTestLoading || !googleTestUrl.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shrink-0"
              >
                {googleTestLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                    Submitting...
                  </>
                ) : (
                  'Push Single URL'
                )}
              </button>
            </div>
            {googleTestResult && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                {googleTestResult}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-500">
            New updates published via the Admin panel are already pushed automatically in real-time. Use this panel for manual re-indexing, testing individual URLs, or after bulk edits.
          </p>
        </div>
      </div>

      {/* ACCOUNT & SECURITY */}
      <div className="admin-card overflow-hidden border border-rose-500/20 bg-rose-500/[0.02]">
        <div className="bg-rose-950/40 border-b border-rose-500/20 px-6 py-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-rose-500/30 text-rose-450 shrink-0">
            <Shield className="w-4 h-4" aria-hidden />
          </span>
          <h2 className="font-heading font-bold text-rose-450">Account & Security</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Admin Email</p>
              <p className="text-xs text-slate-500">mail@corplawupdates.in</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Change Admin Password</p>
              <p className="text-xs text-slate-500">
                Update ADMIN_PASSWORD in Vercel environment variables
              </p>
            </div>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-white/60 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Open Vercel
              <ExternalLink className="w-3 h-3 opacity-70" aria-hidden />
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
