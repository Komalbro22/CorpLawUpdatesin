import { supabaseDocuments } from '@/lib/supabase-documents'
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const revalidate = 0 // Disable cache to track usage increments correctly

const TEMPLATE_COLUMNS =
  'id, name, slug, description, category, template_content, ai_system_prompt, regulation_reference, source, last_verified, is_free, is_active, usage_count, tags, fields'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug
    const client = supabaseDocuments || supabaseAdmin
    if (!client) {
      throw new Error('Supabase Documents client not initialized')
    }

    let data = null
    let error = null
    const retries = 3

    // Retry wrapper for cold start handling — never cache null/error results
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await client
          .from('document_templates')
          .select(TEMPLATE_COLUMNS)
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        data = result.data
        error = result.error

        if (data) break
        if (error?.code === 'PGRST116') {
          return NextResponse.json({ error: 'Template not found', code: 'PGRST116' }, { status: 404 })
        }

        if (attempt < retries) {
          await new Promise(r => setTimeout(r, attempt * 1000))
          continue
        }
      } catch (e) {
        error = e
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, attempt * 1000))
          continue
        }
      }
    }

    if (!data) {
      // If data is still null after retries (likely cold start timed out)
      return NextResponse.json(
        { error: 'Database cold start timeout', code: 'COLD_START' },
        { status: 503 }
      )
    }

    // Safely increment usage count asynchronously (non-blocking)
    ;(async () => {
      try {
        if (!supabaseAdmin) throw new Error('Supabase Admin client not initialized')
        await supabaseAdmin
          .from('document_templates')
          .update({ usage_count: (data.usage_count || 0) + 1 })
          .eq('id', data.id)
      } catch (err) {
        console.error('Failed to increment usage count:', err)
      }
    })()

    return NextResponse.json({ template: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
