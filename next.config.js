/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: 'fcosrsznbxedischtbwe.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https', 
        hostname: 'igglydprjtptmkzvfngg.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'none'; script-src 'none'; sandbox",
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    const scriptSrcEval = isDev ? " 'unsafe-eval'" : ""
    const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-inline'${scriptSrcEval} https://static.cloudflareinsights.com https://www.googletagmanager.com https://va.vercel-scripts.com https://*.clarity.ms https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://news.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' blob: data: https: wss://*.supabase.co; frame-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://news.google.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests;`

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            // HSTS: enforce HTTPS for 1 year including subdomains
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      {
        source: '/api/((?!admin).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
          },
        ],
      },
      ...(isDev
        ? []
        : [
            {
              source: '/_next/static/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ]),
      {
        source: '/(images|fonts)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'corplawupdates.in',
          },
        ],
        destination: 'https://www.corplawupdates.in/:path*',
        permanent: true,
      },
      {
        source: '/updates/mgt-7-annual-return-filing-guide-fy-2025-26-due-date-mca-v3-small-company-limits-ccfs2026',
        destination: '/updates/form-mgt-7-mgt-7a-annual-return-guide-2026',
        permanent: true,
      },
      {
        source: '/corporate-law-updates-india',
        destination: '/updates',
        permanent: true,
      },
      {
        // Specific singular-to-plural calculator redirects
        source: '/tools/penalty-calculator/company',
        destination: '/tools/fee-calculator/companies',
        permanent: true,
      },
      {
        source: '/tools/fee-calculator/company',
        destination: '/tools/fee-calculator/companies',
        permanent: true,
      },
      {
        source: '/tools/fee-calculator/company/:path*',
        destination: '/tools/fee-calculator/companies/:path*',
        permanent: true,
      },
      {
        source: '/tools/fee-calculator/companies/mgt-14',
        destination: '/tools/fee-calculator/companies',
        permanent: true,
      },
      {
        source: '/tools/fee-calculator/companies/inc-22',
        destination: '/tools/fee-calculator/companies',
        permanent: true,
      },
      {
        source: '/tools/penalty-calculator',
        destination: '/tools/fee-calculator',
        permanent: true,
      },
      {
        // Preserves sub-path: /tools/penalty-calculator/foo → /tools/fee-calculator/foo
        source: '/tools/penalty-calculator/:path*',
        destination: '/tools/fee-calculator/:path*',
        permanent: true,
      },
      {
        source: '/roc-deadline-tracker',
        destination: '/tools/roc-tracker',
        permanent: true,
      },
      // Unprefixed Glossary & Document Routes
      {
        source: '/director-identification-number',
        destination: '/glossary/din',
        permanent: true,
      },
      {
        source: '/independent-director',
        destination: '/glossary/independent-director',
        permanent: true,
      },
      {
        source: '/interested-director',
        destination: '/glossary/board-of-directors',
        permanent: true,
      },
      {
        source: '/key-managerial-personnel',
        destination: '/glossary/key-managerial-personnel',
        permanent: true,
      },
      {
        source: '/audit-committee',
        destination: '/glossary/audit-committee',
        permanent: true,
      },
      {
        source: '/board-meeting',
        destination: '/glossary/board-meeting',
        permanent: true,
      },
      {
        source: '/board-resolution',
        destination: '/documents',
        permanent: true,
      },
      // Legacy Blogger URLs
      {
        source: '/2026/:month/:slug*.html',
        destination: '/updates',
        permanent: true,
      },
      {
        source: '/p/privacy-policy.html',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/p/:slug*.html',
        destination: '/:slug*',
        permanent: true,
      },
      {
        source: '/search/label/:label*',
        destination: '/category',
        permanent: true,
      },
      {
        source: '/search',
        destination: '/company-search',
        permanent: true,
      },
      {
        source: '/3',
        destination: '/updates',
        permanent: true,
      },
      {
        source: '/8',
        destination: '/updates',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig
