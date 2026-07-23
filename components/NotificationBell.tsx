'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, Lock, ShieldAlert, X, Settings2 } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const REGULATOR_CATEGORIES = [
  { id: 'all', label: 'All Regulators' },
  { id: 'mca', label: 'MCA Updates' },
  { id: 'sebi', label: 'SEBI Circulars' },
  { id: 'rbi', label: 'RBI Notifications' },
  { id: 'nclt', label: 'NCLT Orders' },
  { id: 'ibc', label: 'IBC Updates' },
  { id: 'fema', label: 'FEMA Guidelines' },
]

export default function NotificationBell() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPermission('unsupported')
      return
    }

    setPermission(Notification.permission)

    // Check if subscription exists in service worker
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(Boolean(sub))
      })
    })
  }, [])

  async function handleSubscribe() {
    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID Public Key missing')
      return
    }

    if (Notification.permission === 'denied') {
      setGuidanceModalOpen(true)
      return
    }

    setLoading(true)

    try {
      const resPermission = await Notification.requestPermission()
      setPermission(resPermission)

      if (resPermission === 'denied') {
        setGuidanceModalOpen(true)
        setLoading(false)
        return
      }

      if (resPermission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        })

        const subJson = subscription.toJSON()

        // Send to backend API
        const apiRes = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: subJson.keys,
            categories: selectedCategories,
          }),
        })

        if (apiRes.ok) {
          setIsSubscribed(true)
        }
      }
    } catch (err) {
      console.error('Failed to subscribe to Web Push:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnsubscribe() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        await subscription.unsubscribe()
        setIsSubscribed(false)
        setDropdownOpen(false)
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleCategory(catId: string) {
    let next: string[]
    if (catId === 'all') {
      next = ['all']
    } else {
      const filtered = selectedCategories.filter((c) => c !== 'all')
      if (filtered.includes(catId)) {
        next = filtered.filter((c) => c !== catId)
      } else {
        next = [...filtered, catId]
      }
      if (next.length === 0) next = ['all']
    }

    setSelectedCategories(next)

    if (isSubscribed) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        const subJson = subscription.toJSON()
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: subJson.keys,
            categories: next,
          }),
        })
      }
    }
  }

  if (permission === 'unsupported') return null

  return (
    <div className="relative inline-block">
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          if (permission === 'denied') {
            setGuidanceModalOpen(true)
          } else if (isSubscribed) {
            setDropdownOpen(!dropdownOpen)
          } else {
            handleSubscribe()
          }
        }}
        disabled={loading}
        title={
          permission === 'denied'
            ? 'Notifications blocked — Click to see how to unblock'
            : isSubscribed
            ? 'Notifications enabled — Manage preferences'
            : 'Get instant alerts for new circulars'
        }
        aria-label="Web Push Notifications"
        className={`relative flex items-center justify-center p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
          permission === 'denied'
            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
            : isSubscribed
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/40 font-medium'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        {permission === 'denied' ? (
          <BellOff className="w-4 h-4 text-red-500" />
        ) : isSubscribed ? (
          <>
            <Bell className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </>
        ) : (
          <Bell className="w-4 h-4" />
        )}
      </button>

      {/* Subscription Preferences Dropdown */}
      {dropdownOpen && isSubscribed && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-amber-500" /> Alert Preferences
            </span>
            <button onClick={() => setDropdownOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 mb-3">
            {REGULATOR_CATEGORIES.map((cat) => {
              const checked = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    checked
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  {checked && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="w-full text-center py-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 border-t border-slate-100 dark:border-slate-800 transition-colors"
          >
            Unsubscribe from notifications
          </button>
        </div>
      )}

      {/* Re-Enable Guidance Modal (State = 'denied') */}
      {guidanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-navy dark:text-white">
                    Unblock Push Notifications
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Notifications are blocked in your browser settings.
                  </p>
                </div>
              </div>
              <button onClick={() => setGuidanceModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 mb-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-navy dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Follow these 2 easy steps to unblock:
              </p>
              <ol className="list-decimal list-inside space-y-2 font-medium">
                <li>
                  Click the <strong className="text-navy dark:text-white">lock / tune icon 🔒</strong> in your browser address bar (next to the website URL).
                </li>
                <li>
                  Change <strong className="text-navy dark:text-white">Notifications</strong> from <em>Block</em> to <strong className="text-amber-600 dark:text-amber-400">Allow</strong>, then refresh the page!
                </li>
              </ol>
            </div>

            <button
              onClick={() => {
                setGuidanceModalOpen(false)
                window.location.reload()
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
            >
              I updated browser settings — Refresh Page
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
