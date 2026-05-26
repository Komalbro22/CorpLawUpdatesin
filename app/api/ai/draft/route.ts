// src/app/api/ai/draft/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getEmbedding, extractVariables, generateCustomDraft } from '@/lib/gemini'
import { populateTemplate, getMissingFields } from '@/lib/template-engine'

export async function POST(req: Request) {
  try {
    const { userPrompt, sessionId, conversationHistory } = await req.json()

    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing userPrompt' }, { status: 400 })
    }

    // 1. Generate text embeddings for semantic template query
    let queryEmbedding: number[] = []
    try {
      queryEmbedding = await getEmbedding(userPrompt)
    } catch (err) {
      console.warn('Gemini embedding failed, falling back to standard search:', err)
    }

    // 2. Perform Hybrid Search (Try pgvector cosine similarity first, then SQL keyword fuzzy matching)
    let bestTemplate: any = null
    const searchTerms = userPrompt.toLowerCase().split(/\s+/)

    try {
      if (queryEmbedding.length > 0) {
        // Query pgvector similarity via RPC function
        const { data: matched, error: rpcError } = await supabaseAdmin.rpc('match_templates', {
          query_embedding: queryEmbedding,
          match_threshold: 0.70,
          match_count: 1
        })

        if (!rpcError && matched && matched.length > 0) {
          bestTemplate = matched[0]
        }
      }
    } catch (err) {
      console.warn('pgvector matching failed or function missing, trying text query:', err)
    }

    // Fallback standard fuzzy query
    if (!bestTemplate) {
      const { data: templates } = await supabaseAdmin
        .from('legal_templates')
        .select('*')
        .is('effective_to', null)

      if (templates && templates.length > 0) {
        let maxMatchCount = 0
        templates.forEach((t: any) => {
          const searchTagsString = Array.isArray(t.search_tags) ? t.search_tags.join(' ') : ''
          const corpus = `${t.title} ${t.category} ${t.statutory_basis} ${searchTagsString}`.toLowerCase()
          const matches = searchTerms.filter((term: string) => corpus.includes(term)).length
          if (matches > maxMatchCount && matches >= 1) {
            maxMatchCount = matches
            bestTemplate = t
          }
        })
      }
    }

    // 3. Fallback to custom AI Drafting if no templates matched
    if (!bestTemplate) {
      const customDraft = await generateCustomDraft(userPrompt, conversationHistory)
      return NextResponse.json({
        message: "I couldn't find an exact pre-verified template, so I've drafted a custom Indian compliance document based on your parameters. Please review carefully.",
        draftHtml: customDraft,
        status: 'complete',
        isCustom: true
      })
    }

    // 4. Extract variables using Gemini Variable Extractor
    const schemaFields = bestTemplate.required_fields || []
    const extraction = await extractVariables(schemaFields, userPrompt, conversationHistory)
    const extractedVars = extraction.extracted || {}

    // 5. Check for missing variables
    const missing = getMissingFields(schemaFields, extractedVars)

    // Save session state to Supabase draft_sessions
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      
      const sessionData = {
        template_slug: bestTemplate.slug,
        variables: extractedVars,
        conversation: [
          ...(conversationHistory || []),
          { role: 'user', content: userPrompt }
        ],
        draft_status: missing.length > 0 ? 'variables_pending' : 'complete',
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }

      if (sessionId && sessionId.startsWith('session-')) {
        await supabaseAdmin
          .from('draft_sessions')
          .insert({ session_token: sessionId, ...sessionData })
          .select()
      }
    } catch (sessionErr) {
      console.warn('Failed to save draft session cache:', sessionErr)
    }

    if (missing.length > 0) {
      const questions = missing.map((f: any, i: number) => `${i + 1}. **${f.label}** ${f.hint ? `(${f.hint})` : ''}`)
      return NextResponse.json({
        message: `I've matched your request to our verified template **${bestTemplate.title}** (${bestTemplate.statutory_basis}).\n\nTo complete your draft, please fill out the fields in the editor or reply here with these details:\n\n${questions.join('\n')}`,
        extracted: extractedVars,
        status: 'prompt_more'
      })
    }

    // 6. Compile draft dynamically using safe template compiler
    const compiledDraft = populateTemplate(bestTemplate.body, extractedVars)

    return NextResponse.json({
      message: `Here is your pre-verified draft: **${bestTemplate.title}**.\n\n⚠️ Please review the board resolutions, signing blocks, and statutory dates in the A4 editor before printing.`,
      draftHtml: compiledDraft,
      status: 'complete',
      sessionId
    })

  } catch (error: any) {
    console.error('AI Draft API Route Error:', error)
    return NextResponse.json({ error: 'Failed to process AI draft request: ' + error.message }, { status: 500 })
  }
}
