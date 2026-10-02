import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseDocuments } from '@/lib/supabase-documents'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getCachedDocumentTemplate } from '@/lib/document-template-cache'
import DocumentGeneratorClient from './DocumentGeneratorClient'

export const revalidate = 86400
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const client = supabaseDocuments || supabaseAdmin
    if (!client) return []
    const { data } = await client
      .from('document_templates')
      .select('slug')
      .eq('is_active', true)

    if (!data) return []
    return data.map((t: { slug: string }) => ({ slug: t.slug }))
  } catch {
    return []
  }
}

export default async function DocumentSlugPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug

  if (!slug) {
    notFound()
  }

  const template = await getCachedDocumentTemplate(slug)

  if (!template) {
    notFound()
  }

  return (
    <main>
      <DocumentGeneratorClient
        slugOverride={slug}
        initialTemplate={template}
      />
    </main>
  )
}
