// src/app/api/ai/draft/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getEmbedding, extractVariables, generateCustomDraft } from '@/lib/gemini'
import { populateTemplate, getMissingFields } from '@/lib/template-engine'

export async function POST(req: Request) {
  try {
    const { userPrompt, sessionId, conversationHistory, currentDraft } = await req.json()

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
        // Query pgvector similarity via RPC function with elevated strict threshold
        const { data: matched, error: rpcError } = await supabaseAdmin.rpc('match_templates', {
          query_embedding: queryEmbedding,
          match_threshold: 0.80, // Prevent false positives on completely different documents
          match_count: 1
        })

        if (!rpcError && matched && matched.length > 0) {
          bestTemplate = matched[0]
        }
      }
    } catch (err) {
      console.warn('pgvector matching failed or function missing, trying text query:', err)
    }

    // Fallback standard fuzzy query with strict stop-word and significant matches criteria
    if (!bestTemplate) {
      const { data: templates } = await supabaseAdmin
        .from('legal_templates')
        .select('*')
        .is('effective_to', null)

      if (templates && templates.length > 0) {
        const STOP_WORDS = new Set([
          'and', 'or', 'the', 'of', 'with', 'for', 'as', 'to', 'between', 'in', 
          'on', 'at', 'by', 'from', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 
          'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'if', 
          'then', 'else', 'when', 'where', 'why', 'how', 'who', 'whom', 'this', 
          'that', 'these', 'those', 'about', 'into', 'through', 'after', 'before', 
          'during', 'under', 'above', 'below', 'write', 'draft', 'create', 'make', 
          'generate', 'weite', 'betwwen', 'seller', 'buyer', 'komal', 'mandeep'
        ])

        const significantTerms = searchTerms.filter((term: string) => !STOP_WORDS.has(term) && term.length > 2)
        let maxMatchCount = 0

        templates.forEach((t: any) => {
          const searchTagsString = Array.isArray(t.search_tags) ? t.search_tags.join(' ') : ''
          const corpus = `${t.title} ${t.category} ${t.statutory_basis} ${searchTagsString}`.toLowerCase()
          
          // Calculate matches only on significant keywords
          const matches = significantTerms.filter((term: string) => corpus.includes(term)).length
          
          // Require at least 2 significant keyword matches for co-opting a static template
          if (matches > maxMatchCount && matches >= 2) {
            maxMatchCount = matches
            bestTemplate = t
          }
        })
      }
    }

    // 3. Fallback to custom AI Drafting if no templates matched
    if (!bestTemplate) {
      const customDraft = await generateCustomDraft(userPrompt, conversationHistory, currentDraft)

      // Save custom draft to draft_sessions for reviews and history
      try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        const sessionData = {
          template_slug: null,
          variables: { custom_prompt: userPrompt },
          conversation: [
            ...(conversationHistory || []),
            { role: 'user', content: userPrompt },
            { role: 'assistant', content: "Generated custom draft." }
          ],
          draft_html: customDraft,
          draft_status: 'complete',
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        }

        if (sessionId) {
          await supabaseAdmin
            .from('draft_sessions')
            .upsert({ session_token: sessionId, ...sessionData }, { onConflict: 'session_token' })
        }
      } catch (err) {
        console.warn('Failed to upsert custom draft session:', err)
      }

      return NextResponse.json({
        message: "I couldn't find an exact pre-verified template, so I've drafted a custom Indian compliance document based on your parameters. Please review carefully.",
        draftHtml: customDraft,
        status: 'complete',
        isCustom: true,
        sessionId
      })
    }

    // 4. Extract variables using Gemini Variable Extractor
    const schemaFields = bestTemplate.required_fields || []
    const extraction = await extractVariables(schemaFields, userPrompt, conversationHistory)
    const extractedVars = extraction.extracted || {}

    // 5. Check for missing variables
    const missing = getMissingFields(schemaFields, extractedVars)

    if (missing.length > 0) {
      // Save partial session state (with status variables_pending)
      try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const sessionData = {
          template_slug: bestTemplate.slug,
          variables: extractedVars,
          conversation: [
            ...(conversationHistory || []),
            { role: 'user', content: userPrompt }
          ],
          draft_html: '',
          draft_status: 'variables_pending',
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        }

        if (sessionId) {
          await supabaseAdmin
            .from('draft_sessions')
            .upsert({ session_token: sessionId, ...sessionData }, { onConflict: 'session_token' })
        }
      } catch (sessionErr) {
        console.warn('Failed to save partial draft session cache:', sessionErr)
      }

      const questions = missing.map((f: any, i: number) => `${i + 1}. **${f.label}** ${f.hint ? `(${f.hint})` : ''}`)
      return NextResponse.json({
        message: `I've matched your request to our verified template **${bestTemplate.title}** (${bestTemplate.statutory_basis}).\n\nTo complete your draft, please fill out the fields in the editor or reply here with these details:\n\n${questions.join('\n')}`,
        extracted: extractedVars,
        status: 'prompt_more',
        sessionId
      })
    }

    // 6. Compile draft dynamically using safe template compiler
    const compiledDraft = populateTemplate(bestTemplate.body, extractedVars)

    // Save complete session state (with status complete and compiled draft)
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const sessionData = {
        template_slug: bestTemplate.slug,
        variables: extractedVars,
        conversation: [
          ...(conversationHistory || []),
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: "Generated template-based draft." }
        ],
        draft_html: compiledDraft,
        draft_status: 'complete',
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }

      if (sessionId) {
        await supabaseAdmin
          .from('draft_sessions')
          .upsert({ session_token: sessionId, ...sessionData }, { onConflict: 'session_token' })
      }
    } catch (sessionErr) {
      console.warn('Failed to save complete draft session cache:', sessionErr)
    }

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
