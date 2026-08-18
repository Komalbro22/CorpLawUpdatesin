// lib/regulator-radar/sources.ts
import { RegulatorKey, RegulatorUpdate, SourceCheckResult } from './types'
import { Category } from '@/types'

const FETCH_TIMEOUT_MS = 7000 // 7 seconds max per source

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
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
 * - "August 18, 2026", "Aug 18 2026", "18 August 2026", "18-Aug-2026", "17 Aug, 2026 +0530"
 * - "18/08/2026", "10.8.2026", "07-08-2026"
 * - "2026-08-18" (ISO)
 */
export function parseIndianDate(raw: string): Date | null {
  if (!raw) return null
  const cleaned = raw
    .replace(/\+[0-9]{4}/g, '') // remove timezone e.g. +0530
    .replace(/GMT|IST|UTC/gi, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // 1. "August 18 2026" or "Aug 18 2026"
  const m1 = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})/)
  if (m1) {
    const monthStr = m1[1].slice(0, 3).toLowerCase()
    const day = parseInt(m1[2], 10)
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

  // 2. "18 Aug 2026" or "18-Aug-2026" or "18 August 2026"
  const m2 = cleaned.match(/(\d{1,2})[\s\-]+([A-Za-z]+)[\s\-]+(\d{4})/)
  if (m2) {
    const day = parseInt(m2[1], 10)
    const monthStr = m2[2].slice(0, 3).toLowerCase()
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

  // 3. "18/08/2026" or "10.8.2026" or "07-08-2026"
  const m3 = cleaned.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
  if (m3) {
    const day = parseInt(m3[1], 10)
    const month = parseInt(m3[2], 10) - 1
    const year = parseInt(m3[3], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  // 4. "2026-08-18" (ISO)
  const m4 = cleaned.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (m4) {
    const year = parseInt(m4[1], 10)
    const month = parseInt(m4[2], 10) - 1
    const day = parseInt(m4[3], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  const fallback = new Date(cleaned)
  return isNaN(fallback.getTime()) ? null : fallback
}

/**
 * Filter within the specified hour window (e.g. 72h / 3 days to cover weekends)
 */
export function isWithinHours(date: Date, maxHours = 72): boolean {
  if (!date || isNaN(date.getTime())) return false
  const now = Date.now()
  const diffMs = now - date.getTime()
  const maxPastMs = maxHours * 60 * 60 * 1000
  const maxFutureMs = 24 * 60 * 60 * 1000 // allow timezone buffer
  return diffMs <= maxPastMs && diffMs >= -maxFutureMs
}

/**
 * Fetch HTML/XML with fallback via multiple proxy mirrors
 */
async function fetchHtmlOrXml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 0 }
    })
    if (res.ok) {
      const text = await res.text()
      if (text && text.length > 50) return text
    }
  } catch (directErr) {}

  // Mirror 1: AllOrigins
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const proxyRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (proxyRes.ok) {
      const data = await proxyRes.json()
      if (data.contents && data.contents.length > 50) return data.contents
    }
  } catch (p1Err) {}

  // Mirror 2: CodeTabs CORS
  try {
    const proxyUrl2 = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    const proxyRes2 = await fetch(proxyUrl2, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (proxyRes2.ok) {
      const text = await proxyRes2.text()
      if (text && text.length > 50) return text
    }
  } catch (p2Err) {}

  throw new Error(`Failed to fetch source from ${url}`)
}

/**
 * Extract clean, valid source & PDF URLs
 */
