'use client'
import { useState, useEffect } from 'react'
import JsonLd from '@/components/JsonLd'
import {
  calculateDeadlinesFromDB,
  getPenaltySummary,
  getNormalFeeForTracker,
  calculateLateFeeForTracker,
  type CompanyProfile,
  type DeadlineItem,
  type ROCFormDB,
} from '@/lib/calculators/roc-deadlines'

function daysUntilCCFSExpiry(): number {
  const expiry = new Date('2026-07-15')
  const today = new Date()
  return Math.max(0, Math.ceil(
    (expiry.getTime() - today.getTime()) / 
    (1000 * 60 * 60 * 24)
  ))
}

function getDefaultFilingYear(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() // 0-11
  if (month >= 3) {
    const start = year - 1
    const end = year
    return `${start}-${String(end).slice(-2)}`
  } else {
    const start = year - 2
    const end = year - 1
    return `${start}-${String(end).slice(-2)}`
  }
}

export default function ROCTrackerPage() {
  // Forms data from DB
  const [dbForms, setDbForms] = 
    useState<ROCFormDB[]>([])
  const [formsLoading, setFormsLoading] = 
    useState(true)

  // Profile form
  const [profile, setProfile] = 
    useState<Partial<CompanyProfile>>({
      companyName: 'Your Company',
      companyType: 'private',
      financialYearEnd: 'march',
      directorCount: 2,
      hasCS: false,
      isXBRL: false,
      isListed: false,
      hasForeignShareholders: false,
      hasDeposits: false,
      paidUpCapital: 1000000,
      turnover: 5000000,
      hasSBO: false,
      hasResolutions: false,
      hasSubsidiaries: false,
      filingYear: getDefaultFilingYear(),
      hasMSMEDues: false,
      hasPublicDeposits: false,
    })

  // Small Company Manual Override
  const [isSmallCompanyManual, setIsSmallCompanyManual] = useState<boolean | null>(null)

  // Filed forms tracking
  const [filedForms, setFiledForms] = useState<Record<string, { filed: boolean; filingDate?: string }>>({})

  // Results
  const [deadlines, setDeadlines] = 
    useState<DeadlineItem[] | null>(null)
  const [prevDeadlines, setPrevDeadlines] = 
    useState<DeadlineItem[] | null>(null)
  const [activeResultsTab, setActiveResultsTab] = useState<'current' | 'previous'>('current')
  const [calculated, setCalculated] = 
    useState(false)
  const [showAll, setShowAll] = useState(false)

  // Profile saving state
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Reminder modal
  const [showReminderModal, setShowReminderModal] = 
    useState(false)
  const [reminderEmail, setReminderEmail] = 
    useState('')
  const [reminderDays, setReminderDays] = 
    useState([30, 7, 1])
  const [reminderSent, setReminderSent] = 
    useState(false)
  const [reminderLoading, setReminderLoading] = 
    useState(false)

  // Auto-evaluation flags
  const qualifiesAsSmall = 
    profile.companyType === 'private' &&
    (profile.paidUpCapital || 0) <= 100000000 && // 10 Crore
    (profile.turnover || 0) <= 1000000000 && // 100 Crore
    !profile.hasSubsidiaries

  const isSmallCompanyActive = 
    profile.companyType === 'private' &&
    (isSmallCompanyManual !== null ? isSmallCompanyManual : qualifiesAsSmall)

  const csMandatory = 
    profile.companyType !== 'opc' &&
    (profile.paidUpCapital || 0) >= 500000000 // Above 10 Crore

  const xbrlMandatory = 
    profile.isListed ||
    (profile.paidUpCapital || 0) >= 50000000 || // 5 Crore or more
    (profile.turnover || 0) >= 1000000000 // 100 Crore or more

  // Load DB forms on mount
  useEffect(() => {
    fetch('/api/roc/forms')
      .then(r => r.json())
      .then(d => {
        setDbForms(d.forms || [])
      })
      .catch(() => {})
      .finally(() => setFormsLoading(false))
  }, [])

  // Load saved profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('roc_tracker_saved_profile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.incorporationDate) {
          parsed.incorporationDate = new Date(parsed.incorporationDate)
        }
        if (parsed.agmDate) {
          parsed.agmDate = new Date(parsed.agmDate)
        }
        setProfile(parsed)
      } catch (e) {
        console.error('Failed to parse saved profile', e)
      }
    }
    const savedSmall = localStorage.getItem('roc_tracker_small_manual')
    if (savedSmall) {
      try {
        setIsSmallCompanyManual(JSON.parse(savedSmall))
      } catch (e) {}
    }
    const savedFiled = localStorage.getItem('roc_tracker_filed_forms')
    if (savedFiled) {
      try {
        setFiledForms(JSON.parse(savedFiled))
      } catch (e) {
        console.error('Failed to parse filed forms', e)
      }
    }
  }, [])

  function getFullProfile(): CompanyProfile {
    return {
      companyName: profile.companyName || 'Your Company',
      cin: profile.cin || '',
      companyType: profile.companyType || 'private',
      incorporationDate: profile.incorporationDate 
        ? new Date(profile.incorporationDate) 
        : new Date(),
      financialYearEnd: profile.financialYearEnd || 'march',
      paidUpCapital: profile.paidUpCapital || 1000000,
      turnover: profile.turnover || 5000000,
      hasCS: csMandatory ? true : (profile.hasCS || false),
      agmDate: profile.agmDate ? new Date(profile.agmDate) : null,
      directorCount: profile.directorCount || 2,
      isXBRL: xbrlMandatory ? true : (profile.isXBRL || false),
      isListed: profile.isListed || false,
      hasForeignShareholders: profile.hasForeignShareholders || false,
      hasDeposits: (profile.hasDeposits || profile.hasPublicDeposits) || false,
      auditDate: null,
      hasSBO: profile.hasSBO || false,
      hasResolutions: profile.hasResolutions || false,
      hasSubsidiaries: profile.hasSubsidiaries || false,
      filingYear: profile.filingYear || getDefaultFilingYear(),
      hasMSMEDues: profile.hasMSMEDues || false,
      hasPublicDeposits: profile.hasPublicDeposits || false,
    }
  }

  function getPreviousYearProfile(currentProfile: CompanyProfile): CompanyProfile | null {
    if (!currentProfile.filingYear || currentProfile.filingYear === '2024-25') {
      return null
    }
    const parts = currentProfile.filingYear.split('-')
    if (parts.length === 2) {
      const startYear = parseInt(parts[0]) - 1
      const endYear = parseInt(parts[1]) - 1
      const prevYearStr = `${startYear}-${String(endYear).slice(-2)}`
      return {
        ...currentProfile,
        filingYear: prevYearStr
      }
    }
    return null
  }

  function getPreviousYearStr(filingYear: string): string {
    const parts = filingYear.split('-')
    if (parts.length === 2) {
      const startYear = parseInt(parts[0]) - 1
      const endYear = parseInt(parts[1]) - 1
      return `${startYear}-${String(endYear).slice(-2)}`
    }
    return '2024-25'
  }

  function handleCalculate() {
    if (!profile.incorporationDate) {
      alert('Please enter incorporation date')
      return
    }

    const fullProfile = getFullProfile()
    if (isSmallCompanyActive) {
      fullProfile.companyType = 'small'
    }

    const result = calculateDeadlinesFromDB(fullProfile, dbForms)
    setDeadlines(result)

    const prevProfile = getPreviousYearProfile(fullProfile)
    if (prevProfile) {
      const prevResult = calculateDeadlinesFromDB(prevProfile, dbForms)
      const filteredPrev = prevResult.filter(d => 
        ['aoc-4', 'aoc-4 cfs', 'mgt-7', 'mgt-7a', 'adt-1', 'itr-6', 'form-3cd', 'rbi-fla'].includes(d.id)
      )
      setPrevDeadlines(filteredPrev)
    } else {
      setPrevDeadlines(null)
    }

    setCalculated(true)

    // Log usage with adjusted summaries
    const currentYearStr = fullProfile.filingYear || '2025-26'
    const prevYearStr = getPreviousYearStr(currentYearStr)
    const adjustedCurrent = adjustDeadlines(result, currentYearStr)
    const adjustedPrev = prevProfile 
      ? adjustDeadlines(calculateDeadlinesFromDB(prevProfile, dbForms).filter(d => ['aoc-4', 'aoc-4 cfs', 'mgt-7', 'mgt-7a', 'adt-1', 'itr-6', 'form-3cd', 'rbi-fla'].includes(d.id)), prevYearStr)
      : []
    const summaryData = getAdjustedSummary(adjustedCurrent, adjustedPrev)

    fetch('/api/roc/log-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_type: fullProfile.companyType,
        fy_end: fullProfile.financialYearEnd,
        forms_count: result.filter(d => d.isApplicable).length,
        overdue_count: summaryData.overdueCount,
        total_penalty: summaryData.totalNormalPenalty,
      })
    }).catch(() => {})

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  async function handleSaveProfile() {
    if (!profile.companyName || !profile.incorporationDate) {
      alert('Please enter company name and incorporation date first')
      return
    }

    setProfileSaving(true)
    try {
      let sessionId = localStorage.getItem('roc_tracker_session_id')
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('roc_tracker_session_id', sessionId)
      }

      localStorage.setItem('roc_tracker_saved_profile', JSON.stringify(profile))
      localStorage.setItem('roc_tracker_small_manual', JSON.stringify(isSmallCompanyManual))
      localStorage.setItem('roc_tracker_filed_forms', JSON.stringify(filedForms))

      const res = await fetch('/api/roc/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          session_id: sessionId,
          user_email: reminderEmail || null
        })
      })
      const data = await res.json()
      if (data.success) {
        setProfileSaved(true)
        setTimeout(() => setProfileSaved(false), 3000)
      } else {
        alert('Failed to save profile: ' + (data.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error saving profile: ' + err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleSetReminder() {
    if (!reminderEmail) {
      alert('Please enter your email address')
      return
    }
    setReminderLoading(true)
    try {
      const res = await fetch('/api/roc/set-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: reminderEmail,
          company_name: profile.companyName || 'Your Company',
          remind_days_before: reminderDays,
          remind_for_forms: [],
        })
      })
      const data = await res.json()
      if (data.success) {
        setReminderSent(true)
        setTimeout(() => {
          setShowReminderModal(false)
          setReminderSent(false)
        }, 3000)
      }
    } finally {
      setReminderLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'ROC Deadline Tracker',
        text: `Check ROC deadlines for ${profile.companyName || 'your company'} at CorpLawUpdates.in`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    }
  }

  function handleToggleFiled(formId: string, year: string, checked: boolean) {
    const key = `${formId.toLowerCase()}_${year}`
    setFiledForms(prev => {
      const updated = {
        ...prev,
        [key]: {
          filed: checked,
          filingDate: checked ? new Date().toISOString().split('T')[0] : undefined
        }
      }
      localStorage.setItem('roc_tracker_filed_forms', JSON.stringify(updated))
      return updated
    })
  }

  function handleUpdateFilingDate(formId: string, year: string, dateStr: string) {
    const key = `${formId.toLowerCase()}_${year}`
    setFiledForms(prev => {
      const updated = {
        ...prev,
        [key]: {
          filed: true,
          filingDate: dateStr || undefined
        }
      }
      localStorage.setItem('roc_tracker_filed_forms', JSON.stringify(updated))
      return updated
    })
  }

  // Adjust raw deadline items based on filed status and MSME/deposit rules
  function adjustDeadlines(items: DeadlineItem[] | null, year: string): DeadlineItem[] {
    if (!items) return []

    return items.map(d => {
      const key = `${d.id}_${year}`
      const filedInfo = filedForms[key]

      // Custom rule adjustments for applicability in frontend
      let isApplicable = d.isApplicable
      let notApplicableReason = d.notApplicableReason

      if (d.id === 'msme-1') {
        isApplicable = d.isApplicable && !!profile.hasMSMEDues
        if (!isApplicable) {
          notApplicableReason = 'Only applicable if company has outstanding dues to MSME suppliers > 45 days'
        }
      }

      if (d.id === 'dpt-3') {
        isApplicable = d.isApplicable && (!!profile.hasDeposits || !!profile.hasPublicDeposits)
        if (!isApplicable) {
          notApplicableReason = 'Only applicable if company has outstanding loans or deposits as on 31st March'
        }
      }

      if (d.id === 'rbi-fla') {
        isApplicable = d.isApplicable && !!profile.hasForeignShareholders
        if (!isApplicable) {
          notApplicableReason = 'Only applicable if company has foreign shareholders or FDI/ODI'
        }
      }

      if (d.id === 'form-3cd') {
        isApplicable = d.isApplicable && (profile.turnover || 0) > 20000000
        if (!isApplicable) {
          notApplicableReason = 'Only applicable if annual turnover exceeds ₹2 Crore (or ₹10 Crore under specific conditions)'
        }
      }

      if (d.id === 'itr-6') {
        if (profile.companyType === 'section8') {
          d.formName = 'ITR-7'
          d.description = `Income Tax Return (ITR-7) — ${year}`
          d.legalSection = 'Section 139(4A) / 139(4C) of the Income Tax Act, 1961'
        } else {
          d.formName = 'ITR-6'
          d.description = `Income Tax Return (ITR-6) — ${year}`
          d.legalSection = 'Section 139(1) of the Income Tax Act, 1961'
        }
      }

      if (d.id === 'board-meetings') {
        isApplicable = d.isApplicable && profile.companyType !== 'opc'
        if (profile.companyType === 'opc') {
          notApplicableReason = 'Exempt for One Person Company (OPC) if there is only one director'
        } else if (isSmallCompanyActive) {
          d.description = `Board Meetings (Min 2, one in each half calendar year) — ${year}`
          d.legalSection = 'Section 173(5) of the Companies Act, 2013'
        } else {
          d.description = `Board Meetings (Min 4, max 120-day interval) — ${year}`
          d.legalSection = 'Section 173(1) of the Companies Act, 2013'
        }
      }

      if (filedInfo?.filed) {
        const filingDate = filedInfo.filingDate ? new Date(filedInfo.filingDate) : null
        
        if (filingDate) {
          const dueDateTime = d.dueDate.getTime()
          const filingDateTime = filingDate.getTime()
          
          const diffTime = filingDateTime - dueDateTime
          const delayDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
          
          const origForm = dbForms.find(f => f.form_code.toLowerCase() === d.id)
          let currentPenalty = 0
          let ccfsPenalty = 0
          
          if (origForm) {
            const normalFee = getNormalFeeForTracker(
              origForm.form_code,
              profile.companyType || 'private',
              profile.paidUpCapital || 1000000
            )
            currentPenalty = calculateLateFeeForTracker(
              origForm.form_code,
              delayDays,
              normalFee,
              profile.turnover || 5000000,
              origForm.flat_late_fee
            )
            const ccfsExpiryDate = new Date(origForm.ccfs_expiry || '2026-07-15')
            const ccfsEligible = origForm.ccfs_eligible && filingDate <= ccfsExpiryDate
            if (ccfsEligible) {
              const waiver = origForm.ccfs_waiver_percent || 90
              ccfsPenalty = Math.ceil(currentPenalty * (1 - waiver / 100))
            } else {
              ccfsPenalty = currentPenalty
            }
          }

          return {
            ...d,
            isApplicable,
            notApplicableReason,
            status: 'upcoming',
            daysRemaining: 0,
            currentPenalty: 0,
            ccfsPenalty: 0,
            ccfsSavings: 0,
            isFiled: true,
            actualFilingDate: filingDate,
            calculatedLateFee: currentPenalty,
            calculatedCcfsLateFee: ccfsPenalty,
          } as any
        } else {
          return {
            ...d,
            isApplicable,
            notApplicableReason,
            status: 'upcoming',
            daysRemaining: 0,
            currentPenalty: 0,
            ccfsPenalty: 0,
            ccfsSavings: 0,
            isFiled: true,
            actualFilingDate: null,
            calculatedLateFee: 0,
            calculatedCcfsLateFee: 0,
          } as any
        }
      }

      return {
        ...d,
        isApplicable,
        notApplicableReason,
        isFiled: false,
      } as any
    })
  }

  function getAdjustedSummary(currList: DeadlineItem[], prevList: DeadlineItem[]) {
    let overdueCount = 0
    let dueSoonCount = 0
    let totalNormalPenalty = 0
    let totalCCFSPenalty = 0
    let totalSavings = 0

    const combined = [...currList, ...prevList]

    for (const item of combined) {
      if (item.isApplicable && !(item as any).isFiled) {
        if (item.status === 'overdue') {
          overdueCount++
        } else if (item.status === 'due-soon') {
          dueSoonCount++
        }
        totalNormalPenalty += item.currentPenalty || 0
        totalCCFSPenalty += item.ccfsPenalty || 0
        totalSavings += item.ccfsSavings || 0
      }
    }

    return {
      overdueCount,
      dueSoonCount,
      totalNormalPenalty,
      totalCCFSPenalty,
      totalSavings,
    }
  }

  const currentYear = profile.filingYear || '2025-26'
  const previousYear = getPreviousYearStr(currentYear)

  const adjustedCurrentDeadlines = adjustDeadlines(deadlines, currentYear)
  const adjustedPrevDeadlines = adjustDeadlines(prevDeadlines, previousYear)

  const summary = deadlines 
    ? getAdjustedSummary(adjustedCurrentDeadlines, adjustedPrevDeadlines) 
    : null

  const ccfsDaysLeft = daysUntilCCFSExpiry()

  const currentVisibleDeadlines = showAll
    ? adjustedCurrentDeadlines
    : adjustedCurrentDeadlines.filter(d => d.isApplicable)

  const prevVisibleDeadlines = showAll
    ? adjustedPrevDeadlines
    : adjustedPrevDeadlines.filter(d => d.isApplicable)

  const activeVisibleDeadlines = activeResultsTab === 'current'
    ? currentVisibleDeadlines
    : prevVisibleDeadlines

  const statusColors = {
    overdue: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/30',
    'due-soon': 'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
    upcoming: 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30',
    'not-applicable': 'border-l-4 border-l-slate-300 bg-slate-50 dark:bg-slate-800/30 opacity-60',
  }

  const inputClass = `w-full border border-slate-200 
    dark:border-slate-700 rounded-xl px-4 py-2.5 
    text-sm text-navy dark:text-slate-100 
    bg-white dark:bg-slate-800 
    focus:outline-none focus:ring-2 
    focus:ring-amber-400`

  return (
    <div className="min-h-screen bg-slate-50 
                    dark:bg-slate-950 
                    print:bg-white transition-colors duration-200">
      
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            'name': 'ROC Compliance Deadline Tracker',
            'applicationCategory': 'BusinessApplication',
            'operatingSystem': 'Any',
            'url': 'https://www.corplawupdates.in/tools/roc-tracker',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'INR'
            }
          },
          {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
              { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
              { '@type': 'ListItem', position: 3, name: 'ROC Tracker', item: 'https://www.corplawupdates.in/tools/roc-tracker' }
            ]
          }
        ]
      }} />
      
      {/* CCFS Countdown banner */}
      {ccfsDaysLeft > 0 && ccfsDaysLeft <= 60 && (
        <div className="bg-green-600 text-white 
                        py-2 px-4 text-center 
                        text-sm font-semibold 
                        print:hidden">
          🎉 CCFS 2026 Scheme closes in 
          {' '}<strong>{ccfsDaysLeft} days</strong> 
          {' '}(15 July 2026) — Save 90% on late fees!
          {' '}<a href="/updates/mca-introduces-companies-compliance-facilitation-scheme-2026-ccfs-2026-big-relief-for-defaulting-companies"
              className="underline ml-2">
            Learn more →
          </a>
        </div>
      )}

      {/* Hero */}
      <div className="bg-navy py-10 px-4 print:hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 
                          bg-amber-400/20 text-amber-400 
                          text-xs font-bold px-3 py-1.5 
                          rounded-full mb-4 uppercase">
            Free · Personalized · Updated June 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-bold 
                         text-white font-heading mb-3">
            ROC Deadline Tracker
          </h1>
          <p className="text-slate-400 text-sm 
                        max-w-xl mx-auto">
            Enter your company details once. 
            Instantly see all personalized 
            ROC deadlines, exact penalties 
            and CCFS 2026 savings.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 
                          mt-6 flex-wrap">
            {[
              { v: `${dbForms.length || 12}`, l: 'ROC Forms Tracked' },
              { v: 'Live', l: 'Updated June 2026' },
              { v: 'CCFS', l: 'Savings Shown' },
              { v: 'Free', l: 'No Registration' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-bold 
                                text-amber-400">{s.v}</div>
                <div className="text-slate-400 text-xs">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Print header */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">
            ROC Deadline Report — {profile.companyName}
          </h1>
          <p className="text-gray-600 text-sm">
            Generated by CorpLawUpdates.in on{' '}
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        {/* Company Profile Form */}
        <div className="bg-white dark:bg-[#111827] 
                        rounded-3xl border border-slate-200/60 
                        dark:border-white/8 
                        shadow-2xl shadow-slate-100 dark:shadow-none
                        overflow-hidden mb-8 
                        print:hidden">
          
          <div className="bg-gradient-to-r from-navy via-slate-900 to-navy
                          border-b border-slate-200 
                          dark:border-slate-800 
                          px-6 py-5 flex items-center 
                          justify-between">
            <div>
              <h2 className="font-extrabold text-white text-lg font-heading tracking-tight">
                🏢 Company Intake Profile
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {formsLoading 
                  ? '⏳ Syncing latest MCA compliance rules...'
                  : `✔️ ${dbForms.length} MCA forms loaded and active`}
              </p>
            </div>
            {!formsLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live Rules
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            
            {/* CS Violation Alert Banner */}
            {csMandatory && !profile.hasCS && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3 items-start animate-pulse">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-extrabold text-red-600 dark:text-red-400 font-heading">
                    Mandatory CS Appointment Violation (Section 203)
                  </p>
                  <p className="text-xs text-red-500/80 dark:text-red-400/80 mt-1 leading-relaxed">
                    Private companies with paid-up capital of <strong>₹10 Crore or more</strong> are mandatorily required to appoint a whole-time Company Secretary (CS). Failure to comply attracts a penalty of <strong>₹5 Lakh</strong> on the company and <strong>₹50,000 + ₹1,000 per day</strong> on every defaulting director.
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: Core Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                01. Core Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Company Name
                  </label>
                  <input type="text"
                    value={profile.companyName || ''}
                    onChange={e => setProfile(p => ({
                      ...p, companyName: e.target.value
                    }))}
                    placeholder="e.g. Acme Private Limited"
                    className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    CIN (Corporate Identity Number)
                  </label>
                  <input type="text"
                    value={profile.cin || ''}
                    onChange={e => setProfile(p => ({
                      ...p, cin: e.target.value
                    }))}
                    placeholder="U74999MH2024PTC123456"
                    className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Date of Incorporation *
                  </label>
                  <input type="date"
                    value={profile.incorporationDate 
                      ? new Date(profile.incorporationDate).toISOString().split('T')[0]
                      : ''}
                    onChange={e => setProfile(p => ({
                      ...p, incorporationDate: e.target.value ? new Date(e.target.value) : undefined
                    }))}
                    className={inputClass} />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* Section 2: Financial Slabs & Classification */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                02. Size & Capital Slabs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Company Type *
                  </label>
                  <select
                    value={profile.companyType}
                    onChange={e => {
                      const val = e.target.value as any
                      setProfile(p => ({
                        ...p, 
                        companyType: val,
                        // Reset manual CS if OPC selected
                        hasCS: val === 'opc' ? false : p.hasCS
                      }))
                    }}
                    className={inputClass}>
                    <option value="private">Private Limited</option>
                    <option value="public">Public Limited</option>
                    <option value="opc">One Person Company (OPC)</option>
                    <option value="section8">Section 8 (Charity/NGO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Filing Financial Year *
                  </label>
                  <select
                    value={profile.filingYear || '2025-26'}
                    onChange={e => setProfile(p => ({
                      ...p, filingYear: e.target.value
                    }))}
                    className={inputClass}>
                    <option value="2024-25">FY 2024-25 (Previous Year)</option>
                    <option value="2025-26">FY 2025-26 (Current Year)</option>
                    <option value="2026-27">FY 2026-27 (Next Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Financial Year End
                  </label>
                  <select
                    value={profile.financialYearEnd}
                    onChange={e => setProfile(p => ({
                      ...p, financialYearEnd: e.target.value as any
                    }))}
                    className={inputClass}>
                    <option value="march">31st March (Standard)</option>
                    <option value="september">30th September (Alternate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Paid-up Capital
                  </label>
                  <select
                    value={profile.paidUpCapital}
                    onChange={e => setProfile(p => ({
                      ...p, paidUpCapital: Number(e.target.value)
                    }))}
                    className={inputClass}>
                    <option value={100000}>Up to ₹1 Lakh</option>
                    <option value={1000000}>₹1–10 Lakh</option>
                    <option value={10000000}>₹10 Lakh–1 Crore</option>
                    <option value={40000000}>₹1–4 Crore</option>
                    <option value={50000000}>₹4–5 Crore</option>
                    <option value={100000000}>₹5–10 Crore</option>
                    <option value={500000000}>Above ₹10 Crore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Annual Turnover
                  </label>
                  <select
                    value={profile.turnover}
                    onChange={e => setProfile(p => ({
                      ...p, turnover: Number(e.target.value)
                    }))}
                    className={inputClass}>
                    <option value={20000000}>Up to ₹2 Crore</option>
                    <option value={400000000}>₹2–40 Crore</option>
                    <option value={1000000000}>₹40–100 Crore</option>
                    <option value={5000000000}>Above ₹100 Crore</option>
                  </select>
                </div>

                {profile.companyType !== 'opc' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Last AGM Date
                    </label>
                    <input type="date"
                      value={profile.agmDate 
                        ? new Date(profile.agmDate).toISOString().split('T')[0]
                        : ''}
                      onChange={e => setProfile(p => ({
                        ...p, agmDate: e.target.value ? new Date(e.target.value) : null
                      }))}
                      className={inputClass} />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 opacity-60">
                      Last AGM Date
                    </label>
                    <input type="text"
                      disabled
                      value="Not Applicable (OPC is exempt)"
                      className={`${inputClass} opacity-60 bg-slate-100 dark:bg-slate-900`} />
                  </div>
                )}
              </div>

              {/* Small Company Evaluation Alert / Toggle */}
              {profile.companyType === 'private' && (
                <div className="mt-4">
                  {qualifiesAsSmall ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">
                          🎉 Qualifies as a Small Company (Section 2(85))
                        </p>
                        <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                          Paid-up Capital $\le$ ₹10 Cr and Turnover $\le$ ₹100 Cr. Concessions applied: abridged return (MGT-7A) and 50% penalty relief.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-emerald-600 transition-colors shadow-sm self-start md:self-auto">
                        <input
                          type="checkbox"
                          checked={isSmallCompanyActive}
                          onChange={e => setIsSmallCompanyManual(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600 cursor-pointer"
                        />
                        Apply Concessions
                      </label>
                    </div>
                  ) : (
                    <div className="bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                      <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 font-heading">
                        ℹ️ Standard Private Limited Compliance
                      </p>
                      <p className="text-[11px] text-slate-500/80 dark:text-slate-400/80 mt-0.5">
                        {profile.hasSubsidiaries 
                          ? 'Holding, subsidiary, or joint venture companies are legally excluded from Small Company concessions under Section 2(85).'
                          : 'Paid-up Capital exceeds ₹10 Crore or Turnover exceeds ₹100 Crore. Standard compliance rules and normal filing fees apply.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* Section 3: Compliance profile questionnaire */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                03. Governance & Borrowing Profile
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Panel A: Structure & Governance */}
                <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-heading border-b border-slate-200/40 dark:border-slate-800 pb-2">
                    🔑 Management & Structure
                  </h4>
                  
                  <div className="space-y-2.5">
                    {/* CS Appointment toggle */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          👩💼 Appointed Whole-time CS
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {csMandatory ? 'Required by capital slab (>= 10Cr)' : 'Required if paid-up capital >= 10Cr'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        disabled={csMandatory}
                        checked={csMandatory ? true : (profile.hasCS || false)}
                        onChange={e => setProfile(p => ({ ...p, hasCS: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 disabled:opacity-50 cursor-pointer"
                      />
                    </div>

                    {/* Listed Company */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          📈 Listed on stock exchange
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Triggers Demat audits (PAS-6) and XBRL
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.isListed || false}
                        onChange={e => setProfile(p => ({ ...p, isListed: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Subsidiaries / Associates / JVs */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          🏢 Has Subsidiaries / JVs / Associates
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Triggers Consolidated Accounts (AOC-4 CFS)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasSubsidiaries || false}
                        onChange={e => {
                          const checked = e.target.checked
                          setProfile(p => ({ ...p, hasSubsidiaries: checked }))
                          if (checked) {
                            // If holding/subsidiary, turn off small manual concessions
                            setIsSmallCompanyManual(false)
                          }
                        }}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel B: Borrowings, Loans & Vendor Dues */}
                <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-heading border-b border-slate-200/40 dark:border-slate-800 pb-2">
                    💸 Transactions & Vendor Liabilities
                  </h4>

                  <div className="space-y-2.5">
                    {/* Loans from Members/Directors */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          📋 Outstanding Member / Director Loans
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Requires DPT-3 return of exempted deposits
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasDeposits || false}
                        onChange={e => setProfile(p => ({ ...p, hasDeposits: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Accepted Public Deposits */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          💰 Accepted Public Deposits
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Requires auditor certificate and Form DPT-3
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasPublicDeposits || false}
                        onChange={e => setProfile(p => ({ ...p, hasPublicDeposits: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* MSME Outstanding Dues */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          ⚖️ Outstanding MSME supplier dues &gt; 45d
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Triggers Form MSME-1 half-yearly returns
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasMSMEDues || false}
                        onChange={e => setProfile(p => ({ ...p, hasMSMEDues: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel C: Shareholders & Ownership */}
                <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-heading border-b border-slate-200/40 dark:border-slate-800 pb-2">
                    🌍 Ownership & Shareholding
                  </h4>

                  <div className="space-y-2.5">
                    {/* Foreign Shareholders */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          🌍 Has Foreign Shareholders / Directors
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Requires RBI FLA return and compliance
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasForeignShareholders || false}
                        onChange={e => setProfile(p => ({ ...p, hasForeignShareholders: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* SBO Declarations */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          🔍 Has SBO Declarations (BEN-1)
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Triggers Form BEN-2 declaration filing
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasSBO || false}
                        onChange={e => setProfile(p => ({ ...p, hasSBO: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel D: Filings & Audits */}
                <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-heading border-b border-slate-200/40 dark:border-slate-800 pb-2">
                    📊 Filing Slabs & Form Triggers
                  </h4>

                  <div className="space-y-2.5">
                    {/* XBRL Filing */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          📊 XBRL filing format required
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {xbrlMandatory ? 'Mandated by size limits' : 'Required if Capital >= 5Cr or Turnover >= 100Cr'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        disabled={xbrlMandatory}
                        checked={xbrlMandatory ? true : (profile.isXBRL || false)}
                        onChange={e => setProfile(p => ({ ...p, isXBRL: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 disabled:opacity-50 cursor-pointer"
                      />
                    </div>

                    {/* Passed special resolutions */}
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          📜 Passed board / special resolutions
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Requires Form MGT-14 filing within 30 days
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasResolutions || false}
                        onChange={e => setProfile(p => ({ ...p, hasResolutions: e.target.checked }))}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-white/5 flex flex-col md:flex-row gap-3">
            <button
              onClick={handleCalculate}
              disabled={formsLoading}
              className="flex-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 bg-[length:200%_auto] hover:bg-right text-navy font-black py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 hover:-translate-y-0.5 disabled:opacity-50">
              {formsLoading 
                ? '⏳ Syncing Latest MCA Rules...' 
                : '📋 Calculate My ROC Deadlines →'}
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="md:w-1/3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold py-4 rounded-2xl text-sm transition-all shadow-md disabled:opacity-50">
              {profileSaving ? 'Saving...' : profileSaved ? 'Saved! ✓' : '💾 Save Profile'}
            </button>
          </div>
        </div>

        {calculated && deadlines && summary && (
          <div id="results" 
               className="space-y-6 
                          animate-in fade-in 
                          duration-300">

            {/* Summary stats */}
            <div className="grid grid-cols-2 
                            md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Pending Overdue',
                  value: summary.overdueCount,
                  bg: 'bg-red-600',
                  icon: '🔴',
                },
                {
                  label: 'Due in 30 days',
                  value: summary.dueSoonCount,
                  bg: 'bg-amber-500',
                  icon: '⚡',
                },
                {
                  label: 'Penalty Today',
                  value: `₹${summary.totalNormalPenalty.toLocaleString('en-IN')}`,
                  bg: 'bg-slate-700 dark:bg-slate-600',
                  icon: '💰',
                },
                {
                  label: 'Save via CCFS',
                  value: `₹${summary.totalSavings.toLocaleString('en-IN')}`,
                  bg: summary.totalSavings > 0 
                    ? 'bg-green-600' 
                    : 'bg-slate-600',
                  icon: '🎉',
                },
              ].map(stat => (
                <div key={stat.label}
                  className={`${stat.bg} text-white 
                    rounded-2xl p-4 text-center`}>
                  <div className="text-2xl mb-1">
                    {stat.icon}
                  </div>
                  <div className="text-xl font-black">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-xs">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Critical Compliance Violations / Warnings Box */}
            {( (csMandatory && !profile.hasCS) || 
               (!qualifiesAsSmall && isSmallCompanyActive) ||
               (profile.hasMSMEDues && !filedForms[`msme-1_${currentYear}`]?.filed) ||
               ((profile.hasDeposits || profile.hasPublicDeposits) && !filedForms[`dpt-3_${currentYear}`]?.filed) ||
               (profile.hasForeignShareholders && !filedForms[`rbi-fla_${currentYear}`]?.filed) ||
               ((profile.turnover || 0) > 20000000 && !filedForms[`form-3cd_${currentYear}`]?.filed) ||
               (!filedForms[`itr-6_${currentYear}`]?.filed) ||
               (profile.companyType !== 'opc' && !filedForms[`board-meetings_${currentYear}`]?.filed) ) && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 space-y-3">
                <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 font-heading flex items-center gap-2">
                  ⚠️ Critical Compliance Warnings
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
                  {csMandatory && !profile.hasCS && (
                    <li>
                      <strong>Section 203 CS Default:</strong> Whole-time Company Secretary has not been appointed despite paid-up capital being $\ge$ ₹10 Crore.
                    </li>
                  )}
                  {!qualifiesAsSmall && isSmallCompanyActive && (
                    <li>
                      <strong>Small Company Limit Warning:</strong> Claiming Small Company concessions, but Paid-up Capital or Turnover exceeds limits (₹10 Cr / ₹100 Cr).
                    </li>
                  )}
                  {profile.hasMSMEDues && !filedForms[`msme-1_${currentYear}`]?.filed && (
                    <li>
                      <strong>Pending MSME Dues Return:</strong> Outstanding payments to MSMEs exceed 45 days. Must file Form MSME-1 twice a year to avoid fixed penalties up to ₹3,0,000.
                    </li>
                  )}
                  {(profile.hasDeposits || profile.hasPublicDeposits) && !filedForms[`dpt-3_${currentYear}`]?.filed && (
                    <li>
                      <strong>Outstanding Loans/Deposits:</strong> Outstanding borrowings or deposits require annual Form DPT-3 filing by 30th June to avoid a flat penalty of ₹50,000.
                    </li>
                  )}
                  {profile.hasForeignShareholders && !filedForms[`rbi-fla_${currentYear}`]?.filed && (
                    <li>
                      <strong>Pending RBI FLA Return:</strong> Foreign shareholding requires annual FLA return filing on the RBI FLAIR portal by 15th July to avoid FEMA penalties (₹7,500 Late Submission Fee).
                    </li>
                  )}
                  {(profile.turnover || 0) > 20000000 && !filedForms[`form-3cd_${currentYear}`]?.filed && (
                    <li>
                      <strong>Mandatory Tax Audit (Form 3CD):</strong> Turnover exceeds ₹2 Crore, requiring a Tax Audit Report under Section 44AB by 30th September. Non-compliance attracts a penalty of 0.5% of turnover (max ₹1.5 Lakh).
                    </li>
                  )}
                  {!filedForms[`itr-6_${currentYear}`]?.filed && (
                    <li>
                      <strong>Income Tax Return ({profile.companyType === 'section8' ? 'ITR-7' : 'ITR-6'}):</strong> Annual income tax return must be filed by 31st October to avoid late filing fees under Section 234F (up to ₹5,000) and interest on unpaid tax.
                    </li>
                  )}
                  {profile.companyType !== 'opc' && !filedForms[`board-meetings_${currentYear}`]?.filed && (
                    <li>
                      <strong>Board Meetings Compliance:</strong> Ensure minimum board meetings are held and recorded in the minutes book (Notice, Agenda, and signed Minutes required). Default attracts a penalty of up to ₹10,000 under Section 450.
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap 
                            print:hidden">
              <button
                onClick={() => setShowReminderModal(true)}
                className="flex items-center gap-2 
                           bg-blue-600 text-white 
                           font-semibold text-sm 
                           px-4 py-2.5 rounded-xl 
                           hover:bg-blue-700 
                           transition-colors">
                🔔 Set Email Reminders
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 
                           bg-white dark:bg-slate-800 
                           border border-slate-200 
                           dark:border-slate-700 
                           text-navy dark:text-white 
                           font-semibold text-sm 
                           px-4 py-2.5 rounded-xl 
                           hover:border-amber-400 
                           transition-colors">
                🖨️ Print / Save PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 
                           bg-white dark:bg-slate-800 
                           border border-slate-200 
                           dark:border-slate-700 
                           text-navy dark:text-white 
                           font-semibold text-sm 
                           px-4 py-2.5 rounded-xl 
                           hover:border-amber-400 
                           transition-colors">
                🔗 Share
              </button>
              <a href="/tools/fee-calculator"
                 className="flex items-center gap-2 
                            bg-white dark:bg-slate-800 
                            border border-slate-200 
                            dark:border-slate-700 
                            text-navy dark:text-white 
                            font-semibold text-sm 
                            px-4 py-2.5 rounded-xl 
                            hover:border-amber-400 
                            transition-colors">
                🧮 Calculate Exact Fees
              </a>
            </div>

            {/* CCFS Alert */}
            {summary.totalSavings > 0 && (
              <div className="bg-green-50 
                              dark:bg-green-950/30 
                              border border-green-200 
                              rounded-2xl p-5 
                              flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">
                  💡
                </span>
                <div>
                  <p className="font-bold text-green-900 
                                dark:text-green-300">
                    Save ₹{summary.totalSavings.toLocaleString('en-IN')} 
                    under CCFS 2026!
                  </p>
                  <p className="text-green-700 
                                dark:text-green-400 
                                text-sm mt-1">
                    Pay only 10% of accumulated 
                    additional fees. 
                    Scheme closes in{' '}
                    <strong>
                      {ccfsDaysLeft} days 
                      (15 July 2026)!
                    </strong>
                  </p>
                  <a href="/updates/mca-introduces-companies-compliance-facilitation-scheme-2026-ccfs-2026-big-relief-for-defaulting-companies"
                     className="text-green-700 
                                dark:text-green-300 
                                underline text-sm 
                                font-bold mt-2 
                                inline-block">
                    File under CCFS 2026 →
                  </a>
                </div>
              </div>
            )}

            {/* Segment Controls for Current vs Previous Year Filings */}
            {prevDeadlines && prevDeadlines.length > 0 && (
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 print:hidden">
                <button
                  onClick={() => setActiveResultsTab('current')}
                  className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
                    activeResultsTab === 'current'
                      ? 'border-amber-400 text-navy dark:text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  📅 FY {currentYear} Filings (Current)
                </button>
                <button
                  onClick={() => setActiveResultsTab('previous')}
                  className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
                    activeResultsTab === 'previous'
                      ? 'border-amber-400 text-navy dark:text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  ⏳ FY {previousYear} Filings (Remaining / Maybe Filed)
                </button>
              </div>
            )}

            {/* Toggle Show All */}
            <div className="flex items-center 
                            justify-between">
              <h2 className="text-xl font-bold 
                             text-navy dark:text-white 
                             font-heading">
                Deadline Report — {profile.companyName || 'Your Company'}
                {activeResultsTab === 'previous' ? ` (FY ${previousYear})` : ` (FY ${currentYear})`}
              </h2>
              <button
                onClick={() => setShowAll(p => !p)}
                className="text-xs text-amber-600 
                           font-semibold underline 
                           print:hidden">
                {showAll 
                  ? 'Hide non-applicable' 
                  : 'Show all forms'}
              </button>
            </div>

            {/* Previous Year Alert Banner */}
            {activeResultsTab === 'previous' && (
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400">
                💡 <strong>Prior Year Annual Checklist:</strong> These are the core annual filings for the previous financial year (FY {previousYear}). If you have already filed them, mark them as Filed and input the filing date to compute past fees. If they are still pending, massive penalties will apply.
              </div>
            )}

            {/* Deadline List */}
            <div className="space-y-3">
              {(activeVisibleDeadlines || []).map(d => {
                const isFiled = (d as any).isFiled
                const borderClass = isFiled
                  ? 'border-l-4 border-l-green-500 bg-green-50/20 dark:bg-green-950/10 border border-slate-200 dark:border-slate-700'
                  : statusColors[d.status]

                return (
                  <div key={d.id}
                       className={`rounded-2xl overflow-hidden bg-white dark:bg-slate-800 ${borderClass}`}>
                    <div className="p-4 md:p-5">
                      <div className="flex items-start 
                                      justify-between 
                                      gap-3">
                        <div className="min-w-0 flex-1">
                          
                          {/* Header row */}
                          <div className="flex items-center 
                                          gap-2 mb-1.5 
                                          flex-wrap">
                            <span className="font-black 
                                             text-navy 
                                             dark:text-white 
                                             text-base">
                              {d.formName}
                            </span>
                            
                            {/* Status badge */}
                            {isFiled ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                ✔️ Filed
                              </span>
                            ) : (
                              <span className={`text-xs 
                                px-2 py-0.5 rounded-full 
                                font-bold
                                ${d.status === 'overdue' 
                                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                  : d.status === 'due-soon'
                                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                                  : d.status === 'upcoming'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                {d.status === 'overdue' 
                                  ? `🔴 ${d.dueDate < new Date() ? `${Math.abs(d.daysRemaining)}d overdue` : 'Overdue'}`
                                  : d.status === 'due-soon'
                                  ? `⚡ ${d.daysRemaining}d left`
                                  : d.status === 'upcoming'
                                  ? `🟢 ${d.daysRemaining}d`
                                  : '⚪ N/A'}
                              </span>
                            )}

                            {/* Priority badge */}
                            {d.priority === 'critical' && 
                             d.isApplicable && (
                              <span className="text-xs 
                                               bg-red-600 
                                               text-white 
                                               px-2 py-0.5 
                                               rounded-full 
                                               font-bold">
                                CRITICAL
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-slate-600 
                                        dark:text-slate-300">
                            {d.description}
                          </p>

                          {/* Due date */}
                          {d.isApplicable && (
                            <p className="text-xs 
                                          text-slate-500 
                                          dark:text-slate-400 
                                          mt-1">
                              📅 Due Date: {d.dueDate
                                .toLocaleDateString(
                                  'en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  }
                                )}
                            </p>
                          )}

                          {/* Not applicable reason */}
                          {!d.isApplicable && 
                           d.notApplicableReason && (
                            <p className="text-xs 
                                          text-slate-400 
                                          italic mt-1">
                              {d.notApplicableReason}
                            </p>
                          )}

                          {/* Filed Date & Late Fee Paid details */}
                          {isFiled && (d as any).calculatedLateFee > 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                              ⚠️ Delayed Filing: Late fee paid/payable: <strong>₹{(d as any).calculatedLateFee.toLocaleString('en-IN')}</strong>
                              {(d as any).calculatedCcfsLateFee < (d as any).calculatedLateFee && (
                                <span> (CCFS rate paid: <strong>₹{(d as any).calculatedCcfsLateFee.toLocaleString('en-IN')}</strong>)</span>
                              )}
                            </p>
                          )}

                          {/* Interactive Mark-As-Filed controls */}
                          {d.isApplicable && (
                            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 print:hidden">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400">
                                <input
                                  type="checkbox"
                                  checked={isFiled || false}
                                  onChange={e => handleToggleFiled(d.id, activeResultsTab === 'current' ? currentYear : previousYear, e.target.checked)}
                                  className="w-4 h-4 accent-emerald-500 rounded"
                                />
                                Mark as Filed
                              </label>

                              {isFiled && (
                                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                                  <span className="text-slate-400 text-[10px] uppercase font-bold">Filing Date:</span>
                                  <input
                                    type="date"
                                    value={(d as any).actualFilingDate ? new Date((d as any).actualFilingDate).toISOString().split('T')[0] : ''}
                                    onChange={e => handleUpdateFilingDate(d.id, activeResultsTab === 'current' ? currentYear : previousYear, e.target.value)}
                                    className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Penalty column for active unfiled forms */}
                        {d.isApplicable && 
                         !isFiled &&
                         d.currentPenalty > 0 && (
                          <div className="text-right 
                                          flex-shrink-0 
                                          ml-3">
                            <p className="text-xs 
                                          text-slate-400 
                                          line-through">
                              ₹{d.currentPenalty.toLocaleString('en-IN')}
                            </p>
                            {d.ccfsEligible ? (
                              <p className="text-green-700 
                                            dark:text-green-400 
                                            font-bold text-sm">
                                ₹{d.ccfsPenalty.toLocaleString('en-IN')}
                                <span className="block 
                                                 text-xs 
                                                 font-normal">
                                  with CCFS
                                </span>
                              </p>
                            ) : (
                              <p className="text-red-600 
                                            font-bold text-sm">
                                ₹{d.currentPenalty.toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer row */}
                      {d.isApplicable && (
                        <div className="flex items-center 
                                        justify-between 
                                        mt-3 pt-3 
                                        border-t 
                                        border-slate-100 
                                        dark:border-slate-700">
                          <p className="text-xs 
                                        text-slate-400 
                                        truncate 
                                        max-w-xs">
                            {d.legalSection}
                          </p>
                          {d.moreInfoUrl && (
                            <a href={d.moreInfoUrl}
                               className="text-xs 
                                          text-amber-600 
                                          dark:text-amber-400 
                                          font-semibold 
                                          underline 
                                          flex-shrink-0 
                                          print:hidden">
                              Guide →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 
                          text-center">
              Calculated based on standard rules 
              as on June 2026. Verify on MCA V3 portal 
              before filing. Not legal advice.
            </p>
          </div>
        )}
      </div>

      {/* Email Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 
                        bg-black/50 flex 
                        items-center 
                        justify-center p-4">
          <div className="bg-white dark:bg-slate-800 
                          rounded-2xl shadow-2xl 
                          w-full max-w-md p-6">
            
            {reminderSent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-bold text-navy 
                               dark:text-white text-lg">
                  Reminders Set!
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                  Check your email for confirmation. 
                  We will remind you before each deadline.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-navy 
                               dark:text-white text-lg mb-1">
                  🔔 Set Deadline Reminders
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Get email reminders before ROC 
                  deadlines for{' '}
                  <strong>
                    {profile.companyName || 'your company'}
                  </strong>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs 
                                      font-bold 
                                      text-slate-600 
                                      dark:text-slate-400 
                                      mb-1.5">
                      Your Email Address
                    </label>
                    <input type="email"
                      value={reminderEmail}
                      onChange={e => 
                        setReminderEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      className="w-full border 
                                 border-slate-200 
                                 dark:border-slate-600 
                                 rounded-xl px-4 py-3 
                                 text-sm bg-white 
                                 dark:bg-slate-700 
                                 text-navy 
                                 dark:text-white 
                                 focus:outline-none 
                                 focus:ring-2 
                                 focus:ring-amber-400" />
                  </div>
                  
                  <div>
                    <label className="block text-xs 
                                      font-bold 
                                      text-slate-600 
                                      dark:text-slate-400 
                                      mb-2">
                      Remind me before (days):
                    </label>
                    <div className="flex gap-2">
                      {[1, 7, 15, 30, 60].map(days => (
                        <button key={days}
                          onClick={() => {
                            setReminderDays(prev => 
                              prev.includes(days)
                                ? prev.filter(d => d !== days)
                                : [...prev, days].sort(
                                    (a, b) => b - a
                                  )
                            )
                          }}
                          className={`flex-1 py-2 
                            rounded-xl text-sm 
                            font-semibold border 
                            transition-colors
                            ${reminderDays.includes(days)
                              ? 'bg-navy text-white border-navy dark:bg-amber-500 dark:border-amber-500'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => 
                        setShowReminderModal(false)
                      }
                      className="flex-1 py-3 border 
                                 border-slate-200 
                                 dark:border-slate-600 
                                 rounded-xl text-sm 
                                 font-semibold 
                                 text-slate-600 
                                 dark:text-slate-300">
                      Cancel
                    </button>
                    <button
                      onClick={handleSetReminder}
                      disabled={reminderLoading}
                      className="flex-1 py-3 bg-blue-600 
                                 text-white rounded-xl 
                                 text-sm font-bold 
                                 hover:bg-blue-700 
                                 disabled:opacity-50">
                      {reminderLoading 
                        ? 'Setting...' 
                        : '🔔 Set Reminders'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
          * { color: black !important; 
              background: white !important;
              border-color: #ccc !important; }
          a { text-decoration: none !important; }
        }
      `}</style>
    </div>
  )
}