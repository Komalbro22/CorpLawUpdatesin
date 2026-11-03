'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { trackEvent } from '@/lib/gtag'

export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A'
export const WA_FLOAT_STORAGE_KEY = 'wa-float-dismissed'
export const WA_FLOAT_DISMISS_DAYS = 30
export const WA_FLOAT_DISMISS_MS = WA_FLOAT_DISMISS_DAYS * 24 * 60 * 60 * 1000

export default function WhatsAppFloatingButton() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(true) // Start dismissed until checked on client

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WA_FLOAT_STORAGE_KEY)
      if (stored) {
        const timestamp = parseInt(stored, 10)
        if (!isNaN(timestamp) && Date.now() - timestamp < WA_FLOAT_DISMISS_MS) {
          // Still within 30-day dismissal window
          return
        }
      }
    } catch {
      // Ignore localStorage access errors (e.g. private browsing restrictions)
    }

    setDismissed(false)

    const handleScroll = () => {
      setVisible(window.scrollY >= 400)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (dismissed) return null

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissed(true)
    try {
      localStorage.setItem(WA_FLOAT_STORAGE_KEY, Date.now().toString())
    } catch {
      // Ignore localStorage write errors
    }
  }

  const handleClick = () => {
    trackEvent('whatsapp_channel_click', { placement: 'floating' })
  }

  return (
    <aside
      aria-label="WhatsApp Channel Quick Access"
      className={`fixed right-4 sm:right-6 bottom-[96px] sm:bottom-6 z-40 transition-all duration-300 ease-out print:hidden ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ willChange: 'opacity, transform' }}
    >
      <div className="relative inline-flex items-center">
        {/* Dismiss Button (small × at top-right) */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss WhatsApp notification"
          title="Dismiss for 30 days"
          className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
        </button>

        {/* WhatsApp Channel Link Button */}
        <a
          href={WHATSAPP_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          aria-label="Get updates on WhatsApp"
          className="group flex items-center bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg shadow-black/15 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out max-w-[180px] p-0 sm:pr-3.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
        >
          {/* Circular 56px WhatsApp Icon */}
          <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7 fill-white drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>

          {/* Desktop Text Pill */}
          <span className="hidden sm:inline-block text-xs font-bold tracking-tight pr-1 text-white whitespace-nowrap overflow-hidden text-ellipsis">
            Get updates on WhatsApp
          </span>
        </a>
      </div>
    </aside>
  )
}
