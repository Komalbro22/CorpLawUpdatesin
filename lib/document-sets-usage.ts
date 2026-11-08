import { supabaseAdmin } from '@/lib/supabase-server'

export type DocumentSetUsageEventType =
  | 'view'
  | 'download_docx'
  | 'download_pdf'
  | 'download_pack_single'
  | 'download_pack_zip'
  | 'checklist_complete'
  | 'generator_use'

interface RecordUsageParams {
  setSlug: string
  documentSlug?: string
  eventType: DocumentSetUsageEventType
}

/**
 * Privacy-preserving aggregate usage logger.
 * Do NOT store visitor identity, IPs, or form contents (§11.4).
 */
export async function recordDocumentSetUsage({
  setSlug,
  documentSlug = '',
  eventType,
}: RecordUsageParams) {
  const today = new Date().toISOString().split('T')[0]

  try {
    // 1. Try atomic upsert in Supabase table
    const { error } = await supabaseAdmin.rpc('increment_document_set_usage', {
      p_set_slug: setSlug,
      p_doc_slug: documentSlug,
      p_event_type: eventType,
      p_date: today,
    })

    if (error) {
      // If RPC is absent, attempt select + update / insert fallback
      const { data: existing } = await supabaseAdmin
        .from('document_set_usage')
        .select('id, count')
        .eq('set_slug', setSlug)
        .eq('document_slug', documentSlug)
        .eq('event_type', eventType)
        .eq('event_date', today)
        .maybeSingle()

      if (existing) {
        await supabaseAdmin
          .from('document_set_usage')
          .update({
            count: existing.count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        await supabaseAdmin.from('document_set_usage').insert({
          set_slug: setSlug,
          document_slug: documentSlug,
          event_type: eventType,
          event_date: today,
          count: 1,
        })
      }
    }
  } catch (err) {
    // Non-fatal telemetry: never fail the user's download or view
    console.warn('[document-sets-usage] Error recording event:', err)
  }
}
