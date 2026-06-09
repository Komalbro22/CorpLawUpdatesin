// app/api/rule-engine/conflict-check/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

export async function POST(request: Request) {
  try {
    const { documentText } = await request.json();
    if (!documentText) return NextResponse.json({ alerts: [] });

    // Fetch all conflict rules from DB
    const { data: conflicts, error } = await docDb
      .from('conflicts')
      .select('*')
      .order('severity', { ascending: false }); // CRITICAL first

    if (error || !conflicts) return NextResponse.json({ alerts: [] });

    const alerts: Array<{
      severity: 'INFO' | 'WARNING' | 'CRITICAL';
      message: string;
      legal_basis: string | null;
    }> = [];

    const lowerText = documentText.toLowerCase();

    for (const conflict of conflicts) {
      const conditions: string[] = conflict.trigger_condition?.requires_all || [];
      const allPresent = conditions.length > 0 &&
        conditions.every((term: string) => lowerText.includes(term.toLowerCase()));

      if (allPresent) {
        alerts.push({
          severity: conflict.severity,
          message: conflict.message,
          legal_basis: conflict.legal_basis || null,
        });
      }
    }

    return NextResponse.json({ alerts, checkedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('[conflict-check/route.ts] Error:', error.message);
    return NextResponse.json({ alerts: [] });
  }
}
