export const DOWNLOAD_PROMPT_SKIP_DAYS = 30

const STORAGE_KEY = 'corplaw_download_prompt'
const COOKIE_KEY = 'corplaw_download_prompt'
const SKIP_MS = DOWNLOAD_PROMPT_SKIP_DAYS * 24 * 60 * 60 * 1000

function readSuppressionValues(): string[] {
  if (typeof window === 'undefined') return []

  const values: string[] = []
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (storedValue) values.push(storedValue)
  } catch {
    // Cookie storage remains available when localStorage is blocked.
  }

  try {
    const cookie = document.cookie
      .split('; ')
      .find((part) => part.startsWith(`${COOKIE_KEY}=`))
    if (cookie) values.push(decodeURIComponent(cookie.slice(COOKIE_KEY.length + 1)))
  } catch {
    // localStorage remains available when cookies are blocked.
  }

  return values
}

export function isDownloadPromptSuppressed(): boolean {
  const values = readSuppressionValues()
  if (values.includes('subscribed')) return true

  return values.some((value) => {
    if (!value.startsWith('skipped.')) return false
    const expiresAt = Number(value.slice('skipped.'.length))
    return Number.isFinite(expiresAt) && expiresAt > Date.now()
  })
}

function persistSuppression(value: string, maxAgeSeconds: number, permanent = false) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Cookie storage remains available when localStorage is blocked.
  }

  try {
    const expiry = permanent
      ? 'expires=Fri, 31 Dec 9999 23:59:59 GMT'
      : `max-age=${maxAgeSeconds}`
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; ${expiry}; path=/; SameSite=Lax${secure}`
  } catch {
    // localStorage remains available when cookies are blocked.
  }
}

export function markDownloadPromptSubscribed() {
  persistSuppression('subscribed', 0, true)
}

export function markDownloadPromptSkipped() {
  const expiresAt = Date.now() + SKIP_MS
  persistSuppression(`skipped.${expiresAt}`, DOWNLOAD_PROMPT_SKIP_DAYS * 24 * 60 * 60)
}
