import { Database } from './supabase'

export type Category = 'MCA' | 'SEBI' | 'RBI' | 'NCLT' | 'IBC' | 'FEMA' | 'CCI' | 'LABOUR'

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
    | 'reading_time'
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

export type PartnerInterestStatus = 'pending' | 'reviewed' | 'contacted' | 'onboarded' | 'rejected'

export interface PartnerInterest {
    id: string
    firm_or_individual_name: string
    services: string[]
    qualification: string | null
    experience_years: number | null
    website: string | null
    contact_preference: string | null
    contact_value: string | null
    additional_notes: string | null
    status: PartnerInterestStatus
    created_at: string
}

