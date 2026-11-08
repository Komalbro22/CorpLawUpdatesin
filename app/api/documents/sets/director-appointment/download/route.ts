import { NextRequest, NextResponse } from 'next/server'
import { getDocumentSet, getSpokeDocument } from '@/lib/document-sets-data'
import {
  compileDocumentSetDocx,
  compileCompletePackDocx,
  compileDocumentSetPdf,
  compileCompletePackZip,
} from '@/lib/doc-generator/document-set-pack-compiler'
import { recordDocumentSetUsage } from '@/lib/document-sets-usage'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const file = searchParams.get('file')
    const docSlug = searchParams.get('doc')
    const format = searchParams.get('format') || 'docx'

    const fullSet = await getDocumentSet('director-appointment-set')
    if (!fullSet) {
      return NextResponse.json({ error: 'Document set not found' }, { status: 404 })
    }

    // 1. Complete Pack: Single combined Word document
    if (file === 'pack-docx' || (!docSlug && format === 'docx' && file !== 'pack-zip')) {
      const buffer = await compileCompletePackDocx(fullSet.documents)
      recordDocumentSetUsage({
        setSlug: fullSet.slug,
        eventType: 'download_pack_single',
      }).catch(() => {})

      const filename = `director-appointment-complete-pack-${fullSet.version}.docx`
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      })
    }

    // 2. Complete Pack: ZIP archive of individual files + pack
    if (file === 'pack-zip') {
      const buffer = await compileCompletePackZip(fullSet.documents)
      recordDocumentSetUsage({
        setSlug: fullSet.slug,
        eventType: 'download_pack_zip',
      }).catch(() => {})

      const filename = `director-appointment-complete-pack-${fullSet.version}.zip`
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      })
    }

    // 3. Individual Document Download (Word or PDF)
    if (docSlug) {
      // Normalize slug in case a browser or link passes a fragment, alias, or parent set slug
      const rawSlug = docSlug.trim()
      const cleanParamSlug = rawSlug.split('#')[0].trim()
      const effectiveSlug = (cleanParamSlug === 'director-appointment-set' || cleanParamSlug === '')
        ? 'checklist-director-appointment'
        : cleanParamSlug

      const spoke = await getSpokeDocument(effectiveSlug)
      if (!spoke || !spoke.document) {
        return NextResponse.json({ error: `Document '${docSlug}' not found` }, { status: 404 })
      }

      const doc = spoke.document

      // Generate clean filename
      const cleanSlug = doc.spoke_slug.includes('checklist') || doc.step_number === 1
        ? 'checklist-director-appointment'
        : doc.spoke_slug.replace(/#.*$/, '').replace(/[^a-z0-9_-]/gi, '')

      if (format === 'pdf') {
        const buffer = await compileDocumentSetPdf(doc)
        recordDocumentSetUsage({
          setSlug: fullSet.slug,
          documentSlug: effectiveSlug,
          eventType: 'download_pdf',
        }).catch(() => {})

        const filename = `${cleanSlug}-${doc.version}.pdf`
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          },
        })
      } else {
        const buffer = await compileDocumentSetDocx(doc)
        recordDocumentSetUsage({
          setSlug: fullSet.slug,
          documentSlug: effectiveSlug,
          eventType: 'download_docx',
        }).catch(() => {})

        const filename = `${cleanSlug}-${doc.version}.docx`
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          },
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid download parameters. Specify file=pack-docx, file=pack-zip, or doc=[slug]&format=[docx|pdf]' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[download-route] Error generating document:', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
