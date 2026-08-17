import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = 'https://www.corplawupdates.in'

  const aiBots = [
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
    'CCBot',
    'Googlebot-Image',
    'Bytespider',
    'FacebookBot',
    'Amazonbot',
  ]

  const aiRules = aiBots.map(bot => ({
    userAgent: bot,
    allow: '/',
    disallow: ['/admin/', '/api/admin/'],
  }))

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
      ...aiRules,
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap/companies/index.xml`,
    ],
  }
}

