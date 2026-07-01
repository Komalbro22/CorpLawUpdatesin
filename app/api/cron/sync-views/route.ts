import { NextResponse } from 'next/server'
import { syncViewsAction } from '@/app/actions/syncViews'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')
        
        // Vercel Cron Authentication
        if (
            process.env.CRON_SECRET && 
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // We bypass the admin check inside syncViewsAction for cron jobs
        // By modifying syncViewsAction, or simply mocking the session? 
        // Wait, syncViewsAction uses `verifyAdminSession()`. If we call it here, it will fail because verifyAdminSession relies on cookies.
        // We should extract the core logic of syncViewsAction into a separate function that can be called without a session, or just copy the logic here.
        
        // Wait, I will just call syncViewsAction but I need to make sure verifyAdminSession doesn't block it.
        // I will write the fix for syncViewsAction next.
        const result = await syncViewsAction(true) // Pass a bypass flag

        return NextResponse.json(result)
    } catch (error) {
        console.error('Failed to run sync-views cron:', error)
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 })
    }
}
