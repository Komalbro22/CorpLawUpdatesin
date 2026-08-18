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
    unoptimized: true,
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    const scriptSrcEval = isDev ? " 'unsafe-eval'" : ""
    const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-inline'${scriptSrcEval} https://static.cloudflareinsights.com https://www.googletagmanager.com https://va.vercel-scripts.com https://*.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https: http: https://i.ibb.co https://images.unsplash.com https://*.clarity.ms; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' blob: data: https: http: https://i.ibb.co https://images.unsplash.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://static.cloudflareinsights.com https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com https://*.clarity.ms; frame-src 'self'; object-src 'none'; base-uri 'self';`

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
            value: 'max-age=31536000; includeSubDomains',
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
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
        source: '/corporate-law-updates-india',
        destination: '/updates',
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
    ]
  },
}
module.exports = nextConfig
