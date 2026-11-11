import { supabaseAdmin } from '@/lib/supabase-server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'
import sanitizeHtmlLib from 'sanitize-html'

export interface NewsletterPdfRecord {
  id: string
  slug: string
  week_label: string
  week_start: string
  week_end: string
  file_path: string
  html_path?: string | null
  file_size_bytes: number
  uploaded_by: string
  download_count: number
  created_at: string
  updated_at: string
  public_url?: string
  direct_storage_url?: string
  reading_url?: string
  has_html?: boolean
}

const STORAGE_BUCKET = 'newsletter-pdfs'
const SITE_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.corplawupdates.in'

/**
 * Sanitize a filename or slug to kebab-case alphanumeric characters.
 */
export function sanitizeNewsletterSlug(input: string, fallbackWeekEnd?: string): string {
  const base = input
    .replace(/\.pdf$/i, '')
    .replace(/\.html?$/i, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (base) return base
  return `weekly-briefing-${fallbackWeekEnd || new Date().toISOString().split('T')[0]}`
}

/**
 * Format raw bytes into human-readable format (KB or MB).
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB'
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Defensively sanitize Muse / Admin generated newsletter briefing HTML fragments.
 * Retains broadsheet design tokens: tables, headings, divs, spans, inline styles & links.
 * Strips all script tags, iframes, forms, inputs, event handlers, and javascript: URIs.
 */
const BRIEFING_ALLOWED_TAGS = [
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'div', 'span', 'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'b', 'i', 'strong', 'em', 'u', 's', 'strike',
  'ul', 'ol', 'li', 'blockquote', 'section', 'article', 'header', 'footer',
  'small', 'sub', 'sup', 'center'
]

const BRIEFING_ALLOWED_ATTR = [
  'style', 'class', 'id', 'width', 'height', 'align', 'valign',
  'border', 'cellpadding', 'cellspacing', 'colspan', 'rowspan',
  'bgcolor', 'color', 'dir'
]

export function sanitizeBriefingHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''

  return sanitizeHtmlLib(html, {
    allowedTags: BRIEFING_ALLOWED_TAGS,
    allowedAttributes: {
      '*': BRIEFING_ALLOWED_ATTR,
      'a': ['href', 'target', 'rel', 'title', 'class', 'style', 'id'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'class', 'style', 'id', 'loading'],
      'table': ['style', 'class', 'id', 'width', 'height', 'border', 'cellpadding', 'cellspacing', 'bgcolor', 'align'],
      'td': ['style', 'class', 'id', 'width', 'height', 'border', 'colspan', 'rowspan', 'align', 'valign', 'bgcolor'],
      'th': ['style', 'class', 'id', 'width', 'height', 'border', 'colspan', 'rowspan', 'align', 'valign', 'bgcolor'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      'a': ['http', 'https', 'mailto', 'tel'],
    },
    disallowedTagsModes: 'discard',
  })
}

/**
 * Generate canonical public URLs for a newsletter PDF record.
 *  - reading_url: /newsletters/<slug> (reads online)
 *  - public_url: /newsletters/<slug>/download (302 redirects to PDF)
 *  - direct_storage_url: direct CDN URL with timestamp cache-buster
 */
export function enrichNewsletterUrls(record: NewsletterPdfRecord): NewsletterPdfRecord {
  const readingUrl = `${SITE_BASE_URL}/newsletters/${record.slug}`
  const downloadUrl = `${SITE_BASE_URL}/newsletters/${record.slug}/download`
  
  // Storage public URL from primary Supabase with timestamp query for instant cache-busting
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(record.file_path)

  const timestamp = record.updated_at ? new Date(record.updated_at).getTime() : Date.now()
  const directStorageUrl = `${data.publicUrl}?v=${timestamp}`

  return {
    ...record,
    reading_url: readingUrl,
    public_url: downloadUrl,
    direct_storage_url: directStorageUrl,
    has_html: !!record.html_path,
  }
}

const htmlCache = new Map<string, { content: string; timestamp: number }>()
const HTML_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch raw HTML text from Supabase storage for a stored briefing.
 */
export async function fetchBriefingHtml(htmlPath: string): Promise<string | null> {
  if (!htmlPath) return null
  const now = Date.now()
  const cached = htmlCache.get(htmlPath)
  if (cached && now - cached.timestamp < HTML_CACHE_TTL_MS) {
    return cached.content
  }

  try {
    // 1. Download from Primary Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(htmlPath)

    if (!error && data) {
      const text = await data.text()
      htmlCache.set(htmlPath, { content: text, timestamp: now })
      return text
    }

    // 2. Fallback to Secondary Supabase storage if available
    if (supabaseDocumentsAdmin) {
      const sec = await supabaseDocumentsAdmin.storage
        .from(STORAGE_BUCKET)
        .download(htmlPath)
      if (!sec.error && sec.data) {
        const text = await sec.data.text()
        htmlCache.set(htmlPath, { content: text, timestamp: now })
        return text
      }
    }

    return null
  } catch (err) {
    console.warn(`[NewsletterPDF] Failed to download briefing HTML '${htmlPath}':`, err)
    return null
  }
}

/**
 * Extract summary intelligence from stored broadsheet HTML for cards & social metadata.
 */
export function extractBriefingSummary(html?: string | null): {
  leadHeadline: string | null
  deck: string | null
  updateCount: string | null
} {
  if (!html || typeof html !== 'string') {
    return { leadHeadline: null, deck: null, updateCount: null }
  }

  // 1. Extract Lead Headline (inside .headline or h1)
  const headlineMatch = html.match(/class=["'][^"']*\bheadline\b[^"']*["'][^>]*>([\s\S]*?)<\//i)
  const rawHeadline = headlineMatch ? headlineMatch[1].replace(/<[^>]+>/g, '').trim() : null

  // 2. Extract Deck / Sub-headline
  const deckMatch = html.match(/class=["'][^"']*\bdeck\b[^"']*["'][^>]*>([\s\S]*?)<\//i)
  const rawDeck = deckMatch ? deckMatch[1].replace(/<[^>]+>/g, '').trim() : null

  // 3. Extract update count (strip HTML tags first to match text across nested elements)
  const plainText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const countMatch = plainText.match(/(\d+)\s+(?:statutory|regulatory|total|updates|orders|circulars)/i)
  const rawCount = countMatch ? countMatch[0].trim() : null

  return {
    leadHeadline: rawHeadline,
    deck: rawDeck,
    updateCount: rawCount,
  }
}

export interface BriefingMetadata {
  leadHeadline: string | null
  deck: string | null
  updateCount: string | null
  leadCategory: string
  leadCategoryLabel: string
  regulators: string[]
  publishedIso: string
  title: string
  description: string
  ogImageUrl: string
}

const REGULATOR_MATCHERS: Array<{ slug: string; label: string; patterns: RegExp[] }> = [
  { slug: 'taxation', label: 'Taxation', patterns: [/\btaxation\b/i, /\bgstn?\b/i, /\bcbdt\b/i, /\bcbic\b/i, /\bcustoms\b/i, /\bincome tax\b/i] },
  { slug: 'mca', label: 'MCA', patterns: [/\bmca\b/i, /\broc\b/i, /\bcompanies act\b/i] },
  { slug: 'sebi', label: 'SEBI', patterns: [/\bsebi\b/i] },
  { slug: 'rbi', label: 'RBI', patterns: [/\brbi\b/i] },
  { slug: 'ifsca', label: 'IFSCA', patterns: [/\bifsca\b/i] },
  { slug: 'fema', label: 'FEMA', patterns: [/\bfema\b/i] },
  { slug: 'ibc', label: 'IBC', patterns: [/\bibc\b/i, /\bibbi\b/i] },
  { slug: 'nclt', label: 'NCLT', patterns: [/\bnclt\b/i, /\bnclat\b/i] },
  { slug: 'cci', label: 'CCI', patterns: [/\bcci\b/i] },
  { slug: 'labour', label: 'Labour', patterns: [/\blabour\b/i, /\bepfo\b/i, /\besic\b/i, /\bosh\b/i] },
]

function matchRegulator(text: string): { slug: string; label: string } | null {
  for (const item of REGULATOR_MATCHERS) {
    if (item.patterns.some(re => re.test(text))) {
      return { slug: item.slug, label: item.label }
    }
  }
  return null
}

/**
 * Compute the edition's Monday broadcast date in ISO 8601 IST (+05:30).
 * Prefers a Monday YYYY-MM-DD date in the slug, otherwise derives the Monday immediately following week_end.
 */
export function getNewsletterMondayIso(record: {
  slug: string
  week_end?: string | null
  created_at?: string | null
}): string {
  const slugDateMatch = record.slug.match(/(\d{4}-\d{2}-\d{2})$/)
  if (slugDateMatch) {
    const dt = new Date(`${slugDateMatch[1]}T00:00:00Z`)
    if (!Number.isNaN(dt.getTime()) && dt.getUTCDay() === 1) {
      return `${slugDateMatch[1]}T05:00:00+05:30`
    }
  }

  if (record.week_end && /^\d{4}-\d{2}-\d{2}$/.test(record.week_end)) {
    const dt = new Date(`${record.week_end}T00:00:00Z`)
    if (!Number.isNaN(dt.getTime())) {
      const day = dt.getUTCDay()
      const daysUntilMonday = day === 1 ? 0 : (8 - day) % 7
      dt.setUTCDate(dt.getUTCDate() + daysUntilMonday)
      return `${dt.toISOString().slice(0, 10)}T05:00:00+05:30`
    }
  }

  return record.created_at || new Date().toISOString()
}

/**
 * Extract structured SEO metadata (lead category, regulators covered, dynamic description,
 * OG image URL, and edition Monday publish timestamp) from a stored broadsheet HTML edition.
 */
export function extractBriefingMetadata(
  rawHtml: string | null | undefined,
  record: { slug: string; week_label: string; week_end?: string | null; created_at?: string | null }
): BriefingMetadata {
  const summary = extractBriefingSummary(rawHtml)
  const cleanHtml = (rawHtml || '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')

  let leadMatch: { slug: string; label: string } | null = null

  // 1. Inspect the kicker immediately preceding "Lead Story" or <h2 class="headline">
  const leadKickerMatch = cleanHtml.match(/>([^<>]{2,100}?\bLead\s*Story[^<>]{0,40})</i)
  if (leadKickerMatch) {
    leadMatch = matchRegulator(leadKickerMatch[1])
  }

  if (!leadMatch) {
    const headlineIdx = cleanHtml.search(/<h2\b[^>]*class=["'][^"']*headline[^"']*["']/i)
    if (headlineIdx > 0) {
      const contextBefore = cleanHtml
        .slice(Math.max(0, headlineIdx - 350), headlineIdx)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      leadMatch = matchRegulator(contextBefore)
    }
  }

  if (!leadMatch && summary.leadHeadline) {
    leadMatch = matchRegulator(summary.leadHeadline)
  }

  const foundRegulators: string[] = []
  const addRegulator = (label: string) => {
    if (!foundRegulators.includes(label)) {
      foundRegulators.push(label)
    }
  }

  if (leadMatch) {
    addRegulator(leadMatch.label)
  }

  // 2. Collect all regulators from uppercase kickers & middle-dot regulator strips
  const kickerTexts = Array.from(cleanHtml.matchAll(/text-transform:\s*uppercase[^>]*>([^<]{2,140})</gi)).map(m => m[1])
  const strippedBody = cleanHtml.replace(/<[^>]+>/g, ' ')

  for (const snippet of kickerTexts) {
    for (const reg of REGULATOR_MATCHERS) {
      if (reg.patterns.some(re => re.test(snippet))) {
        addRegulator(reg.label)
      }
    }
  }

  for (const reg of REGULATOR_MATCHERS) {
    // Only scan full text for crisp acronyms / explicit regulator words so generic words don't over-match
    if (new RegExp(`\\b${reg.label}\\b`, 'i').test(strippedBody)) {
      addRegulator(reg.label)
    }
  }

  if (!leadMatch && foundRegulators.length > 0) {
    const first = REGULATOR_MATCHERS.find(r => r.label === foundRegulators[0])
    if (first) leadMatch = { slug: first.slug, label: first.label }
  }

  const finalLead = leadMatch || { slug: 'mca', label: 'MCA' }
  const regulators = foundRegulators.length > 0 ? foundRegulators : ['MCA', 'SEBI', 'RBI', 'IBC']
  const regulatorsDisplay = regulators.slice(0, 6).join(', ')

  const title = `CorpLawUpdates Weekly Briefing: ${record.week_label}`
  const countSuffix = summary.updateCount ? ` (${summary.updateCount})` : ''
  const description = summary.leadHeadline
    ? `${summary.leadHeadline}. Official weekly briefing for ${record.week_label} covering ${regulatorsDisplay}${countSuffix}.`
    : `Read the official weekly corporate law briefing for ${record.week_label} covering ${regulatorsDisplay}${countSuffix} statutory developments.`

  const ogImageUrl = `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(`Weekly Briefing: ${record.week_label}`)}&category=${encodeURIComponent(finalLead.slug.toUpperCase())}`
  const publishedIso = getNewsletterMondayIso(record)

  return {
    leadHeadline: summary.leadHeadline,
    deck: summary.deck,
    updateCount: summary.updateCount,
    leadCategory: finalLead.slug,
    leadCategoryLabel: finalLead.label,
    regulators,
    publishedIso,
    title,
    description,
    ogImageUrl,
  }
}

/**
 * Get adjacent (Previous and Next) editions for chronological reading navigation.
 */
export async function getAdjacentNewsletters(currentSlug: string): Promise<{
  prev: NewsletterPdfRecord | null
  next: NewsletterPdfRecord | null
}> {
  try {
    const { data: all } = await listNewsletterPdfs()
    if (!all || all.length === 0) return { prev: null, next: null }

    const cleanSlug = sanitizeNewsletterSlug(currentSlug)
    const idx = all.findIndex(item => item.slug === cleanSlug)
    if (idx === -1) return { prev: null, next: null }

    // List is ordered newest first (week_end DESC)
    // Next (newer edition) is idx - 1
    // Previous (older edition) is idx + 1
    const next = idx > 0 ? all[idx - 1] : null
    const prev = idx < all.length - 1 ? all[idx + 1] : null

    return { prev, next }
  } catch {
    return { prev: null, next: null }
  }
}

/**
 * List all newsletter PDFs ordered by week_start DESC (newest first).
 */
export async function listNewsletterPdfs(): Promise<{ data: NewsletterPdfRecord[]; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_pdfs')
      .select('*')
      .order('week_start', { ascending: false })

    if (error) {
      // Fallback to secondary if configured
      if (supabaseDocumentsAdmin) {
        const secondaryRes = await supabaseDocumentsAdmin
          .from('newsletter_pdfs')
          .select('*')
          .order('week_start', { ascending: false })

        if (!secondaryRes.error && secondaryRes.data) {
          return {
            data: secondaryRes.data.map(enrichNewsletterUrls),
            error: null,
          }
        }
      }
      return { data: [], error: error.message }
    }

    const enriched = (data || []).map(enrichNewsletterUrls)
    return { data: enriched, error: null }
  } catch (err: any) {
    return { data: [], error: err?.message || 'Failed to list newsletter PDFs' }
  }
}

/**
 * Fetch a single newsletter PDF record by slug or file_path.
 */
export async function getNewsletterPdfBySlug(slug: string): Promise<{ data: NewsletterPdfRecord | null; error: string | null }> {
  try {
    const cleanSlug = slug.replace(/\.pdf$/i, '').replace(/\.html?$/i, '').trim()

    // 1. Check primary DB
    let { data, error } = await supabaseAdmin
      .from('newsletter_pdfs')
      .select('*')
      .or(`slug.eq.${cleanSlug},file_path.eq.${cleanSlug}.pdf,file_path.eq.${cleanSlug}`)
      .limit(1)
      .maybeSingle()

    // 2. Fallback to secondary DB if primary returns nothing or errors
    if ((error || !data) && supabaseDocumentsAdmin) {
      const sec = await supabaseDocumentsAdmin
        .from('newsletter_pdfs')
        .select('*')
        .or(`slug.eq.${cleanSlug},file_path.eq.${cleanSlug}.pdf,file_path.eq.${cleanSlug}`)
        .limit(1)
        .maybeSingle()

      if (sec.data) {
        data = sec.data
        error = null
      }
    }

    if (error) return { data: null, error: error.message }
    if (!data) return { data: null, error: 'Newsletter PDF not found' }

    return { data: enrichNewsletterUrls(data), error: null }
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to fetch newsletter PDF' }
  }
}

/**
 * Fetch a single newsletter PDF record by ID.
 */
export async function getNewsletterPdfById(id: string): Promise<{ data: NewsletterPdfRecord | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_pdfs')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return { data: null, error: error.message }
    if (!data) return { data: null, error: 'Newsletter PDF not found' }

    return { data: enrichNewsletterUrls(data), error: null }
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to fetch newsletter PDF' }
  }
}

/**
 * Upload a new weekly newsletter PDF and optional HTML reading version to Supabase storage.
 * Dual-syncs to both Primary Supabase and Secondary Supabase.
 */
export async function uploadNewsletterPdf(params: {
  fileBuffer: Buffer
  htmlBuffer?: Buffer
  fileName?: string
  slug?: string
  week_label: string
  week_start: string
  week_end: string
  uploaded_by?: string
}): Promise<{ data: NewsletterPdfRecord | null; error: string | null }> {
  try {
    const {
      fileBuffer,
      htmlBuffer,
      fileName: rawFileName,
      slug: rawSlug,
      week_label,
      week_start,
      week_end,
      uploaded_by = 'admin',
    } = params

    // 1. Sanitize slug and fileName
    const slug = sanitizeNewsletterSlug(rawSlug || rawFileName || `weekly-briefing-${week_end}`, week_end)
    const filePath = `${slug}.pdf`
    const htmlPath = htmlBuffer ? `${slug}.html` : null

    // 2. Upload PDF to Primary Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '31536000', // 1 year cache header
      })

    if (uploadError) {
      return { data: null, error: `Primary storage upload failed: ${uploadError.message}` }
    }

    // 3. Upload HTML to Primary Supabase Storage if provided
    if (htmlBuffer && htmlPath) {
      const { error: htmlUploadErr } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(htmlPath, htmlBuffer, {
          contentType: 'text/html; charset=utf-8',
          upsert: true,
          cacheControl: '31536000',
        })

      if (htmlUploadErr) {
        console.warn('[NewsletterPDF] Primary HTML upload warning:', htmlUploadErr.message)
      }
    }

    // 4. Mirror uploads to Secondary Supabase Storage if configured
    if (supabaseDocumentsAdmin) {
      try {
        await supabaseDocumentsAdmin.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: true,
            cacheControl: '31536000',
          })

        if (htmlBuffer && htmlPath) {
          await supabaseDocumentsAdmin.storage
            .from(STORAGE_BUCKET)
            .upload(htmlPath, htmlBuffer, {
              contentType: 'text/html; charset=utf-8',
              upsert: true,
              cacheControl: '31536000',
            })
        }
      } catch (s2Err: any) {
        console.warn('[NewsletterPDF] Secondary S2 storage mirror warning:', s2Err?.message)
      }
    }

    // 5. Insert record into Primary DB
    const insertPayload: Record<string, any> = {
      slug,
      week_label,
      week_start,
      week_end,
      file_path: filePath,
      file_size_bytes: fileBuffer.length,
      uploaded_by,
      download_count: 0,
      updated_at: new Date().toISOString(),
    }

    if (htmlPath) {
      insertPayload.html_path = htmlPath
    }

    let { data: inserted, error: dbError } = await supabaseAdmin
      .from('newsletter_pdfs')
      .upsert(insertPayload, { onConflict: 'slug' })
      .select()
      .single()

    if (dbError && (dbError.message.includes('html_path') || dbError.message.includes('column'))) {
      console.warn('[NewsletterPDF] DB column html_path missing, falling back without column in table:', dbError.message)
      const fallbackPayload = { ...insertPayload }
      delete fallbackPayload.html_path
      const retry = await supabaseAdmin
        .from('newsletter_pdfs')
        .upsert(fallbackPayload, { onConflict: 'slug' })
        .select()
        .single()
      inserted = retry.data
      dbError = retry.error
      if (inserted && htmlPath) {
        inserted.html_path = htmlPath
      }
    }

    if (dbError || !inserted) {
      return { data: null, error: `Database insert failed: ${dbError?.message}` }
    }

    // 6. Mirror record to Secondary DB if configured
    if (supabaseDocumentsAdmin) {
      try {
        await supabaseDocumentsAdmin
          .from('newsletter_pdfs')
          .upsert({ ...insertPayload, id: inserted.id }, { onConflict: 'slug' })
      } catch (s2DbErr: any) {
        console.warn('[NewsletterPDF] Secondary S2 DB mirror warning:', s2DbErr?.message)
      }
    }

    return { data: enrichNewsletterUrls(inserted), error: null }
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to upload newsletter PDF' }
  }
}

/**
 * Replace the PDF/HTML files and/or metadata of an existing newsletter PDF entry.
 * Dual-syncs to both Primary and Secondary Supabase instances.
 */
export async function replaceNewsletterPdf(
  id: string,
  params: {
    fileBuffer?: Buffer
    htmlBuffer?: Buffer
    fileName?: string
    slug?: string
    week_label?: string
    week_start?: string
    week_end?: string
  }
): Promise<{ data: NewsletterPdfRecord | null; error: string | null }> {
  try {
    const existing = await getNewsletterPdfById(id)
    if (!existing.data) {
      return { data: null, error: existing.error || 'Record not found' }
    }

    const currentRecord = existing.data
    const newSlug = params.slug ? sanitizeNewsletterSlug(params.slug) : currentRecord.slug
    const newFilePath = `${newSlug}.pdf`
    let newHtmlPath = currentRecord.html_path || (params.htmlBuffer ? `${newSlug}.html` : null)

    // A. If new PDF file buffer is provided, upload/overwrite in storage
    let newFileSize = currentRecord.file_size_bytes
    if (params.fileBuffer) {
      newFileSize = params.fileBuffer.length

      // Upload PDF to Primary
      const { error: upErr } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(newFilePath, params.fileBuffer, {
          contentType: 'application/pdf',
          upsert: true,
          cacheControl: '31536000',
        })

      if (upErr) {
        return { data: null, error: `Primary storage replace failed: ${upErr.message}` }
      }

      // If slug changed, delete old file
      if (newFilePath !== currentRecord.file_path) {
        await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([currentRecord.file_path])
      }

      // Mirror to Secondary
      if (supabaseDocumentsAdmin) {
        try {
          await supabaseDocumentsAdmin.storage
            .from(STORAGE_BUCKET)
            .upload(newFilePath, params.fileBuffer, {
              contentType: 'application/pdf',
              upsert: true,
              cacheControl: '31536000',
            })
          if (newFilePath !== currentRecord.file_path) {
            await supabaseDocumentsAdmin.storage.from(STORAGE_BUCKET).remove([currentRecord.file_path])
          }
        } catch (s2Err: any) {
          console.warn('[NewsletterPDF] Secondary S2 replace mirror warning:', s2Err?.message)
        }
      }
    }

    // B. If new HTML buffer is provided, upload/overwrite in storage
    if (params.htmlBuffer) {
      newHtmlPath = `${newSlug}.html`

      // Upload HTML to Primary
      const { error: htmlUpErr } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(newHtmlPath, params.htmlBuffer, {
          contentType: 'text/html; charset=utf-8',
          upsert: true,
          cacheControl: '31536000',
        })

      if (htmlUpErr) {
        return { data: null, error: `Primary HTML storage upload failed: ${htmlUpErr.message}` }
      }

      // Mirror HTML to Secondary
      if (supabaseDocumentsAdmin) {
        try {
          await supabaseDocumentsAdmin.storage
            .from(STORAGE_BUCKET)
            .upload(newHtmlPath, params.htmlBuffer, {
              contentType: 'text/html; charset=utf-8',
              upsert: true,
              cacheControl: '31536000',
            })
        } catch (s2HtmlErr: any) {
          console.warn('[NewsletterPDF] Secondary S2 HTML replace mirror warning:', s2HtmlErr?.message)
        }
      }
    }

    const updatePayload: Record<string, any> = {
      slug: newSlug,
      file_path: newFilePath,
      file_size_bytes: newFileSize,
      updated_at: new Date().toISOString(),
    }

    if (newHtmlPath) updatePayload.html_path = newHtmlPath
    if (params.week_label) updatePayload.week_label = params.week_label
    if (params.week_start) updatePayload.week_start = params.week_start
    if (params.week_end) updatePayload.week_end = params.week_end

    // Update Primary DB
    let { data: updated, error: updateErr } = await supabaseAdmin
      .from('newsletter_pdfs')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr && (updateErr.message.includes('html_path') || updateErr.message.includes('column'))) {
      console.warn('[NewsletterPDF] DB column html_path missing, falling back without column in table update:', updateErr.message)
      const fallbackPayload = { ...updatePayload }
      delete fallbackPayload.html_path
      const retry = await supabaseAdmin
        .from('newsletter_pdfs')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
        .single()
      updated = retry.data
      updateErr = retry.error
      if (updated && newHtmlPath) {
        updated.html_path = newHtmlPath
      }
    }

    if (updateErr || !updated) {
      return { data: null, error: `Database update failed: ${updateErr?.message}` }
    }

    // Mirror to Secondary DB
    if (supabaseDocumentsAdmin) {
      try {
        await supabaseDocumentsAdmin
          .from('newsletter_pdfs')
          .update(updatePayload)
          .eq('id', id)
      } catch (s2Err: any) {
        console.warn('[NewsletterPDF] Secondary S2 DB update mirror warning:', s2Err?.message)
      }
    }

    return { data: enrichNewsletterUrls(updated), error: null }
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to replace newsletter PDF' }
  }
}

