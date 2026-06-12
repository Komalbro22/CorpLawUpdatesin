import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Ping SECONDARY
    if (!supabaseDocumentsAdmin) throw new Error('Supabase Documents Admin client not initialized')
    const { error: secondaryError } = await supabaseDocumentsAdmin
      .from('intents')
      .select('id')
      .limit(1)
      
    // Ping PRIMARY
    const { error: primaryError } = await supabase
      .from('updates')
      .select('id')
      .limit(1)

    return NextResponse.json({ 
      ok: !secondaryError && !primaryError, 
      secondaryError: secondaryError ? String(secondaryError) : null,
      primaryError: primaryError ? String(primaryError) : null,
      timestamp: new Date().toISOString() 
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) })
  }
}
