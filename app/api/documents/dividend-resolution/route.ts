import { NextResponse } from 'next/server'
import {
  buildDividendResolutionDocx,
  buildDividendResolutionPdf,
  type DividendResolutionData,
} from '@/lib/doc-generator/dividend-resolution-generator'

export const dynamic = 'force-dynamic'

const emptyData: DividendResolutionData = { resolutionType: 'final' }
const docxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const privateHeaders = { 'Cache-Control': 'private, no-store' }

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: privateHeaders })
}

function safeData(input: unknown): DividendResolutionData | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const candidate = input as Record<string, unknown>
  if (candidate.resolutionType !== 'final' && candidate.resolutionType !== 'interim') return null
  const allowedKeys = new Set([
    'resolutionType', 'companyName', 'cin', 'registeredOffice', 'meetingDate', 'meetingTime',
    'meetingPlace', 'financialYear', 'dividendPerShare', 'faceValue', 'eligibleShares',
    'recordDate', 'paymentDeadline', 'chairperson', 'bankName',
  ])
  if (Object.keys(candidate).some(key => !allowedKeys.has(key))) return null
  for (const [key, value] of Object.entries(candidate)) {
    if (key !== 'resolutionType' && (typeof value !== 'string' || value.length > 500)) return null
  }
  const normalized = Object.fromEntries(Object.entries(candidate).map(([key, value]) => [
    key,
    typeof value === 'string' ? value.replace(/[\r\n\t\u0000-\u001f\u007f]/g, ' ').trim() : value,
  ]))
  const amount = Number(normalized.dividendPerShare)
  const faceValue = Number(normalized.faceValue)
  const eligibleShares = Number(normalized.eligibleShares)
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(faceValue) || faceValue <= 0 || !Number.isSafeInteger(eligibleShares) || eligibleShares <= 0) return null
  return normalized as DividendResolutionData
}

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') || 'blank-docx'
  try {
    if (type === 'blank-pdf') {
      const bytes = await buildDividendResolutionPdf(emptyData)
      return new Response(new Uint8Array(bytes), { headers: { ...privateHeaders, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="Dividend_Declaration_Board_Resolution_Blank.pdf"' } })
    }
    if (type === 'blank-docx') {
      const bytes = await buildDividendResolutionDocx(emptyData)
      return new Response(new Uint8Array(bytes), { headers: { ...privateHeaders, 'Content-Type': docxType, 'Content-Disposition': 'attachment; filename="Dividend_Declaration_Board_Resolution_Blank.docx"' } })
    }
    return jsonError('Invalid document type requested', 400)
  } catch (error) {
    console.error('Dividend resolution blank download failed:', error)
    return jsonError('Could not generate the document', 500)
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Invalid request', 400)
    const { data: rawData, format } = body as { data?: unknown; format?: unknown }
    const data = safeData(rawData)
    if (!data || (format !== 'docx' && format !== 'pdf')) return jsonError('Please provide valid dividend resolution details and choose Word or PDF.', 400)

    if (format === 'pdf') {
      const bytes = await buildDividendResolutionPdf(data)
      return new Response(new Uint8Array(bytes), { headers: { ...privateHeaders, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="Dividend_Declaration_Board_Resolution.pdf"' } })
    }
    const bytes = await buildDividendResolutionDocx(data)
    return new Response(new Uint8Array(bytes), { headers: { ...privateHeaders, 'Content-Type': docxType, 'Content-Disposition': 'attachment; filename="Dividend_Declaration_Board_Resolution.docx"' } })
  } catch (error) {
    console.error('Dividend resolution generation failed:', error)
    return jsonError('Could not generate the document', 500)
  }
}
