import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

export async function GET() {
  try {
    const { data, error } = await docDb
      .from('rules')
      .select(`
        id, usage_count, accepted_count, rejected_count, document_type,
        intents(name),
        clauses(content)
      `);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rules = (data || []).map((r: any) => {
      const total = r.accepted_count + r.rejected_count;
      const health_score = total > 0 ? (r.accepted_count / total) * 100 : 0;
      return {
        id: r.id,
        intent_name: r.intents?.name || 'Unknown',
        document_type: r.document_type,
        usage_count: r.usage_count,
        accepted_count: r.accepted_count,
        rejected_count: r.rejected_count,
        health_score,
        clause_content_preview: (r.clauses?.content || '').substring(0, 100),
      };
    });

    return NextResponse.json({ rules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
