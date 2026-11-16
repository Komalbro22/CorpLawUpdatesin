import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkDuplicateCalendarEntry, normalizeRecurrence } from '@/lib/compliance-calendar'
import { revalidateComplianceMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

interface ImportItem {
  form_name: string
  title?: string
  compliance_title?: string
  due_date?: string
  date?: string
  applies_to?: string
  applicable_to?: string
  category?: string
  category_slug?: string
  regulator?: string
  description?: string
  statutory_ref?: string
  act_rule_reference?: string
  regulation_reference?: string
  penalty_text?: string
  penalty_details?: string
  penalty?: string
  recurrence?: string
  frequency?: string
  source_url?: string
  official_link?: string
  official_source_url?: string
  last_verified_at?: string
  original_date?: string
  extension_ref?: string
  extension_note?: string
}

function parseCsv(text: string): ImportItem[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))
  const items: ImportItem[] = []

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim()
    if (!rawLine) continue

    // Handle quoted CSV cells
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g
    const values: string[] = []
    let match
    while ((match = regex.exec(rawLine)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2]
      values.push((val || '').trim())
    }

    const rowObj: any = {}
    header.forEach((col, idx) => {
      rowObj[col] = values[idx] || ''
    })
    items.push(rowObj)
  }

  return items
}

/**
 * POST /api/admin/calendar/import
 * Bulk import entries via JSON or CSV with dry-run preview capability.
 * Requires: calendar:write
 */
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)
  const keyName = authCheck.auth.type === 'api_key' ? authCheck.auth.key.name : 'admin-session'
  const keyId = authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : null

  try {
    const contentType = request.headers.get('content-type') || ''
    let rawItems: ImportItem[] = []
    let isDryRun = true
    let forceDuplicates = false

    if (contentType.includes('text/csv')) {
      const text = await request.text()
      rawItems = parseCsv(text)
      isDryRun = request.nextUrl.searchParams.get('dry_run') !== 'false'
      forceDuplicates = request.nextUrl.searchParams.get('force') === 'true'
    } else {
      const body = await request.json()
      isDryRun = body.dry_run !== false
      forceDuplicates = Boolean(body.force || body.ignore_duplicates)

      if (Array.isArray(body)) {
        rawItems = body
      } else if (Array.isArray(body.entries)) {
        rawItems = body.entries
      } else if (typeof body.csv === 'string') {
        rawItems = parseCsv(body.csv)
      } else {
        return NextResponse.json(
          { error: 'INVALID_PAYLOAD', message: 'Payload must be an array of entries or contain { entries: [...] } or CSV.' },
          { status: 400 }
        )
      }
    }

    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'EMPTY_IMPORT', message: 'No entries provided to import.' }, { status: 400 })
    }

    // Fetch existing categories for resolution
    const { data: categories } = await supabaseAdmin.from('compliance_categories').select('id, slug, name')
    const catMapBySlug = new Map<string, { id: string; slug: string }>()
    for (const c of categories || []) {
      catMapBySlug.set(c.slug.toLowerCase(), c)
    }

    const preview: any[] = []
    const errors: any[] = []
    const toInsert: any[] = []
    let duplicateCount = 0

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i]
      const formName = (item.form_name || '').trim()
      const title = (item.title || item.compliance_title || '').trim()
      const dueDate = (item.due_date || item.date || '').trim()
      const appliesTo = (item.applies_to || item.applicable_to || '').trim()
      const categorySlugInput = (item.category || item.category_slug || item.regulator || 'other').trim().toLowerCase()

      // Validation
      if (!formName || !title || !dueDate || !appliesTo) {
        errors.push({
          row_index: i + 1,
          form_name: formName || 'MISSING',
          error: 'Required fields missing (must include form_name, title, due_date, applies_to)',
        })
        continue
      }

      // Category matching
      let resolvedCategory = catMapBySlug.get(categorySlugInput)
      if (!resolvedCategory) {
        // try partial match
        for (const [slug, c] of catMapBySlug.entries()) {
          if (categorySlugInput.includes(slug) || slug.includes(categorySlugInput)) {
            resolvedCategory = c
            break
          }
        }
      }
      const categoryId = resolvedCategory ? resolvedCategory.id : (catMapBySlug.get('other')?.id || null)
      const categorySlug = resolvedCategory ? resolvedCategory.slug : 'other'

      // Duplicate check
      const dupCheck = await checkDuplicateCalendarEntry(formName, dueDate)
      const isDuplicate = dupCheck.isDuplicate
      if (isDuplicate) duplicateCount++

      const description = (item.description || '').trim() || null
      const statutoryRef = (item.statutory_ref || item.act_rule_reference || item.regulation_reference || '').trim() || null
      const penaltyText = (item.penalty_text || item.penalty_details || item.penalty || '').trim() || null
      const recCheck = normalizeRecurrence(item.recurrence || item.frequency)
      const recurrence = recCheck.valid ? recCheck.recurrence : 'monthly'
      const sourceUrl = (item.source_url || item.official_source_url || item.official_link || '').trim() || null
      const lastVerifiedAt = item.last_verified_at || new Date().toISOString()
      const originalDate = (item.original_date || '').trim() || null
      const isExtended = Boolean(originalDate || item.extension_ref)
      const extensionRef = (item.extension_ref || '').trim() || null
      const extensionNote = (item.extension_note || '').trim() || null

      const rowPayload = {
        form_name: formName,
        compliance_title: title,
        due_date: dueDate,
        applicable_to: appliesTo,
        category_id: categoryId,
        category_slug: categorySlug,
        regulator: categorySlug,
        description,
        regulation_reference: statutoryRef,
        penalty: penaltyText,
        frequency: recurrence,
        recurrence,
        official_link: sourceUrl,
        official_source_url: sourceUrl,
        last_verified_at: lastVerifiedAt,
        original_date: originalDate,
        is_extended: isExtended,
        extension_ref: extensionRef,
        extension_note: extensionNote,
        is_active: true,
        is_live: true,
        ever_live: true,
        is_deleted: false,
        created_by: `import:${keyName}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      preview.push({
        row_index: i + 1,
        form_name: formName,
        title,
        due_date: dueDate,
        category: categorySlug,
        is_duplicate: isDuplicate,
        duplicate_details: dupCheck.existingEntry || null,
        status: isDuplicate ? (forceDuplicates ? 'will_insert_duplicate' : 'skipped_duplicate') : 'valid',
      })

      if (!isDuplicate || forceDuplicates) {
        toInsert.push(rowPayload)
      }
    }

    if (isDryRun) {
      return NextResponse.json({
        success: true,
        dry_run: true,
        summary: {
          total_rows: rawItems.length,
          valid_for_insertion: toInsert.length,
          duplicate_warnings: duplicateCount,
          error_count: errors.length,
        },
        preview: preview.slice(0, 100),
        errors,
        note: 'This was a dry-run preview. No changes were applied to the database. Send dry_run: false to apply.',
      })
    }

    // Apply actual insertion
    let insertedCount = 0
    if (toInsert.length > 0) {
      // Insert in chunks of 50
      for (let i = 0; i < toInsert.length; i += 50) {
        const chunk = toInsert.slice(i, i + 50)
        const { error: insertErr } = await supabaseAdmin.from('compliance_entries').insert(chunk)
        if (insertErr) throw insertErr
        insertedCount += chunk.length
      }

      await logApiAudit({
        keyId,
        keyName,
        action: 'calendar:bulk_import',
        entityType: 'calendar_entry',
        entityId: null,
        ip: clientIp,
        status: 'success',
        details: {
          imported_count: insertedCount,
          skipped_duplicates: duplicateCount,
          errors_count: errors.length,
        },
      })

      await revalidateComplianceMutation()
    }

    return NextResponse.json({
      success: true,
      dry_run: false,
      message: `Successfully imported ${insertedCount} entries into compliance calendar.`,
      imported_count: insertedCount,
      skipped_duplicates: forceDuplicates ? 0 : duplicateCount,
      errors_count: errors.length,
      errors,
    })
  } catch (err: any) {
    console.error('[API Error /calendar/import POST]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
