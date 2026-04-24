import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            }
        ],
        sitemap: BASE_URL + '/sitemap.xml',
        host: BASE_URL,
    }
}
