import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';
import { getEmbedding } from '@/lib/gemini';
import { verifyAdminSession } from '@/lib/admin-auth';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: rule_id } = params;
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

    // 1. Fetch the existing rule to get intent_id and clause_id
    const { data: existingRule, error: fetchError } = await docDb
      .from('rules')
      .select('intent_id, clause_id')
      .eq('id', rule_id)
      .single();

    if (fetchError || !existingRule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const { intent_id, clause_id } = existingRule;

    // 2. Update the intent
    const embedding = await getEmbedding(intent_description);
    const { error: intentError } = await docDb
      .from('intents')
      .update({
        name: intent_name.trim().toUpperCase().replace(/\s+/g, '_'),
        description: intent_description,
        embedding
      })
      .eq('id', intent_id);

    if (intentError) {
      return NextResponse.json({ error: 'Failed to update intent: ' + intentError.message }, { status: 500 });
    }

    // 3. Update aliases
    // First, delete old aliases
    await docDb.from('intent_aliases').delete().eq('intent_id', intent_id);

    // Then insert new ones
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
            .upsert({ phrase: normalized, intent_id: intent_id }, { onConflict: 'phrase' });
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

    // 5. Update clause
    const { error: clauseError } = await docDb
      .from('clauses')
      .update({
        document_type,
        category: clause_category || 'INSERT',
        content: clause_content,
        variables,
        placement_rules,
        legal_basis: legal_basis || '',
        related_forms,
        compliance_deadline: compliance_deadline || null,
      })
      .eq('id', clause_id);

    if (clauseError) {
      return NextResponse.json({ error: 'Failed to update clause: ' + clauseError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Rule updated successfully`,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: rule_id } = params;

    const { error } = await docDb
      .from('rules')
      .delete()
      .eq('id', rule_id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete rule: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Rule deleted successfully' });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
