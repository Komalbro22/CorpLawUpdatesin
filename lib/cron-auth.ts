import { NextResponse } from 'next/server'

/**
 * Validates the Authorization header for Vercel Cron job routes.
 * Returns a 401 NextResponse if auth fails, or null if auth passes.
 *
 * Usage at the top of every cron route handler:
 *   const authError = validateCronAuth(request)
 *   if (authError) return authError
 */
export function validateCronAuth(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET

  // Fail closed: if CRON_SECRET is not configured, always block
  if (!cronSecret) {
    console.error('[Cron Auth] CRON_SECRET environment variable is not set. Blocking cron execution.')
    return NextResponse.json(
      { error: 'Cron jobs are not configured. Set CRON_SECRET in environment variables.' },
      { status: 401 }
    )
  }

  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization')

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron Auth] Unauthorized cron trigger attempt.')
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  return null // Auth passed
}
