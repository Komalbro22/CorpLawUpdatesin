import { NextResponse } from 'next/server'
import { generateLegalClause, AiClauseRequest } from '@/lib/ai-clause-generator'
import { redis } from '@/lib/redis-cache'

export const dynamic = 'force-dynamic'

// In-memory fallback rate limiter if Redis is not configured
const inMemoryRateLimit = new Map<string, { count: number; resetAt: number }>()

function checkMemoryLimit(ip: string, maxRequests = 15, windowMs = 24 * 60 * 60 * 1000): boolean {
  const now = Date.now()
  const record = inMemoryRateLimit.get(ip)

  if (!record || now > record.resetAt) {
    inMemoryRateLimit.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count += 1
  return true
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous'

    // Rate limiting: 10-15 requests per IP per day
    if (redis) {
      try {
        const key = `ratelimit:ai-clause:${ip}`
        const current = await redis.incr(key)
        if (current === 1) {
          await redis.expire(key, 86400) // 24 hours
        }
        if (current > 15) {
          return NextResponse.json(
            { error: 'Daily clause drafting limit reached (15/day). Please try again tomorrow.' },
            { status: 429 }
          )
        }
      } catch (redisErr) {
        console.warn('[AI Clause] Redis rate limit failed, using fallback:', redisErr)
        if (!checkMemoryLimit(ip, 15)) {
          return NextResponse.json(
            { error: 'Daily clause drafting limit reached. Please try again tomorrow.' },
            { status: 429 }
          )
        }
      }
    } else {
      if (!checkMemoryLimit(ip, 15)) {
        return NextResponse.json(
          { error: 'Daily clause drafting limit reached. Please try again tomorrow.' },
          { status: 429 }
        )
      }
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const { documentType, userInstruction, existingClauseTitles } = body as Partial<AiClauseRequest>

    if (!userInstruction || typeof userInstruction !== 'string' || !userInstruction.trim()) {
      return NextResponse.json(
        { error: 'Please describe the custom clause you want to generate in plain English.' },
        { status: 400 }
      )
    }

    if (userInstruction.length > 500) {
      return NextResponse.json(
        { error: 'Clause description is too long (maximum 500 characters).' },
        { status: 400 }
      )
    }

    const result = await generateLegalClause({
      documentType: documentType || 'Legal Document',
      userInstruction,
      existingClauseTitles,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[AI Clause Route Error]:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate clause. Please try again shortly.' },
      { status: 500 }
    )
  }
}
