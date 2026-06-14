// app/api/documents/extract-vars/route.ts
import { NextResponse } from 'next/server'
import { extractVariables } from '@/lib/gemini'

export async function POST(request: Request) {
  try {
    const { prompt, fields } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'Fields schema is required' },
        { status: 400 }
      )
    }

    // Map fields schema to format expected by extractVariables helper
    const fieldsSpec = fields.map((f: any) => ({
      name: f.id,
      type: f.type || 'text',
      description: `Extract value for field "${f.label}" (${f.help_text || f.placeholder || 'detail'}). If not found, return null.`
    }))

    const result = await extractVariables(fieldsSpec, prompt, [])

    return NextResponse.json({
      success: true,
      extracted: result.extracted || {},
      confidence: result.confidence || 0
    })

  } catch (error: any) {
    console.error('[extract-vars/route.ts] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract variables' },
      { status: 500 }
    )
  }
}
