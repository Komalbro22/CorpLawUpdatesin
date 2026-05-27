import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || query.length < 5) {
      return NextResponse.json(
        { error: 'Query too short' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing Gemini API configuration' },
        { status: 500 }
      )
    }

    // Get all templates names, slugs, and descriptions
    const { data: templates, error: templatesError } = await supabase
      .from('document_templates')
      .select('id, name, slug, description, category, tags')
      .eq('is_active', true)

    if (templatesError || !templates) {
      return NextResponse.json(
        { error: 'Failed to retrieve templates for matching' },
        { status: 500 }
      )
    }

    const templateList = templates
      .map(t => `- ${t.name} (slug: ${t.slug}): ${t.description}`)
      .join('\n')

    const promptText = `You are an AI assistant for an Indian legal document platform. A user wants to create a document.

Available templates:
${templateList}

User's request: "${query}"

Analyze the user's intent and respond with ONLY a JSON object (no markdown, no explanations, no wrapping code blocks, just raw JSON):
{
  "matched_slug": "slug-of-best-matching-template or null",
  "confidence": 0.0-1.0,
  "document_needed": "short description of what document they need",
  "missing_info": ["list of key information user hasn't mentioned"],
  "warning": "any urgent compliance note or null",
  "alternatives": ["other_slug_1", "other_slug_2"]
}

If no template matches well, set matched_slug to null.
If urgent deadline or compliance issue, add warning.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Gemini intent call failed: ${errorText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    let intent
    try {
      intent = JSON.parse(rawText.trim())
    } catch {
      intent = {
        matched_slug: null,
        confidence: 0,
        document_needed: 'Could not determine',
        missing_info: [],
        warning: null,
        alternatives: []
      }
    }

    // Get matched template details
    let matchedTemplate = null
    if (intent.matched_slug) {
      const found = templates.find(t => t.slug === intent.matched_slug)
      if (found) matchedTemplate = found
    }

    return NextResponse.json({
      intent,
      matched_template: matchedTemplate,
      all_templates: templates,
    })

  } catch (error: any) {
    console.error('Intent detection error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to detect intent' },
      { status: 500 }
    )
  }
}
