const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'
export const DEFAULT_INDEXNOW_KEY = 'dc492a076f8b41e39e0666a19ab79108'

const HOST = (() => {
  try {
    return new URL(BASE_URL).hostname
  } catch {
    return 'www.corplawupdates.in'
  }
})()

export async function submitToIndexNow(
  urls: string[]
): Promise<boolean> {
  const indexNowKey = process.env.INDEXNOW_KEY || process.env.INDEXNOW_API_KEY || DEFAULT_INDEXNOW_KEY
  if (!indexNowKey) {
    console.warn('[IndexNow] INDEXNOW_KEY environment variable not set and no default key available. Skipping submission.')
    return false
  }

  // Deduplicate and filter valid absolute HTTP(S) URLs
  const cleanUrls = Array.from(
    new Set(
      (urls || [])
        .map(u => (typeof u === 'string' ? u.trim() : ''))
        .filter(u => u && /^https?:\/\//i.test(u))
    )
  )

  if (!cleanUrls.length) {
    console.warn('[IndexNow] No valid URLs to submit.')
    return false
  }

  const payload = {
    host: HOST,
    key: indexNowKey,
    keyLocation: `${BASE_URL}/${indexNowKey}.txt`,
    urlList: cleanUrls,
  }

  try {
    const response = await fetch(
      'https://api.indexnow.org/indexnow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      }
    )

    const responseBody = await response.text()

    if (response.ok || response.status === 202) {
      console.log(
        `[IndexNow] Success: HTTP ${response.status} ${response.statusText}. Submitted ${cleanUrls.length} URL(s) to api.indexnow.org:`,
        cleanUrls
      )
      return true
    }

    console.error(
      `[IndexNow] Failed with HTTP ${response.status} ${response.statusText}. Response body: ${responseBody}. Payload was:`,
      JSON.stringify(payload)
    )
    return false
  } catch (error: any) {
    console.error('[IndexNow] Error dispatching request to api.indexnow.org:', error?.message || error)
    return false
  }
}

export async function submitArticleToIndexNow(
  slug: string,
  oldSlug?: string | null
): Promise<boolean> {
  const urlSet = new Set<string>()
  if (slug) {
    urlSet.add(`${BASE_URL}/updates/${slug}`)
  }
  if (oldSlug && oldSlug !== slug) {
    urlSet.add(`${BASE_URL}/updates/${oldSlug}`)
  }
  urlSet.add(`${BASE_URL}/updates`)
  urlSet.add(`${BASE_URL}`)

  return submitToIndexNow(Array.from(urlSet))
}

export async function submitCompanyToIndexNow(
  cin: string
): Promise<boolean> {
  const urls = [
    `${BASE_URL}/company/${cin}`,
    `${BASE_URL}/tools/cin-decoder`,
    `${BASE_URL}`,
  ]
  return submitToIndexNow(urls)
}
