import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;
import { NextResponse } from 'next/server';
import { executeRule, extractVariablesFromPrompt } from '@/lib/rule-engine';

const GEMINI_KEYS = [
  process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
  process.env.GOOGLE_GEMINI_API_KEY_2 || '',
  process.env.GOOGLE_GEMINI_API_KEY_3 || '',
  process.env.GOOGLE_GEMINI_API_KEY_4 || '',
].map(k => k.trim()).filter(Boolean);

export async function POST(request: Request) {
  try {
    const {
      document_id,
      current_content,
      edit_instruction,
      document_type,
      intent_id,
      variables,
      force_ai,
    } = await request.json();

    if (!current_content || !edit_instruction) {
      return NextResponse.json(
        { error: 'Missing required fields (current_content or edit_instruction)' },
        { status: 400 }
      );
    }

    if (GEMINI_KEYS.length === 0) {
      return NextResponse.json(
        { error: 'Missing Gemini API configuration for document editing' },
        { status: 500 }
      );
    }

    // === RULE ENGINE INTERCEPT ===
    try {
      let classification = null;

      if (force_ai) {
        classification = { status: 'fallback_to_ai', source: 'user_forced_ai' };
      } else if (intent_id) {
        const { data: intent } = await docDb
          .from('intents')
          .select('id, name')
          .eq('id', intent_id)
          .single();

        if (intent) {
          classification = {
            status: 'success',
            confidence: 1.0,
            intent: intent.name,
            intentId: intent.id,
            source: 'fuzzy_confirm',
          };
        }
      }

      if (!classification) {
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
        const origin = request.headers.get('origin') || `${protocol}://${host}`;

        const classifyResponse = await fetch(`${origin}/api/rule-engine/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: edit_instruction,
            userId: 'anonymous',
            docType: document_type || 'GENERAL',
          }),
        });

        classification = await classifyResponse.json();
      }

      // ── HIGH CONFIDENCE: Execute deterministically ────────────────────────────
      if (classification.status === 'success') {
        // Fetch the rule for this intent + document type
        const { data: rule } = await docDb
          .from('rules')
          .select('clause_id')
          .eq('intent_id', classification.intentId)
          .single();

        if (rule?.clause_id) {
          // Extract variables from the user's prompt using the clause's variable schema
          const { data: clause } = await docDb
            .from('clauses')
            .select('variables')
            .eq('id', rule.clause_id)
            .single();

          let extractedVars: Record<string, string> = {};
          if (clause?.variables && Object.keys(clause.variables).length > 0) {
            extractedVars = await extractVariablesFromPrompt(edit_instruction, clause.variables);
          }

          // Merge user-supplied variables (from UI fallback form)
          if (variables) {
            extractedVars = { ...extractedVars, ...variables };
          }

          // Check if any required variables are missing → signal UI to show input form
          const requiredVars = Object.keys(clause?.variables || {});
          const missingVars = requiredVars.filter(k => !extractedVars[k]);

          if (missingVars.length > 0) {
            return NextResponse.json({
              success: true,
              requiresInput: true,
              missingVariables: missingVars,
              clauseId: rule.clause_id,
              currentVariables: extractedVars,
              source: 'rule_engine_needs_input',
            });
          }

          try {
            const ruleResult = await executeRule(
              current_content,
              rule.clause_id,
              extractedVars,
              document_id,
              edit_instruction
            );

            // Increment rule accepted_count (user got a result)
            const { data: currentRuleData } = await docDb
              .from('rules')
              .select('accepted_count')
              .eq('clause_id', rule.clause_id)
              .single();

            await docDb
              .from('rules')
              .update({ accepted_count: (currentRuleData?.accepted_count || 0) + 1 })
              .eq('clause_id', rule.clause_id);

            return NextResponse.json({
              success: true,
              content: ruleResult.text,
              inlineWarnings: ruleResult.inlineWarnings,
              missingVariables: ruleResult.missingVariables,
              source: 'rule_engine',
              confidence: classification.confidence,
              clauseVersion: ruleResult.clauseVersion,
              clauseId: rule.clause_id, // Expose clauseId for UI integrations
            });

          } catch (ruleError: any) {
            if (ruleError.message === 'CUSTOM_MODIFIED_BLOCK_DETECTED') {
              // Block was user-modified — fall through to Gemini for smart merge
              console.log('[edit/route.ts] Custom block detected, routing to Gemini smart merge');
              // Falls through to existing Gemini logic below
            } else {
              throw ruleError;
            }
          }
        }
      }

      // ── FUZZY MATCH: Return suggestion to trigger FuzzyClarifier UI ──────────
      if (classification.status === 'fuzzy_match') {
        return NextResponse.json({
          success: true,
          fuzzyMatch: true,
          suggestion: {
            intentId: classification.intentId,
            intent: classification.intent,
            confidence: classification.confidence,
            suggested_label: classification.suggested_label,
          },
          source: 'rule_engine_fuzzy',
        });
      }

      // classification.status === 'fallback_to_ai' → continues to existing Gemini code below

    } catch (interceptError: any) {
      // If rule engine itself errors, log and fall through gracefully to Gemini
      console.error('[edit/route.ts] Rule engine intercept error:', interceptError.message);
      // Falls through to existing Gemini logic
    }
    // === END RULE ENGINE INTERCEPT ===

    const systemPrompt = `You are an expert Indian Company Secretary editing legal documents. You must:
1. Apply ONLY the requested change
2. Maintain all other content exactly as-is
3. Keep formal legal language
4. Ensure legal accuracy per Companies Act 2013
5. Output ONLY the complete edited document
6. Do NOT add explanations, conversational comments, or markdown wraps`;

    const promptText = `Current document (${document_type || 'Legal Document'}):

${current_content}

Edit instruction: ${edit_instruction}

Apply this change and return the complete updated document text only.`;

    // Attempt Gemini API call with key rotation (same pattern as generate/route.ts)
    let editedContent: string | null = null;
    let lastErrorText = '';

    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const apiKey = GEMINI_KEYS[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ 
              role: 'user', 
              parts: [{ text: `System Guidance: ${systemPrompt}\n\n${promptText}` }] 
            }]
          })
        });

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          lastErrorText = JSON.stringify(errorJson);
          const isQuotaError =
            response.status === 429 ||
            response.status === 403 ||
            lastErrorText.toLowerCase().includes('quota') ||
            lastErrorText.toLowerCase().includes('limit');

          if (isQuotaError && i < GEMINI_KEYS.length - 1) {
            console.log(`[edit/route.ts] Quota error on key ${i}, rotating to key ${i + 1}...`);
            continue;
          }
          // Non-quota error or last key — break
          break;
        }

        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          editedContent = candidate;
          break;
        }
      } catch (fetchErr: any) {
        lastErrorText = fetchErr.message || 'Network error';
        console.error(`[edit/route.ts] Gemini fetch error on key ${i}:`, lastErrorText);
        if (i < GEMINI_KEYS.length - 1) continue;
      }
    }

    if (!editedContent) {
      return NextResponse.json(
        { error: 'AI editing is currently unavailable — daily quota exceeded on all API keys. Please try again tomorrow or use the manual editor to make changes.' },
        { status: 429 }
      );
    }

    // Save edited version to database if document_id is provided
    if (document_id) {
      await supabaseAdmin
        .from('generated_documents')
        .update({ 
          edited_content: editedContent,
          status: 'draft'
        })
        .eq('id', document_id);
    }

    // === AI GENERALIZATION PIPE (background, non-blocking) ===
    (async () => {
      try {
        const { generateCustomDraft } = await import('@/lib/gemini');

        // Ask Gemini to generalize the specific prompt into a reusable parameterized template
        const generalizationPrompt = `
You are a legal template engineer. A user made this edit request to a legal document:
"${edit_instruction}"

The AI produced this clause/change in response:
"${editedContent.substring(0, 500)}"

Your task: Extract a generalized, reusable template from this interaction.
Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "proposed_intent": "ADD_INTENT_NAME_IN_CAPS",
  "generalized_clause": "The full clause text with {{variable_name}} placeholders for any specific values",
  "variables_schema": {"variable_name": "STRING|CITY|DATE|CURRENCY|NAME"},
  "document_type": "BOARD_RESOLUTION|EMPLOYMENT_CONTRACT|GENERAL"
}

Rules:
- proposed_intent must start with ADD_, REMOVE_, REPLACE_, or FORMAT_
- Only create placeholders for things that change between uses (names, dates, amounts, locations)
- Do NOT create placeholders for legal boilerplate that never changes
- If the clause is too specific (person's name, specific CIN) to generalize, return {"skip": true}
        `.trim();

        const generalizationResponse = await generateCustomDraft(generalizationPrompt, []);
        const cleanJson = generalizationResponse.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed.skip) return; // Too specific, don't queue

        // Validate: must have at least one {{variable}} placeholder
        const hasPlaceholder = /{{[a-zA-Z_]+}}/.test(parsed.generalized_clause || '');
        if (!hasPlaceholder) return; // Failed quality gate

        // Validate variables_schema keys match placeholders in clause
        const placeholders = [...(parsed.generalized_clause || '').matchAll(/{{([a-zA-Z_]+)}}/g)].map(m => m[1]);
        const schemaKeys = Object.keys(parsed.variables_schema || {});
        const allAccountedFor = placeholders.every(p => schemaKeys.includes(p));
        if (!allAccountedFor) return; // Failed quality gate

        // Check if this prompt pattern already exists in the queue (upsert frequency_count)
        const { data: existing } = await docDb
          .from('learning_queue')
          .select('id, frequency_count')
          .eq('proposed_intent', parsed.proposed_intent)
          .eq('status', 'pending')
          .single();

        if (existing) {
          await docDb
            .from('learning_queue')
            .update({ frequency_count: existing.frequency_count + 1, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await docDb.from('learning_queue').insert({
            original_prompt: edit_instruction,
            generalized_prompt: parsed.generalized_clause,
            proposed_intent: parsed.proposed_intent,
            ai_clause_draft: parsed.generalized_clause,
            variables_schema: parsed.variables_schema,
            document_type: parsed.document_type || 'GENERAL',
            frequency_count: 1,
            validation_passed: true,
          });
        }
      } catch (genError: any) {
        // Non-fatal: generalization failing should never affect the user response
        console.error('[edit/route.ts] Generalization pipe error:', genError.message);
      }
    })();
    // === END GENERALIZATION PIPE ===

    return NextResponse.json({
      success: true,
      content: editedContent,
    });

  } catch (error: any) {
    console.error('Edit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to edit document' },
      { status: 500 }
    );
  }
}
