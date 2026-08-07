import { NextRequest, NextResponse } from 'next/server'
import { decodeCIN } from '@/lib/cin-decoder'
import { generateCinDecoderPdfBuffer } from '@/lib/pdf/generateCompanyPdf'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cin = searchParams.get('cin') || ''

  const breakdown = decodeCIN(cin)
  if (!breakdown) {
    return NextResponse.json({ error: 'Invalid 21-character CIN provided' }, { status: 400 })
  }

  try {
    const pdfBuffer = generateCinDecoderPdfBuffer(breakdown)
    const filename = `CIN_Breakdown_${breakdown.cin}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error: any) {
    console.error('CIN Decoder PDF Error:', error)
    return NextResponse.json({ error: 'Failed to generate CIN PDF breakdown' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
