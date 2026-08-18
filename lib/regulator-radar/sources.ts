// lib/regulator-radar/sources.ts
import { RegulatorKey, RegulatorUpdate, SourceCheckResult } from './types'
import { Category } from '@/types'

const FETCH_TIMEOUT_MS = 6000 // 6 seconds max per source

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

/**
 * Decode HTML entities and clean text
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
 * Robust date parser supporting all Indian Government portal date formats:
 * - 09 Jul, 2026 / 09 July 2026 / 9 Jul 2026 / 9 July 2026
 * - 18/08/2026 / 18-08-2026 / 18.08.2026
 * - Aug 18, 2026 / August 18, 2026
 * - 2026-08-18 (ISO)
 */
export function parseIndianDate(raw: string): Date | null {
  if (!raw) return null
  const cleaned = raw.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()

  // 1. "09 Jul 2026" or "09 July 2026" or "9 Jul 2026"
  const wordMatch = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/)
  if (wordMatch) {
    const day = parseInt(wordMatch[1], 10)
    const monthName = wordMatch[2].slice(0, 3).toLowerCase()
    const year = parseInt(wordMatch[3], 10)
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    }
    if (monthName in months) {
      const d = new Date(year, months[monthName], day)
      if (!isNaN(d.getTime())) return d
    }
  }

  // 2. "Aug 18 2026" or "August 18 2026"
  const wordFirstMatch = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})/)
  if (wordFirstMatch) {
    const monthName = wordFirstMatch[1].slice(0, 3).toLowerCase()
    const day = parseInt(wordFirstMatch[2], 10)
    const year = parseInt(wordFirstMatch[3], 10)
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    }
    if (monthName in months) {
      const d = new Date(year, months[monthName], day)
      if (!isNaN(d.getTime())) return d
    }
  }

  // 3. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    const year = parseInt(dmyMatch[3], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  // 4. YYYY-MM-DD
  const ymdMatch = cleaned.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10)
    const month = parseInt(ymdMatch[2], 10) - 1
    const day = parseInt(ymdMatch[3], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  // 5. Fallback native parse if string is standard
  const fallback = new Date(cleaned)
  return isNaN(fallback.getTime()) ? null : fallback
}

/**
 * Strict filter: only within the last `maxHours` (default 48 hours / 2 days)
 */
export function isWithinHours(date: Date, maxHours = 48): boolean {
  if (!date || isNaN(date.getTime())) return false
  const now = Date.now()
  const diffMs = now - date.getTime()
  // Max past hours & allow up to 24h future timezone offsets
  const maxPastMs = maxHours * 60 * 60 * 1000
  const maxFutureMs = 24 * 60 * 60 * 1000
  return diffMs <= maxPastMs && diffMs >= -maxFutureMs
}

/**
 * Fetch with timeout & CORS proxy fallback
 */
async function fetchHtmlOrXml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 0 }
    })
    if (res.ok) {
      return await res.text()
    }
  } catch (directErr) {
    // Direct fetch failed, fallback to proxy
  }

  // Fallback via AllOrigins
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  const proxyRes = await fetch(proxyUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  })
  if (proxyRes.ok) {
    const data = await proxyRes.json()
    return data.contents || ''
  }

  throw new Error(`Failed to fetch source from ${url}`)
}

/**
 * Helper to extract real valid URL from a table row or anchor tag
 * Strips javascript:void(0), #, etc. and finds the true PDF / web target.
 */
