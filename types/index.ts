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

export interface DirectorRecord {
    din: string
    name: string
    designation: string
    date_of_appointment: string | null
    date_of_cessation?: string | null
    kyc_status?: string
}

export interface ChargeRecord {
    charge_id: string
    holder_name: string
    amount: number
    creation_date: string | null
    satisfaction_date?: string | null
    status: 'OPEN' | 'SATISFIED'
}

export interface CompanyMaster {
    cin: string
    company_name: string
    date_of_registration: string | null
    company_status: string | null
    company_class: string | null
    company_category: string | null
    company_subcategory: string | null
    authorised_capital: number | null
    paid_up_capital: number | null
    registered_state: string | null
    roc_office: string | null
    registered_address: string | null
    principal_business_activity: string | null
    last_synced_at: string
    last_accessed_at: string
    is_manually_corrected?: boolean
    corrected_by?: string | null
    corrected_at?: string | null
    views_count?: number
    pdf_downloads_count?: number
    directors?: DirectorRecord[]
    charges?: ChargeRecord[]
}

export interface ComplianceRule {
    rule_id: string
    category: string
    condition_logic: Record<string, any>
    consequence_text: string
    legal_section_reference: string
    effective_from: string | null
    last_verified_date: string | null
    is_active: boolean
}

export interface ComplianceFlag {
    rule_id: string
    category: string
    label: string
    status: 'ok' | 'flag' | 'info' | 'unknown'
    detail: string
    legal_section: string
    disclaimer: string
}

export interface CompanyAuditLog {
    id: string
    action: string
    cin: string | null
    performed_by: string
    performed_at: string
    details: Record<string, any>
}

export interface CompanyHealthStats {
    totalCached: number
    tableSizeBytes: number
    tableSizeFormatted: string
    thresholdBytes: number
    thresholdFormatted: string
    usagePercentage: number
    evictionCount: number
    lastEvictionAt: string | null
}