/**
 * Delete a newsletter PDF entry, its PDF file, and its HTML reading asset.
 * Dual-syncs deletion across Primary and Secondary Supabase instances.
 */
export async function deleteNewsletterPdf(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const existing = await getNewsletterPdfById(id)
    if (!existing.data) {
      return { success: false, error: existing.error || 'Record not found' }
    }

    const record = existing.data
    const filesToDelete = [record.file_path]
    if (record.html_path) {
      filesToDelete.push(record.html_path)
    }

    // 1. Delete files from Primary Storage
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove(filesToDelete)

    // 2. Delete files from Secondary Storage if configured
    if (supabaseDocumentsAdmin) {
      try {
        await supabaseDocumentsAdmin.storage.from(STORAGE_BUCKET).remove(filesToDelete)
      } catch (s2Err) {
        // Non-blocking
      }
    }

    // 3. Delete from Primary DB
    const { error: dbErr } = await supabaseAdmin
      .from('newsletter_pdfs')
      .delete()
      .eq('id', id)

    if (dbErr) {
      return { success: false, error: dbErr.message }
    }

    // 4. Delete from Secondary DB
    if (supabaseDocumentsAdmin) {
      try {
        await supabaseDocumentsAdmin.from('newsletter_pdfs').delete().eq('id', id)
      } catch (s2Err) {
        // Non-blocking
      }
    }

    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete newsletter PDF' }
  }
}

/**
 * Increment the download count for an edition (fire-and-forget).
 */
export async function incrementNewsletterDownloadCount(idOrSlug: string): Promise<void> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    const filter = isUuid ? { id: idOrSlug } : { slug: idOrSlug }

    // Fetch current count
    const { data: current } = await supabaseAdmin
      .from('newsletter_pdfs')
      .select('id, download_count')
      .match(filter)
      .single()

    if (current) {
      const nextCount = (current.download_count || 0) + 1
      await supabaseAdmin
        .from('newsletter_pdfs')
        .update({ download_count: nextCount })
        .eq('id', current.id)

      if (supabaseDocumentsAdmin) {
        try {
          await supabaseDocumentsAdmin
            .from('newsletter_pdfs')
            .update({ download_count: nextCount })
            .eq('id', current.id)
        } catch {
          // Non-blocking
        }
      }
    }
  } catch {
    // Non-blocking
  }
}
