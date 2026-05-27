import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { 
      template_slug, 
      form_data, 
      use_ai,
      session_id 
    } = await request.json()

    if (!template_slug) {
      return NextResponse.json(
        { error: 'Missing template_slug' },
        { status: 400 }
      )
    }

    // Get template
    const { data: template, error } = await supabaseAdmin
      .from('document_templates')
      .select('*')
      .eq('slug', template_slug)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    let documentContent = ''

    if (use_ai && template.ai_system_prompt) {
      if (!GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Missing Gemini API configuration for AI generation' },
          { status: 500 }
        )
      }

      // AI-powered generation
      const fieldsSummary = Object.entries(form_data || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')

      const promptText = `Generate a complete ${template.name} using these details:

${fieldsSummary}

Base template format:
${template.template_content}

Instructions:
1. Fill all {{PLACEHOLDERS}} with provided data
2. Use proper legal language throughout
3. Ensure all mandatory clauses per Companies Act / ICSI SS-1 are present
4. If any field is empty, use appropriate placeholder text [TO BE FILLED]
5. Maintain exact formatting — do not add markdown wrapping or post-text notes
6. Output only the final document text, nothing else`

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            role: 'user', 
            parts: [{ text: `System Instructions: ${template.ai_system_prompt}\n\n${promptText}` }] 
          }]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: `Gemini generation call failed: ${errorText}` },
          { status: 500 }
        )
      }

      const data = await response.json()
      documentContent = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    } else {
      // Simple template substitution
      documentContent = template.template_content
      Object.entries(form_data || {}).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        documentContent = documentContent.replace(
          regex, 
          String(value || `[${key}]`)
        )
      })
      
      // Replace any remaining placeholders
      documentContent = documentContent.replace(
        /{{[A-Z_]+}}/g,
        '[TO BE FILLED]'
      )
    }

    // Save to database
    const { data: saved, error: saveError } = await supabaseAdmin
      .from('generated_documents')
      .insert({
        template_id: template.id,
        template_name: template.name,
        form_data: form_data || {},
        original_content: documentContent,
        edited_content: documentContent,
        session_id: session_id || null,
        status: 'draft',
      })
      .select()
      .single()

    if (saveError) {
      return NextResponse.json(
        { error: `Failed to persist generated document: ${saveError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document_id: saved?.id,
      content: documentContent,
      template_name: template.name,
    })

  } catch (error: any) {
    console.error('Document generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate document' },
      { status: 500 }
    )
  }
}
