import { revalidatePath, revalidateTag } from 'next/cache'

export interface ArticleRevalidationOptions {
    slug: string
    category?: string | null
    oldSlug?: string | null
    oldCategory?: string | null
}

/**
 * Scoped on-demand revalidation for article mutations (create, update, delete).
 * Strictly targets only the affected article and the 4 listing surfaces.
 * Never touches root layout or global wildcard patterns.
 */
export function revalidateArticleMutation({
    slug,
    category,
    oldSlug,
    oldCategory,
}: ArticleRevalidationOptions) {
    // 1. Invalidate tags
    const tagsToInvalidate = new Set<string>([
        'updates',
        'list:home',
        'list:updates',
        'list:sitemap',
    ])

    if (slug) tagsToInvalidate.add(`article:${slug}`)
    if (oldSlug && oldSlug !== slug) tagsToInvalidate.add(`article:${oldSlug}`)

    const cleanCategory = category?.trim().toLowerCase()
    if (cleanCategory) {
        tagsToInvalidate.add(`list:category:${cleanCategory}`)
    }

    const cleanOldCategory = oldCategory?.trim().toLowerCase()
    if (cleanOldCategory && cleanOldCategory !== cleanCategory) {
        tagsToInvalidate.add(`list:category:${cleanOldCategory}`)
    }

    for (const tag of tagsToInvalidate) {
        try {
            (revalidateTag as any)(tag)
        } catch {
            // Ignore if tag cache not initialized
        }
    }

    // 2. Invalidate exact page paths (scoped to 'page' only)
    if (slug) {
        try { revalidatePath(`/updates/${slug}`, 'page') } catch {}
    }
    if (oldSlug && oldSlug !== slug) {
        try { revalidatePath(`/updates/${oldSlug}`, 'page') } catch {}
    }

    try { revalidatePath('/', 'page') } catch {}
    try { revalidatePath('/updates', 'page') } catch {}

    if (cleanCategory) {
        try { revalidatePath(`/category/${cleanCategory}`, 'page') } catch {}
    }
    if (cleanOldCategory && cleanOldCategory !== cleanCategory) {
        try { revalidatePath(`/category/${cleanOldCategory}`, 'page') } catch {}
    }

    try { revalidatePath('/sitemap.xml') } catch {}
    try { revalidatePath('/news-sitemap.xml') } catch {}
}

/**
 * Scoped revalidation for glossary terms.
 */
export function revalidateGlossaryMutation(slug?: string, oldSlug?: string) {
    try { (revalidateTag as any)('glossary') } catch {}
    try { (revalidateTag as any)('list:sitemap') } catch {}

    if (slug) {
        try { (revalidateTag as any)(`glossary:${slug}`) } catch {}
        try { revalidatePath(`/glossary/${slug}`, 'page') } catch {}
    }
    if (oldSlug && oldSlug !== slug) {
        try { (revalidateTag as any)(`glossary:${oldSlug}`) } catch {}
        try { revalidatePath(`/glossary/${oldSlug}`, 'page') } catch {}
    }

    try { revalidatePath('/glossary', 'page') } catch {}
    try { revalidatePath('/sitemap.xml') } catch {}
}

/**
 * Scoped revalidation for document templates.
 */
export function revalidateDocumentMutation(slug?: string, oldSlug?: string) {
    try { (revalidateTag as any)('documents') } catch {}
    try { (revalidateTag as any)('list:sitemap') } catch {}

    if (slug) {
        try { (revalidateTag as any)(`document:${slug}`) } catch {}
        try { revalidatePath(`/documents/${slug}`, 'page') } catch {}
    }
    if (oldSlug && oldSlug !== slug) {
        try { (revalidateTag as any)(`document:${oldSlug}`) } catch {}
        try { revalidatePath(`/documents/${oldSlug}`, 'page') } catch {}
    }

    try { revalidatePath('/documents', 'page') } catch {}
    try { revalidatePath('/sitemap.xml') } catch {}
}

/**
 * Scoped revalidation for compliance calendar events.
 */
export function revalidateComplianceMutation() {
    try { (revalidateTag as any)('compliance') } catch {}
    try { (revalidateTag as any)('list:sitemap') } catch {}
    try { revalidatePath('/calendar', 'page') } catch {}
    try { revalidatePath('/sitemap.xml') } catch {}
}