function extractValidUrl(rawHref: string | undefined, rowHtml: string, baseUrl: string, fallbackUrl: string): string {
  // 1. Check if rawHref is a valid http / relative link (not javascript:)
  if (rawHref && !rawHref.toLowerCase().startsWith('javascript') && rawHref.trim() !== '#') {
    let clean = rawHref.trim().replace(/^["']|["']$/g, '')
    if (clean.startsWith('http')) return clean
    return `${baseUrl.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`
  }

  // 2. Search rowHtml for an actual .pdf link
  const pdfMatch = rowHtml.match(/href=["']?([^"'>\s]+\.pdf[^"'>\s]*)["']?/i)
  if (pdfMatch && pdfMatch[1] && !pdfMatch[1].toLowerCase().startsWith('javascript')) {
    let clean = pdfMatch[1].trim().replace(/^["']|["']$/g, '')
    if (clean.startsWith('http')) return clean
    return `${baseUrl.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`
  }

  // 3. Search rowHtml for any valid anchor href that isn't javascript
  const validLinkMatch = rowHtml.match(/href=["']?((?!javascript|#)[^"'>\s]+)["']?/i)
  if (validLinkMatch && validLinkMatch[1]) {
    let clean = validLinkMatch[1].trim().replace(/^["']|["']$/g, '')
    if (clean.startsWith('http')) return clean
    return `${baseUrl.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`
  }

  // 4. Safe fallback to the portal listing page
  return fallbackUrl
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
   1. FEMA & RBI (Foreign Exchange & Banking)
   ========================================================================= */
export async function fetchFemaAndRbi(maxHours = 48): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const urls = [
    {
      url: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
      type: 'PR',
      regulator: 'RBI' as RegulatorKey,
      category: 'RBI' as Category,
      fallbackUrl: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx'
    },
    {
      url: 'https://rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx',
      type: 'CIRCULAR',
      regulator: 'FEMA' as RegulatorKey,
      category: 'FEMA' as Category,
      fallbackUrl: 'https://rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx'
    }
  ]

  for (const target of urls) {
    try {
      const html = await fetchHtmlOrXml(target.url)
      const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
      let rowMatch: RegExpExecArray | null

      while ((rowMatch = rowRegex.exec(cleanHtml)) !== null && updates.length < 15) {
        const rowHtml = rowMatch[1]
        if (!rowHtml.includes('link2')) continue

        const aMatch = /<a[^>]+href=["']([^"']+)["'][^>]*class=["']link2["'][^>]*>([\s\S]*?)<\/a>/i.exec(rowHtml)
        if (!aMatch) continue

        const title = cleanHtmlText(aMatch[2])
        if (!title || title.length < 5) continue

        // Extract date strictly from row
        const dateMatch = rowHtml.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|[A-Za-z]+\s+\d{1,2}\s*,\s*\d{4})/i)
        if (!dateMatch) continue // Strict: must have a parsed date!

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: must be within last 48h!

        const href = extractValidUrl(aMatch[1], rowHtml, 'https://rbi.org.in/Scripts/', target.fallbackUrl)

        const isFema = title.toLowerCase().includes('foreign exchange') || 
                       title.toLowerCase().includes('fema') || 
                       title.toLowerCase().includes('a.p. (dir') || 
                       title.toLowerCase().includes('external commercial') ||
                       title.toLowerCase().includes('fdi') ||
                       target.regulator === 'FEMA'

        const regulator: RegulatorKey = isFema ? 'FEMA' : 'RBI'
        const category: Category = isFema ? 'FEMA' : 'RBI'
        const isoDate = formatIsoDate(parsedDate)

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
          snippet: `Official RBI / FEMA announcement: ${title}`
        })
      }
    } catch (err) {
      console.warn(`[Radar] RBI/FEMA fetch failed for ${target.url}:`, err)
    }
  }

  return updates
}

/* =========================================================================
   2. SEBI (Securities and Exchange Board of India)
   ========================================================================= */
export async function fetchSebi(maxHours = 48): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.sebi.gov.in/sebirss.xml'

  try {
    const xml = await fetchHtmlOrXml(url)
    const cleanXml = xml.replace(/<!--[\s\S]*?-->/g, '')
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null
    let count = 0

    while ((match = itemRegex.exec(cleanXml)) !== null && count < 10) {
      count++
      const itemXml = match[1]
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i)
      const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || itemXml.match(/<link>([\s\S]*?)<\/link>/i)
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)

      if (titleMatch && linkMatch) {
        const title = cleanHtmlText(titleMatch[1])
        const link = linkMatch[1].trim()
        const rawDate = dateMatch ? dateMatch[1].trim() : ''
        
        if (!rawDate) continue
        const parsedDate = parseIndianDate(rawDate)
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: discard older than 48h!

        const isoDate = formatIsoDate(parsedDate)
        updates.push({
          id: createHash('SEBI', isoDate, title),
          regulator: 'SEBI',
          regulatorLabel: 'SEBI (Securities Board)',
          category: 'SEBI',
          title,
          date: isoDate,
          rawDateStr: rawDate,
          sourceUrl: link || 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0',
          pdfUrl: link.endsWith('.pdf') ? link : undefined,
          snippet: `SEBI circular / notification: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] SEBI RSS fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   3. EPFO & ESIC & LABOUR (Ministry of Labour & Employment)
   ========================================================================= */
export async function fetchLabourAndEpfo(maxHours = 48): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  // Source A: EPFO
  try {
    const epfoHtml = await fetchHtmlOrXml('https://www.epfindia.gov.in/site_en/Circulars.php')
    const cleanHtml = epfoHtml.replace(/<!--[\s\S]*?-->/g, '')
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let match: RegExpExecArray | null
    let count = 0

    while ((match = rowRegex.exec(cleanHtml)) !== null && count < 10) {
      const row = match[1]
      if (row.includes('<th')) continue

      const aMatch = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(row)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        count++
        const title = cleanHtmlText(aMatch[2]) || 'EPFO Office Order / Circular'
        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: 48h filter!

        const href = extractValidUrl(aMatch[1], row, 'https://www.epfindia.gov.in', 'https://www.epfindia.gov.in/site_en/Circulars.php')
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('EPFO', isoDate, title),
          regulator: 'EPFO',
          regulatorLabel: 'EPFO (Provident Fund)',
          category: 'LABOUR',
          title: title.startsWith('EPFO') ? title : `EPFO: ${title}`,
          date: isoDate,
          rawDateStr: dateMatch[1].trim(),
          sourceUrl: href,
          pdfUrl: href.endsWith('.pdf') ? href : undefined,
          snippet: `EPFO Circular / Order dated ${isoDate}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] EPFO fetch failed:', err)
  }

  // Source B: ESIC
  try {
    const esicHtml = await fetchHtmlOrXml('https://www.esic.gov.in/circulars')
    const cleanHtml = esicHtml.replace(/<!--[\s\S]*?-->/g, '')
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let match: RegExpExecArray | null
    let count = 0

    while ((match = rowRegex.exec(cleanHtml)) !== null && count < 10) {
      const row = match[1]
      if (row.includes('<th')) continue

      const aMatch = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(row)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        count++
        const title = cleanHtmlText(aMatch[2])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: 48h filter!

        const href = extractValidUrl(aMatch[1], row, 'https://www.esic.gov.in', 'https://www.esic.gov.in/circulars')
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('ESIC', isoDate, title),
          regulator: 'ESIC',
          regulatorLabel: 'ESIC (Employees Insurance)',
          category: 'LABOUR',
          title: title.startsWith('ESIC') ? title : `ESIC: ${title}`,
          date: isoDate,
          rawDateStr: dateMatch[1].trim(),
          sourceUrl: href,
          pdfUrl: href.endsWith('.pdf') ? href : undefined,
          snippet: `ESIC Instruction / Circular: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] ESIC fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   4. MCA (Ministry of Corporate Affairs)
   ========================================================================= */
export async function fetchMca(maxHours = 48): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.mca.gov.in/content/mca/global/en/notifications-circulars/notifications.html'

  try {
    const html = await fetchHtmlOrXml(url)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let match: RegExpExecArray | null
    let count = 0

    while ((match = rowRegex.exec(cleanHtml)) !== null && count < 10) {
      const row = match[1]
      if (row.includes('<th')) continue

      const aMatch = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(row)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        count++
        const title = cleanHtmlText(aMatch[2])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: 48h filter!

        const href = extractValidUrl(aMatch[1], row, 'https://www.mca.gov.in', url)
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('MCA', isoDate, title),
          regulator: 'MCA',
          regulatorLabel: 'Ministry of Corporate Affairs',
          category: 'MCA',
          title,
          date: isoDate,
          rawDateStr: dateMatch[1].trim(),
          sourceUrl: href,
          pdfUrl: href.endsWith('.pdf') ? href : undefined,
          snippet: `MCA General Circular / Notification: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] MCA fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   5. CCI (Competition Commission of India)
   ========================================================================= */
export async function fetchCci(maxHours = 48): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://cci.gov.in/whats-new'

  try {
    const html = await fetchHtmlOrXml(url)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let match: RegExpExecArray | null
    let count = 0

    while ((match = rowRegex.exec(cleanHtml)) !== null && count < 10) {
      const row = match[1]
      if (row.includes('<th')) continue

      const aMatch = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(row)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        count++
        const title = cleanHtmlText(aMatch[2])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: 48h filter!

        const href = extractValidUrl(aMatch[1], row, 'https://cci.gov.in', url)
        const isoDate = formatIsoDate(parsedDate)

        updates.push({
          id: createHash('CCI', isoDate, title),
          regulator: 'CCI',
          regulatorLabel: 'Competition Commission of India',
          category: 'CCI',
          title: title.startsWith('CCI') ? title : `CCI: ${title}`,
          date: isoDate,
          rawDateStr: dateMatch[1].trim(),
          sourceUrl: href,
          pdfUrl: href.endsWith('.pdf') ? href : undefined,
          snippet: `CCI Order / Notification: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] CCI fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   6. IBBI (Insolvency and Bankruptcy Board of India)
   ========================================================================= */
export async function fetchIbbi(maxHours = 48): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://ibbi.gov.in/legal-framework/circulars'

  try {
    const html = await fetchHtmlOrXml(url)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '') // Strip comments first!
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let match: RegExpExecArray | null
    let count = 0

    while ((match = rowRegex.exec(cleanHtml)) !== null && count < 10) {
      const row = match[1]
      if (row.includes('<th')) continue

      // Extract date strictly from row
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)
      if (!dateMatch) continue // Strict: must have date!

      const parsedDate = parseIndianDate(dateMatch[1])
      if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: must be within last 48h!

      // Extract subject text from 3rd <td> column
      const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []
      const titleRaw = tdMatches[2] || tdMatches[1] || ''
      const title = cleanHtmlText(titleRaw)
      if (!title || title.length < 5) continue

      // Extract real PDF download link
      const href = extractValidUrl(undefined, row, 'https://ibbi.gov.in', url)
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
        snippet: `IBBI Circular / Guideline: ${title}`
      })
    }
  } catch (err) {
    console.warn('[Radar] IBBI fetch failed:', err)
  }

  return updates
}

/* =========================================================================
   7. CBIC & CBDT (Income Tax & GST)
   ========================================================================= */
export async function fetchTax(maxHours = 48): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.incometax.gov.in/iec/foportal/latest-news'

  try {
    const html = await fetchHtmlOrXml(url)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let match: RegExpExecArray | null
    let count = 0

    while ((match = itemRegex.exec(cleanHtml)) !== null && count < 8) {
      const itemHtml = match[1]
      const aMatch = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(itemHtml)
      const dateMatch = itemHtml.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        count++
        const title = cleanHtmlText(aMatch[2])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue // Strict: 48h filter!

        const href = extractValidUrl(aMatch[1], itemHtml, 'https://www.incometax.gov.in', url)
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
  } catch (err) {
    console.warn('[Radar] TAX fetch failed:', err)
  }

  return updates
}
