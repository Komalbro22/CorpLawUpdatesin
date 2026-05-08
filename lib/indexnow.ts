const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const BASE_URL = 'https://www.corplawupdates.in'

export async function submitToIndexNow(
  urls: string[]
): Promise<boolean> {
  if (!INDEXNOW_KEY) {
    console.warn('IndexNow: INDEXNOW_KEY not set')
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
          host: 'www.corplawupdates.in',
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
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
