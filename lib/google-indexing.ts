import { GoogleAuth } from 'google-auth-library'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'

/**
 * Submits a URL to Google Indexing API (URL_UPDATED or URL_DELETED).
 * Triggers Googlebot accelerated crawl and re-indexing.
 */
export async function submitToGoogleIndexing(
  urlPathOrFull: string,
  action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<boolean> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    console.warn('Google Indexing: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY not set. Skipping.')
    return false
  }

  const fullUrl = urlPathOrFull.startsWith('http')
    ? urlPathOrFull
    : `${BASE_URL}${urlPathOrFull.startsWith('/') ? '' : '/'}${urlPathOrFull}`

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
      return true
    } else {
      console.warn(
        `Google Indexing API notice for ${fullUrl} [${response.status}]:`,
        data?.error?.message || data
      )
      return false
    }
  } catch (error) {
    console.error(`Google Indexing API: Error submitting ${fullUrl}:`, error)
    return false
  }
}

/**
 * Convenience helper to submit an article update to Google Indexing API by slug
 */
export async function submitArticleToGoogleIndexing(
  slug: string,
  action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<boolean> {
  if (!slug) return false
  return submitToGoogleIndexing(`/updates/${slug}`, action)
}
