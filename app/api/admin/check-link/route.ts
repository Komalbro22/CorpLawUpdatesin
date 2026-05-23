import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL required' }, { status: 400 }
    )
  }

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'CorpLawUpdates-LinkChecker/1.0',
      },
      signal: AbortSignal.timeout(5000),
    })

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
    })
  } catch {
    // Fallback to GET in case HEAD request is not allowed/supported
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'CorpLawUpdates-LinkChecker/1.0',
        },
        signal: AbortSignal.timeout(5000),
      })
      return NextResponse.json({
        ok: res.ok,
        status: res.status,
      })
    } catch {
      return NextResponse.json({
        ok: false,
        status: 0,
      })
    }
  }
}
