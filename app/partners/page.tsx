'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  Plus,
  X,
  Building2,
  Award,
  Globe,
  MessageSquare,
  Briefcase,
  ChevronRight,
  FileText,
  Sparkles,
  Megaphone,
  Handshake,
  Check,
  ShieldAlert,
  HelpCircle,
  Mail,
  Info,
} from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'

const PRESET_SERVICES = [
  'MCA Filings (DIR-12, DPT-3, AOC-4, MGT-7)',
  'ROC Compliance & Incorporation',
  'SEBI LODR & Secretarial Audit',
  'RBI & FEMA Compliance',
  'IBBI & Insolvency Advisory',
  'NCLT Drafting & Representations',
  'Tax & Statutory Audit (CBDT / GST)',
  'Legal Due Diligence & Agreements',
]

const QUALIFICATIONS = ['CS', 'CA', 'CMA', 'Advocate', 'Legal Professional', 'Other']

const PARTNERSHIP_OPTIONS = [
  {
    id: 'Sponsored Article',
    title: 'Sponsored Article',
    desc: 'A full article about your service, tool, or product, published on CorpLawUpdates.in and shared on LinkedIn & X.',
    badge: 'Content & Reach',
  },
  {
    id: 'Featured Partner Listing',
    title: 'Featured Partner Listing',
    desc: 'A prominent profile in our partner directory with a Featured badge, appearing first for compliance clients.',
    badge: 'Directory',
  },
  {
    id: 'Product or Service Promotion',
    title: 'Product / Service Promotion',
    desc: 'A dedicated showcase for a tool, course, software, or service launch shared across our site and socials.',
    badge: 'Showcase',
  },
  {
    id: 'Referral Partnership',
    title: 'Referral Partnership',
    desc: 'Matched reader enquiries for ROC filings, incorporations, and annual compliance after mutual vetting.',
    badge: 'Client Referrals',
  },
]

const CONTACT_METHODS = [
  { value: 'Email', label: 'Email', placeholder: 'Enter your email address' },
  { value: 'WhatsApp', label: 'WhatsApp', placeholder: 'Enter your WhatsApp number (+91...)' },
  { value: 'Phone', label: 'Phone', placeholder: 'Enter your phone number (+91...)' },
  { value: 'Direct via site', label: 'Direct via site', placeholder: 'Leave preferred reach-out details' },
]

const FAQS = [
  {
    q: 'Do you accept every sponsor?',
    a: 'No. Every request is reviewed for relevance, quality, and category. Off-niche or restricted-category requests are declined.',
  },
  {
    q: 'How long does a sponsored article stay live?',
    a: "It stays published as part of the site's content. We reserve the right to update or remove it if accuracy or policy requires.",
  },
  {
    q: 'Do you give dofollow links?',
    a: 'No. Sponsored links are marked rel="sponsored".',
  },
  {
    q: 'Can I promote a casino, betting, or CBD product?',
    a: 'No. Those categories are not accepted at any price.',
  },
  {
    q: 'Do you guarantee leads or clients?',
    a: 'No. Partnership buys placement and exposure. Results depend on your offer and on reader demand.',
  },
]

