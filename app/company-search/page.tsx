import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Company Search Tool — MCA CIN Lookup & Structure Analyzer | CorpLawUpdates.in',
  description: 'Search and decode any Indian company CIN string into listing status, NIC industry code, state RoC office, incorporation year, and ownership classification.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/cin-decoder',
  },
}

export default function CompanySearchLandingPage() {
  redirect('/tools/cin-decoder')
}
