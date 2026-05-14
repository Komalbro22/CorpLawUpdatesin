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
        // REMOVED: '/updates?*' 
        // Reason: Allow Googlebot to crawl search pages
        // to follow internal links. Pages already have
        // meta robots noindex via generateMetadata.
        // meta noindex is better than robots disallow
        // because Google can still follow links.
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: [
      'https://www.corplawupdates.in/sitemap.xml',
      'https://www.corplawupdates.in/image-sitemap.xml',
    ],
    // REMOVED: host field (wrong format, Google ignores it)
  }
}
