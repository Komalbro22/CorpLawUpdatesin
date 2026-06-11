/** Column selections for Supabase queries — keeps egress low by never fetching `content` on list pages. */

/** Card / list views (homepage, /updates, /category, related articles). Excludes `content`. */
export const UPDATE_LIST_COLUMNS =
  'id, title, slug, summary, content, category, published_at, is_featured, effective_date, featured_image_url, impact_level, source_name, views, tags' as const

/** Full article detail page — includes body and metadata fields. */
export const UPDATE_DETAIL_COLUMNS =
  'id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description' as const

/** Glossary hub index — definitions needed for client-side search preview. */
export const GLOSSARY_INDEX_COLUMNS =
  'id, term, slug, definition, category, keywords, synonyms' as const

/** Glossary cross-linking map (term → slug only). */
export const GLOSSARY_LINK_COLUMNS = 'term, slug' as const

/** Compliance calendar public pages. */
export const COMPLIANCE_ENTRY_COLUMNS =
  'id, regulator, form_name, compliance_title, due_date, applicable_to, penalty, regulation_reference, is_active, is_verified, created_by, contributor_name, contributor_profession, correction_count, frequency, display_order, updated_at' as const

/** RBI repo rate history table. */
export const REPO_RATE_HISTORY_COLUMNS =
  'id, meeting_date, meeting_name, repo_rate, change_amount, change_direction, stance, sdf_rate, msf_rate, notes' as const
