export type Category = 'MCA' | 'SEBI' | 'RBI' | 'NCLT' | 'IBC' | 'FEMA'

export interface Update {
    id: string
    title: string
    slug: string
    summary: string
    content: string | null
    category: Category
    tags: string[]
    source_url: string | null
    source_name: string | null
    published_at: string | null
    is_featured: boolean
    views: number
    key_change: string | null
    effective_date: string | null
    impact_level: 'high' | 'medium' | 'low' | null
    created_at: string
    updated_at: string
}

export interface Subscriber {
    id: string
    email: string
    subscribed_at: string
    unsubscribed_at: string | null
    is_active: boolean
}

export interface CategoryCount {
    category: Category
    count: number
}

export interface SiteSetting {
  key: string
  value: string | null
  label: string
  description: string
  updated_at: string
}
