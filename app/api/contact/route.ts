import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { redis } from '@/lib/redis-cache'
import { sendEmail, parseSender, getActiveEmailProvider } from '@/lib/email-provider'

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

    // Redis rate limiting — fast layer (5 messages per hour per IP)
    if (redis) {
      const redisKey = `ratelimit:contact:${clientIp}`
      const count = await redis.incr(redisKey)
      if (count === 1) {
        await redis.expire(redisKey, 3600) // 1 hour window
      }
      if (count > 5) {
        return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
      }
    }

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
    const { email: fromEmail, name: fromName } = parseSender()

    if (getActiveEmailProvider() === 'none') {
      return NextResponse.json({ error: 'Email service unavailable' }, { status: 503 })
    }

    const safeName = String(name).trim().slice(0, 200)
    const safeSubject = String(subject).trim().slice(0, 200)
    const safeMessage = String(message).trim().slice(0, 5000)

    const sendRes = await sendEmail({
      from: fromEmail,
      fromName,
      to: toEmail,
      replyTo: email,
      subject: `[Contact] ${safeSubject}`,
      html: `<div style="font-family:sans-serif;line-height:1.6;color:#333;">
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;">${safeMessage}</p>
      </div>`,
    })

    if (!sendRes.success) {
      console.error('[Contact] Delivery error:', sendRes.error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, provider: sendRes.provider })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
