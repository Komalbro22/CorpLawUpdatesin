import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminSession()) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    let targetPath = '/'
    try {
      const body = await request.json()
      if (body?.path) targetPath = body.path
    } catch {
      const url = new URL(request.url)
      if (url.searchParams.get('path')) targetPath = url.searchParams.get('path')!
    }

    revalidatePath(targetPath)
    if (targetPath !== '/') {
      revalidatePath('/', 'layout')
    }

    return NextResponse.json({
      success: true,
      message: `Cache revalidated successfully for ${targetPath}`
    })
  } catch (error) {
    const err = error as Error & { digest?: string };
    if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
      throw error;
    }

    console.error('[API Revalidate Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
