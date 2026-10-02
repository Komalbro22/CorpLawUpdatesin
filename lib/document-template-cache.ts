import { unstable_cache } from 'next/cache'
import { supabaseDocuments } from '@/lib/supabase-documents'
import { supabaseAdmin } from '@/lib/supabase-server'

export interface DocumentTemplateRecord {
  id: string
  name: string
  slug: string
  description: string
  category: string
  template_content: string
  ai_system_prompt: string
  regulation_reference?: string
  source?: string
  last_verified?: string
  is_free?: boolean
  is_active?: boolean
  usage_count?: number
  tags?: string[]
  fields?: unknown[]
  [key: string]: any
}

export const getCachedDocumentTemplate = unstable_cache(
  async (slug: string): Promise<DocumentTemplateRecord | null> => {
    const client = supabaseDocuments || supabaseAdmin
    if (!client) return null

    try {
      const { data, error } = await client
        .from('document_templates')
        .select('id, name, slug, description, category, template_content, ai_system_prompt, regulation_reference, source, last_verified, is_free, is_active, usage_count, tags, fields')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return null
      }

      return data as DocumentTemplateRecord
    } catch {
      return null
    }
  },
  ['document-template-detail'],
  { revalidate: 86400, tags: ['documents'] }
)
