'use client';

import { useEffect } from 'react';

export default function ArticleSearchTool() {
  useEffect(() => {
    if (!('modelContext' in document) || !document.modelContext) return;

    document.modelContext.registerTool({
      name: 'searchCorpLawArticles',
      description: 'Search and retrieve Indian corporate law regulatory update articles from CorpLawUpdates.in. The site publishes same-day analysis of MCA, SEBI, RBI, IBBI, and FEMA circulars and notifications. Use when a user asks about recent regulatory changes, new circulars, compliance updates, or wants to find specific legal articles.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search query. Examples: "SEBI AIF circular", "DPT-3 extension", "RBI master directions", "MCA amendment 2026"'
          },
          category: {
            type: 'string',
            enum: ['MCA', 'SEBI', 'RBI', 'IBBI', 'FEMA', 'ALL'],
            description: 'Filter by regulator category (default: ALL)'
          },
          limit: {
            type: 'number',
            description: 'Number of results to return (default: 5, max: 10)'
          }
        },
        required: []
      },
      execute: async (params) => {
        try {
          const searchParam = params.search ? `&search=${encodeURIComponent(String(params.search))}` : '';
          const categoryParam = params.category && params.category !== 'ALL' ? `&category=${encodeURIComponent(String(params.category))}` : '';
          const url = `/api/articles?limit=${Math.min(Number(params.limit || 5), 10)}${searchParam}${categoryParam}`;

          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();

          if (!data.articles || data.articles.length === 0) {
            return `No articles found${params.search ? ` for "${params.search}"` : ''}. Visit https://corplawupdates.in/updates for the full list.`;
          }

          const lines = data.articles.map((a: { title: string; summary?: string; category?: string; published_at?: string; slug: string }) =>
            `**${a.title}**\n` +
            `${a.category ? `[${a.category}] ` : ''}${a.published_at ? new Date(a.published_at).toLocaleDateString('en-IN') : ''}\n` +
            `${a.summary || ''}\n` +
            `Read: https://corplawupdates.in/updates/${a.slug}`
          );

          return `Found ${data.total || data.articles.length} article(s) on CorpLawUpdates.in:\n\n${lines.join('\n\n')}`;
        } catch (e) {
          return 'Error searching articles. Visit https://corplawupdates.in/updates directly.';
        }
      }
    });

    return () => {
      if (!('modelContext' in document) || !document.modelContext) return;
      document.modelContext.unregisterTool?.('searchCorpLawArticles');
    };
  }, []);

  return null;
}
