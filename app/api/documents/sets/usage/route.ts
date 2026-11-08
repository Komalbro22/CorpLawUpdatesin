import { NextRequest, NextResponse } from 'next/server'
import { recordDocumentSetUsage, DocumentSetUsageEventType } from '@/lib/document-sets-usage'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { setSlug, documentSlug, eventType } = body

    if (!setSlug || !eventType) {
      return NextResponse.json({ error: 'Missing setSlug or eventType' }, { status: 400 })
    }

    await recordDocumentSetUsage({
      setSlug,
      documentSlug: documentSlug || '',
      eventType: eventType as DocumentSetUsageEventType,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to log usage' }, { status: 500 })
  }
}
