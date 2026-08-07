'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Save, CheckCircle, ShieldCheck, Loader2, UserCheck, Landmark, Eye, ExternalLink } from 'lucide-react'

export default function AdminSingleCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const cin = params.cin as string

  const [company, setCompany] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResyncing, setIsResyncing] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchCompany()
  }, [cin])

  const fetchCompany = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/company/${cin}`)
      const data = await res.json()
      setCompany(data.company || null)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceResync = async () => {
    setIsResyncing(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/company-data/force-resync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cin })
      })
      const data = await res.json()
      if (res.ok) {
        setMsg('Successfully re-synced live from data.gov.in API.')
        setCompany(data.company)
      } else {
        setMsg('Resync failed: ' + data.error)
      }
    } catch (e: any) {
      setMsg('Resync error: ' + e.message)
    } finally {
      setIsResyncing(false)
    }
  }

  if (isLoading) {
    return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" /></div>
  }

  if (!company) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold text-navy dark:text-white mb-2">Company Record Not Found</h2>
        <Link href="/admin/company-data" className="text-sm text-amber-600 font-bold">← Back to Company Data</Link>
      </div>
    )
  }

  const directors = company.directors || []
  const charges = company.charges || []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/company-data" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-navy">
          <ArrowLeft className="w-4 h-4" /> Back to Companies List
        </Link>
        <Link
          href={`/company/${company.cin}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Public Live Profile
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white font-heading">
            {company.company_name}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">CIN: {company.cin}</p>
        </div>

        <button
          onClick={handleForceResync}
          disabled={isResyncing}
          className="bg-navy hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-navy px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isResyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Force Re-sync from data.gov.in API
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
          {msg}
        </div>
      )}

      {/* Raw Record & Details Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider">
            Cached DB2 Record Overview
          </h2>
          {company.is_manually_corrected && (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Manually Overridden
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block mb-1">Company Status</span>
            <strong className="text-navy dark:text-white font-bold">{company.company_status}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block mb-1">Registration Date</span>
            <strong className="text-navy dark:text-white font-bold">{company.date_of_registration}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block mb-1">Authorised Capital</span>
            <strong className="text-navy dark:text-white font-bold">₹{(company.authorised_capital / 10000000).toFixed(2)} Cr</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 block mb-1">Paid-Up Capital</span>
            <strong className="text-navy dark:text-white font-bold">₹{(company.paid_up_capital / 10000000).toFixed(2)} Cr</strong>
          </div>
        </div>
      </div>

      {/* Directors Master Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-500" /> Board of Directors Master ({directors.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-2.5">DIN</th>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Designation</th>
                <th className="p-2.5">Appointment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {directors.map((d: any) => (
                <tr key={d.din}>
                  <td className="p-2.5 font-mono font-bold">{d.din}</td>
                  <td className="p-2.5 font-bold text-navy dark:text-white">{d.name}</td>
                  <td className="p-2.5">{d.designation}</td>
                  <td className="p-2.5">{d.date_of_appointment || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Charges Master Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-500" /> Secured Bank Charges & Mortgages ({charges.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-2.5">Charge ID</th>
                <th className="p-2.5">Lending Bank</th>
                <th className="p-2.5">Amount (₹ Cr)</th>
                <th className="p-2.5">Creation Date</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {charges.map((c: any) => (
                <tr key={c.charge_id}>
                  <td className="p-2.5 font-mono font-bold">#{c.charge_id}</td>
                  <td className="p-2.5 font-bold text-navy dark:text-white">{c.holder_name}</td>
                  <td className="p-2.5 font-bold text-emerald-600">₹{(c.amount / 10000000).toFixed(2)} Cr</td>
                  <td className="p-2.5">{c.creation_date || 'N/A'}</td>
                  <td className="p-2.5 font-bold">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
