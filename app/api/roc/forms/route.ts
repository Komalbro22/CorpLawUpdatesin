import { NextResponse } from 'next/server'
import { supabaseDocuments } from '@/lib/supabase-documents'

export const revalidate = 3600 // Cache 1 hour

export async function GET() {
  if (!supabaseDocuments) {
    return NextResponse.json(
      { error: 'DB not available' },
      { status: 503 }
    )
  }

  const { data, error } = await supabaseDocuments
    .from('roc_forms')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ 
    forms: data,
    total: data?.length || 0,
    last_updated: new Date().toISOString(),
  })
}