export default function PartnerInterestPage() {
  const [name, setName] = useState('')
  const [qualification, setQualification] = useState('CS')
  const [experienceYears, setExperienceYears] = useState<string>('')
  const [website, setWebsite] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customService, setCustomService] = useState('')
  const [partnershipTypes, setPartnershipTypes] = useState<string[]>([])
  const [productDescription, setProductDescription] = useState('')
  const [message, setMessage] = useState('')
  const [contactPreference, setContactPreference] = useState('Email')
  const [contactValue, setContactValue] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  const handleAddCustomService = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    const trimmed = customService.trim()
    if (trimmed && !selectedServices.includes(trimmed)) {
      setSelectedServices([...selectedServices, trimmed])
      setCustomService('')
    }
  }

  const removeService = (service: string) => {
    setSelectedServices(selectedServices.filter((s) => s !== service))
  }

  const togglePartnershipType = (typeId: string) => {
    if (partnershipTypes.includes(typeId)) {
      setPartnershipTypes(partnershipTypes.filter((t) => t !== typeId))
    } else {
      setPartnershipTypes([...partnershipTypes, typeId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Please enter your firm or individual name.')
      return
    }

    if (!qualification.trim()) {
      setErrorMsg('Please select your qualification.')
      return
    }

    if (selectedServices.length === 0) {
      setErrorMsg('Please select at least one service category.')
      return
    }

    if (partnershipTypes.length === 0) {
      setErrorMsg('Please select at least one partnership option (I am interested in...).')
      return
    }

    if (!contactValue.trim()) {
      setErrorMsg('Please enter your contact details so our team can reach back.')
      return
    }

    if (website.trim()) {
      try {
        const urlToTest = website.startsWith('http') ? website : `https://${website}`
        new URL(urlToTest)
      } catch {
        setErrorMsg('Please enter a valid website URL (e.g. https://example.com).')
        return
      }
    }

    setLoading(true)

    try {
      const formattedWebsite = website.trim()
        ? website.startsWith('http')
          ? website.trim()
          : `https://${website.trim()}`
        : null

      const combinedNotes = [
        partnershipTypes.length > 0 ? `[Interests: ${partnershipTypes.join(', ')}]` : '',
        productDescription.trim() ? `[Product/Service: ${productDescription.trim()}]` : '',
        message.trim() ? `[Message: ${message.trim()}]` : '',
      ]
        .filter(Boolean)
        .join('\n\n')

      // Attempt insert with new schema columns
      let { error } = await supabaseBrowser.from('partner_interests').insert([
        {
          firm_or_individual_name: name.trim(),
          qualification: qualification || null,
          experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
          website: formattedWebsite,
          services: selectedServices,
          partnership_types: partnershipTypes,
          product_description: productDescription.trim() || null,
          message: message.trim() || null,
          contact_preference: contactPreference || null,
          contact_value: contactValue.trim() || null,
          additional_notes: combinedNotes || null,
          status: 'pending',
        },
      ])

      // Fallback for resilient schema evolution if columns not yet migrated
      if (
        error &&
        (error.message?.includes('column') ||
          error.code === 'PGRST204' ||
          error.code === '42703')
      ) {
        console.warn('Dedicated columns not detected yet. Falling back to core columns with combined notes.')
        const fallbackRes = await supabaseBrowser.from('partner_interests').insert([
          {
            firm_or_individual_name: name.trim(),
            qualification: qualification || null,
            experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
            website: formattedWebsite,
            services: selectedServices,
            contact_preference: contactPreference || null,
            contact_value: contactValue.trim() || null,
            additional_notes: combinedNotes || null,
            status: 'pending',
          },
        ])
        error = fallbackRes.error
      }

      if (error) {
        console.error('Submission error:', error)
        setErrorMsg('Failed to submit form. Please check your connection and try again.')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      {/* HERO SECTION */}
      <section className="bg-navy text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-white/10 shadow-xs">
            <Briefcase className="size-3.5" aria-hidden="true" /> Partner With Us
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Partner With <span className="text-amber-400">CorpLawUpdates.in</span>
          </h1>
          <p className="text-slate-200 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-6">
            CorpLawUpdates.in is a free corporate-law intelligence platform dedicated to Indian regulatory updates and compliance tools.
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            If you serve the same readers we do — Company Secretaries, Chartered Accountants, Cost Accountants (CMA), CS/CA/CMA students, legal enthusiasts, and compliance professionals — you can partner with us to reach them.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-amber-300 uppercase tracking-wider mr-1">Regulators covered:</span>
            {['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI', 'Labour Law', 'IFSCA', 'Taxation (CBDT & GST)'].map((reg) => (
              <span key={reg} className="px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-slate-200 font-medium">
                {reg}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-16">
        {/* WAYS TO PARTNER */}
        <section aria-labelledby="ways-to-partner-heading" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10">
          <div className="max-w-2xl mb-8">
            <h2 id="ways-to-partner-heading" className="font-heading text-2xl sm:text-3xl font-bold text-navy dark:text-white mb-2">
              Ways to Partner
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose the format that aligns with your campaign goals, brand positioning, or client acquisition strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Sponsored Article */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <FileText className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Content & Authority
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-navy dark:text-white mb-2">
                  1. Sponsored Article
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  A full article about your service, tool, or product, published on CorpLawUpdates.in and shared on our LinkedIn company page and X.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>Topic must be relevant to corporate law, compliance, taxation, legal-tech, fintech, or business services.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>Every sponsored article is clearly labelled <strong>&quot;Sponsored&quot;</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>Links in sponsored articles are marked <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded-sm">rel=&quot;sponsored&quot;</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>We review every article before publication and may edit or decline it.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. Featured Partner Listing */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                    <Sparkles className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Directory
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-navy dark:text-white mb-2">
                  2. Featured Partner Listing
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  A profile in our partner directory, for firms and individual professionals offering compliance and related services.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>Includes your firm or individual name, services offered, qualification, years of experience, and website link.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>Featured listings carry a <strong>Featured badge</strong> and appear first.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>A basic listing remains available; Featured is the paid option.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Product / Service Promotion */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                    <Megaphone className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Showcase
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-navy dark:text-white mb-2">
                  3. Product / Service Promotion
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  A short, clearly labelled showcase for a tool, course, software, or service launch.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Explains what the product does, who it is for, and where to learn more.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Shared on our LinkedIn company page and X.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>This is a sponsored showcase, not a review or recommendation, unless we have independently used and reviewed the product and say so explicitly.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. Referral Partnership */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Handshake className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Client Referral
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-navy dark:text-white mb-2">
                  4. Referral Partnership
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  For firms that take on reader work, such as ROC filings, incorporations, and annual compliance.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Reader enquiries in your service area are matched to you after vetting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Any fee — per lead or per completed case — is agreed in advance, in writing, before any enquiry is shared.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>A reader&apos;s details are shared only with that reader&apos;s consent and on the agreed terms.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <Info className="size-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
            <div>
              <strong>Newsletter feature:</strong> A mention in our weekly digest can be added to a Sponsored Article or a Product Promotion. It is not sold as a standalone product at this stage.
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section aria-labelledby="how-it-works-heading" className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg border border-slate-800">
          <h2 id="how-it-works-heading" className="font-heading text-2xl font-bold mb-8 text-center sm:text-left">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 relative">
              <div className="size-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-heading text-base font-semibold text-white">Fill enquiry form</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit your firm details and select your partnership interests below.
              </p>
            </div>
            <div className="space-y-2 relative">
              <div className="size-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-heading text-base font-semibold text-white">Editorial review</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We review your request for relevance, professional quality, and category suitability.
              </p>
            </div>
            <div className="space-y-2 relative">
              <div className="size-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-heading text-base font-semibold text-white">Agree scope & draft</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We agree scope and price in writing, then draft the article or configure the listing.
              </p>
            </div>
            <div className="space-y-2 relative">
              <div className="size-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-heading text-base font-semibold text-white">Go live & promote</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You receive live publication links and social media post links on LinkedIn and X.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING & PARTNERSHIP RULES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PRICING */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-navy dark:text-white mb-3">
                Pricing
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Pricing is on enquiry. Tell us which product you are interested in and what you want to promote, and we will quote after review.
              </p>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                We do not promise a fixed number of leads or clients — you are paying for placement and exposure to our verified professional audience.
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="size-4 text-amber-500" />
              <span>Direct enquiries: <a href="mailto:mail@corplawupdates.in" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">mail@corplawupdates.in</a></span>
            </div>
          </div>

          {/* RULES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-navy dark:text-white mb-3 flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-500" />
              Partnership Rules
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">•</span>
                <span><strong>Niche only:</strong> Corporate law, compliance, taxation, legal-tech, fintech, and business services.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">•</span>
                <span><strong>No restricted content:</strong> No casino, betting, gambling, CBD, or restricted-category content, at any price.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">•</span>
                <span><strong>SEO integrity:</strong> No dofollow links for SEO. Sponsored links are marked <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm">rel=&quot;sponsored&quot;</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">•</span>
                <span>We reserve the right to edit or decline any submission.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">•</span>
                <span>A listing or sponsored article is advertising. It is not an endorsement by CorpLawUpdates.in, and CorpLawUpdates.in is a publication, not a practising CS or CA firm.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section aria-labelledby="faq-heading" className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="size-5 text-amber-500" />
            <h2 id="faq-heading" className="font-heading text-2xl font-bold text-navy dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ENQUIRY FORM */}
        <section id="enquiry-form" aria-labelledby="form-heading" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
            <h2 id="form-heading" className="font-heading text-2xl sm:text-3xl font-bold text-navy dark:text-white mb-2">
              Partnership Enquiry Form
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Tell us about your firm, what you would like to promote, and how you want to collaborate. We will review and respond promptly.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="size-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="size-10" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                Thanks — we&apos;ll review and reach out
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
                Your partnership inquiry has been received. Our editorial and partnerships team will review your submission and contact you via your preferred channel.
              </p>
              <div className="pt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-navy dark:bg-amber-400 text-white dark:text-navy px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-500 transition-colors"
                >
                  Return to Home <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMsg && (
                <div
                  className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium"
                  role="alert"
                >
                  {errorMsg}
                </div>
              )}

              {/* 1. PROFESSIONAL / FIRM DETAILS */}
              <div className="space-y-5">
                <h3 className="font-heading text-base font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Building2 className="size-4 text-amber-500" aria-hidden="true" />
                  Firm & Professional Details
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Firm or Individual Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex Corporate Solutions / CS R. Sharma"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
                  />
                </div>

                {/* Qualification & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Qualification <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all bg-white dark:bg-slate-800 appearance-none"
                      >
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q} className="dark:bg-slate-800 dark:text-slate-100">
                            {q}
                          </option>
                        ))}
                      </select>
                      <Award
                        className="size-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Website <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://www.yourfirm.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
                    />
                    <Globe
                      className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SERVICES OFFERED */}
              <div className="space-y-4 pt-2">
                <h3 className="font-heading text-base font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Briefcase className="size-4 text-amber-500" aria-hidden="true" />
                  Services Offered <span className="text-red-500 text-sm">*</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select key regulatory and compliance areas you handle:
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_SERVICES.map((service) => {
                    const active = selectedServices.includes(service)
                    return (
                      <button
                        type="button"
                        key={service}
                        onClick={() => toggleService(service)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                          active
                            ? 'bg-navy dark:bg-amber-400 text-white dark:text-navy border-navy dark:border-amber-400 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {service}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Service Input */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Add specific service / filing type
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      onKeyDown={handleAddCustomService}
                      placeholder="e.g. DIR-3 KYC, MGT-14, Secretarial Audit"
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomService}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus className="size-4" aria-hidden="true" /> Add
                    </button>
                  </div>
                </div>

                {/* Selected Tags Display */}
                {selectedServices.length > 0 && (
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-2">
                      Selected Services ({selectedServices.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServices.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 text-navy dark:text-white border border-amber-300 dark:border-amber-500/50 text-xs font-semibold px-2.5 py-1 rounded-md shadow-2xs"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => removeService(service)}
                            className="hover:text-red-500 transition-colors"
                            aria-label={`Remove ${service}`}
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. PARTNERSHIP INTERESTS */}
              <div className="space-y-4 pt-2">
                <h3 className="font-heading text-base font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="size-4 text-amber-500" aria-hidden="true" />
                  I am interested in (tick one or more) <span className="text-red-500 text-sm">*</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PARTNERSHIP_OPTIONS.map((opt) => {
                    const checked = partnershipTypes.includes(opt.id)
                    return (
                      <label
                        key={opt.id}
                        onClick={() => togglePartnershipType(opt.id)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          checked
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-1 size-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {opt.title}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-sm">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {opt.desc}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {/* Product / service to promote */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Product or service you want to promote <span className="text-slate-400 font-normal">(short description)</span>
                  </label>
                  <input
                    type="text"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="e.g. Secretarial audit SaaS tool, ROC filing representation, corporate tax advisory..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* 4. CONTACT & MESSAGE */}
              <div className="space-y-5 pt-2">
                <h3 className="font-heading text-base font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <MessageSquare className="size-4 text-amber-500" aria-hidden="true" />
                  Contact & Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Preferred Contact Method
                    </label>
                    <select
                      value={contactPreference}
                      onChange={(e) => setContactPreference(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all bg-white dark:bg-slate-800"
                    >
                      {CONTACT_METHODS.map((m) => (
                        <option key={m.value} value={m.value} className="dark:bg-slate-800 dark:text-slate-100">
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Contact Details <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={
                        CONTACT_METHODS.find((m) => m.value === contactPreference)?.placeholder ||
                        'Enter contact value'
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Message <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your audience focus, timeline, budget expectations, or specific collaboration ideas..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-navy font-bold px-8 py-3.5 rounded-xl text-base shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Submitting Enquiry...' : 'Submit Partnership Enquiry'}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Or email directly: <a href="mailto:mail@corplawupdates.in" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">mail@corplawupdates.in</a>
                </span>
              </div>
            </form>
          )}
        </section>

        {/* DISCLAIMER */}
        <section className="p-6 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Disclaimer</p>
          <p>
            Information provided on CorpLawUpdates.in is for educational purposes only and does not constitute legal advice. Readers should verify a professional&apos;s credentials themselves before engaging any listed firm or individual.
          </p>
          <p className="mt-2">
            For partnership enquiries, contact: <a href="mailto:mail@corplawupdates.in" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">mail@corplawupdates.in</a>
          </p>
        </section>
      </main>
    </div>
  )
}
