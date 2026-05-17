import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'

export function verifyAdminSession(): boolean {
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminSalt = process.env.ADMIN_SECRET_SALT
    if (!adminPassword || !adminSalt) {
        console.error('CRITICAL: ADMIN_PASSWORD or ADMIN_SECRET_SALT missing from environment')
        return false
    }

    const cookieStore = cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return false

    const parts = session.value.split('.')
    if (parts.length !== 2) return false

    const [payloadB64, signature] = parts

    const expectedSignature = createHash('sha256')
        .update(payloadB64 + adminPassword + adminSalt)
        .digest('hex')

    // Timing-safe comparison of signatures
    try {
        const sigBuffer = Buffer.from(signature, 'hex')
        const expBuffer = Buffer.from(expectedSignature, 'hex')

        if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
            return false
        }
    } catch {
        return false
    }

    try {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
        if (!payload.exp || Date.now() > payload.exp) {
            return false
        }
        return true
    } catch {
        return false
    }
}

