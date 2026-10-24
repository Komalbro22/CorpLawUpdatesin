import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { revalidateArticleMutation, revalidateGlossaryMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminOrKey(request, 'articles:write')
    if (!authCheck.success) {
      return authCheck.response
    }

    let targetPath = '/'
    try {
      const body = await request.json()
      if (body?.path) targetPath = body.path
      else if (body?.slug) targetPath = `/updates/${body.slug}`
    } catch {
      const url = new URL(request.url)
      if (url.searchParams.get('path')) targetPath = url.searchParams.get('path')!
      else if (url.searchParams.get('slug')) targetPath = `/updates/${url.searchParams.get('slug')}`
    }

    // 1. Scoped Path revalidation
    try { revalidatePath(targetPath, 'page') } catch {}
    try { revalidatePath(targetPath) } catch {}

    // 2. Extract slug if it's an article or glossary
    if (targetPath.startsWith('/updates/')) {
      const slug = targetPath.replace(/^\/updates\//, '').split('?')[0].split('#')[0]
      if (slug) {
        try { (revalidateTag as any)(`article:${slug}`) } catch {}
        try { (revalidateTag as any)('updates') } catch {}
        revalidateArticleMutation({ slug })
      }
    } else if (targetPath.startsWith('/glossary/')) {
      const slug = targetPath.replace(/^\/glossary\//, '').split('?')[0].split('#')[0]
      if (slug) {
        try { (revalidateTag as any)(`glossary:${slug}`) } catch {}
        try { (revalidateTag as any)('glossary') } catch {}
        revalidateGlossaryMutation(slug)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cache revalidated successfully for ${targetPath}`,
      path: targetPath,
    })
  } catch (error) {
    const err = error as Error & { digest?: string }
    if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
      throw error
    }

    console.error('[API Revalidate Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
