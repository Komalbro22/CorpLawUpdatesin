import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 0 // Disable cache to track usage increments correctly

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Safely increment usage count asynchronously (non-blocking)
    ;(async () => {
      try {
        await supabase
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
