import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { userPrompt, sessionId, conversationHistory, isCustomRequest = false } = await req.json()

    // 1. PostgreSQL fuzzy matching on templates (Low-maintenance, highly reliable alternative to pgvector)
    const searchTerms = userPrompt.toLowerCase().split(/\s+/)
    
    // Query template library from Supabase
    const { data: templates } = await supabase
      .from('legal_templates')
      .select('*')
      .is('effective_to', null)

    let bestTemplate: any = null
    let maxMatchCount = 0

    if (templates && templates.length > 0) {
      templates.forEach(t => {
        const corpus = `${t.title} ${t.category} ${t.legal_reference}`.toLowerCase()
        const matchCount = searchTerms.filter((term: string) => corpus.includes(term)).length
        if (matchCount > maxMatchCount) {
          maxMatchCount = matchCount
          bestTemplate = t
        }
      })
    }

    // 2. Hybrid AI container fallback if no exact template matches (or custom request)
    if (!bestTemplate || maxMatchCount < 2 || isCustomRequest) {
      // Direct prompt to generate standard legal language wrapped inside strict Indian Compliance container
      const customPrompt = `
        You are an expert Indian Corporate Lawyer. Draft a highly professional document in Markdown for this requirement: "${userPrompt}".
        Previous conversation context: "${JSON.stringify(conversationHistory)}".
        
        Strict Guidelines:
        - Output the document using standard Indian legal headers, structure, and formal legal English.
        - Add clear corporate signing blocks.
        - Do not output any conversational introductions or postscripts. Return ONLY the legal markdown body text.
      `
      const responseGemini = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY || ''
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: customPrompt }] }] })
      })

      const geminiData = await responseGemini.json()
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

      return NextResponse.json({
        message: "I've drafted a custom document matching your parameters. Please verify the legal elements below.",
        draftHtml: rawText,
        status: 'complete',
        isCustom: true
      })
    }

    // 3. Prompt Gemini to extract variables from prompt context
    const extractionPrompt = `
      You are an expert legal assistant. Based on the template variables required and the client request, extract the exact values.
      Required variables schema: ${JSON.stringify(bestTemplate.required_fields)}
      Client's free-text request: "${userPrompt}"
      Previous conversation context: "${JSON.stringify(conversationHistory)}"
      
      Return ONLY a clean JSON object in this exact shape:
      {
        "extracted": {
          "variable_key": "exact_value_or_null"
        },
        "confidence": 0.0-1.0
      }
      
      Rules:
      - Set values to null if missing or ambiguous.
      - Validate formats strictly: dates must be YYYY-MM-DD.
      - Extract exact names, do not infer.
    `

    const responseGemini = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: extractionPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    })

    const geminiData = await responseGemini.json()
    const rawResultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const extractionResult = JSON.parse(rawResultText)

    // 4. Identify missing variables
    const missing = bestTemplate.required_fields.filter((field: any) => {
      const val = extractionResult.extracted?.[field.key]
      return val === undefined || val === null || val === 'null' || val === ''
    })

    if (missing.length > 0) {
      const questions = missing.map((f: any, i: number) => `${i + 1}. **${f.label}** ${f.hint ? `(${f.hint})` : ''}`)
      return NextResponse.json({
        message: `I've matched your request to our verified template **${bestTemplate.title}** (${bestTemplate.legal_reference}).\n\nTo complete your draft, please provide these details:\n\n${questions.join('\n')}`,
        extracted: extractionResult.extracted,
        status: 'prompt_more'
      })
    }

    // 5. Populate template dynamically (Zero Free Generation for matching templates)
    let compiledDraft = bestTemplate.master_text_markdown
    Object.entries(extractionResult.extracted).forEach(([key, val]) => {
      compiledDraft = compiledDraft.replaceAll(`{${key}}`, String(val))
    })

    return NextResponse.json({
      message: `Here is your draft **${bestTemplate.title}**.\n\n⚠️ Please review all corporate details and authority resolutions before signature execution.`,
      draftHtml: compiledDraft,
      status: 'complete',
      sessionId
    })

  } catch (error: any) {
    console.error('Co-Pilot API Error:', error)
    return NextResponse.json({ error: 'Failed to process AI draft request' }, { status: 500 })
  }
}
