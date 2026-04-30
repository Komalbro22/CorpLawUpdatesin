import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/',
          '/_next/image/',
          '/api/og',
        ],
        disallow: [
          '/admin/',
          '/api/admin/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: 'https://www.corplawupdates.in/sitemap.xml',
    host: 'https://www.corplawupdates.in',
  }
}
