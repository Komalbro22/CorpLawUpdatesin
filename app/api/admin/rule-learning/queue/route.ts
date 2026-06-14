import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';
import { verifyAdminSession } from '@/lib/admin-auth';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

export async function GET() {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data, error } = await docDb
      .from('learning_queue')
      .select('*')
      .eq('status', 'pending')
      .eq('validation_passed', true)
      .order('frequency_count', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
