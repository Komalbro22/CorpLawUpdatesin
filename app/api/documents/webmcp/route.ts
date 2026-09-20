import { NextRequest, NextResponse } from 'next/server';
import { supabaseDocuments } from '@/lib/supabase-documents';
import { MVP_DOCUMENTS_META } from '@/lib/doc-generator/ai-engine';

// GET /api/documents/webmcp
// WebMCP tools: search_document_templates & get_document_template
// Exposes structured legal drafting template metadata, ICSI secretarial standards,
// and required drafting variables to browser AI agents.

export const revalidate = 300; // Cache for 5 minutes at edge

const VALID_CATEGORIES = [
  'board_resolution',
  'commercial_contracts',
  'appointments',
  'company_drafts',
  'shareholders_meeting',
  'agreements',
  'mca_forms',
  'notices',
  'banking_finance',
  'real_estate',
] as const;

interface DocumentTemplateRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  regulation_reference: string | null;
  source: string | null;
  last_verified: string | null;
  is_free: boolean;
  tags: string[] | null;
  fields: any[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.trim().toLowerCase() ?? '';
  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';
  const category = searchParams.get('category')?.trim() ?? '';
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 25);

  try {
    // ── Branch 1: Single Template Details by Slug ───────────────────────────
    if (slug) {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return NextResponse.json(
          { error: 'Invalid template slug format.' },
          { status: 400 }
        );
      }

      if (supabaseDocuments) {
        const { data: rawData, error } = await supabaseDocuments
          .from('document_templates')
          .select(
            'id, name, slug, description, category, regulation_reference, ' +
            'source, last_verified, is_free, tags, usage_count, fields'
          )
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (!error && rawData) {
          const data = rawData as unknown as DocumentTemplateRow;
          return NextResponse.json({
            template: {
              id: data.id,
              name: data.name,
              slug: data.slug,
              description: data.description,
              category: data.category,
              regulationReference: data.regulation_reference ?? 'Companies Act, 2013 read with ICSI Secretarial Standards',
              source: data.source ?? 'ICSI SS-1 / Companies Act 2013',
              lastVerified: data.last_verified,
              isFree: data.is_free,
              tags: data.tags ?? [],
              fields: data.fields ?? [],
              url: `https://www.corplawupdates.in/documents/${data.slug}`,
            },
          });
        }
      }

      // Check MVP documents meta fallback
      const mvpMatch = MVP_DOCUMENTS_META.find((m) => m.id === slug || m.id.replace(/_/g, '-') === slug);
      if (mvpMatch) {
        return NextResponse.json({
          template: {
            id: mvpMatch.id,
            name: mvpMatch.title,
            slug: mvpMatch.id.replace(/_/g, '-'),
            description: mvpMatch.shortDescription,
            category: mvpMatch.category,
            regulationReference: mvpMatch.actReference,
            source: 'ICSI SS-1 (Revised 2024)',
            lastVerified: new Date().toISOString().split('T')[0],
            isFree: true,
            tags: ['board meeting', 'resolution', 'mca compliance'],
            fields: [
              { name: 'companyName', label: 'Company Name', type: 'text', required: true },
              { name: 'cin', label: 'CIN', type: 'text', required: true },
              { name: 'registeredOffice', label: 'Registered Office', type: 'text', required: true },
              { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
            ],
            url: `https://www.corplawupdates.in/documents/${mvpMatch.id.replace(/_/g, '-')}`,
          },
        });
      }

      return NextResponse.json(
        { error: `Document template "${slug}" not found.` },
        { status: 404 }
      );
    }

    // ── Branch 2: Search or List Templates ──────────────────────────────────
    let templates: any[] = [];

    if (supabaseDocuments) {
      let dbQuery = supabaseDocuments
        .from('document_templates')
        .select('id, name, slug, description, category, regulation_reference, source, last_verified, is_free, tags')
        .eq('is_active', true)
        .order('display_order');

      if (category && category !== 'all' && VALID_CATEGORIES.includes(category as any)) {
        dbQuery = dbQuery.eq('category', category);
      }

      const { data, error } = await dbQuery;
      if (!error && data) {
        templates = data;
      }
    }

    // Fallback if database is empty or unavailable
    if (templates.length === 0) {
      templates = MVP_DOCUMENTS_META.map((m) => ({
        id: m.id,
        name: m.title,
        slug: m.id.replace(/_/g, '-'),
        description: m.shortDescription,
        category: m.category,
        regulation_reference: m.actReference,
        source: 'ICSI SS-1 (Revised 2024)',
        last_verified: new Date().toISOString().split('T')[0],
        is_free: true,
        tags: ['board meeting', 'resolution'],
      }));
    }

    // In-memory filter if query parameter provided
    if (query) {
      const q = query.toLowerCase();
      templates = templates.filter((t) => {
        const nameMatch = t.name?.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q);
        const catMatch = t.category?.toLowerCase().includes(q);
        const tagMatch = Array.isArray(t.tags) && t.tags.some((tag: string) => tag.toLowerCase().includes(q));
        return nameMatch || descMatch || catMatch || tagMatch;
      });
    }

    const results = templates.slice(0, limit).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      category: t.category,
      regulationReference: t.regulation_reference ?? 'Companies Act, 2013',
      source: t.source ?? 'ICSI SS-1',
      lastVerified: t.last_verified,
      isFree: t.is_free ?? true,
      tags: t.tags ?? [],
      url: `https://www.corplawupdates.in/documents/${t.slug}`,
    }));

    return NextResponse.json(
      {
        total: results.length,
        query: query || null,
        category: category || null,
        templates: results,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to retrieve document templates.' },
      { status: 500 }
    );
  }
}
