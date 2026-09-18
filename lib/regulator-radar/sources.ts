// lib/regulator-radar/sources.ts
import { RegulatorKey, RegulatorUpdate, SourceCheckResult } from './types'
import { Category } from '@/types'
import https from 'https'
import http from 'http'

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
  'Upgrade-Insecure-Requests': '1',
  'Connection': 'close'
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
    .replace(/&#x2013;/gi, '-')
    .replace(/&#x2014;/gi, '-')
    .replace(/&#x2018;/gi, "'")
    .replace(/&#x2019;/gi, "'")
    .replace(/&#x201C;/gi, '"')
    .replace(/&#x201D;/gi, '"')
    .replace(/&#x200B;/gi, '')
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
 * Fetch HTML/Text via direct HTTP/HTTPS with redirect-following and relaxed SSL for government servers
 */
function fetchHttpsText(
  url: string,
  extraHeaders: Record<string, string> = {},
  timeoutMs = FETCH_TIMEOUT_MS,
  maxRedirects = 3
): Promise<string> {
  return new Promise((resolve) => {
    if (maxRedirects < 0) return resolve('')
    try {
      const client = url.startsWith('http://') ? http : https
      const req = client.get(
        url,
        {
          rejectUnauthorized: false,
          headers: { ...BROWSER_HEADERS, ...extraHeaders },
          timeout: timeoutMs
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirectUrl = res.headers.location
            if (!redirectUrl.startsWith('http')) {
              try {
                const u = new URL(url)
                redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`
              } catch {
                return resolve('')
              }
            }
            return resolve(fetchHttpsText(redirectUrl, extraHeaders, timeoutMs, maxRedirects - 1))
          }

          let data = ''
          res.on('data', (chunk) => {
            data += chunk
            // Cap body at 250KB to prevent memory exhaustion and long downloads
            if (data.length > 250000) {
              req.destroy()
              resolve(data)
            }
          })
          res.on('end', () => resolve(data))
        }
      )
      req.on('error', () => resolve(''))
      req.on('timeout', () => {
        req.destroy()
        resolve('')
      })
    } catch {
      resolve('')
    }
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
   4. Labour (ESIC, EPFO & Ministry of Labour Circulars)
   ========================================================================= */
export async function fetchLabourAndEpfo(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  // Labour authorities and judicial bodies publish circulars periodically; allow at least a 15-day lookback
  const lookbackHours = Math.max(maxHours, 360)

  // Run live scrapers in parallel with independent fail-safes
  const [esicRes, pibRes, labourCmsRes] = await Promise.allSettled([
    // 4A. ESIC Circulars
    (async () => {
      const items: RegulatorUpdate[] = []
      const esicUrl = 'https://esic.gov.in/circulars'
      const html = await fetchHttpsText(esicUrl, {}, 4500)
      if (!html || html.length < 200) return items

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
          if (!parsedDate || !isWithinHours(parsedDate, lookbackHours)) continue

          const href = rawHref.startsWith('http') ? rawHref : `https://esic.gov.in/${rawHref.replace(/^\/+/, '')}`
          const isoDate = formatIsoDate(parsedDate)

          items.push({
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
      return items
    })(),

    // 4B. Ministry of Labour & Employment / PIB Press Releases
    (async () => {
      const pibUpdates: RegulatorUpdate[] = []
      const pibUrl = 'https://www.pib.gov.in/RssMain.aspx?ModId=6&reg=3&lang=1'
      const xml = await fetchHttpsText(pibUrl, {}, 3500)
      if (!xml || xml.length < 200) return pibUpdates

      const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || []
      const labourKeywords = /labour|labor|epfo|esic|provident fund|employment|pension|shram|wage|gratuity|workmen|social security/i

      for (const it of items) {
        const titleMatch = it.match(/<title>([\s\S]*?)<\/title>/i)
        const linkMatch = it.match(/<link>([\s\S]*?)<\/link>/i)
        const dateMatch = it.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)
        const descMatch = it.match(/<description>([\s\S]*?)<\/description>/i)

        const rawTitle = cleanHtmlText(titleMatch ? titleMatch[1] : '')
        const href = cleanHtmlText(linkMatch ? linkMatch[1] : '')
        const desc = cleanHtmlText(descMatch ? descMatch[1] : '')

        if (!rawTitle || (!labourKeywords.test(rawTitle) && !labourKeywords.test(desc))) {
          continue
        }

        const parsedDate = dateMatch ? parseIndianDate(dateMatch[1]) : new Date()
        if (!parsedDate || !isWithinHours(parsedDate, lookbackHours)) continue

        const isoDate = formatIsoDate(parsedDate)
        const title = rawTitle.startsWith('Labour:') || rawTitle.startsWith('Ministry of Labour') ? rawTitle : `Labour: ${rawTitle}`

        pibUpdates.push({
          id: createHash('LABOUR', isoDate, title),
          regulator: 'LABOUR',
          regulatorLabel: 'Labour / ESIC / EPFO',
          category: 'LABOUR',
          title,
          date: isoDate,
          rawDateStr: dateMatch ? dateMatch[1].trim() : isoDate,
          sourceUrl: href || 'https://www.pib.gov.in',
          snippet: desc ? `PIB Press Release: ${desc.slice(0, 180)}` : `PIB Labour & Employment Announcement: ${rawTitle}`
        })
      }
      return pibUpdates
    })(),

    // 4C. Labour Ministry CMS
    (async () => {
      const cmsUpdates: RegulatorUpdate[] = []
      const cmsUrl = 'https://www.labour.gov.in/cms/wp-json/post-page/whats_new'
      const jsonStr = await fetchHttpsText(cmsUrl, { apikey: '4bW5t13453pa' }, 3500)
      if (!jsonStr || jsonStr.length < 50) return cmsUpdates

      try {
        const j = JSON.parse(jsonStr)
        const posts = j.posts || []
        for (const p of posts) {
          const title = cleanHtmlText(p.post_title)
          if (!title || title.length < 5) continue
          const parsedDate = parseIndianDate(p.post_date)
          if (!parsedDate || !isWithinHours(parsedDate, lookbackHours)) continue

          const isoDate = formatIsoDate(parsedDate)
          cmsUpdates.push({
            id: createHash('LABOUR', isoDate, title),
            regulator: 'LABOUR',
            regulatorLabel: 'Labour / ESIC / EPFO',
            category: 'LABOUR',
            title: title.startsWith('Labour') ? title : `Labour: ${title}`,
            date: isoDate,
            rawDateStr: p.post_date,
            sourceUrl: 'https://www.labour.gov.in/whats-new',
            snippet: `Ministry of Labour & Employment Notification: ${title}`
          })
        }
      } catch {}
      return cmsUpdates
    })()
  ])

  if (esicRes.status === 'fulfilled' && Array.isArray(esicRes.value)) updates.push(...esicRes.value)
  if (pibRes.status === 'fulfilled' && Array.isArray(pibRes.value)) updates.push(...pibRes.value)
  if (labourCmsRes.status === 'fulfilled' && Array.isArray(labourCmsRes.value)) updates.push(...labourCmsRes.value)

  // 4D. Resilient Database Fallback
  // If external government scrapers returned 0 items (e.g. NIC downtime or server block),
  // pull latest published Labour & EPFO updates from Supabase so the tab is never empty!
  if (updates.length === 0) {
    try {
      const { getSupabaseAdminClient } = await import('@/lib/supabase-factory')
      const supabase = getSupabaseAdminClient()
      const { data: dbItems, error } = await supabase
        .from('updates')
        .select('id, title, slug, summary, published_at, category')
        .ilike('category', '%labour%')
        .order('published_at', { ascending: false })
        .limit(10)

      if (!error && Array.isArray(dbItems)) {
        for (const item of dbItems) {
          const pubDate = new Date(item.published_at)
          const isoDate = !isNaN(pubDate.getTime()) ? formatIsoDate(pubDate) : formatIsoDate(new Date())
          updates.push({
            id: createHash('LABOUR', isoDate, item.title),
            regulator: 'LABOUR',
            regulatorLabel: 'Labour / ESIC / EPFO',
            category: 'LABOUR',
            title: item.title,
            date: isoDate,
            rawDateStr: isoDate,
            sourceUrl: `https://corplawupdates.in/updates/${item.slug}`,
            snippet: item.summary || `Labour Law Update: ${item.title}`
          })
        }
      }
    } catch (dbErr) {
      console.warn('[Radar] Labour DB fallback error:', dbErr)
    }
  }

  // Deduplicate items by ID
  const seenMap = new Map<string, RegulatorUpdate>()
  for (const u of updates) {
    if (!seenMap.has(u.id)) {
      seenMap.set(u.id, u)
    }
  }

  const result = Array.from(seenMap.values())
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return result
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

/* =========================================================================
   8. NCLT (National Company Law Tribunal - Judgments & Orders)
   ========================================================================= */
export async function fetchNclt(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://ibbi.gov.in/orders/nclt'
  // Judicial tribunals issue orders in periodic batches; allow at least a 15-day lookback
  const lookbackHours = Math.max(maxHours, 360)

  try {
    const html = await fetchHttpsText(url)
    if (html && html.length > 500) {
      const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
      const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

      for (const row of rows) {
        if (row.includes('<th')) continue

        const aMatch = row.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
        const dateMatch = row.match(/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

        if (aMatch && dateMatch) {
          const rawHref = (aMatch[1] || aMatch[2] || '').replace(/['"]/g, '').trim()
          let title = cleanHtmlText(aMatch[3])
          if (!title || title.length < 5) continue

          title = title.replace(/\(\d+[\.\d]*\s*[KM]B\)/gi, '').trim()

          const parsedDate = parseIndianDate(dateMatch[1])
          if (!parsedDate || !isWithinHours(parsedDate, lookbackHours)) continue

          const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []
          let orderType = ''
          if (tdMatches.length >= 4) {
            orderType = cleanHtmlText(tdMatches[3])
          }

          const pdfUrl = rawHref.startsWith('http')
            ? rawHref
            : `https://ibbi.gov.in/${rawHref.replace(/^\/+/, '')}`
          const isoDate = formatIsoDate(parsedDate)
          const displayTitle = title.startsWith('NCLT') ? title : `NCLT: ${title}`

          updates.push({
            id: createHash('NCLT', isoDate, title),
            regulator: 'NCLT',
            regulatorLabel: 'NCLT (National Company Law Tribunal)',
            category: 'NCLT',
            title: displayTitle,
            date: isoDate,
            rawDateStr: dateMatch[1].trim(),
            sourceUrl: 'https://ibbi.gov.in/orders/nclt',
            pdfUrl: pdfUrl.endsWith('.pdf') ? pdfUrl : undefined,
            circularNo: orderType || 'NCLT Order',
            snippet: orderType ? `Order Classification: ${orderType} | ${title}` : `NCLT Case Order: ${title}`
          })
        }
      }
    }
  } catch (err) {
    console.warn('[Radar] NCLT fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   9. NCLAT (National Company Law Appellate Tribunal - Judgments)
   ========================================================================= */
export async function fetchNclat(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://ibbi.gov.in/orders/nclat'
  // Judicial appellate orders are batch uploaded; allow at least a 20-day lookback
  const lookbackHours = Math.max(maxHours, 480)

  try {
    const html = await fetchHttpsText(url)
    if (html && html.length > 500) {
      const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
      const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

      for (const row of rows) {
        if (row.includes('<th')) continue

        const aMatch = row.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
        const dateMatch = row.match(/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

        if (aMatch && dateMatch) {
          const rawHref = (aMatch[1] || aMatch[2] || '').replace(/['"]/g, '').trim()
          let title = cleanHtmlText(aMatch[3])
          if (!title || title.length < 5) continue

          title = title.replace(/\(\d+[\.\d]*\s*[KM]B\)/gi, '').trim()

          const parsedDate = parseIndianDate(dateMatch[1])
          if (!parsedDate || !isWithinHours(parsedDate, lookbackHours)) continue

          const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []
          let orderType = ''
          if (tdMatches.length >= 4) {
            orderType = cleanHtmlText(tdMatches[3])
          }

          const pdfUrl = rawHref.startsWith('http')
            ? rawHref
            : `https://ibbi.gov.in/${rawHref.replace(/^\/+/, '')}`
          const isoDate = formatIsoDate(parsedDate)
          const displayTitle = title.startsWith('NCLAT') ? title : `NCLAT: ${title}`

          updates.push({
            id: createHash('NCLAT', isoDate, title),
            regulator: 'NCLAT',
            regulatorLabel: 'NCLAT (Appellate Tribunal)',
            category: 'NCLT',
            title: displayTitle,
            date: isoDate,
            rawDateStr: dateMatch[1].trim(),
            sourceUrl: 'https://ibbi.gov.in/orders/nclat',
            pdfUrl: pdfUrl.endsWith('.pdf') ? pdfUrl : undefined,
            circularNo: orderType || 'NCLAT Appellate Order',
            snippet: orderType ? `Appellate Order: ${orderType} | ${title}` : `NCLAT Appellate Judgment: ${title}`
          })
        }
      }
    }
  } catch (err) {
    console.warn('[Radar] NCLAT fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   10. IFSCA (International Financial Services Centres Authority - GIFT City)
   ========================================================================= */
export async function fetchIfsca(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://ifsca.gov.in/'
  // Regulatory notifications are published periodically; allow at least a 15-day lookback
  const lookbackHours = Math.max(maxHours, 360)

  try {
    const html = await fetchHttpsText(url)
    if (!html || html.length < 500) {
      return updates
    }

    const blockRegex = /<div[^>]*class=["'][^"']*new-head[^"']*["'][\s\S]*?<div[^>]*class=["'][^"']*main-list[^"']*["'][\s\S]*?<\/div>/gi
    const blocks = html.match(blockRegex) || []

    for (const block of blocks) {
      const h6Matches = block.match(/<h6[^>]*>([\s\S]*?)<\/h6>/gi) || []
      if (h6Matches.length < 2) continue

      const rawDocType = h6Matches[0]
      const rawDateVal = h6Matches[1]
      if (!rawDocType || !rawDateVal) continue

      const docType = cleanHtmlText(rawDocType)
      const rawDate = cleanHtmlText(rawDateVal)

      // Exclude recruitment, careers, and general administrative tenders
      const docLower = docType.toLowerCase()
      if (docLower.includes('career') || docLower.includes('vacancy') || docLower.includes('tender')) {
        continue
      }

      const mainListMatch = block.match(/<div[^>]*class=["'][^"']*main-list[^"']*["'][\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i)
      if (!mainListMatch) continue

      const rawHref = (mainListMatch[1] || '').trim()
      const rawTitle = mainListMatch[2]
      if (!rawTitle) continue
      const title = cleanHtmlText(rawTitle)
      if (!title || title.length < 5) continue

      const parsedDate = parseIndianDate(rawDate)
      if (!parsedDate || !isWithinHours(parsedDate, lookbackHours)) continue

      const year = parsedDate.getFullYear()
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
      const day = String(parsedDate.getDate()).padStart(2, '0')
      const isoDate = `${year}-${month}-${day}`

      let sourceUrl = rawHref
      if (sourceUrl && !sourceUrl.startsWith('http')) {
        sourceUrl = `https://ifsca.gov.in/${sourceUrl.replace(/^\/+/, '')}`
      }

      const pdfUrl = sourceUrl.endsWith('.pdf') ? sourceUrl : undefined

      updates.push({
        id: createHash('IFSCA', isoDate, title),
        regulator: 'IFSCA',
        regulatorLabel: 'IFSCA (GIFT City)',
        category: 'IFSCA',
        title,
        date: isoDate,
        rawDateStr: rawDate,
        sourceUrl,
        pdfUrl,
        circularNo: `IFSCA ${docType}`,
        snippet: `IFSCA ${docType} (${rawDate}): ${title}`
      })
    }
  } catch (err) {
    console.warn('[Radar] IFSCA fetch failed:', err)
  }

  return updates
}


