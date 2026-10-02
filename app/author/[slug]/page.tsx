import { permanentRedirect, notFound } from 'next/navigation'

export default async function DynamicAuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (slug === 'komalpreet-singh') {
    permanentRedirect('/author/komalpreet-singh')
  }
  notFound()
}
