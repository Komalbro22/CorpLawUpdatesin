import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAdminSession } from '@/lib/admin-auth'
import type { AdminRole } from '@/lib/utils'

export type ApiKeyScope =
  | 'articles:read' | 'articles:write' | 'articles:publish' | 'articles:delete'
  | 'glossary:read' | 'glossary:write' | 'glossary:delete'
  | 'media:read' | 'media:write' | 'media:delete'
  | 'newsletter:read' | 'newsletter:write' | 'newsletter:send'
  | 'subscribers:read' | 'subscribers:write'
  | 'feedback:read' | 'feedback:write'
  | 'partner-interests:read' | 'partner-interests:write'
  | 'analytics:read'
  | 'audit:read'

export const ALL_API_SCOPES: { scope: ApiKeyScope; label: string; group: string }[] = [
  { scope: 'articles:read', label: 'Read Articles', group: 'Articles' },
  { scope: 'articles:write', label: 'Create & Edit Articles', group: 'Articles' },
  { scope: 'articles:publish', label: 'Publish & Unpublish Articles', group: 'Articles' },
  { scope: 'articles:delete', label: 'Delete Draft Articles', group: 'Articles' },

  { scope: 'glossary:read', label: 'Read Glossary Terms', group: 'Glossary' },
  { scope: 'glossary:write', label: 'Create & Edit Terms', group: 'Glossary' },
  { scope: 'glossary:delete', label: 'Delete Unpublished Terms', group: 'Glossary' },

  { scope: 'media:read', label: 'List Media Files', group: 'Media' },
  { scope: 'media:write', label: 'Upload Images', group: 'Media' },
  { scope: 'media:delete', label: 'Delete Images', group: 'Media' },

  { scope: 'newsletter:read', label: 'Read Campaigns & Stats', group: 'Newsletter' },
  { scope: 'newsletter:write', label: 'Create Drafts & Test Sends', group: 'Newsletter' },
  { scope: 'newsletter:send', label: 'Send Live Campaign to Subscribers', group: 'Newsletter' },

  { scope: 'subscribers:read', label: 'Read Subscribers & Stats & Export', group: 'Subscribers' },
  { scope: 'subscribers:write', label: 'Add & Update Subscriber Status', group: 'Subscribers' },

  { scope: 'feedback:read', label: 'Read Reader Feedback & Stats', group: 'Feedback' },
  { scope: 'feedback:write', label: 'Update Feedback Status & Notes', group: 'Feedback' },

  { scope: 'partner-interests:read', label: 'Read Partner Interests & Stats', group: 'Partner Interests' },
  { scope: 'partner-interests:write', label: 'Update Partner Status & Notes', group: 'Partner Interests' },

  { scope: 'analytics:read', label: 'Read Article & Site Analytics', group: 'Analytics' },
  { scope: 'audit:read', label: 'Read API Audit Log', group: 'Audit' },
]

export interface ApiKeyRecord {
  id: string
  name: string
  prefix: string
  scopes: ApiKeyScope[]
  created_at: string
  last_used_at: string | null
  status: 'active' | 'revoked'
  revoked_at: string | null
  created_by?: string
}

export type AuthContext =
  | { type: 'session'; role: AdminRole }
  | { type: 'api_key'; key: ApiKeyRecord }

// In-memory caches for throttling updates and rate limits
const keyLastUsedCache = new Map<string, number>() // keyId -> timestamp ms
const inMemoryRequestCount = new Map<string, { count: number; windowStart: number }>() // keyHash -> count
const inMemoryIpViolations = new Map<string, { count: number; lockedUntil?: number }>() // ip -> failure count

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  )
}

/**
 * Generate a new API key with cryptographically strong entropy
 * Format: clk_ + 48 hex chars (24 random bytes => 48 hex chars, plus 16 additional random bytes => 32 bytes total entropy = 64 hex chars)
 */
