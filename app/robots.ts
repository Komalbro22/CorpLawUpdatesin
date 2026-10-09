import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = 'https://www.corplawupdates.in'

  // AI & Search Citation Bots allowed on public articles and tools
  const aiSearchBots = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Perplexity-User',
    'ClaudeBot',
    'Claude-Searchbot',
    'Claude-Web',
    'anthropic-ai',
    'Google-Extended',
    'Applebot-Extended',
    'cohere-ai',
    'Meta-ExternalAgent',
    'Googlebot-Image',
  ]

  // Abusive / non-essential high-frequency scrapers that exhaust Vercel bandwidth
  const abusiveScrapers = [
    'Bytespider',
    'CCBot',
    'Amazonbot',
    'MJ12bot',
    'DotBot',
    'PetalBot',
    'DataForSeoBot',
    'Barkrowler',
    'Seekport',
  ]

  const aiRules = aiSearchBots.map(bot => ({
    userAgent: bot,
    allow: '/',
    disallow: ['/admin/', '/api/admin/', '/sitemap/companies/'],
  }))

  const scraperRules = abusiveScrapers.map(bot => ({
    userAgent: bot,
    disallow: ['/'],
  }))

  return {
    rules: [
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      ...scraperRules,
      ...aiRules,
      {
        userAgent: '*',
        allow: ['/', '/api/og', '/api/feed.xml', '/api/image-proxy'],
        disallow: [
          '/api/',
          '/admin/',
          '/sitemap/companies/',
          '/company/',
          '/bookmarks',
          '/documents/saved',
        ],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
    ],
  }
}


