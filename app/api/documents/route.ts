import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 300 // Revalidate cache every 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('document_templates')
      .select(
        'id, name, slug, description, category, ' +
        'regulation_reference, source, last_verified, ' +
        'is_free, display_order, tags, usage_count, fields'
      )
      .eq('is_active', true)
      .order('display_order')

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ templates: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
