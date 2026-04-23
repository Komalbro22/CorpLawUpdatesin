import { cookies } from 'next/headers'
import { generateAdminSessionHash } from '@/lib/utils'

export function verifyAdminSession(): boolean {
    const cookieStore = cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return false
    return session.value === generateAdminSessionHash()
}
