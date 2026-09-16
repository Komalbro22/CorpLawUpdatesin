import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-server'
import { ratelimit } from '@/lib/ratelimit'

const feedbackSchema = z.object({
  context_type: z.enum(['article', 'calculator', 'document']),
  context_title: z.string().min(1).max(300),
  context_url: z.string().min(1).max(500),
  sentiment: z.enum(['positive', 'negative']),
  tags: z.array(z.string()).default([]),
  comment: z.string().max(2000).optional().nullable(),
  user_email: z.string().email().optional().nullable().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    if (ratelimit) {
      const { success } = await ratelimit.limit(`feedback:${ip}`)
      if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
    }

    const body = await req.json()
    const parsed = feedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    const { context_type, context_title, context_url, sentiment, tags, comment, user_email } = parsed.data

    // 1. Try inserting into reader_feedback
    const { error: primaryError } = await supabaseAdmin.from('reader_feedback').insert([
      {
        context_type,
        context_title,
        context_url,
        sentiment,
        tags,
        comment: comment || null,
        user_email: user_email || null,
        status: 'pending',
      },
    ])

    if (!primaryError) {
      return NextResponse.json({ success: true })
    }

    // 2. Seamless fallback to compliance_suggestions if reader_feedback table is not yet migrated
    const formattedDesc = `[Reader Feedback: ${context_type.toUpperCase()}] Sentiment: ${sentiment.toUpperCase()} | Tags: ${tags.join(', ') || 'None'}${comment ? ` | Note: ${comment}` : ''}`
    
    await supabaseAdmin.from('compliance_suggestions').insert([
      {
        suggestion_type: 'error_report',
        compliance_title: `[Feedback: ${context_type}] ${context_title.substring(0, 80)}`,
        regulation_reference: context_url,
        error_field: `feedback_${sentiment}`,
        error_description: formattedDesc,
        suggested_correction: JSON.stringify({ sentiment, tags, comment, context_type }),
        user_email: user_email || null,
        status: 'pending',
      },
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Feedback submission error:', err)
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 })
  }
}
