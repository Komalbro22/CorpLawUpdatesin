/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'

export async function POST() {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', 'admin_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/')
    return response
}
