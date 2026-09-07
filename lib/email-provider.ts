/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

export interface EmailSenderInfo {
    email: string
    name: string
}

export interface SingleEmailOptions {
    to: string
    subject: string
    html: string
    from?: string
    fromName?: string
    replyTo?: string
}

export interface BatchEmailItem {
    to: string
    subject: string
    html: string
}

export interface BatchEmailOptions {
    emails: BatchEmailItem[]
    from?: string
    fromName?: string
    replyTo?: string
}

export interface SendResult {
    success: boolean
    messageId?: string
    error?: string
    provider: 'brevo-api' | 'brevo-smtp' | 'resend' | 'none'
}

export interface BatchSendResult {
    success: boolean
    sent: number
    failed: number
    total: number
    results: Array<{
        email: string
        success: boolean
        messageId?: string
        error?: string
    }>
    provider: 'brevo-api' | 'brevo-smtp' | 'resend' | 'none'
}

/**
 * Parses sender address and display name cleanly.
 * Handles strings like "CorpLawUpdates <newsletter@corplawupdates.in>" or plain emails.
 */
export function parseSender(from?: string, fromName?: string): EmailSenderInfo {
    const raw = (
        from ||
        process.env.BREVO_FROM_EMAIL ||
        process.env.RESEND_FROM_EMAIL ||
        'newsletter@corplawupdates.in'
    ).trim().replace(/['"]/g, '')

    let parsedName = fromName || 'CorpLawUpdates'
    let parsedEmail = raw

    const match = raw.match(/^(?:(.*)<)?([^<>]+)>?$/)
    if (match) {
        if (match[1]?.trim()) {
            parsedName = match[1].trim()
        }
        parsedEmail = match[2].trim()
    }

    return { email: parsedEmail, name: parsedName }
}

/**
 * Identifies the prioritized active email delivery provider.
 * 1. Brevo REST API (highest recommendation: 300 free/day, fast HTTP, zero SMTP latency)
 * 2. Brevo SMTP Relay (via nodemailer with smtp-relay.brevo.com)
 * 3. Resend (100 free/day fallback)
 */
export function getActiveEmailProvider(): 'brevo-api' | 'brevo-smtp' | 'resend' | 'none' {
    if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim()) {
        return 'brevo-api'
    }
    if (process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_KEY.trim()) {
        return 'brevo-smtp'
    }
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
        return 'resend'
    }
    return 'none'
}

/**
 * Sends a single email via Brevo REST API v3 (POST https://api.brevo.com/v3/smtp/email).
 */
async function sendViaBrevoApi(options: SingleEmailOptions): Promise<SendResult> {
    const apiKey = process.env.BREVO_API_KEY?.trim()
    if (!apiKey) {
        return { success: false, error: 'BREVO_API_KEY is not configured', provider: 'brevo-api' }
    }

    const { email: senderEmail, name: senderName } = parseSender(options.from, options.fromName)

    try {
        const payload: any = {
            sender: { name: senderName, email: senderEmail },
            to: [{ email: options.to.trim() }],
            subject: options.subject,
            htmlContent: options.html,
        }

        if (options.replyTo) {
            payload.replyTo = { email: options.replyTo.trim() }
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify(payload),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            const errorMsg = data?.message || `Brevo API returned HTTP ${response.status}: ${response.statusText}`
            return { success: false, error: errorMsg, provider: 'brevo-api' }
        }

        return {
            success: true,
            messageId: data?.messageId || data?.messageIds?.[0] || 'brevo-sent',
            provider: 'brevo-api',
        }
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || 'Network error sending via Brevo API',
            provider: 'brevo-api',
        }
    }
}

/**
 * Sends batch emails via Brevo REST API using the `messageVersions` payload.
 * Supports up to 1000 messages per request natively.
 */
