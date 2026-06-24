import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-server'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    const rawIp = request.headers.get('x-forwarded-for') || 'unknown'
    const clientIp = rawIp.split(',')[0].trim()
    const ipKey = `contact:${clientIp}`

    const { data: attemptData } = await supabaseAdmin
      .from('login_attempts')
      .select('attempts, window_start')
      .eq('ip', ipKey)
      .single()

    const now = new Date()

    if (attemptData) {
      const windowStart = new Date(attemptData.window_start)
      const diffHours = (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60)

      if (diffHours <= 1) {
        if (attemptData.attempts >= 5) {
          return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
        }
        await supabaseAdmin
          .from('login_attempts')
          .update({ attempts: attemptData.attempts + 1 })
          .eq('ip', ipKey)
      } else {
        await supabaseAdmin
          .from('login_attempts')
          .update({ attempts: 1, window_start: now.toISOString() })
          .eq('ip', ipKey)
      }
    } else {
      await supabaseAdmin
        .from('login_attempts')
        .insert({ ip: ipKey, attempts: 1, window_start: now.toISOString() })
    }

    const toEmail = process.env.ADMIN_EMAIL || 'mail@corplawupdates.in'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'CorpLawUpdates <onboarding@resend.dev>'

    if (!resend) {
      return NextResponse.json({ error: 'Email service unavailable' }, { status: 503 })
    }

    const safeName = String(name).trim().slice(0, 200)
    const safeSubject = String(subject).trim().slice(0, 200)
    const safeMessage = String(message).trim().slice(0, 5000)

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[Contact] ${safeSubject}`,
      text: `Name: ${safeName}\nEmail: ${email}\nSubject: ${safeSubject}\n\nMessage:\n${safeMessage}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
