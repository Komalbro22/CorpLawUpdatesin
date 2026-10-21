// Safe client-side Google Analytics (GA4) event dispatcher

export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === 'undefined') return

  try {
    const win = window as unknown as {
      gtag?: (...args: unknown[]) => void
      dataLayer?: unknown[]
    }

    if (typeof win.gtag === 'function') {
      win.gtag('event', action, params)
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: action,
        ...params,
      })
    }
  } catch (err) {
    // Fail silently so analytics never interrupts user interactions
    console.debug('[GA4] Event dispatch failed:', err)
  }
}