async function sendBatchViaBrevoApi(options: BatchEmailOptions): Promise<BatchSendResult> {
    const apiKey = process.env.BREVO_API_KEY?.trim()
    const { email: senderEmail, name: senderName } = parseSender(options.from, options.fromName)
    const emails = options.emails

    if (!apiKey) {
        return {
            success: false,
            sent: 0,
            failed: emails.length,
            total: emails.length,
            results: emails.map(e => ({ email: e.to, success: false, error: 'BREVO_API_KEY not configured' })),
            provider: 'brevo-api',
        }
    }

    const CHUNK_SIZE = 100
    let totalSent = 0
    let totalFailed = 0
    const results: Array<{ email: string; success: boolean; messageId?: string; error?: string }> = []

    for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
        const chunk = emails.slice(i, i + CHUNK_SIZE)
        const payload: any = {
            sender: { name: senderName, email: senderEmail },
            subject: chunk[0]?.subject || 'CorpLawUpdates Intelligence',
            messageVersions: chunk.map(item => ({
                to: [{ email: item.to.trim() }],
                subject: item.subject,
                htmlContent: item.html,
            })),
        }

        if (options.replyTo) {
            payload.replyTo = { email: options.replyTo.trim() }
        }

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                console.warn('[Brevo Batch] Batch API returned error, falling back to individual sends:', data)
                // Fallback to individual sends for this chunk
                for (const item of chunk) {
                    const single = await sendViaBrevoApi({
                        to: item.to,
                        subject: item.subject,
                        html: item.html,
                        from: senderEmail,
                        fromName: senderName,
                        replyTo: options.replyTo,
                    })

                    if (single.success) {
                        totalSent++
                        results.push({ email: item.to, success: true, messageId: single.messageId })
                    } else {
                        totalFailed++
                        results.push({ email: item.to, success: false, error: single.error })
                    }
                    await new Promise(r => setTimeout(r, 50))
                }
            } else {
                const messageIds: string[] = Array.isArray(data?.messageIds) ? data.messageIds : []
                chunk.forEach((item, idx) => {
                    totalSent++
                    results.push({
                        email: item.to,
                        success: true,
                        messageId: messageIds[idx] || data?.messageId || `brevo-batch-${Date.now()}-${idx}`,
                    })
                })
            }
        } catch (err: any) {
            console.error('[Brevo Batch] Network error:', err)
            chunk.forEach(item => {
                totalFailed++
                results.push({ email: item.to, success: false, error: err?.message || 'Batch send network error' })
            })
        }

        if (i + CHUNK_SIZE < emails.length) {
            await new Promise(r => setTimeout(r, 200))
        }
    }

    return {
        success: totalSent > 0,
        sent: totalSent,
        failed: totalFailed,
        total: emails.length,
        results,
        provider: 'brevo-api',
    }
}

/**
 * Sends a single email via Nodemailer using Brevo SMTP relay (smtp-relay.brevo.com:587).
 */
async function sendViaBrevoSmtp(options: SingleEmailOptions): Promise<SendResult> {
    const smtpKey = process.env.BREVO_SMTP_KEY?.trim()
    const smtpUser = (
        process.env.BREVO_SMTP_LOGIN ||
        process.env.BREVO_FROM_EMAIL ||
        'corplawupdatesin@gmail.com'
    ).trim()

    if (!smtpKey) {
        return { success: false, error: 'BREVO_SMTP_KEY is not configured', provider: 'brevo-smtp' }
    }

    const { email: senderEmail, name: senderName } = parseSender(options.from, options.fromName)

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false, // 587 uses STARTTLS
            auth: {
                user: smtpUser,
                pass: smtpKey,
            },
        })

        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo,
        })

        return {
            success: true,
            messageId: info.messageId,
            provider: 'brevo-smtp',
        }
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || 'Brevo SMTP error',
            provider: 'brevo-smtp',
        }
    }
}

/**
 * Sends batch emails via Nodemailer with Brevo SMTP relay.
 */
async function sendBatchViaBrevoSmtp(options: BatchEmailOptions): Promise<BatchSendResult> {
    const emails = options.emails
    let totalSent = 0
    let totalFailed = 0
    const results: Array<{ email: string; success: boolean; messageId?: string; error?: string }> = []

    for (const item of emails) {
        const res = await sendViaBrevoSmtp({
            to: item.to,
            subject: item.subject,
            html: item.html,
            from: options.from,
            fromName: options.fromName,
            replyTo: options.replyTo,
        })

        if (res.success) {
            totalSent++
            results.push({ email: item.to, success: true, messageId: res.messageId })
        } else {
            totalFailed++
            results.push({ email: item.to, success: false, error: res.error })
        }

        // Small delay to prevent rate issues on SMTP socket
        await new Promise(r => setTimeout(r, 100))
    }

    return {
        success: totalSent > 0,
        sent: totalSent,
        failed: totalFailed,
        total: emails.length,
        results,
        provider: 'brevo-smtp',
    }
}

/**
 * Sends a single email via Resend.
 */
