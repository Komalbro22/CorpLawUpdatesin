// app/api/admin/rules/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';
import { getEmbedding } from '@/lib/gemini';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

// ─── GET — fetch all rules with intent + clause details ───────────────────────
export async function GET() {
  const { data, error } = await docDb
    .from('rules')
    .select(`
      id,
      document_type,
      usage_count,
      accepted_count,
      rejected_count,
      created_at,
      intents ( id, name, description ),
      clauses ( id, content, category, variables, placement_rules, legal_basis, related_forms, compliance_deadline, is_active )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rules: data || [] });
}

// ─── POST — create a new intent + aliases + clause + rule ─────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      intent_name,
      intent_description,
      aliases,         // comma-separated string
      document_type,
      clause_content,
      clause_category,
      variables_raw,   // JSON string like {"name":"STRING"}
      placement_action,
      placement_anchor,
      placement_anchor_type,
      placement_fallback,
      legal_basis,
      related_forms_raw, // comma-separated string
      compliance_deadline,
    } = body;

    // Validate required fields
    if (!intent_name || !intent_description || !document_type || !clause_content) {
      return NextResponse.json(
        { error: 'intent_name, intent_description, document_type and clause_content are required' },
        { status: 400 }
      );
    }

    // 1. Generate embedding for the intent
    const embedding = await getEmbedding(intent_description);

    // 2. Upsert intent
    const { data: intent, error: intentError } = await docDb
      .from('intents')
      .upsert(
        { name: intent_name.trim().toUpperCase().replace(/\s+/g, '_'), description: intent_description, embedding },
        { onConflict: 'name' }
      )
      .select('id')
      .single();

    if (intentError || !intent) {
      return NextResponse.json({ error: 'Failed to create intent: ' + intentError?.message }, { status: 500 });
    }

    // 3. Upsert aliases
    if (aliases) {
      const aliasList = aliases.split(',').map((a: string) => a.trim().toLowerCase()).filter(Boolean);
      for (const phrase of aliasList) {
        const normalized = phrase
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
          .replace(/\b(please|the|a|an|could|you|insert|add|put|show|make|in|for|to|into|section)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (normalized) {
          await docDb
            .from('intent_aliases')
            .upsert({ phrase: normalized, intent_id: intent.id }, { onConflict: 'phrase' });
        }
      }
    }

    // 4. Parse variables and related_forms
    let variables = {};
    try { variables = variables_raw ? JSON.parse(variables_raw) : {}; } catch { variables = {}; }

    const related_forms = related_forms_raw
      ? related_forms_raw.split(',').map((f: string) => f.trim()).filter(Boolean)
      : [];

    const placement_rules = {
      action: placement_action || 'APPEND',
      anchor: placement_anchor || '',
      anchor_type: placement_anchor_type || 'REGEX',
      fallback: placement_fallback || 'BOTTOM',
    };

    // 5. Insert clause
    const { data: clause, error: clauseError } = await docDb
      .from('clauses')
      .insert({
        document_type,
        category: clause_category || 'INSERT',
        content: clause_content,
        variables,
        placement_rules,
        legal_basis: legal_basis || '',
        related_forms,
        compliance_deadline: compliance_deadline || null,
        version: 1,
        is_active: true,
      })
      .select('id')
      .single();

    if (clauseError || !clause) {
      return NextResponse.json({ error: 'Failed to create clause: ' + clauseError?.message }, { status: 500 });
    }

    // 6. Upsert rule
    const { error: ruleError } = await docDb
      .from('rules')
      .upsert(
        { intent_id: intent.id, clause_id: clause.id, document_type },
        { onConflict: 'intent_id, document_type' }
      );

    if (ruleError) {
      return NextResponse.json({ error: 'Failed to create rule: ' + ruleError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      intentId: intent.id,
      clauseId: clause.id,
      message: `Rule created: ${intent_name} → ${document_type}`,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
