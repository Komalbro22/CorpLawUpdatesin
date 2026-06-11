import { Database } from './supabase'

export type Category = 'MCA' | 'SEBI' | 'RBI' | 'NCLT' | 'IBC' | 'FEMA'

export interface Update extends Omit<Database['public']['Tables']['updates']['Row'], 'category' | 'key_changes' | 'sources' | 'impact_level'> {
    category: Category
    key_changes: string[] | null
    sources: { name: string; url: string }[] | null
    impact_level: 'high' | 'medium' | 'low' | null
}

/** Subset of Update fields used on list/card views (no `content` body). */
export type UpdateListItem = Pick<
    Update,
    | 'id'
    | 'title'
    | 'slug'
    | 'summary'
    | 'category'
    | 'published_at'
    | 'is_featured'
    | 'effective_date'
    | 'featured_image_url'
    | 'impact_level'
    | 'source_name'
    | 'views'
    | 'tags'
> & { content?: string | null }

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
