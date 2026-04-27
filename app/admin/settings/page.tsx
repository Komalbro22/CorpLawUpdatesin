'use client'

import { useEffect, useState } from 'react'

interface Setting {
  key: string
  value: string | null
  label: string
  description: string
}

const settingGroups = [
  {
    title: '📱 Social Media & Channels',
    keys: ['whatsapp_channel', 'linkedin_url', 'twitter_url', 'instagram_url'],
  },
  {
    title: '🌐 Site Content',
    keys: ['site_tagline', 'contact_email', 'newsletter_footer'],
  },
  {
    title: '📢 Announcement Bar',
    keys: ['announcement_bar', 'announcement_bar_url'],
  },
  {
    title: '📊 Analytics & SEO',
    keys: ['google_analytics_id', 'google_search_console'],
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
  const [settings, setSettings] = useState<Record<string, Setting>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        setTimeout(() => {
          setSaved(prev => ({ ...prev, [key]: false }))
        }, 2500)
      }
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 animate-pulse">Loading settings...</div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy">Site Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update social links, WhatsApp channel, SEO settings and more.
          Changes apply instantly — no deployment needed.
        </p>
      </div>

      {settingGroups.map((group) => (
        <div key={group.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="font-bold text-navy">{group.title}</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {group.keys.map((key) => {
              const setting = settings[key]
              if (!setting) return null
              const isUrl = urlKeys.includes(key)
              const isTextarea = textareaKeys.includes(key)

              return (
                <div key={key} className="px-6 py-5">
                  <label className="block text-sm font-semibold text-navy mb-1">
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
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder={`Enter ${setting.label}...`}
                        />
                      ) : (
                        <input
                          type={isUrl ? 'url' : 'text'}
                          value={values[key] || ''}
                          onChange={e =>
                            setValues(prev => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder={isUrl ? 'https://' : `Enter ${setting.label}...`}
                        />
                      )}
                      {isUrl && values[key] && values[key].startsWith('https://') && (
                        <a
                          href={values[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2"
                        >
                          ↗ Preview link
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => saveSetting(key)}
                      disabled={saving[key]}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${saved[key]
                          ? 'bg-green-500 text-white'
                          : 'bg-amber-400 hover:bg-amber-500 text-navy'
                        }`}
                    >
                      {saving[key] ? '...' : saved[key] ? '✓ Saved!' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* ACCOUNT & SECURITY */}
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <h2 className="font-bold text-red-700">🔴 Account & Security</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy text-sm">Admin Email</p>
              <p className="text-xs text-slate-400">corplawupdatesin@gmail.com</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy text-sm">Change Admin Password</p>
              <p className="text-xs text-slate-400">
                Update ADMIN_PASSWORD in Vercel environment variables
              </p>
            </div>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Open Vercel →
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
