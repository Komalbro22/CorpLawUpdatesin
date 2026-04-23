import { NextRequest, NextResponse } from 'next/server'
import { generateUnsubscribeToken } from '@/lib/utils'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    const errorHtml = (msg: string) => `
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

    if (!email || !token) {
        return new NextResponse(errorHtml('Invalid unsubscribe link'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
        })
    }

    const expectedToken = generateUnsubscribeToken(email)
    if (token !== expectedToken) {
        return new NextResponse(errorHtml('Invalid or expired unsubscribe link'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
        })
    }

    await supabaseAdmin
        .from('subscribers')
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email)

    const successHtml = `
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

    return new NextResponse(successHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
    })
}
