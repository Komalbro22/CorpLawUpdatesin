import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export async function POST(request: Request) {
  try {
    const {
      company_profile_id,
      user_email,
      company_name,
      remind_for_forms,
      remind_days_before,
    } = await request.json()

    if (!user_email || !company_name) {
      return NextResponse.json(
        { error: 'Email and company name required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!supabaseDocumentsAdmin) {
      return NextResponse.json(
        { error: 'DB not available' },
        { status: 503 }
      )
    }

    const { data, error } = await supabaseDocumentsAdmin
      .from('roc_reminders')
      .insert({
        company_profile_id: company_profile_id || null,
        user_email,
        company_name,
        remind_for_forms: remind_for_forms || [],
        remind_days_before: remind_days_before || 
          [30, 7, 1],
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Send welcome confirmation email via Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(
        process.env.RESEND_API_KEY
      )
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 
          'updates@mail.corplawupdates.in',
        to: user_email,
        subject: `✅ ROC Reminders Set — ${company_name} | CorpLawUpdates.in`,
        html: `
          <div style="font-family:Arial,sans-serif;
                      max-width:600px;margin:0 auto;
                      background:#0F172A;
                      color:#E2E8F0;padding:32px;
                      border-radius:16px;">
            <h2 style="color:#F59E0B;
                       font-family:Georgia,serif;">
              ROC Deadline Reminders Activated ✅
            </h2>
            <p style="color:#CBD5E1;">
              You will receive email reminders for 
              <strong>${company_name}</strong> 
              before the following deadlines:
            </p>
            <div style="background:#1E293B;
                        border-radius:12px;
                        padding:16px;margin:16px 0;">
              <p style="color:#94A3B8;
                        font-size:13px;margin:0;">
                📅 Reminders set for: 
                <strong style="color:#F59E0B;">
                  ${(remind_days_before || [30, 7, 1])
                    .join(' days, ')} days before due date
                </strong>
              </p>
            </div>
            <p style="color:#94A3B8;font-size:12px;">
              To unsubscribe, reply to this email 
              or visit corplawupdates.in/tools/roc-tracker
            </p>
          </div>
        `
      })
    } catch (emailErr) {
      console.error('Reminder email failed:', emailErr)
      // Non-fatal — reminder is saved even if email fails
    }

    return NextResponse.json({
      success: true,
      reminder_id: data?.id,
      message: 'Reminders set! Check your email for confirmation.'
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
