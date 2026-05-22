/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendNewsletterEmails, buildWeeklyDigestHtml } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

function parseDueDate(s: string): Date | null {
    try {
        const d = new Date(s)
        if (!isNaN(d.getTime())) return d
        const p = new Date(s.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'))
        return isNaN(p.getTime()) ? null : p
    } catch { return null }
}

export async function GET(request: Request) {
    try {
        console.log('=== CRON: GENERATING WEEKLY COMPLIANCE DIGEST ===')

        const { searchParams } = new URL(request.url)
        const isForce = searchParams.get('force') === 'true'
        const testEmail = searchParams.get('testEmail')

        // 1. Strict security check (Bearer token from Vercel Cron or local test)
        const authHeader = request.headers.get('authorization')
        const hasSecret = !!process.env.CRON_SECRET
        const isAuthorized = !hasSecret || authHeader === `Bearer ${process.env.CRON_SECRET}`

        if (hasSecret && !isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Day check: Only execute on Mondays unless forced or testing
        const today = new Date()
        const isMonday = today.getDay() === 1
        if (!isMonday && !isForce && !testEmail) {
            return NextResponse.json({ 
                message: 'Today is not Monday. Weekly digest skipped. Use ?force=true to override or ?testEmail=email@domain.com to test.' 
            })
        }

        // 3. Dynamic Date Range: Calculate Monday (00:00:00) and Sunday (23:59:59) for the current week
        const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        
        const currentMonday = new Date(today)
        currentMonday.setDate(today.getDate() + mondayOffset)
        currentMonday.setHours(0, 0, 0, 0)

        const currentSunday = new Date(currentMonday)
        currentSunday.setDate(currentMonday.getDate() + 6)
        currentSunday.setHours(23, 59, 59, 999)

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
        const startDateStr = currentMonday.toLocaleDateString('en-IN', options)
        const endDateStr = currentSunday.toLocaleDateString('en-IN', options)

        console.log(`Calculating weekly range: Monday=${startDateStr} to Sunday=${endDateStr}`)

        // 4. Fetch all active compliance entries
        const { data: rawEntries, error: fetchError } = await supabaseAdmin
            .from('compliance_entries')
            .select('*')
            .eq('is_active', true)

        if (fetchError) throw fetchError

        // 5. Filter entries whose parsed due date falls within the calculated Monday-Sunday week
        const weeklyDeadlines = (rawEntries || []).filter(entry => {
            const date = parseDueDate(entry.due_date)
            if (!date) return false
            return date >= currentMonday && date <= currentSunday
        })

        console.log(`Found ${weeklyDeadlines.length} compliance deadlines for the week.`)

        // 6. Broadcast configuration
        const subject = `📅 Weekly Compliance Digest: ${startDateStr} - ${endDateStr} Deadlines`
        const previewText = weeklyDeadlines.length > 0
            ? `Stay compliant! This week has ${weeklyDeadlines.length} key statutory due dates across MCA, GST, SEBI & Income Tax.`
            : `Enjoy a peaceful week! No major corporate or tax compliance due dates are scheduled this week.`

        // Support direct testing to a single administrator email if provided in params
        const targetEmails = testEmail ? [testEmail.trim()] : undefined

        const result = await sendNewsletterEmails({
            subject,
            previewText,
            body: `Weekly Compliance Digest: ${startDateStr} - ${endDateStr}`,
            customHtmlBuilder: (unsubscribeUrl) => buildWeeklyDigestHtml({
                startDateStr,
                endDateStr,
                entries: weeklyDeadlines,
                unsubscribeUrl
            }),
            targetEmails,
            newsletterMode: 'auto',
            articleCount: weeklyDeadlines.length
        })

        return NextResponse.json({
            success: true,
            message: testEmail ? `Test weekly digest sent successfully to ${testEmail}` : `Weekly digest broadcast completed`,
            week: {
                start: startDateStr,
                end: endDateStr,
            },
            deadlinesCount: weeklyDeadlines.length,
            deliveryResult: result
        })

    } catch (err: any) {
        console.error('=== WEEKLY DIGEST CRON FATAL ERROR ===', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
