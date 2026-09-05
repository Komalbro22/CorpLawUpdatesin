'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Plus, X, Building2, User, Award, Globe, MessageSquare, Briefcase, ChevronRight } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'

const PRESET_SERVICES = [
  'MCA Filings (DIR-12, DPT-3, AOC-4, MGT-7)',
  'ROC Compliance & Incorporation',
  'SEBI LODR & Secretarial Audit',
  'RBI & FEMA Compliance',
  'IBBI & Insolvency Advisory',
  'NCLT Drafting & Representations',
  'Tax & Statutory Audit',
  'Legal Due Diligence & Agreements',
]

const QUALIFICATIONS = ['CS', 'CA', 'Advocate', 'Other']

const CONTACT_METHODS = [
  { value: 'Email', label: 'Email', placeholder: 'Enter your email address' },
  { value: 'WhatsApp', label: 'WhatsApp', placeholder: 'Enter your WhatsApp number (+91...)' },
  { value: 'Phone', label: 'Phone', placeholder: 'Enter your phone number (+91...)' },
  { value: 'Direct via site', label: 'Direct via site', placeholder: 'Leave preferred reach-out details' },
]

export default function PartnerInterestPage() {
  const [name, setName] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customService, setCustomService] = useState('')
  const [qualification, setQualification] = useState('CS')
  const [experienceYears, setExperienceYears] = useState<string>('')
  const [website, setWebsite] = useState('')
  const [contactPreference, setContactPreference] = useState('Email')
  const [contactValue, setContactValue] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Please enter your firm or individual name.')
      return
    }

    if (selectedServices.length === 0) {
      setErrorMsg('Please select at least one service category.')
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

      const { error } = await supabaseBrowser.from('partner_interests').insert([
        {
          firm_or_individual_name: name.trim(),
          services: selectedServices,
          qualification: qualification || null,
          experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
          website: formattedWebsite,
          contact_preference: contactPreference || null,
          contact_value: contactValue.trim() || null,
          additional_notes: additionalNotes.trim() || null,
          status: 'pending',
        },
      ])

      if (error) {
        console.error('Submission error:', error)
        setErrorMsg('Failed to submit form. Please try again.')
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
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-16">
      {/* HEADER HERO */}
      <section className="bg-navy text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          aria-hidden="true"
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
            <Briefcase className="size-3.5" aria-hidden="true" /> Professional Network
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            List Your Services on CorpLawUpdates<span className="text-gold">.in</span>
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Express interest to list your CS, CA, or legal compliance practice for statutory filings, ROC work, SEBI compliance, and regulatory advisory.
          </p>
        </div>
      </section>

      {/* FORM CONTAINER */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="size-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="size-10" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                Thanks — we&apos;ll review and reach out
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
                Your interest submission has been received. Our team will review your practice details and get in touch with next steps.
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
            <form 
              onSubmit={handleSubmit} 
              className="space-y-8"
            >
              {errorMsg && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium" role="alert">
                  {errorMsg}
                </div>
              )}

              {/* SECTION 1: BASIC DETAILS */}
              <div className="space-y-5">
                <h3 className="font-heading text-lg font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Building2 className="size-5 text-gold" aria-hidden="true" />
                  Practice & Professional Details
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
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
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
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white dark:bg-slate-800 appearance-none"
                      >
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q} className="dark:bg-slate-800 dark:text-slate-100">
                            {q}
                          </option>
                        ))}
                      </select>
                      <Award className="size-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
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
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    />
                    <Globe className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SERVICES OFFERED */}
              <div className="space-y-4 pt-2">
                <h3 className="font-heading text-lg font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <User className="size-5 text-gold" aria-hidden="true" />
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
                            ? 'bg-navy dark:bg-amber-400 text-white dark:text-navy border-navy dark:border-amber-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {service}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
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
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
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
                          className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 text-navy dark:text-white border border-amber-300 dark:border-amber-500/50 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => removeService(service)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: CONTACT & PREFERENCES */}
              <div className="space-y-5 pt-2">
                <h3 className="font-heading text-lg font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <MessageSquare className="size-5 text-gold" aria-hidden="true" />
                  Contact Preference
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Preferred Contact Method
                    </label>
                    <select
                      value={contactPreference}
                      onChange={(e) => setContactPreference(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white dark:bg-slate-800"
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
                      Contact Details
                    </label>
                    <input
                      type="text"
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={
                        CONTACT_METHODS.find((m) => m.value === contactPreference)?.placeholder ||
                        'Enter contact value'
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Tell us more about your practice focus, cities served, or specialized regulatory domain..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gold hover:bg-amber-400 text-navy font-bold px-8 py-3.5 rounded-xl text-base shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Partner Interest'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
