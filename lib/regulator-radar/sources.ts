// lib/regulator-radar/sources.ts
import { RegulatorKey, RegulatorUpdate, SourceCheckResult } from './types'
import { Category } from '@/types'
import https from 'https'

const FETCH_TIMEOUT_MS = 6000 // 6 seconds max per source

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
}

/**
 * Clean and normalize text from HTML
 */
export function cleanHtmlText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<!--[\s\S]*?-->/g, '') // strip HTML comments
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Universal date parser supporting all Indian Government portal formats:
 * - "19 August 2026", "August 18, 2026", "Aug 18 2026", "18-Aug-2026", "17 Aug, 2026 +0530"
 * - "19/08/2026", "18/08/2026", "10.8.2026", "07-08-2026", "18-08-2026"
 * - "2026-08-18" (ISO)
 */
export function parseIndianDate(raw: string): Date | null {
  if (!raw) return null
  const cleaned = raw
    .replace(/\+[0-9]{4}/g, '')
    .replace(/GMT|IST|UTC/gi, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // 1. "19 August 2026" or "18-Aug-2026" or "18 Aug 2026"
  const m1 = cleaned.match(/(\d{1,2})[\s\-]+([A-Za-z]+)[\s\-]+(\d{4})/)
  if (m1) {
    const day = parseInt(m1[1], 10)
    const monthStr = m1[2].slice(0, 3).toLowerCase()
    const year = parseInt(m1[3], 10)
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    }
    if (monthStr in months) {
      const d = new Date(year, months[monthStr], day)
      if (!isNaN(d.getTime())) return d
    }
  }

  // 2. "August 19 2026" or "Aug 18 2026"
  const m2 = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})/)
  if (m2) {
    const monthStr = m2[1].slice(0, 3).toLowerCase()
    const day = parseInt(m2[2], 10)
    const year = parseInt(m2[3], 10)
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    }
    if (monthStr in months) {
      const d = new Date(year, months[monthStr], day)
      if (!isNaN(d.getTime())) return d
    }
  }

  // 3. "2026-08-18" or "2026/08/18" (ISO)
  const m3 = cleaned.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (m3) {
    const year = parseInt(m3[1], 10)
    const month = parseInt(m3[2], 10) - 1
    const day = parseInt(m3[3], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  // 4. "19/08/2026" or "18/08/2026" or "10.8.2026" or "18-08-2026"
  const m4 = cleaned.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
  if (m4) {
    const day = parseInt(m4[1], 10)
    const month = parseInt(m4[2], 10) - 1
    const year = parseInt(m4[3], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  const fallback = new Date(cleaned)
  return isNaN(fallback.getTime()) ? null : fallback
}

/**
 * Filter within specified hours (e.g. 72h / 3 days)
 */
export function isWithinHours(date: Date, maxHours = 72): boolean {
  if (!date || isNaN(date.getTime())) return false
  const now = Date.now()
  const diffMs = now - date.getTime()
  const maxPastMs = maxHours * 60 * 60 * 1000
  const maxFutureMs = 24 * 60 * 60 * 1000 // timezone buffer
  return diffMs <= maxPastMs && diffMs >= -maxFutureMs
}

/**
 * Fetch HTML via direct HTTPS with relaxed SSL for government servers
 */
function fetchHttpsText(url: string, extraHeaders: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve) => {
    https.get(url, {
      rejectUnauthorized: false,
      headers: { ...BROWSER_HEADERS, ...extraHeaders },
      timeout: FETCH_TIMEOUT_MS
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', () => resolve(''))
  })
}

function createHash(regulator: string, dateStr: string, title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 40)
  return `${regulator.toLowerCase()}_${dateStr.replace(/[^0-9]/g, '')}_${cleanTitle}`
}

function formatIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/* =========================================================================
   1. RBI & FEMA (Press Releases & Circulars)
   ========================================================================= */
export async function fetchFemaAndRbi(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  // 1A. RBI Press Releases
  try {
    const prUrl = 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx'
    const html = await fetchHttpsText(prUrl)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const r of rows) {
      if (!r.includes('link2')) continue

      const aMatch = r.match(/<a[^>]*class=["']?link2["']?[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i) ||
                    r.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*class=["']?link2["']?[^>]*>([\s\S]*?)<\/a>/i)

      if (!aMatch) continue

      const rawHref = aMatch[1] || aMatch[2]
      const title = cleanHtmlText(aMatch[3])
      if (!title || title.length < 5) continue

      const dateMatch = r.match(/([A-Za-z]+\s+\d{1,2}\s*,?\s*\d{4}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)
      if (!dateMatch) continue

      const parsedDate = parseIndianDate(dateMatch[1])
      if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

      const pdfMatch = r.match(/href=(?:["']([^"']+\.pdf[^"']*)["']|([^\s>]+\.pdf[^\s>]*))/i)
      const pdfUrl = pdfMatch ? (pdfMatch[1] || pdfMatch[2]) : undefined

      let href = rawHref
      if (href && !href.startsWith('http')) {
        href = `https://rbi.org.in/Scripts/${href.replace(/^\/+/, '')}`
      }

      const isoDate = formatIsoDate(parsedDate)
      const isFema = title.toLowerCase().includes('foreign exchange') ||
                     title.toLowerCase().includes('fema') ||
                     title.toLowerCase().includes('a.p. (dir') ||
                     title.toLowerCase().includes('external commercial') ||
                     title.toLowerCase().includes('fdi')

      const regulator: RegulatorKey = isFema ? 'FEMA' : 'RBI'
      const category: Category = isFema ? 'FEMA' : 'RBI'

      updates.push({
        id: createHash(regulator, isoDate, title),
        regulator,
        regulatorLabel: isFema ? 'RBI FEMA (Foreign Exchange)' : 'Reserve Bank of India',
        category,
        title,
        date: isoDate,
        rawDateStr: dateMatch[1].trim(),
        sourceUrl: href,
        pdfUrl,
        snippet: `RBI official notification / release: ${title}`
      })
    }
  } catch (err) {
    console.warn('[Radar] RBI PR fetch failed:', err)
  }

  // 1B. RBI Circulars
  try {
    const circUrl = 'https://rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx'
    const html = await fetchHttpsText(circUrl)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const r of rows) {
      if (!r.includes('link2') && !r.includes('<a')) continue

      const aMatch = r.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      if (!aMatch) continue

      const rawHref = aMatch[1] || aMatch[2]
      const title = cleanHtmlText(aMatch[3])
      if (!title || title.length < 5) continue

      const dateMatch = r.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|[A-Za-z]+\s+\d{1,2}\s*,?\s*\d{4})/i)
      if (!dateMatch) continue

      const parsedDate = parseIndianDate(dateMatch[1])
      if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

      let href = rawHref
      if (href && !href.startsWith('http')) {
        href = `https://rbi.org.in/Scripts/${href.replace(/^\/+/, '')}`
      }
      const isoDate = formatIsoDate(parsedDate)

      const isFema = title.toLowerCase().includes('foreign exchange') ||
                     title.toLowerCase().includes('fema') ||
                     title.toLowerCase().includes('a.p. (dir')

      const regulator: RegulatorKey = isFema ? 'FEMA' : 'RBI'
      const category: Category = isFema ? 'FEMA' : 'RBI'

      updates.push({
        id: createHash(regulator, isoDate, title),
        regulator,
        regulatorLabel: isFema ? 'RBI FEMA (Foreign Exchange)' : 'Reserve Bank of India',
        category,
        title,
        date: isoDate,
        rawDateStr: dateMatch[1].trim(),
        sourceUrl: href,
        pdfUrl: href.endsWith('.pdf') ? href : undefined,
        snippet: `RBI Master Direction / Circular: ${title}`
      })
    }
  } catch (err) {
    console.warn('[Radar] RBI Circular fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   2. SEBI (Circulars + Press Releases)
   ========================================================================= */
export async function fetchSebi(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  // 2A. SEBI Live Circulars Listing Page
  try {
    const circUrl = 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0'
    const html = await fetchHttpsText(circUrl)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const r of rows) {
      const aMatch = r.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      const dateMatch = r.match(/([A-Za-z]+\s+\d{1,2}\s*,?\s*\d{4}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        const rawHref = aMatch[1] || aMatch[2]
        const title = cleanHtmlText(aMatch[3])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const href = rawHref.startsWith('http') ? rawHref : `https://www.sebi.gov.in/${rawHref.replace(/^\/+/, '')}`
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('SEBI', isoDate, title),
          regulator: 'SEBI',
          regulatorLabel: 'SEBI (Securities Board)',
          category: 'SEBI',
          title,
          date: isoDate,
          rawDateStr: dateMatch[1].trim(),
          sourceUrl: href,
          pdfUrl: href.endsWith('.pdf') ? href : undefined,
          snippet: `SEBI circular: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] SEBI Circulars page fetch failed:', err)
  }

  // 2B. SEBI RSS Feed
  try {
    const rssUrl = 'https://www.sebi.gov.in/sebirss.xml'
    const xml = await fetchHttpsText(rssUrl)
    const cleanXml = xml.replace(/<!--[\s\S]*?-->/g, '')
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(cleanXml)) !== null && updates.length < 25) {
      const itemXml = match[1]
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i)
      const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || itemXml.match(/<link>([\s\S]*?)<\/link>/i)
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)

      if (titleMatch && linkMatch && dateMatch) {
        const title = cleanHtmlText(titleMatch[1])
        const link = linkMatch[1].trim()
        const rawDate = dateMatch[1].trim()

        const parsedDate = parseIndianDate(rawDate)
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const isoDate = formatIsoDate(parsedDate)
        updates.push({
          id: createHash('SEBI', isoDate, title),
          regulator: 'SEBI',
          regulatorLabel: 'SEBI (Securities Board)',
          category: 'SEBI',
          title,
          date: isoDate,
          rawDateStr: rawDate,
          sourceUrl: link || 'https://www.sebi.gov.in',
          pdfUrl: link.endsWith('.pdf') ? link : undefined,
          snippet: `SEBI notification: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] SEBI RSS fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   3. CCI (Competition Commission of India - Live DataTable AJAX API)
   ========================================================================= */
export async function fetchCci(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  try {
    const cciAjaxUrl = 'https://cci.gov.in/whats-new?draw=1&columns%5B0%5D%5Bdata%5D=DT_RowIndex&columns%5B1%5D%5Bdata%5D=title&columns%5B2%5D%5Bdata%5D=file_name&start=0&length=25'
    const rawJson = await fetchHttpsText(cciAjaxUrl, {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://cci.gov.in/whats-new'
    })

    if (rawJson && rawJson.length > 50) {
      const json = JSON.parse(rawJson)
      for (const row of json.data || []) {
        const title = cleanHtmlText(row.title || '')
        if (!title || title.length < 5) continue

        // Extract date from row.new_date (e.g. "19/08/2026") or title
        const parsedDate = parseIndianDate(row.new_date) || parseIndianDate(title)
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const pdfMatch = (row.file_name || '').match(/href=["']([^"']+\.pdf[^"']*)["']/i)
        const pdfUrl = pdfMatch ? pdfMatch[1] : undefined
        const sourceUrl = pdfUrl || 'https://cci.gov.in/whats-new'
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('CCI', isoDate, title),
          regulator: 'CCI',
          regulatorLabel: 'Competition Commission of India',
          category: 'CCI',
          title: title.startsWith('CCI') ? title : `CCI: ${title}`,
          date: isoDate,
          rawDateStr: row.new_date || isoDate,
          sourceUrl,
          pdfUrl,
          snippet: `CCI Gazette Notification / Order: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] CCI fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   4. Labour (ESIC & EPFO Circulars)
   ========================================================================= */
export async function fetchLabourAndEpfo(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  // 4A. ESIC Circulars
  try {
    const esicUrl = 'https://esic.gov.in/circulars'
    const html = await fetchHttpsText(esicUrl)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const r of rows) {
      if (r.includes('<th')) continue

      const aMatch = r.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      const dateMatch = r.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4})/i)

      if (aMatch && dateMatch) {
        const rawHref = aMatch[1] || aMatch[2]
        let title = cleanHtmlText(aMatch[3])
        if (!title || title.length < 5) continue

        title = title.replace(/-?\s*PDF size.*$/i, '').trim()

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const href = rawHref.startsWith('http') ? rawHref : `https://esic.gov.in/${rawHref.replace(/^\/+/, '')}`
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('LABOUR', isoDate, title),
          regulator: 'LABOUR',
          regulatorLabel: 'Labour / ESIC / EPFO',
          category: 'LABOUR',
          title: title.startsWith('ESIC') || title.startsWith('Labour') ? title : `ESIC: ${title}`,
          date: isoDate,
          rawDateStr: dateMatch[1].trim(),
          sourceUrl: href,
          pdfUrl: href.endsWith('.pdf') ? href : undefined,
          snippet: `Ministry of Labour / ESIC Order: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] ESIC fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   5. IBBI (Insolvency and Bankruptcy Board of India)
   ========================================================================= */
export async function fetchIbbi(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  // 5A. IBBI What's New
  try {
    const whatsNewUrl = 'https://ibbi.gov.in/whats-new'
    const html = await fetchHttpsText(whatsNewUrl)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const row of rows) {
      if (row.includes('<th')) continue

      const aMatch = row.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      const dateMatch = row.match(/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        const rawHref = aMatch[1] || aMatch[2]
        let title = cleanHtmlText(aMatch[3])
        if (!title || title.length < 5) continue

        title = title.replace(/\(\d+[\.\d]*\s*[KM]B\)/gi, '').trim()

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const href = rawHref.startsWith('http') ? rawHref : `https://ibbi.gov.in/${rawHref.replace(/^\/+/, '')}`
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('IBBI', isoDate, title),
          regulator: 'IBBI',
          regulatorLabel: 'IBBI (Insolvency & Bankruptcy)',
          category: 'IBC',
          title: title.startsWith('IBBI') ? title : `IBBI: ${title}`,
          date: isoDate,
          rawDateStr: dateMatch[1].trim(),
          sourceUrl: href,
          pdfUrl: href.endsWith('.pdf') ? href : undefined,
          snippet: `IBBI Update / Order: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] IBBI What\'s New fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   6. MCA (Ministry of Corporate Affairs)
   ========================================================================= */
export async function fetchMca(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.mca.gov.in/content/mca/global/en/home.html'

  try {
    const html = await fetchHttpsText(url)
    if (html && html.length > 500) {
      const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
      const allAnchors = cleanHtml.match(/<a[^>]+href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi) || []

      for (const a of allAnchors) {
        const title = cleanHtmlText(a)
        const hrefMatch = a.match(/href=["']([^"']+)["']/i)
        const href = hrefMatch ? hrefMatch[1] : ''

        if (
          title.length > 15 &&
          (href.includes('/content/dam/mca') || href.includes('.pdf') || href.includes('.jpg') || title.includes('Voluntary strike off') || title.includes('Accounting Standards') || title.includes('Corporate Mitra')) &&
          !title.includes('Skip to') &&
          !title.includes('Screen Reader')
        ) {
          const dateMatch = a.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i) ||
                            title.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

          // If date is found or recently updated
          const parsedDate = dateMatch ? parseIndianDate(dateMatch[1]) : new Date()
          if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

          const fullHref = href.startsWith('http') ? href : `https://www.mca.gov.in/${href.replace(/^\/+/, '')}`
          const isoDate = formatIsoDate(parsedDate)

          updates.push({
            id: createHash('MCA', isoDate, title),
            regulator: 'MCA',
            regulatorLabel: 'Ministry of Corporate Affairs',
            category: 'MCA',
            title: title.startsWith('MCA') ? title : `MCA: ${title}`,
            date: isoDate,
            rawDateStr: dateMatch ? dateMatch[1] : isoDate,
            sourceUrl: fullHref,
            pdfUrl: fullHref.endsWith('.pdf') ? fullHref : undefined,
            snippet: `MCA Circular / Notification: ${title}`
          })
        }
      }
    }
  } catch (err) {
    console.warn('[Radar] MCA fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   7. CBIC & CBDT (Income Tax & GST)
   ========================================================================= */
export async function fetchTax(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.incometax.gov.in/iec/foportal/latest-news'

  try {
    const html = await fetchHttpsText(url)
    if (html && html.length > 500) {
      const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
      const items = cleanHtml.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || []

      for (const itemHtml of items) {
        const aMatch = itemHtml.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
        const dateMatch = itemHtml.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

        if (aMatch && dateMatch) {
          const rawHref = aMatch[1] || aMatch[2]
          const title = cleanHtmlText(aMatch[3])
          if (!title || title.length < 5) continue

          const parsedDate = parseIndianDate(dateMatch[1])
          if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

          const href = rawHref.startsWith('http') ? rawHref : `https://www.incometax.gov.in/${rawHref.replace(/^\/+/, '')}`
          const isoDate = formatIsoDate(parsedDate)

          updates.push({
            id: createHash('TAX', isoDate, title),
            regulator: 'TAX',
            regulatorLabel: 'Income Tax / CBDT',
            category: 'MCA',
            title: title.startsWith('IT') ? title : `Income Tax: ${title}`,
            date: isoDate,
            rawDateStr: dateMatch[1].trim(),
            sourceUrl: href,
            pdfUrl: href.endsWith('.pdf') ? href : undefined,
            snippet: `Income Tax Notification: ${title}`
          })
        }
      }
    }
  } catch (err) {
    console.warn('[Radar] TAX fetch failed:', err)
  }

  return updates
}
