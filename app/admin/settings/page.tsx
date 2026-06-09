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
    keys: ['whatsapp_channel', 'linkedin_url', 'twitter_url', 'instagram_url'],
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
    keys: ['google_analytics_id', 'google_search_console', 'microsoft_clarity_id'],
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" aria-hidden />
        <p className="text-sm font-medium">Loading settings...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-rose-500 p-6">{error}</div>
  }

  return (
    <div className="space-y-8 max-w-3xl content-fade-in text-slate-200">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Social links, announcements, RBI rates, and SEO identifiers. Changes apply on save - no
          deployment required.
        </p>
      </div>

      {settingGroups.map((group) => {
        const GroupIcon = group.Icon
        return (
        <div key={group.id} className="admin-card overflow-hidden">
          <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
              <GroupIcon className="w-4 h-4" aria-hidden />
            </span>
            <h2 className="font-heading font-bold text-white">{group.title}</h2>
          </div>
          <div className="divide-y divide-slate-800/40">
            {group.keys.map((key) => {
              const setting = settings[key]
              if (!setting) return null
              const isUrl = urlKeys.includes(key)
              const isTextarea = textareaKeys.includes(key)

              return (
                <div key={key} className="px-6 py-5">
                  <label className="block text-sm font-semibold text-slate-200 mb-1">
                    {setting.label}
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow"
                          placeholder={`Enter ${setting.label}...`}
                        />
                      ) : (
                        <input
                          type={isUrl ? 'url' : 'text'}
                          value={values[key] || ''}
                          onChange={e =>
                            setValues(prev => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow"
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
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10'
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

      {/* IndexNow Section */}
      <div className="admin-card overflow-hidden">
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
            <Search className="w-4 h-4" aria-hidden />
          </span>
          <h2 className="font-heading font-bold text-white">IndexNow (Bing & Search Partners)</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Submit published article URLs to Bing, Yandex, and other IndexNow participants for faster discovery.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleIndexNowSubmit}
              disabled={indexNowLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm animate-none"
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

      {/* ACCOUNT & SECURITY */}
      <div className="admin-card overflow-hidden border border-rose-500/20 bg-rose-500/[0.02]">
        <div className="bg-rose-950/40 border-b border-rose-500/20 px-6 py-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-rose-500/30 text-rose-450 shrink-0">
            <Shield className="w-4 h-4" aria-hidden />
          </span>
          <h2 className="font-heading font-bold text-rose-450">Account & Security</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-200 text-sm">Admin Email</p>
              <p className="text-xs text-slate-400">mail@corplawupdates.in</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-200 text-sm">Change Admin Password</p>
              <p className="text-xs text-slate-400">
                Update ADMIN_PASSWORD in Vercel environment variables
              </p>
            </div>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
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
