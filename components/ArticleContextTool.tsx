'use client';

import { useEffect } from 'react';

interface ArticleContextToolProps {
  title: string;
  summary?: string;
  category?: string;
  published_at?: string;
  tags?: string[];
  slug: string;
  content?: string;
}

export default function ArticleContextTool({ title, summary, category, published_at, tags, slug, content }: ArticleContextToolProps) {
  useEffect(() => {
    if (!('modelContext' in document) || !document.modelContext) return;

    document.modelContext.registerTool({
      name: 'getCurrentArticle',
      description: `Retrieve the full details of the currently viewed article on CorpLawUpdates.in. Current article: "${title}". Use this to get the complete content, summary, or metadata of the article the user is reading.`,
      inputSchema: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: ['summary', 'full', 'metadata'],
            description: 'What to return: summary (brief overview), full (complete content), metadata (title, category, date, tags)'
          }
        },
        required: []
      },
      execute: async (params) => {
        const section = String(params.section || 'summary');

        if (section === 'metadata') {
          return [
            `Title: ${title}`,
            `Category: ${category || 'N/A'}`,
            `Published: ${published_at ? new Date(published_at).toLocaleDateString('en-IN') : 'N/A'}`,
            `Tags: ${tags?.join(', ') || 'N/A'}`,
            `URL: https://corplawupdates.in/updates/${slug}`,
          ].join('\n');
        }

        if (section === 'full' && content) {
          // Strip HTML tags for clean text output
          const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          return `${title}\n\n${cleanContent.slice(0, 3000)}${cleanContent.length > 3000 ? '\n\n[Content truncated. Read full article at https://corplawupdates.in/updates/' + slug + ']' : ''}`;
        }

        return `${title}\n\n${summary || 'No summary available.'}\n\nRead full article: https://corplawupdates.in/updates/${slug}`;
      }
    });

    return () => {
      if (!('modelContext' in document) || !document.modelContext) return;
      document.modelContext.unregisterTool('getCurrentArticle');
    };
  }, [title, summary, category, published_at, tags, slug, content]);

  return null;
}
