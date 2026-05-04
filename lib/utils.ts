import { createHash } from 'crypto'

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
    const adminSalt = process.env.ADMIN_SECRET_SALT || ''
    return createHash('sha256')
        .update(email + adminSalt)
        .digest('hex')
}

export function generateAdminSessionHash(): string {
    const adminPassword = process.env.ADMIN_PASSWORD || ''
    const adminSalt = process.env.ADMIN_SECRET_SALT || ''
    return createHash('sha256')
        .update(adminPassword + adminSalt)
        .digest('hex')
}