export async function createApiKey(
  name: string,
  scopes: ApiKeyScope[],
  createdBy: string = 'admin'
): Promise<{ rawKey: string; keyRecord: ApiKeyRecord }> {
  const randomHex = randomBytes(32).toString('hex') // 32 bytes = 256 bits entropy
  const rawKey = `clk_${randomHex}`
  const prefix = `clk_${randomHex.substring(0, 8)}`
  const keyHash = hashApiKey(rawKey)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      name,
      key_hash: keyHash,
      prefix,
      scopes,
      status: 'active',
      created_by: createdBy,
    })
    .select('id, name, prefix, scopes, created_at, last_used_at, status, revoked_at, created_by')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create API key in database: ${error?.message || 'unknown error'}`)
  }

  // Audit log key creation
  await logApiAudit({
    keyId: data.id,
    keyName: name,
    action: 'key:create',
    entityType: 'api_key',
    entityId: data.id,
    status: 'success',
    details: { scopes, prefix },
  })

  return { rawKey, keyRecord: data as ApiKeyRecord }
}

/**
 * Revoke an existing API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', keyId)
    .select('id, name, prefix')
    .single()

  if (error || !data) {
    return false
  }

  await logApiAudit({
    keyId: data.id,
    keyName: data.name,
    action: 'key:revoke',
    entityType: 'api_key',
    entityId: data.id,
    status: 'success',
    details: { prefix: data.prefix },
  })

  return true
}

/**
 * Regenerate an existing API key (revokes old key and creates a fresh one with identical scopes)
 */
export async function regenerateApiKey(keyId: string): Promise<{ rawKey: string; keyRecord: ApiKeyRecord } | null> {
  const { data: oldKey, error: fetchError } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .single()

  if (fetchError || !oldKey) {
    return null
  }

  // Revoke old key
  await revokeApiKey(keyId)

  // Create new key with same name and scopes
  return await createApiKey(oldKey.name, oldKey.scopes, oldKey.created_by || 'admin')
}

/**
 * Log an action to api_audit_log
 */
export async function logApiAudit(entry: {
  keyId?: string
  keyName: string
  action: string
  entityType: string
  entityId?: string | null
  ip?: string
  status: 'success' | 'failure'
  details?: Record<string, any>
}): Promise<void> {
  try {
    await supabaseAdmin.from('api_audit_log').insert({
      key_id: entry.keyId || null,
      key_name: entry.keyName,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId || null,
      ip_address: entry.ip || null,
      status: entry.status,
      details: entry.details || {},
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[API Audit Log Error]', err)
  }
}

/**
 * Check if an IP address is currently locked out due to repeated invalid key attempts
 */
async function checkIpLockout(ip: string): Promise<{ locked: boolean; retryAfter?: number }> {
  const now = Date.now()

  // 1. In-memory check
  const mem = inMemoryIpViolations.get(ip)
  if (mem?.lockedUntil && mem.lockedUntil > now) {
    return { locked: true, retryAfter: Math.ceil((mem.lockedUntil - now) / 1000) }
  }

  // 2. Persistent check in Supabase
  try {
    const { data } = await supabaseAdmin
      .from('api_ip_violations')
      .select('locked_until')
      .eq('ip_address', ip)
      .single()

    if (data?.locked_until) {
      const lockedTime = new Date(data.locked_until).getTime()
      if (lockedTime > now) {
        const retryAfter = Math.ceil((lockedTime - now) / 1000)
        inMemoryIpViolations.set(ip, { count: 10, lockedUntil: lockedTime })
        return { locked: true, retryAfter }
      }
    }
  } catch {
    // Ignore DB check error, fall back to in-memory
  }

  return { locked: false }
}

/**
 * Record an invalid API key attempt from an IP address
 */
export async function recordInvalidKeyAttempt(ip: string): Promise<void> {
  const now = Date.now()
  const current = inMemoryIpViolations.get(ip) || { count: 0 }
  const newCount = current.count + 1

  // 10 invalid attempts in a short window -> 15 min lock
  const lockedUntil = newCount >= 10 ? now + 15 * 60 * 1000 : undefined
  inMemoryIpViolations.set(ip, { count: newCount, lockedUntil })

  try {
    if (newCount >= 10) {
      await supabaseAdmin.from('api_ip_violations').upsert({
        ip_address: ip,
        attempt_count: newCount,
        last_attempt_at: new Date(now).toISOString(),
        locked_until: new Date(now + 15 * 60 * 1000).toISOString(),
      })
    } else {
      await supabaseAdmin.from('api_ip_violations').upsert({
        ip_address: ip,
        attempt_count: newCount,
        last_attempt_at: new Date(now).toISOString(),
      })
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Rate limit check for an active API key
 * 300 requests/hour standard; 5/hour for newsletter sends
 */
function checkRateLimit(keyId: string, isNewsletterSend: boolean = false): { ok: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = isNewsletterSend ? 5 : 300
  const bucketKey = isNewsletterSend ? `${keyId}:send` : keyId

  const entry = inMemoryRequestCount.get(bucketKey)
  if (!entry || now - entry.windowStart > windowMs) {
    inMemoryRequestCount.set(bucketKey, { count: 1, windowStart: now })
    return { ok: true }
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000)
    return { ok: false, retryAfter: Math.max(1, retryAfter) }
  }

  entry.count++
  return { ok: true }
}

/**
 * Throttled update of api_keys.last_used_at (at most once every 60 seconds per key)
 */
export async function touchLastUsed(keyId: string): Promise<void> {
  const now = Date.now()
  const lastTouch = keyLastUsedCache.get(keyId) || 0

  if (now - lastTouch < 60 * 1000) {
    return // Skip write if updated within the last 60 seconds
  }

  keyLastUsedCache.set(keyId, now)
  try {
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date(now).toISOString() })
      .eq('id', keyId)
  } catch (err) {
    console.error('[API Key Touch Error]', err)
  }
}

/**
 * Check idempotency key for POST endpoints (articles create, publish, newsletter send)
 */
export async function getIdempotentResponse(
  idempotencyKey: string | null,
  endpoint: string
): Promise<{ exists: boolean; statusCode?: number; responseBody?: any }> {
  if (!idempotencyKey) return { exists: false }

  try {
    const { data } = await supabaseAdmin
      .from('idempotency_keys')
      .select('status_code, response_body, expires_at')
      .eq('key', idempotencyKey)
      .eq('endpoint', endpoint)
      .single()

    if (data && new Date(data.expires_at).getTime() > Date.now()) {
      return {
        exists: true,
        statusCode: data.status_code,
        responseBody: data.response_body,
      }
    }
  } catch {
    // Non-blocking
  }

  return { exists: false }
}

/**
 * Store response for an idempotency key (valid for 24 hours)
 */
export async function storeIdempotentResponse(
  idempotencyKey: string | null,
  endpoint: string,
  statusCode: number,
  responseBody: any
): Promise<void> {
  if (!idempotencyKey) return

  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await supabaseAdmin.from('idempotency_keys').upsert({
      key: idempotencyKey,
      endpoint,
      status_code: statusCode,
      response_body: responseBody,
      expires_at: expiresAt,
    })
  } catch (err) {
    console.error('[Store Idempotency Error]', err)
  }
}

/**
 * Main Opt-In Verification Helper for Admin Endpoints
 * 
 * 1. Checks session cookie first (session callers have full admin/editor access with zero regressions).
 * 2. If no session, checks Authorization: Bearer <key> against api_keys table with requiredScope.
 * 3. Enforces transport rules (rejects query string keys, rejects if scope missing, rate-limits, throttles last_used_at).
 * 4. NEVER adds CORS headers.
 */
export async function verifyAdminOrKey(
  request: NextRequest,
  requiredScope: ApiKeyScope
): Promise<
  | { success: true; auth: AuthContext }
  | { success: false; response: NextResponse }
> {
  const url = new URL(request.url)
  const clientIp = getClientIp(request)

  // RULE: Transport rejection — reject keys passed in query strings
  if (url.searchParams.has('key') || url.searchParams.has('api_key')) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: {
            code: 'INVALID_TRANSPORT',
            message: 'API keys must be passed exclusively via Authorization: Bearer header. Query string keys are forbidden for security.',
          },
        },
        { status: 400 }
      ),
    }
  }

  // 1. Check Session Cookie (Human Admin Panel)
  const session = await getAdminSession()
  if (session) {
    return {
      success: true,
      auth: { type: 'session', role: session.role },
    }
  }

  // 2. Check Authorization Bearer Header (AI Agent / Programmatic)
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Provide a valid admin session cookie or Authorization: Bearer <key> header.',
          },
        },
        { status: 401 }
      ),
    }
  }

  const rawKey = authHeader.substring(7).trim()
  if (!rawKey) {
    return {
      success: false,
      response: NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing API key in Bearer authorization header.' } },
        { status: 401 }
      ),
    }
  }

  // Check IP lockout from previous repeated invalid attempts
  const lockout = await checkIpLockout(clientIp)
  if (lockout.locked) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: {
            code: 'IP_LOCKED_OUT',
            message: `Too many invalid API key attempts from this IP address. Please wait ${lockout.retryAfter || 900} seconds.`,
          },
        },
        {
          status: 429,
          headers: { 'Retry-After': String(lockout.retryAfter || 900) },
        }
      ),
    }
  }

  // Lookup key in DB by SHA-256 hash
  const keyHash = hashApiKey(rawKey)
  const { data: keyRecord, error: dbError } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, prefix, scopes, created_at, last_used_at, status, revoked_at, created_by')
    .eq('key_hash', keyHash)
    .single()

  if (dbError || !keyRecord || keyRecord.status !== 'active') {
    // Record invalid attempt for IP throttle
    await recordInvalidKeyAttempt(clientIp)
    return {
      success: false,
      response: NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid or revoked API key.' } },
        { status: 401 }
      ),
    }
  }

  // Rate Limiting Check
  const isNewsletterSend = requiredScope === 'newsletter:send'
  const rateLimitResult = checkRateLimit(keyRecord.id, isNewsletterSend)
  if (!rateLimitResult.ok) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: `Rate limit exceeded for key "${keyRecord.name}". Please retry after ${rateLimitResult.retryAfter} seconds.`,
          },
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) },
        }
      ),
    }
  }

  // Scope Enforcement Check
  const keyScopes = (keyRecord.scopes || []) as ApiKeyScope[]
  if (!keyScopes.includes(requiredScope)) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. API key "${keyRecord.name}" lacks the required scope: "${requiredScope}".`,
          },
        },
        { status: 403 }
      ),
    }
  }

  // Throttled update of last_used_at (guaranteed write in serverless)
  await touchLastUsed(keyRecord.id)

  return {
    success: true,
    auth: {
      type: 'api_key',
      key: keyRecord as ApiKeyRecord,
    },
  }
}
