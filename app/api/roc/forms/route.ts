import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export const revalidate = 3600 // Cache 1 hour

export async function GET() {
  if (!supabaseDocumentsAdmin) {
    return NextResponse.json(
      { error: 'DB not available' },
      { status: 503 }
    )
  }

  const { data, error } = await supabaseDocumentsAdmin
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
