import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

export async function POST(request: Request) {
  try {
    const { queueItemId } = await request.json();
    const { error } = await docDb
      .from('learning_queue')
      .update({ status: 'rejected' })
      .eq('id', queueItemId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
