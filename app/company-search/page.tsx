import { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'CIN Decoder Tool — MCA Structure Analyzer',
  description: 'Search and decode any Indian company CIN string into listing status, NIC industry code, state RoC office, incorporation year, and ownership classification.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/cin-decoder',
  },
}

export default function CompanySearchLandingPage() {
  permanentRedirect('/tools/cin-decoder')
}
