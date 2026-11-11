import { NextRequest, NextResponse } from 'next/server'
import { generateUnsubscribeToken, safeCompare } from '@/lib/utils'
import { supabaseAdmin } from '@/lib/supabase-server'

function buildErrorHtml(msg: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Unsubscribe Error</title>
      <style>
        body { font-family: sans-serif; background-color: #F8FAFC; color: #0F172A; text-align: center; padding: 40px; }
        h1 { color: #EF4444; }
      </style>
    </head>
    <body>
      <h1>Error</h1>
      <p>${msg}</p>
      <a href="/" style="color: #F59E0B; text-decoration: none; font-weight: bold;">Return to Homepage</a>
    </body>
    </html>
  `
}

function buildSuccessHtml(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Unsubscribed successfully</title>
      <style>
        body { font-family: sans-serif; background-color: #0F172A; color: #fff; text-align: center; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; }
        h1 { color: #F59E0B; }
        p { color: #94A3B8; margin-bottom: 2rem; }
        a { background-color: #F59E0B; color: #0F172A; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>You have been unsubscribed</h1>
      <p>You will no longer receive emails from CorpLawUpdates.in.</p>
      <a href="/">Return to Homepage</a>
    </body>
    </html>
  `
}

async function extractUnsubscribeParams(request: NextRequest): Promise<{ email: string | null; token: string | null }> {
    const { searchParams } = new URL(request.url)
    let email = searchParams.get('email')
    let token = searchParams.get('token')

    if (request.method === 'POST' && (!email || !token)) {
        const contentType = request.headers.get('content-type') || ''
        try {
            if (contentType.includes('application/json')) {
                const body = await request.json().catch(() => null)
                if (body && typeof body === 'object') {
                    email = email || (typeof body.email === 'string' ? body.email : null)
                    token = token || (typeof body.token === 'string' ? body.token : null)
                }
            } else {
                const rawBody = await request.text().catch(() => '')
                if (rawBody) {
                    const formParams = new URLSearchParams(rawBody)
                    email = email || formParams.get('email')
                    token = token || formParams.get('token')
                }
            }
        } catch {
            // Fall back to query parameters only
        }
    }

    return {
        email: email ? email.trim() : null,
        token: token ? token.trim() : null,
    }
}

/**
 * Shared case-insensitive unsubscribe handler used by both GET and RFC 8058 POST.
 */
async function processUnsubscribe(request: NextRequest): Promise<NextResponse> {
    try {
        const { email, token } = await extractUnsubscribeParams(request)
        const wantsJson = request.headers.get('accept')?.includes('application/json')

        if (!email || !token) {
            if (wantsJson) {
                return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 })
            }
            return new NextResponse(buildErrorHtml('Invalid unsubscribe link'), {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            })
        }

        const expectedToken = generateUnsubscribeToken(email)
        if (!safeCompare(token, expectedToken)) {
            if (wantsJson) {
                return NextResponse.json({ error: 'Invalid or expired unsubscribe link' }, { status: 400 })
            }
            return new NextResponse(buildErrorHtml('Invalid or expired unsubscribe link'), {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            })
        }

        // Escape LIKE special characters so '_' or '%' in email addresses match literally, case-insensitively
        const escapedPattern = email.replace(/[\\%_]/g, '\\$&')
        const { data: candidates, error: lookupError } = await supabaseAdmin
            .from('subscribers')
            .select('id, email')
            .ilike('email', escapedPattern)

        if (lookupError) {
            throw lookupError
        }

        const normalizedTarget = email.toLowerCase()
        const matchingIds = (candidates || [])
            .filter(row => typeof row.email === 'string' && row.email.trim().toLowerCase() === normalizedTarget)
            .map(row => row.id)

        if (matchingIds.length > 0) {
            const { error: updateError } = await supabaseAdmin
                .from('subscribers')
                .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
                .in('id', matchingIds)

            if (updateError) {
                throw updateError
            }
        }

        if (wantsJson) {
            return NextResponse.json({
                success: true,
                unsubscribed: true,
                matchedCount: matchingIds.length,
            })
        }

        return new NextResponse(buildSuccessHtml(), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        })
    } catch (error) {
        const err = error as Error & { digest?: string }
        if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
            throw error
        }

        console.error('[API Error]', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    return processUnsubscribe(request)
}

/**
 * RFC 8058 One-Click Unsubscribe POST handler (List-Unsubscribe=One-Click)
 */
export async function POST(request: NextRequest) {
    return processUnsubscribe(request)
}
