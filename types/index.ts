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
