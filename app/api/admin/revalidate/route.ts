import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { revalidateArticleMutation, revalidateGlossaryMutation } from '@/lib/content-revalidation'
import { warmUpPublishedArticle, warmUpUrls } from '@/lib/cache-warmup'
import { BASE_URL } from '@/lib/utils'

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
    try { revalidatePath(targetPath) } catch {}
    try { revalidatePath(targetPath, 'page') } catch {}
    try { revalidatePath(targetPath, 'layout') } catch {}

    // 2. Extract slug if it's an article or glossary
    if (targetPath.startsWith('/updates/')) {
      const slug = targetPath.replace(/^\/updates\//, '').split('?')[0].split('#')[0]
      if (slug) {
        try { (revalidateTag as any)(`article:${slug}`) } catch {}
        try { (revalidateTag as any)('updates') } catch {}
        revalidateArticleMutation({ slug })
        try {
          await warmUpPublishedArticle(slug)
        } catch (warmupErr) {
          console.error('[Revalidate] Cache warmup error:', warmupErr)
        }
      }
    } else if (targetPath.startsWith('/glossary/')) {
      const slug = targetPath.replace(/^\/glossary\//, '').split('?')[0].split('#')[0]
      if (slug) {
        try { (revalidateTag as any)(`glossary:${slug}`) } catch {}
        try { (revalidateTag as any)('glossary') } catch {}
        revalidateGlossaryMutation(slug)
      }
    } else if (targetPath === '/' || targetPath === '/updates') {
      try { (revalidateTag as any)('updates') } catch {}
      try { (revalidateTag as any)('list:home') } catch {}
      try { (revalidateTag as any)('list:updates') } catch {}
      revalidateArticleMutation({ slug: '' })
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || BASE_URL || 'https://www.corplawupdates.in').replace(/\/+$/, '')
        await warmUpUrls([`${baseUrl}/`, `${baseUrl}/updates`, `${baseUrl}/sitemap.xml`])
      } catch (warmupErr) {
        console.error('[Revalidate] Cache warmup error:', warmupErr)
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
