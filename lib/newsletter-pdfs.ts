import { supabaseAdmin } from '@/lib/supabase-server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export interface NewsletterPdfRecord {
  id: string
  slug: string
  week_label: string
  week_start: string
  week_end: string
  file_path: string
  file_size_bytes: number
  uploaded_by: string
  download_count: number
  created_at: string
  updated_at: string
  public_url?: string
  direct_storage_url?: string
}

const STORAGE_BUCKET = 'newsletter-pdfs'
const SITE_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.corplawupdates.in'

/**
 * Sanitize a filename or slug to kebab-case alphanumeric characters.
 */
export function sanitizeNewsletterSlug(input: string, fallbackWeekEnd?: string): string {
  const base = input
    .replace(/\.pdf$/i, '')
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
 * Generate public URLs for a newsletter PDF record.
 */
export function enrichNewsletterUrls(record: NewsletterPdfRecord): NewsletterPdfRecord {
  const brandedUrl = `${SITE_BASE_URL}/newsletters/${record.slug}`
  
  // Storage public URL from primary Supabase with timestamp query for instant cache-busting
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(record.file_path)

  const timestamp = record.updated_at ? new Date(record.updated_at).getTime() : Date.now()
  const directStorageUrl = `${data.publicUrl}?v=${timestamp}`

  return {
    ...record,
    public_url: brandedUrl,
    direct_storage_url: directStorageUrl,
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
    const cleanSlug = slug.replace(/\.pdf$/i, '').trim()

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
 * Upload a new weekly newsletter PDF to Supabase storage and create the database record.
 * Dual-syncs to both Primary Supabase and Secondary Supabase.
 */
export async function uploadNewsletterPdf(params: {
  fileBuffer: Buffer
  fileName?: string
  slug?: string
  week_label: string
  week_start: string
  week_end: string
  uploaded_by?: string
}): Promise<{ data: NewsletterPdfRecord | null; error: string | null }> {
  try {
    const { fileBuffer, fileName: rawFileName, slug: rawSlug, week_label, week_start, week_end, uploaded_by = 'admin' } = params

    // 1. Sanitize slug and fileName
    const slug = sanitizeNewsletterSlug(rawSlug || rawFileName || `weekly-briefing-${week_end}`, week_end)
    const filePath = `${slug}.pdf`

    // 2. Upload to Primary Supabase Storage
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

    // 3. Mirror upload to Secondary Supabase Storage if configured
    if (supabaseDocumentsAdmin) {
      try {
        await supabaseDocumentsAdmin.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: true,
            cacheControl: '31536000',
          })
      } catch (s2Err: any) {
        console.warn('[NewsletterPDF] Secondary S2 storage mirror warning:', s2Err?.message)
      }
    }

    // 4. Insert record into Primary DB
    const insertPayload = {
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

    const { data: inserted, error: dbError } = await supabaseAdmin
      .from('newsletter_pdfs')
      .upsert(insertPayload, { onConflict: 'slug' })
      .select()
      .single()

    if (dbError) {
      return { data: null, error: `Database insert failed: ${dbError.message}` }
    }

    // 5. Mirror record to Secondary DB if configured
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
 * Replace the file and/or metadata of an existing newsletter PDF entry.
 * Dual-syncs to both Primary and Secondary Supabase instances.
 */
export async function replaceNewsletterPdf(
  id: string,
  params: {
    fileBuffer?: Buffer
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

    // If new file buffer is provided, upload/overwrite in storage
    let newFileSize = currentRecord.file_size_bytes
    if (params.fileBuffer) {
      newFileSize = params.fileBuffer.length

      // Upload to Primary
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

    const updatePayload: Record<string, any> = {
      slug: newSlug,
      file_path: newFilePath,
      file_size_bytes: newFileSize,
      updated_at: new Date().toISOString(),
    }

    if (params.week_label) updatePayload.week_label = params.week_label
    if (params.week_start) updatePayload.week_start = params.week_start
    if (params.week_end) updatePayload.week_end = params.week_end

    // Update Primary DB
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('newsletter_pdfs')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      return { data: null, error: `Database update failed: ${updateErr.message}` }
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
 * Delete a newsletter PDF entry and its storage asset.
 * Dual-syncs deletion across Primary and Secondary Supabase instances.
 */
export async function deleteNewsletterPdf(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const existing = await getNewsletterPdfById(id)
    if (!existing.data) {
      return { success: false, error: existing.error || 'Record not found' }
    }

    const record = existing.data

    // 1. Delete file from Primary Storage
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([record.file_path])

    // 2. Delete file from Secondary Storage if configured
    if (supabaseDocumentsAdmin) {
      try {
        await supabaseDocumentsAdmin.storage.from(STORAGE_BUCKET).remove([record.file_path])
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
