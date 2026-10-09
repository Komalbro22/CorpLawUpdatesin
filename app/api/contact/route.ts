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

    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }

    function sanitizeHeader(str: string): string {
      return str.replace(/[\r\n]+/g, ' ').trim()
    }

    const rawName = String(name).trim().slice(0, 200)
    const rawSubject = String(subject).trim().slice(0, 200)
    const rawMessage = String(message).trim().slice(0, 5000)

    const cleanSubject = sanitizeHeader(rawSubject)
    const escapedName = escapeHtml(rawName)
    const escapedEmail = escapeHtml(email)
    const escapedSubject = escapeHtml(cleanSubject)
    const escapedMessage = escapeHtml(rawMessage).replace(/\r\n|\r|\n/g, '<br />')

    const plainText = [
      'New Contact Inquiry - CorpLawUpdates.in',
      '----------------------------------------',
      `Name:    ${rawName}`,
      `Email:   ${email}`,
      `Subject: ${cleanSubject}`,
      '',
      'Message:',
      rawMessage,
    ].join('\n')

    const htmlBody = `<div style="font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:8px;">
      <h3 style="color:#1e293b;margin-top:0;">New Contact Message</h3>
      <p><strong>Name:</strong> ${escapedName}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapedEmail}" style="color:#2563eb;">${escapedEmail}</a></p>
      <p><strong>Subject:</strong> ${escapedSubject}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
      <p><strong>Message:</strong></p>
      <div style="background:#f8fafc;padding:12px;border-radius:6px;word-break:break-word;font-size:14px;line-height:1.6;">${escapedMessage}</div>
    </div>`

    const sendRes = await sendEmail({
      from: fromEmail,
      fromName,
      to: toEmail,
      replyTo: email,
      subject: `[Contact] ${cleanSubject}`,
      html: htmlBody,
      text: plainText,
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
