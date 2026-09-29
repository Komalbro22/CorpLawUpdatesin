'use client'

import { useMemo, useState } from 'react'
import { Download, FileText, LoaderCircle } from 'lucide-react'

type FormState = {
  resolutionType: 'final' | 'interim'
  companyName: string
  cin: string
  registeredOffice: string
  meetingDate: string
  meetingTime: string
  meetingPlace: string
  financialYear: string
  dividendPerShare: string
  faceValue: string
  eligibleShares: string
  recordDate: string
  paymentDeadline: string
  chairperson: string
  bankName: string
}

const initial: FormState = {
  resolutionType: 'final', companyName: '', cin: '', registeredOffice: '', meetingDate: '', meetingTime: '',
  meetingPlace: '', financialYear: '', dividendPerShare: '', faceValue: '', eligibleShares: '',
  recordDate: '', paymentDeadline: '', chairperson: '', bankName: '',
}

const fields: Array<{ key: keyof Omit<FormState, 'resolutionType'>; label: string; placeholder: string; required?: boolean }> = [
  { key: 'companyName', label: 'Company name', placeholder: 'As stated in the certificate of incorporation', required: true },
  { key: 'cin', label: 'CIN', placeholder: 'Company Identification Number' },
  { key: 'registeredOffice', label: 'Registered office', placeholder: 'Full registered office address' },
  { key: 'meetingDate', label: 'Board meeting date', placeholder: 'e.g. 30 September 2026', required: true },
  { key: 'meetingTime', label: 'Meeting time', placeholder: 'e.g. 11:00 a.m.' },
  { key: 'meetingPlace', label: 'Meeting venue / VC details', placeholder: 'Venue or video-conference details' },
  { key: 'financialYear', label: 'Financial year', placeholder: 'e.g. 2025–26', required: true },
  { key: 'dividendPerShare', label: 'Dividend per share (Rs.)', placeholder: 'e.g. 2.50', required: true },
  { key: 'faceValue', label: 'Face value per share (Rs.)', placeholder: 'e.g. 10', required: true },
  { key: 'eligibleShares', label: 'Estimated eligible shares', placeholder: 'e.g. 100000', required: true },
  { key: 'recordDate', label: 'Record date / entitlement date', placeholder: 'If applicable; verify notice requirements' },
  { key: 'paymentDeadline', label: 'Proposed payment date / deadline', placeholder: 'Subject to statutory time limits' },
  { key: 'chairperson', label: 'Chairperson / authorised signatory', placeholder: 'Full name', required: true },
  { key: 'bankName', label: 'Scheduled bank for dividend account', placeholder: 'Interim dividend: add bank details' },
]

export default function DividendResolutionClient() {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState<'docx' | 'pdf' | null>(null)
  const [error, setError] = useState('')
  const total = useMemo(() => {
    const amount = Number(form.dividendPerShare)
    const shares = Number(form.eligibleShares)
    return amount > 0 && shares > 0 ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount * shares) : ''
  }, [form.dividendPerShare, form.eligibleShares])

  async function download(format: 'docx' | 'pdf') {
    setError('')
    const missing = fields.filter(field => field.required).find(field => !form[field.key].trim())
    if (missing) {
      setError(`Please enter ${missing.label.toLowerCase()}.`)
      document.getElementById(missing.key)?.focus()
      return
    }
    const amount = Number(form.dividendPerShare)
    const faceValue = Number(form.faceValue)
    const shares = Number(form.eligibleShares)
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(faceValue) || faceValue <= 0 || !Number.isSafeInteger(shares) || shares <= 0) {
      setError('Enter positive amounts and a whole number of eligible shares.')
      return
    }
    setBusy(format)
    try {
      const response = await fetch('/api/documents/dividend-resolution', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format, data: form }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Document generation failed. Please try again.')
      }
      const blob = await response.blob()
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = `Dividend_${form.resolutionType}_Board_Resolution.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(href)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Document generation failed. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section id="generator" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8" aria-labelledby="generator-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Free document builder</p>
          <h2 id="generator-heading" className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Create a dividend board resolution</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Choose final or interim dividend, enter the meeting and dividend particulars, then download an editable Word document or print-ready PDF. No account required.</p>
        </div>
        <a href="/api/documents/dividend-resolution?type=blank-docx" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          <FileText className="size-4" aria-hidden="true" /> Blank Word format
        </a>
        <a href="/api/documents/dividend-resolution?type=blank-pdf" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          <FileText className="size-4" aria-hidden="true" /> Blank PDF
        </a>
      </div>

      <fieldset className="mt-7">
        <legend className="text-sm font-semibold text-slate-900 dark:text-white">Resolution type</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(['final', 'interim'] as const).map(type => (
            <label key={type} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${form.resolutionType === type ? 'border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
              <input type="radio" name="resolutionType" value={type} checked={form.resolutionType === type} onChange={() => setForm(current => ({ ...current, resolutionType: type }))} className="mt-1 accent-amber-700" />
              <span>
                <span className="block text-sm font-semibold capitalize text-slate-900 dark:text-white">{type} dividend</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">{type === 'final' ? 'Board recommends; members declare at the AGM.' : 'Board declares, subject to Section 123 and available profits.'}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map(field => (
          <label key={field.key} className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200">{field.label}{field.required && <span className="text-red-600"> *</span>}</span>
            <input
              id={field.key}
              value={form[field.key]}
              onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}
              placeholder={field.placeholder}
              required={field.required}
              inputMode={field.key === 'dividendPerShare' || field.key === 'faceValue' || field.key === 'eligibleShares' ? 'decimal' : undefined}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70" aria-live="polite">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Estimated aggregate dividend</p>
        <p className="mt-1 tabular-nums text-lg font-bold text-slate-800 dark:text-slate-100">{total ? `Rs. ${total}` : 'Enter dividend per share and eligible shares'}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estimate only. Reconcile the eligible shareholder list and final amount before the resolution is acted on.</p>
      </div>

      {error && <p role="alert" className="mt-4 text-sm font-medium text-red-700 dark:text-red-300">{error}</p>}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => download('docx')} disabled={!!busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
          {busy === 'docx' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />} Download Word (.docx)
        </button>
        <button type="button" onClick={() => download('pdf')} disabled={!!busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
          {busy === 'pdf' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <FileText className="size-4" aria-hidden="true" />} Download PDF
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Your entries are sent only to generate the file. This tool does not save a copy in your account.</p>
    </section>
  )
}
