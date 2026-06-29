import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      // Explicitly allow AI crawler bots for citation indexing and model training
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      // Explicitly allow major retrieval UAs (Live Citation)
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Claude-Searchbot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },
    ],
    sitemap: [
      'https://www.corplawupdates.in/sitemap.xml',
      'https://www.corplawupdates.in/news-sitemap.xml',
    ],
  }
}
