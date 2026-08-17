const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'
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
  const indexNowKey = process.env.INDEXNOW_KEY || process.env.INDEXNOW_API_KEY
  if (!indexNowKey) {
    console.warn('IndexNow: INDEXNOW_KEY environment variable not set. Skipping submission.')
    return false
  }

  if (!urls.length) return false

  try {
    const response = await fetch(
      'https://api.indexnow.org/indexnow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          host: HOST,
          key: indexNowKey,
          keyLocation: `${BASE_URL}/${indexNowKey}.txt`,
          urlList: urls,
        }),
      }
    )

    if (response.ok || response.status === 202) {
      console.log(
        `IndexNow: Submitted ${urls.length} URLs`,
        urls
      )
      return true
    }

    console.error(
      'IndexNow: Failed',
      response.status,
      await response.text()
    )
    return false

  } catch (error) {
    console.error('IndexNow: Error', error)
    return false
  }
}

export async function submitArticleToIndexNow(
  slug: string
): Promise<boolean> {
  const urls = [
    `${BASE_URL}/updates/${slug}`,
    `${BASE_URL}/updates`,
    `${BASE_URL}`,
  ]
  return submitToIndexNow(urls)
}

export async function submitCompanyToIndexNow(
  cin: string
): Promise<boolean> {
  const urls = [
    `${BASE_URL}/company/${cin}`,
    `${BASE_URL}/company-search`,
    `${BASE_URL}`,
  ]
  return submitToIndexNow(urls)
}

