import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export async function POST() {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Purge cache for the homepage to update the popular section
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Homepage cache revalidated successfully'
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
