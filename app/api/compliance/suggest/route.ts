import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      suggestion_type,
      compliance_entry_id,
      regulator,
      form_name,
      compliance_title,
      due_date,
      applicable_to,
      penalty,
      regulation_reference,
      error_field,
      error_description,
      suggested_correction,
      user_name,
      user_email,
      user_profession,
      user_city,
      user_linkedin,
    } = body

    if (!suggestion_type || !user_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user_email)) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('compliance_suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', user_email)
      .gte('created_at', today.toISOString())

    if ((count || 0) >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 suggestions per day' },
        { status: 429 }
      )
    }

    const { error } = await supabase
      .from('compliance_suggestions')
      .insert({
        suggestion_type,
        compliance_entry_id: compliance_entry_id || null,
        regulator,
        form_name,
        compliance_title,
        due_date,
        applicable_to,
        penalty,
        regulation_reference,
        error_field,
        error_description,
        suggested_correction,
        user_name: user_name || 'Anonymous',
        user_email,
        user_profession,
        user_city,
        user_linkedin,
        status: 'pending',
      })

    if (error) {
      console.error('Suggestion insert error:', error)
      return NextResponse.json(
        { error: 'Failed to submit' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your suggestion has been submitted for review.',
    })
  } catch (error: any) {
  if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) throw error;

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
