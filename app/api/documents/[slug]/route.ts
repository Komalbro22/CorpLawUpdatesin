import { supabaseDocuments } from '@/lib/supabase-documents'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'
import { NextResponse } from 'next/server'

export const revalidate = 0 // Disable cache to track usage increments correctly

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    let data = null
    let error = null
    const retries = 3

    // Retry wrapper for cold start handling
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (!supabaseDocuments) throw new Error('Supabase Documents client not initialized')
        const result = await supabaseDocuments
          .from('document_templates')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()
        
        data = result.data
        error = result.error

        if (data) break
        if (error?.code === 'PGRST116') {
          // genuine not found
          return NextResponse.json({ error: 'Template not found', code: 'PGRST116' }, { status: 404 })
        }

        // Any other error = likely cold start, retry
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, attempt * 1000)) // 1s, 2s, 3s
          continue
        }
      } catch (e) {
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
        if (!supabaseDocumentsAdmin) throw new Error('Supabase Documents Admin client not initialized')
        await supabaseDocumentsAdmin
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
