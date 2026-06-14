import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';
import { verifyAdminSession } from '@/lib/admin-auth';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

type PlacementDSL = { action: string; anchor: string; anchor_type: string; fallback: string; };

export async function POST(request: Request) {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { queueItemId } = await request.json();

    // Fetch the queue item
    const { data: item, error: fetchError } = await docDb
      .from('learning_queue')
      .select('*')
      .eq('id', queueItemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }

    // Create the intent (or find existing)
    let intentId: string;
    const { data: existingIntent } = await docDb
      .from('intents')
      .select('id')
      .eq('name', item.proposed_intent)
      .single();

    if (existingIntent) {
      intentId = existingIntent.id;
    } else {
      // Generate embedding for the new intent
      const { getEmbedding } = await import('@/lib/gemini');
      const embedding = await getEmbedding(item.proposed_intent.replace(/_/g, ' ').toLowerCase());

      const { data: newIntent, error: intentError } = await docDb
        .from('intents')
        .insert({ name: item.proposed_intent, embedding, description: item.generalized_prompt })
        .select('id')
        .single();

      if (intentError || !newIntent) {
        return NextResponse.json({ error: 'Failed to create intent: ' + intentError?.message }, { status: 500 });
      }
      intentId = newIntent.id;
    }

    // Create the clause (version 1)
    const defaultPlacement: PlacementDSL = {
      action: 'APPEND',
      anchor: '',
      anchor_type: 'REGEX',
      fallback: 'BOTTOM',
    };

    const { data: newClause, error: clauseError } = await docDb
      .from('clauses')
      .insert({
        version: 1,
        is_active: true,
        document_type: item.document_type || 'GENERAL',
        category: 'INSERT',
        content: item.ai_clause_draft,
        variables: item.variables_schema,
        placement_rules: defaultPlacement,
      })
      .select('id')
      .single();

    if (clauseError || !newClause) {
      return NextResponse.json({ error: 'Failed to create clause: ' + clauseError?.message }, { status: 500 });
    }

    // Create the rule linking intent → clause
    const { error: ruleError } = await docDb
      .from('rules')
      .insert({
        intent_id: intentId,
        clause_id: newClause.id,
        document_type: item.document_type || 'GENERAL',
      });

    if (ruleError) {
      return NextResponse.json({ error: 'Failed to create rule: ' + ruleError.message }, { status: 500 });
    }

    // Mark queue item as approved
    await docDb
      .from('learning_queue')
      .update({ status: 'approved' })
      .eq('id', queueItemId);

    return NextResponse.json({ success: true, clauseId: newClause.id, intentId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