async function sendViaResend(options: SingleEmailOptions): Promise<SendResult> {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    if (!apiKey) {
        return { success: false, error: 'RESEND_API_KEY is not configured', provider: 'resend' }
    }

    const { email: senderEmail, name: senderName } = parseSender(options.from, options.fromName)
    const resend = new Resend(apiKey)

    try {
        const result = await resend.emails.send({
            from: `"${senderName}" <${senderEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo,
        })

        if (result.error) {
            return { success: false, error: result.error.message, provider: 'resend' }
        }

        return {
            success: true,
            messageId: result.data?.id,
            provider: 'resend',
        }
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || 'Resend send error',
            provider: 'resend',
        }
    }
}

/**
 * Sends batch emails via Resend Batch API.
 */
async function sendBatchViaResend(options: BatchEmailOptions): Promise<BatchSendResult> {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    const { email: senderEmail, name: senderName } = parseSender(options.from, options.fromName)
    const emails = options.emails

    if (!apiKey) {
        return {
            success: false,
            sent: 0,
            failed: emails.length,
            total: emails.length,
            results: emails.map(e => ({ email: e.to, success: false, error: 'RESEND_API_KEY not configured' })),
            provider: 'resend',
        }
    }

    const resend = new Resend(apiKey)
    const CHUNK_SIZE = 100
    let totalSent = 0
    let totalFailed = 0
    const results: Array<{ email: string; success: boolean; messageId?: string; error?: string }> = []

    for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
        const chunk = emails.slice(i, i + CHUNK_SIZE)
        const batchPayload = chunk.map(item => ({
            from: `"${senderName}" <${senderEmail}>`,
            to: item.to,
            subject: item.subject,
            html: item.html,
        }))

        try {
            const batchResult = await resend.batch.send(batchPayload)

            if (batchResult.error) {
                // Fallback to individual sends
                for (const item of chunk) {
                    const single = await sendViaResend({
                        to: item.to,
                        subject: item.subject,
                        html: item.html,
                        from: senderEmail,
                        fromName: senderName,
                        replyTo: options.replyTo,
                    })

                    if (single.success) {
                        totalSent++
                        results.push({ email: item.to, success: true, messageId: single.messageId })
                    } else {
                        totalFailed++
                        results.push({ email: item.to, success: false, error: single.error })
                    }
                    await new Promise(r => setTimeout(r, 100))
                }
            } else {
                const responseData = (batchResult.data as any)?.data || (Array.isArray(batchResult.data) ? batchResult.data : [])
                chunk.forEach((item, idx) => {
                    totalSent++
                    results.push({
                        email: item.to,
                        success: true,
                        messageId: responseData[idx]?.id || 'resend-batch-sent',
                    })
                })
            }
        } catch (err: any) {
            chunk.forEach(item => {
                totalFailed++
                results.push({ email: item.to, success: false, error: err?.message || 'Resend batch exception' })
            })
        }

        if (i + CHUNK_SIZE < emails.length) {
            await new Promise(r => setTimeout(r, 500))
        }
    }

    return {
        success: totalSent > 0,
        sent: totalSent,
        failed: totalFailed,
        total: emails.length,
        results,
        provider: 'resend',
    }
}

/**
 * Universal single email dispatcher.
 * Intelligently routes to the configured provider (Brevo API > Brevo SMTP > Resend).
 */
export async function sendEmail(options: SingleEmailOptions): Promise<SendResult> {
    const provider = getActiveEmailProvider()

    switch (provider) {
        case 'brevo-api':
            return sendViaBrevoApi(options)
        case 'brevo-smtp':
            return sendViaBrevoSmtp(options)
        case 'resend':
            return sendViaResend(options)
        default:
            return {
                success: false,
                error: 'No active email provider configured. Please configure BREVO_API_KEY (recommended) or BREVO_SMTP_KEY in your environment variables.',
                provider: 'none',
            }
    }
}

/**
 * Universal batch email dispatcher.
 * Intelligently routes to the configured provider (Brevo API > Brevo SMTP > Resend).
 */
export async function sendBatchEmails(options: BatchEmailOptions): Promise<BatchSendResult> {
    const provider = getActiveEmailProvider()

    switch (provider) {
        case 'brevo-api':
            return sendBatchViaBrevoApi(options)
        case 'brevo-smtp':
            return sendBatchViaBrevoSmtp(options)
        case 'resend':
            return sendBatchViaResend(options)
        default:
            return {
                success: false,
                sent: 0,
                failed: options.emails.length,
                total: options.emails.length,
                results: options.emails.map(e => ({
                    email: e.to,
                    success: false,
                    error: 'No active email provider configured. Please configure BREVO_API_KEY or BREVO_SMTP_KEY.',
                })),
                provider: 'none',
            }
    }
}
