import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CorpLawUpdates.in',
        short_name: 'CorpLawUpdates',
        description: "India's Free Corporate Law Intelligence Platform",
        start_url: '/',
        display: 'standalone',
        background_color: '#0F172A',
        theme_color: '#F59E0B',
        orientation: 'any',
        categories: ['news', 'education', 'finance'],
        shortcuts: [
            {
                name: 'Recent Updates',
                url: '/updates',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }]
            },
            {
                name: 'Compliance Calendar',
                url: '/calendar',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }]
            }
        ],
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icon-192-maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icon-512-maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ]
    }
}
