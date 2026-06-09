import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docType = searchParams.get('docType');
    if (!docType) return NextResponse.json({ recommendations: [] });

    // Normalize docType (e.g., BOARD_RESOLUTION -> board_resolution)
    const normalizedCategory = docType.toLowerCase();

    // Query active templates in document_templates table matching the category
    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .select('slug, name, description')
      .eq('category', normalizedCategory)
      .eq('is_active', true)
      .limit(3);

    if (error) {
      console.error('[bundle-recommendations] DB error:', error.message);
      return NextResponse.json({ recommendations: [] });
    }

    // Fallback: if no category match, return some standard active templates
    if (!data || data.length === 0) {
      const { data: fallbackData } = await supabaseAdmin
        .from('document_templates')
        .select('slug, name, description')
        .eq('is_active', true)
        .limit(3);
      return NextResponse.json({ recommendations: fallbackData || [] });
    }

    return NextResponse.json({ recommendations: data });
  } catch (error: any) {
    console.error('[bundle-recommendations] Error:', error.message);
    return NextResponse.json({ recommendations: [] });
  }
}
