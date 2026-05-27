import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { type, input, result } = 
      await request.json()

    if (!type) {
      return NextResponse.json({ ok: true })
    }

    await supabaseAdmin
      .from('calculator_usage')
      .insert({
        calculator_type: type,
        input_data: input || {},
        result_data: result || {},
      })

    return NextResponse.json({ ok: true })
  } catch {
    // Silently fail — logging is non-critical
    return NextResponse.json({ ok: true })
  }
}
