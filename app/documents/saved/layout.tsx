import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Saved Documents',
  robots: { index: false, follow: true },
}

export default function SavedDocumentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
