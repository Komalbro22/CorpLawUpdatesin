/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendEmail, parseSender } from '@/lib/email-provider'
import { buildEmailHtml, markdownToHtml, sendNewsletterEmails, buildNewsletterTemplateHtml } from '@/lib/newsletter'

function parseDueDate(s: string): Date | null {
    try {
        let dateStr = s
        const parenMatch = dateStr.match(/by\s+(\d+\s+\w+\s+\d{4})/i)
        if (parenMatch) dateStr = parenMatch[1]
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) return d
        const p = new Date(dateStr.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'))
        return isNaN(p.getTime()) ? null : p
    } catch { return null }
}

export async function POST(request: Request) {
    try {
        console.log('=== NEWSLETTER SEND START ===')

        // 1. Authenticate admin
        const isValid = await verifyAdminSession()
        if (!isValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse request payload
        const body = await request.json()
        const { 
            subject, 
            previewText, 
            body: emailBody, 
            testOnly, 
            targetEmails, 
            mode = 'markdown', 
            testEmail, 
            scheduledAt,
            newsletterMode, // 'auto' | 'custom'
            selectedArticleIds,
            leadArticleId,
            includeDeadlines = false,
            introMessage,
            previewOnly // true if only rendering for admin composer preview
        } = body

        const { email: fromEmail, name: fromName } = parseSender()
        const adminEmail = (process.env.ADMIN_EMAIL || 'mail@corplawupdates.in').trim().replace(/['"]/g, '')

        // 3. Validate for standard modes (if not auto/custom preview/send)
        const isCuratedNewsletter = newsletterMode === 'auto' || newsletterMode === 'custom'

        if (!subject?.trim()) {
            return NextResponse.json({ error: 'Subject required' }, { status: 400 })
        }
        if (!isCuratedNewsletter && !emailBody?.trim()) {
            return NextResponse.json({ error: 'Body required' }, { status: 400 })
        }

        // 4. Fetch articles if Auto or Custom Curated modes are chosen
        let articles: any[] = []
        if (isCuratedNewsletter) {
            if (newsletterMode === 'auto') {
                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

                const { data, error: fetchErr } = await supabaseAdmin
                    .from('updates').select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description')
                    .not('published_at', 'is', null)
                    .gte('published_at', sevenDaysAgo.toISOString())
                    .order('published_at', { ascending: false })

                if (fetchErr) {
                    console.error('Error fetching auto updates:', fetchErr)
                    return NextResponse.json({ error: `Fetch error: ${fetchErr.message}` }, { status: 500 })
                }
                articles = data || []
            } else if (newsletterMode === 'custom') {
                if (!selectedArticleIds || !Array.isArray(selectedArticleIds) || selectedArticleIds.length === 0) {
                    return NextResponse.json({ error: 'Please select at least one article for custom curated mode' }, { status: 400 })
                }

                const { data, error: fetchErr } = await supabaseAdmin
                    .from('updates').select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description')
                    .in('id', selectedArticleIds)
                    .order('published_at', { ascending: false })

                if (fetchErr) {
                    console.error('Error fetching custom updates:', fetchErr)
                    return NextResponse.json({ error: `Fetch error: ${fetchErr.message}` }, { status: 500 })
                }
                articles = data || []
            }
        }

        // Fetch upcoming compliance deadlines for executive deadlines section (strictly if enabled and chronologically upcoming)
        let upcomingDeadlines: any[] = []
        if (isCuratedNewsletter && includeDeadlines === true) {
            try {
                const { data: dlData } = await supabaseAdmin
                    .from('compliance_entries')
                    .select('id, form_name, compliance_title, due_date, regulator, applicable_to')
                    .eq('is_active', true)

                const now = new Date()
                const fortyFiveDaysLater = new Date()
                fortyFiveDaysLater.setDate(now.getDate() + 45)

                upcomingDeadlines = (dlData || [])
                    .map((entry: any) => ({
                        ...entry,
                        parsedDate: parseDueDate(entry.due_date)
                    }))
                    .filter((e: any) => e.parsedDate && e.parsedDate >= now && e.parsedDate <= fortyFiveDaysLater)
                    .sort((a: any, b: any) => a.parsedDate.getTime() - b.parsedDate.getTime())
                    .slice(0, 4)
            } catch (dlErr) {
                console.warn('Failed to fetch upcoming deadlines for newsletter:', dlErr)
            }
        }

        // 5. Handle previewOnly rendering
        if (previewOnly) {
            const html = isCuratedNewsletter 
                ? buildNewsletterTemplateHtml({
                    subject,
                    previewText: previewText || '',
                    introMessage,
                    articles,
                    unsubscribeUrl: '#',
                    upcomingDeadlines,
                    leadArticleId,
                    includeDeadlines
                  })
                : buildEmailHtml({
                    subject,
                    previewText: previewText || '',
                    bodyHtml: mode === 'markdown' ? markdownToHtml(emailBody || '') : (emailBody || ''),
                    unsubscribeUrl: '#'
                  })

            return NextResponse.json({
                html,
                articleCount: articles.length,
                articles: articles.map(a => ({ id: a.id, title: a.title, category: a.category, impact_level: a.impact_level }))
            })
        }

        // 6. Define custom HTML builder if using dynamic premium layout
        let customHtmlBuilder: ((unsubUrl: string) => string) | undefined = undefined
        if (isCuratedNewsletter) {
            customHtmlBuilder = (unsubUrl: string) => buildNewsletterTemplateHtml({
                subject,
                previewText: previewText || '',
                introMessage,
                articles,
                unsubscribeUrl: unsubUrl,
                upcomingDeadlines,
                leadArticleId,
                includeDeadlines
            })
        }

        // 7. If test only
        if (testOnly) {
            const sendTo = testEmail && testEmail.trim() ? testEmail.trim() : adminEmail
            
            let testHtml = ''
            if (customHtmlBuilder) {
                testHtml = customHtmlBuilder('#')
            } else {
                let rawHtml = emailBody
                if (mode === 'markdown') {
                    rawHtml = markdownToHtml(emailBody)
                }
                testHtml = buildEmailHtml({
                    subject,
                    previewText: previewText || '',
                    bodyHtml: rawHtml,
                    unsubscribeUrl: '#'
                })
            }

            const result = await sendEmail({
                from: fromEmail,
                fromName,
                to: sendTo,
                subject: `[TEST] ${subject}`,
                html: testHtml,
            })

            if (!result.success) {
                return NextResponse.json(
                    { error: `Send error (${result.provider}): ${result.error}` },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                sent: 1,
                failed: 0,
                total: 1,
                testOnly: true,
                provider: result.provider
            })
        }

        // 8. Handle Scheduling
        if (scheduledAt) {
            // Pre-compile the html to save in database scheduled queue if using newsletter builders
            const bodyContent = customHtmlBuilder 
                ? customHtmlBuilder('#')
                : emailBody.trim()

            const { error: scheduleError } = await supabaseAdmin.from('scheduled_newsletters').insert({
                subject: subject.trim(),
                preview_text: previewText?.trim() || null,
                body: bodyContent,
                scheduled_at: scheduledAt,
                status: 'pending'
            })

            if (scheduleError) {
                return NextResponse.json({ error: `Schedule error: ${scheduleError.message}` }, { status: 500 })
            }

            return NextResponse.json({ scheduled: true, scheduledAt })
        }

        // 9. Send Immediately
        const result = await sendNewsletterEmails({
            subject,
            previewText,
            body: emailBody || 'Newsletter generated dynamically',
            mode,
            targetEmails,
            customHtmlBuilder,
            newsletterMode,
            articleCount: articles.length
        })

        return NextResponse.json(result)

    } catch (err: any) {
        console.error('=== NEWSLETTER FATAL ERROR ===', err)
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
