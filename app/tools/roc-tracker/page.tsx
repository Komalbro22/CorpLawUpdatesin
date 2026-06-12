'use client'
import { useState, useEffect } from 'react'
import {
  calculateDeadlinesFromDB,
  getPenaltySummary,
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
      hasDeposits: true,
      paidUpCapital: 1000000,
      turnover: 5000000,
    })

  // Results
  const [deadlines, setDeadlines] = 
    useState<DeadlineItem[] | null>(null)
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
      hasCS: profile.hasCS || false,
      agmDate: profile.agmDate ? new Date(profile.agmDate) : null,
      directorCount: profile.directorCount || 2,
      isXBRL: profile.isXBRL || false,
      isListed: profile.isListed || false,
      hasForeignShareholders: profile.hasForeignShareholders || false,
      hasDeposits: profile.hasDeposits || true,
      auditDate: null,
    }
  }

  function handleCalculate() {
    if (!profile.incorporationDate) {
      alert('Please enter incorporation date')
      return
    }

    const fullProfile = getFullProfile()
    const result = calculateDeadlinesFromDB(fullProfile, dbForms)

    setDeadlines(result)
    setCalculated(true)

    // Log usage
    const summary = getPenaltySummary(result)
    fetch('/api/roc/log-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_type: profile.companyType,
        fy_end: profile.financialYearEnd,
        forms_count: result.filter(d => d.isApplicable).length,
        overdue_count: summary.overdueCount,
        total_penalty: summary.totalNormalPenalty,
      })
    }).catch(() => {})

    // Scroll to results
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

  const summary = deadlines 
    ? getPenaltySummary(deadlines) 
    : null

  const ccfsDaysLeft = daysUntilCCFSExpiry()

  const visibleDeadlines = showAll
    ? deadlines
    : deadlines?.filter(d => d.isApplicable)

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
        <div className="bg-white dark:bg-slate-800 
                        rounded-2xl border border-slate-200 
                        dark:border-slate-700 
                        overflow-hidden mb-8 
                        print:hidden">
          <div className="bg-slate-50 dark:bg-slate-900 
                          border-b border-slate-200 
                          dark:border-slate-700 
                          px-6 py-4 flex items-center 
                          justify-between">
            <div>
              <h2 className="font-bold text-navy 
                             dark:text-white text-base">
                🏢 Your Company Details
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {formsLoading 
                  ? 'Loading latest ROC form data...'
                  : `${dbForms.length} forms loaded from latest database`}
              </p>
            </div>
            {!formsLoading && (
              <div className="w-2 h-2 bg-green-500 
                              rounded-full 
                              animate-pulse" 
                   title="Live data" />
            )}
          </div>

          <div className="p-6 grid grid-cols-1 
                          md:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 
                                mb-1.5">
                Company Name
              </label>
              <input type="text"
                value={profile.companyName || ''}
                onChange={e => setProfile(p => ({
                  ...p, companyName: e.target.value
                }))}
                placeholder="ABC Private Limited"
                className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 mb-1.5">
                CIN
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
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 mb-1.5">
                Company Type *
              </label>
              <select
                value={profile.companyType}
                onChange={e => setProfile(p => ({
                  ...p, 
                  companyType: e.target.value as any
                }))}
                className={inputClass}>
                <option value="private">
                  Private Limited
                </option>
                <option value="public">
                  Public Limited
                </option>
                <option value="opc">
                  One Person Company (OPC)
                </option>
                <option value="small">
                  Small Company
                </option>
                <option value="section8">
                  Section 8 (NGO/Charity)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 mb-1.5">
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

            <div>
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 mb-1.5">
                Financial Year End
              </label>
              <select
                value={profile.financialYearEnd}
                onChange={e => setProfile(p => ({
                  ...p, financialYearEnd: e.target.value as any
                }))}
                className={inputClass}>
                <option value="march">
                  31st March (Standard — most companies)
                </option>
                <option value="september">
                  30th September (Alternate FY)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 mb-1.5">
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

            <div>
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 mb-1.5">
                Paid-up Capital
              </label>
              <select
                value={profile.paidUpCapital}
                onChange={e => setProfile(p => ({
                  ...p, paidUpCapital: Number(e.target.value)
                }))}
                className={inputClass}>
                <option value={100000}>
                  Up to ₹1 Lakh
                </option>
                <option value={1000000}>
                  ₹1–10 Lakh
                </option>
                <option value={10000000}>
                  ₹10 Lakh–1 Crore
                </option>
                <option value={50000000}>
                  ₹1–5 Crore
                </option>
                <option value={500000000}>
                  ₹5 Crore+ (XBRL likely needed)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold 
                                text-slate-600 
                                dark:text-slate-400 mb-1.5">
                Annual Turnover
              </label>
              <select
                value={profile.turnover}
                onChange={e => setProfile(p => ({
                  ...p, turnover: Number(e.target.value)
                }))}
                className={inputClass}>
                <option value={4000000}>
                  Below ₹40 Lakh (Small Company)
                </option>
                <option value={50000000}>
                  ₹40 Lakh–5 Crore
                </option>
                <option value={500000000}>
                  ₹5–50 Crore
                </option>
                <option value={5000000000}>
                  ₹50 Crore+ (Cost Audit likely)
                </option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 
                            grid grid-cols-2 
                            md:grid-cols-3 gap-2">
              {[
                { 
                  key: 'hasDeposits', 
                  label: '📋 Has loans from members/directors' 
                },
                { 
                  key: 'hasForeignShareholders', 
                  label: '🌍 Has foreign shareholders' 
                },
                { 
                  key: 'isXBRL', 
                  label: '📊 XBRL filing required' 
                },
                { 
                  key: 'isListed', 
                  label: '📈 Listed on BSE/NSE' 
                },
                { 
                  key: 'hasCS', 
                  label: '👩💼 Has whole-time CS' 
                },
              ].map(item => (
                <label key={item.key}
                  className="flex items-center gap-2 
                             cursor-pointer 
                             bg-slate-50 
                             dark:bg-slate-900 
                             border border-slate-200 
                             dark:border-slate-700 
                             rounded-xl p-2.5 
                             hover:border-amber-400 
                             transition-colors">
                  <input type="checkbox"
                    checked={
                      (profile as any)[item.key] || false
                    }
                    onChange={e => setProfile(p => ({
                      ...p, 
                      [item.key]: e.target.checked
                    }))}
                    className="w-4 h-4 accent-amber-400" />
                  <span className="text-xs text-slate-600 
                                   dark:text-slate-300">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col md:flex-row gap-3">
            <button
              onClick={handleCalculate}
              disabled={formsLoading}
              className="flex-1 bg-amber-400 
                         hover:bg-amber-500 text-navy 
                         font-bold py-4 rounded-xl 
                         text-base transition-colors
                         disabled:opacity-50">
              {formsLoading 
                ? '⏳ Loading latest data...' 
                : '📋 Calculate My ROC Deadlines →'}
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="md:w-1/3 bg-slate-100 hover:bg-slate-200 
                         dark:bg-slate-700 dark:hover:bg-slate-600 
                         text-navy dark:text-white 
                         font-bold py-4 rounded-xl 
                         text-base transition-colors
                         disabled:opacity-50">
              {profileSaving ? 'Saving...' : profileSaved ? 'Saved! ✓' : '💾 Save Profile'}
            </button>
          </div>
        </div>

        {/* Results Section */}
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
                  label: 'Overdue',
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
                              border-2 border-green-400 
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

            {/* Toggle */}
            <div className="flex items-center 
                            justify-between">
              <h2 className="text-xl font-bold 
                             text-navy dark:text-white 
                             font-heading">
                Deadline Report — {
                  profile.companyName || 'Your Company'
                }
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

            {/* Deadline List */}
            <div className="space-y-3">
              {(visibleDeadlines || []).map(d => (
                <div key={d.id}
                     className={`border 
                       dark:border-slate-700 
                       rounded-2xl overflow-hidden 
                       bg-white dark:bg-slate-800 
                       ${statusColors[d.status]}`}>
                  <div className="p-4 md:p-5">
                    <div className="flex items-start 
                                    justify-between 
                                    gap-3">
                      <div className="min-w-0 flex-1">
                        
                        {/* Header row */}
                        <div className="flex items-center 
                                        gap-2 mb-1 
                                        flex-wrap">
                          <span className="font-black 
                                           text-navy 
                                           dark:text-white 
                                           text-base">
                            {d.formName}
                          </span>
                          
                          {/* Status badge */}
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
                              ? `🔴 ${Math.abs(d.daysRemaining)}d overdue`
                              : d.status === 'due-soon'
                              ? `⚡ ${d.daysRemaining}d left`
                              : d.status === 'upcoming'
                              ? `🟢 ${d.daysRemaining}d`
                              : '⚪ N/A'}
                          </span>

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
                            📅 Due: {d.dueDate
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
                      </div>

                      {/* Penalty column */}
                      {d.isApplicable && 
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
              ))}
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