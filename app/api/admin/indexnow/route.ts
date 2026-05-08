import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { submitToIndexNow } from '@/lib/indexnow'

export async function POST() {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  const { data: articles } = await supabaseAdmin
    .from('updates')
    .select('slug')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(100)

  const BASE_URL = 'https://www.corplawupdates.in'
  
  const urls = [
    BASE_URL,
    `${BASE_URL}/updates`,
    `${BASE_URL}/calendar`,
    ...(articles || []).map(
      a => `${BASE_URL}/updates/${a.slug}`
    ),
  ]

  const success = await submitToIndexNow(urls)

  return NextResponse.json({
    success,
    count: urls.length,
  })
}
