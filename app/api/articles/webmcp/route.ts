import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/articles/webmcp
// WebMCP tool: get_article_summary
// Returns a curated summary of a single article by slug — no raw content body,
// only safe structured fields. untrustedContentHint is set in the tool registration.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: string;
  published_at: string;
  updated_at: string | null;
  effective_date: string | null;
  impact_level: string | null;
  source_name: string | null;
  source_url: string | null;
  key_changes: string[] | null;
  tags: string[] | null;
  quick_answer: string | null;
  regulation_ref: string | null;
  key_takeaways: string | null;
}

// Only return safe, structured fields — never raw content body
const SAFE_COLUMNS = [
  'id', 'title', 'slug', 'summary', 'category', 'published_at', 'updated_at',
  'effective_date', 'impact_level', 'source_name', 'source_url',
  'key_changes', 'tags', 'quick_answer', 'regulation_ref', 'key_takeaways',
].join(', ');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.trim() ?? '';

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing required param: slug' },
      { status: 400 }
    );
  }

  // Basic slug validation — only alphanumeric + hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Invalid slug format.' },
      { status: 400 }
    );
  }

  const { data: rawData, error } = await supabase
    .from('updates')
    .select(SAFE_COLUMNS)
    .eq('slug', slug)
    .single();

  if (error || !rawData) {
    return NextResponse.json(
      { error: `Article not found: "${slug}"` },
      { status: 404 }
    );
  }

  const data = rawData as unknown as ArticleRow;

  return NextResponse.json({
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    quickAnswer: data.quick_answer ?? null,
    category: data.category,
    publishedAt: data.published_at,
    updatedAt: data.updated_at ?? null,
    effectiveDate: data.effective_date ?? null,
    impactLevel: data.impact_level ?? null,
    sourceName: data.source_name ?? null,
    sourceUrl: data.source_url ?? null,
    keyChanges: data.key_changes ?? [],
    keyTakeaways: data.key_takeaways ?? null,
    regulationRef: data.regulation_ref ?? null,
    tags: data.tags ?? [],
    url: `https://www.corplawupdates.in/updates/${data.slug}`,
  });
}
