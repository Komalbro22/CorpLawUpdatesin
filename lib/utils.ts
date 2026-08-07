import { createHash, createHmac, timingSafeEqual } from 'crypto'

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

export function calculateReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export function generateUnsubscribeToken(email: string): string {
    const adminSalt = process.env.ADMIN_SECRET_SALT || process.env.ADMIN_PASSWORD || 'corplawupdates-unsubscribe-salt-2026'
    return createHmac('sha256', adminSalt)
        .update(email.toLowerCase().trim())
        .digest('hex')
}

export function createAdminSessionToken(): string {
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminSalt = process.env.ADMIN_SECRET_SALT
    if (!adminPassword || !adminSalt) {
        throw new Error('ADMIN_PASSWORD and ADMIN_SECRET_SALT must be configured')
    }

    const payload = JSON.stringify({
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })

    const payloadB64 = Buffer.from(payload).toString('base64')
    const secretKey = adminPassword + adminSalt
    const signature = createHmac('sha256', secretKey)
        .update(payloadB64)
        .digest('hex')

    return `${payloadB64}.${signature}`
}

export function safeCompare(a: string, b: string): boolean {
    const hashA = createHash('sha256').update(a).digest()
    const hashB = createHash('sha256').update(b).digest()
    return timingSafeEqual(hashA, hashB)
}

export function extractFirstImage(content: string): string | null {
    if (!content) return null
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/)
    if (mdMatch && mdMatch[1]) return mdMatch[1]
    // Use backreference \1 to ensure opening and closing quotes match (prevents partial match on mismatched quotes)
    const htmlMatch = content.match(/<img[^>]*?src=(["'])(.*?)\1/)
    if (htmlMatch && htmlMatch[2]) return htmlMatch[2]
    return null
}

