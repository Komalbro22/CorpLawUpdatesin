import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saved Articles | CorpLawUpdates.in',
  description: 'Your saved corporate law updates.',
  robots: { index: false, follow: true },
}

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
