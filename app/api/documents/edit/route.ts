import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''

export async function POST(request: Request) {
  try {
    const {
      document_id,
      current_content,
      edit_instruction,
      document_type,
    } = await request.json()

    if (!current_content || !edit_instruction) {
      return NextResponse.json(
        { error: 'Missing required fields (current_content or edit_instruction)' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing Gemini API configuration for document editing' },
        { status: 500 }
      )
    }

    const systemPrompt = `You are an expert Indian Company Secretary editing legal documents. You must:
1. Apply ONLY the requested change
2. Maintain all other content exactly as-is
3. Keep formal legal language
4. Ensure legal accuracy per Companies Act 2013
5. Output ONLY the complete edited document
6. Do NOT add explanations, conversational comments, or markdown wraps`

    const promptText = `Current document (${document_type || 'Legal Document'}):

${current_content}

Edit instruction: ${edit_instruction}

Apply this change and return the complete updated document text only.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          role: 'user', 
          parts: [{ text: `System Guidance: ${systemPrompt}\n\n${promptText}` }] 
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Gemini edit call failed: ${errorText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const editedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || current_content

    // Save edited version to database if document_id is provided
    if (document_id) {
      await supabaseAdmin
        .from('generated_documents')
        .update({ 
          edited_content: editedContent,
          status: 'draft'
        })
        .eq('id', document_id)
    }

    return NextResponse.json({
      success: true,
      content: editedContent,
    })

  } catch (error: any) {
    console.error('Edit error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to edit document' },
      { status: 500 }
    )
  }
}
