import { GoogleAuth } from 'google-auth-library'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'

/**
 * Checks if Google Indexing API credentials are configured in environment
 */
export function isGoogleIndexingConfigured(): { configured: boolean; clientEmail: string | null } {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || null
  const hasKey = Boolean(process.env.GOOGLE_PRIVATE_KEY)
  return {
    configured: Boolean(clientEmail && hasKey),
    clientEmail,
  }
}

/**
 * Submits a single URL to Google Indexing API (URL_UPDATED or URL_DELETED).
 * Triggers Googlebot accelerated crawl and re-indexing.
 */
export async function submitToGoogleIndexing(
  urlPathOrFull: string,
  action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: boolean; message?: string; url: string }> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  const fullUrl = urlPathOrFull.startsWith('http')
    ? urlPathOrFull
    : `${BASE_URL}${urlPathOrFull.startsWith('/') ? '' : '/'}${urlPathOrFull}`

  if (!clientEmail || !privateKey) {
    const msg = 'GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY not set. Skipping.'
    console.warn('Google Indexing:', msg)
    return { success: false, message: msg, url: fullUrl }
  }

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })

    const client = await auth.getClient()
    const token = await client.getAccessToken()

    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: fullUrl,
        type: action,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`Google Indexing API: Successfully submitted ${action} for ${fullUrl}`)
      return { success: true, message: 'Googlebot crawl scheduled (200 OK)', url: fullUrl }
    } else {
      const errMsg = data?.error?.message || JSON.stringify(data)
      console.warn(`Google Indexing API notice for ${fullUrl} [${response.status}]:`, errMsg)
      return { success: false, message: `Status ${response.status}: ${errMsg}`, url: fullUrl }
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`Google Indexing API: Error submitting ${fullUrl}:`, error)
    return { success: false, message: errMsg, url: fullUrl }
  }
}

/**
 * Submits multiple URLs to Google Indexing API sequentially with throttling.
 */
export async function submitUrlsToGoogleIndexing(
  urls: string[],
  action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: number; failed: number; submitted: string[]; errors: string[] }> {
  let success = 0
  let failed = 0
  const submitted: string[] = []
  const errors: string[] = []

  for (const u of urls) {
    const res = await submitToGoogleIndexing(u, action)
    if (res.success) {
      success++
      submitted.push(res.url)
    } else {
      failed++
      if (res.message) errors.push(`${u}: ${res.message}`)
    }
    // Polite throttle between requests (100ms) to respect Google burst limits
    await new Promise(r => setTimeout(r, 100))
  }

  return { success, failed, submitted, errors }
}

/**
 * Convenience helper to submit an article update to Google Indexing API by slug
 */
export async function submitArticleToGoogleIndexing(
  slug: string,
  action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<boolean> {
  if (!slug) return false
  const res = await submitToGoogleIndexing(`/updates/${slug}`, action)
  return res.success
}

/**
 * Pings Google's official PubSubHubbub (WebSub) hub.
 * Notifies Google News, feed subscribers, and search engines that /api/feed.xml has fresh content.
 */
export async function pingGoogleWebSub(): Promise<boolean> {
  try {
    const feedUrl = `${BASE_URL}/api/feed.xml`
    const res = await fetch('https://pubsubhubbub.appspot.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'publish',
        'hub.url': feedUrl,
      }),
    })
    const ok = res.ok || res.status === 204
    if (ok) {
      console.log('WebSub: Successfully pinged Google PubSubHubbub hub for feed:', feedUrl)
    } else {
      console.warn('WebSub: Ping returned status', res.status)
    }
    return ok
  } catch (error) {
    console.error('WebSub: Failed to ping Google PubSubHubbub hub:', error)
    return false
  }
}
