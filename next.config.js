/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
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
    dangerouslyAllowSVG: false,
    unoptimized: false,
  },
  async headers() {
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://www.clarity.ms https://www.googletagmanager.com https://news.google.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://i.ibb.co https://*.supabase.co https://images.unsplash.com https://www.clarity.ms https://c.clarity.ms; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://analytics.google.com https://stats.g.doubleclick.net https://c.clarity.ms https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com; frame-src 'self' https://news.google.com; object-src 'none'; base-uri 'self';",
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
            value: 'public, max-age=300, stale-while-revalidate=600',
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
        source: '/tools/penalty-calculator/:path*',
        destination: '/tools/fee-calculator',
        permanent: true,
      },
      {
        source: '/tools/penalty-calculator',
        destination: '/tools/fee-calculator',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig
