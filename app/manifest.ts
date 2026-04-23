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
    }
}