function extractValidUrl(rawHref: string | undefined, rowHtml: string, baseUrl: string, fallbackUrl: string): string {
  if (rawHref && !rawHref.toLowerCase().startsWith('javascript') && rawHref.trim() !== '#') {
    let clean = rawHref.trim().replace(/^["']|["']$/g, '')
    if (clean.startsWith('http')) return clean
    return `${baseUrl.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`
  }

  const pdfMatch = rowHtml.match(/href=(?:["']([^"']+\.pdf[^"']*)["']|([^\s>]+\.pdf[^\s>]*))/i)
  if (pdfMatch) {
    const val = (pdfMatch[1] || pdfMatch[2] || '').trim().replace(/^["']|["']$/g, '')
    if (val && !val.toLowerCase().startsWith('javascript')) {
      if (val.startsWith('http')) return val
      return `${baseUrl.replace(/\/+$/, '')}/${val.replace(/^\/+/, '')}`
    }
  }

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
   1. RBI & FEMA (Press Releases & Circulars)
   ========================================================================= */
export async function fetchFemaAndRbi(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  // 1A. RBI Press Releases (Includes Market Ops, VRRR, Sovereign Gold Bonds, Regulatory Decisions)
  try {
    const prUrl = 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx'
    const html = await fetchHtmlOrXml(prUrl)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const r of rows) {
      if (!r.includes('link2')) continue

      // Support quoted or unquoted href (e.g. href=BS_PressReleaseDisplay.aspx?prid=63394)
      const aMatch = r.match(/<a[^>]*class=["']?link2["']?[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i) ||
                    r.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*class=["']?link2["']?[^>]*>([\s\S]*?)<\/a>/i)

      if (!aMatch) continue

      const rawHref = aMatch[1] || aMatch[2]
      const title = cleanHtmlText(aMatch[3])
      if (!title || title.length < 5) continue

      // Date from row or within title (e.g. "held on August 18, 2026")
      const dateMatch = r.match(/([A-Za-z]+\s+\d{1,2}\s*,?\s*\d{4}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)
      if (!dateMatch) continue

      const parsedDate = parseIndianDate(dateMatch[1])
      if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

      const pdfMatch = r.match(/href=(?:["']([^"']+\.pdf[^"']*)["']|([^\s>]+\.pdf[^\s>]*))/i)
      const pdfUrl = pdfMatch ? (pdfMatch[1] || pdfMatch[2]) : undefined

      const href = extractValidUrl(rawHref, r, 'https://rbi.org.in/Scripts', prUrl)
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
        snippet: `RBI official press release / notification: ${title}`
      })
    }
  } catch (err) {
    console.warn('[Radar] RBI PR fetch failed:', err)
  }

  // 1B. RBI Circulars (A.P. DIR Series & Banking Directions)
  try {
    const circUrl = 'https://rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx'
    const html = await fetchHtmlOrXml(circUrl)
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

      const href = extractValidUrl(rawHref, r, 'https://rbi.org.in/Scripts', circUrl)
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
   2. SEBI (Securities and Exchange Board of India)
   ========================================================================= */
export async function fetchSebi(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.sebi.gov.in/sebirss.xml'

  try {
    const xml = await fetchHtmlOrXml(url)
    const cleanXml = xml.replace(/<!--[\s\S]*?-->/g, '')
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(cleanXml)) !== null && updates.length < 20) {
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
   3. EPFO & ESIC & LABOUR
   ========================================================================= */
export async function fetchLabourAndEpfo(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []

  // 3A. EPFO Circulars
  try {
    const epfoHtml = await fetchHtmlOrXml('https://www.epfindia.gov.in/site_en/Circulars.php')
    const cleanHtml = epfoHtml.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const row of rows) {
      if (row.includes('<th')) continue

      const aMatch = row.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        const rawHref = aMatch[1] || aMatch[2]
        const title = cleanHtmlText(aMatch[3]) || 'EPFO Office Order / Circular'
        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const href = extractValidUrl(rawHref, row, 'https://www.epfindia.gov.in', 'https://www.epfindia.gov.in/site_en/Circulars.php')
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
          snippet: `EPFO Circular / Order: ${title}`
        })
      }
    }
  } catch (err) {
    console.warn('[Radar] EPFO fetch failed:', err)
  }

  // 3B. ESIC Circulars
  try {
    const esicHtml = await fetchHtmlOrXml('https://www.esic.gov.in/circulars')
    const cleanHtml = esicHtml.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const row of rows) {
      if (row.includes('<th')) continue

      const aMatch = row.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        const rawHref = aMatch[1] || aMatch[2]
        const title = cleanHtmlText(aMatch[3])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const href = extractValidUrl(rawHref, row, 'https://www.esic.gov.in', 'https://www.esic.gov.in/circulars')
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
export async function fetchMca(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.mca.gov.in/content/mca/global/en/notifications-circulars/notifications.html'

  try {
    const html = await fetchHtmlOrXml(url)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const row of rows) {
      if (row.includes('<th')) continue

      const aMatch = row.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        const rawHref = aMatch[1] || aMatch[2]
        const title = cleanHtmlText(aMatch[3])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const href = extractValidUrl(rawHref, row, 'https://www.mca.gov.in', url)
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
export async function fetchCci(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://cci.gov.in/whats-new'

  try {
    const html = await fetchHtmlOrXml(url)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const row of rows) {
      if (row.includes('<th')) continue

      const aMatch = row.match(/<a[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)
      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)

      if (aMatch && dateMatch) {
        const rawHref = aMatch[1] || aMatch[2]
        const title = cleanHtmlText(aMatch[3])
        if (!title || title.length < 5) continue

        const parsedDate = parseIndianDate(dateMatch[1])
        if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

        const href = extractValidUrl(rawHref, row, 'https://cci.gov.in', url)
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
export async function fetchIbbi(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://ibbi.gov.in/legal-framework/circulars'

  try {
    const html = await fetchHtmlOrXml(url)
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    const rows = cleanHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const row of rows) {
      if (row.includes('<th')) continue

      const dateMatch = row.match(/(\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)
      if (!dateMatch) continue

      const parsedDate = parseIndianDate(dateMatch[1])
      if (!parsedDate || !isWithinHours(parsedDate, maxHours)) continue

      const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []
      const titleRaw = tdMatches[2] || tdMatches[1] || ''
      const title = cleanHtmlText(titleRaw)
      if (!title || title.length < 5) continue

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
export async function fetchTax(maxHours = 72): Promise<RegulatorUpdate[]> {
  const updates: RegulatorUpdate[] = []
  const url = 'https://www.incometax.gov.in/iec/foportal/latest-news'

  try {
    const html = await fetchHtmlOrXml(url)
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

        const href = extractValidUrl(rawHref, itemHtml, 'https://www.incometax.gov.in', url)
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
