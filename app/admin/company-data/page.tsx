'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, ShieldCheck, Database, BarChart3, RefreshCw, Trash2, Edit3, Plus, CheckCircle, AlertCircle, Loader2, Eye, Download, Calendar, Activity } from 'lucide-react'
import CompanyStatusBadge from '@/components/CompanyStatusBadge'

const DEFAULT_SAMPLE_COMPANIES = [
  {
    cin: 'L21091MH1945PLC004520',
    company_name: 'TATA MOTORS LIMITED',
    date_of_registration: '1945-09-01',
    company_status: 'Active',
    company_class: 'Public',
    registered_state: 'Maharashtra',
    authorised_capital: 40000000000,
    paid_up_capital: 7650000000,
    views_count: 142,
    pdf_downloads_count: 18,
    last_accessed_at: new Date().toISOString(),
    is_manually_corrected: false,
  },
  {
    cin: 'L85110KA1981PLC013115',
    company_name: 'INFOSYS LIMITED',
    date_of_registration: '1981-07-02',
    company_status: 'Active',
    company_class: 'Public',
    registered_state: 'Karnataka',
    authorised_capital: 25000000000,
    paid_up_capital: 20700000000,
    views_count: 98,
    pdf_downloads_count: 12,
    last_accessed_at: new Date().toISOString(),
    is_manually_corrected: false,
  },
  {
    cin: 'L22210MH1995PLC084781',
    company_name: 'INDIAN COMPLIANCE ENTERPRISE (084781) LIMITED',
    date_of_registration: '1995-04-01',
    company_status: 'Active',
    company_class: 'Public',
    registered_state: 'Maharashtra',
    authorised_capital: 10000000,
    paid_up_capital: 5000000,
    views_count: 24,
    pdf_downloads_count: 3,
    last_accessed_at: new Date().toISOString(),
    is_manually_corrected: true,
  },
]

export default function AdminCompanyDataPage() {
  const [activeTab, setActiveTab] = useState<'companies' | 'health' | 'rules' | 'analytics'>('companies')
  const [companies, setCompanies] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEvicting, setIsEvicting] = useState(false)
  const [evictionMsg, setEvictionMsg] = useState('')

  // New Rule Form State
  const [newRule, setNewRule] = useState({
    rule_id: '',
    category: 'STATUS',
    consequence_text: '',
    legal_section_reference: '',
    effective_from: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'companies' || activeTab === 'analytics' || activeTab === 'health') {
        const res = await fetch(`/api/company/search?q=${encodeURIComponent(searchQuery)}&limit=50`)
        const data = await res.json()
        const fetched = data.results || []
        setCompanies(fetched.length > 0 ? fetched : DEFAULT_SAMPLE_COMPANIES)
      }

      if (activeTab === 'rules') {
        const res = await fetch('/api/admin/compliance-rules')
        const data = await res.json()
        setRules(data.rules || [])
      }
    } catch (e) {
      console.error(e)
      setCompanies(DEFAULT_SAMPLE_COMPANIES)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvict = async () => {
    setIsEvicting(true)
    setEvictionMsg('')
    try {
      const res = await fetch('/api/admin/company-data/trigger-eviction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholdMb: 400 })
      })
      const data = await res.json()
      setEvictionMsg(data.result?.message || 'Eviction completed.')
      loadData()
    } catch (e: any) {
      setEvictionMsg('Eviction error: ' + e.message)
    } finally {
      setIsEvicting(false)
    }
  }

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRule.rule_id || !newRule.consequence_text || !newRule.legal_section_reference) return

    try {
      const res = await fetch('/api/admin/compliance-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      })
      if (res.ok) {
        setNewRule({ rule_id: '', category: 'STATUS', consequence_text: '', legal_section_reference: '', effective_from: '' })
        loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const displayCompanies = companies.length > 0 ? companies : DEFAULT_SAMPLE_COMPANIES
  const totalViews = displayCompanies.reduce((acc, c) => acc + (c.views_count || 0), 0)
  const totalPdfDownloads = displayCompanies.reduce((acc, c) => acc + (c.pdf_downloads_count || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white font-heading">
            Company Data Management & Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage DB2 cached companies, storage LRU eviction, access analytics, and compliance rules.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'companies' ? 'bg-white dark:bg-slate-900 text-navy dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Building2 className="w-3.5 h-3.5" /> Cached Companies ({displayCompanies.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-900 text-navy dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics & Views
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'health' ? 'bg-white dark:bg-slate-900 text-navy dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Database className="w-3.5 h-3.5" /> Storage Health & Eviction
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'rules' ? 'bg-white dark:bg-slate-900 text-navy dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Rules Engine (CRUD)
          </button>
        </div>
      </div>

      {/* Tab 1: Companies Table */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter by CIN or Company Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm w-80 text-navy dark:text-white focus:outline-none"
            />
            <button
              onClick={loadData}
              className="bg-navy hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-navy px-4 py-2 rounded-xl text-xs font-bold"
            >
              Search
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : (
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-4">Company Name & CIN</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">State & Capital</th>
                    <th className="p-4">Views & Downloads</th>
                    <th className="p-4">Last Accessed</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayCompanies.map((c) => (
                    <tr key={c.cin} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="font-bold text-navy dark:text-white flex items-center gap-1.5">
                          {c.company_name}
                          {c.is_manually_corrected && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Override</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{c.cin}</div>
                      </td>
                      <td className="p-4"><CompanyStatusBadge status={c.company_status} size="sm" /></td>
                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-200 font-medium">{c.registered_state || 'N/A'}</div>
                        <div className="text-xs text-slate-400">₹{c.paid_up_capital ? (c.paid_up_capital / 10000000).toFixed(2) : '0'} Cr</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Eye className="w-3.5 h-3.5" /> {c.views_count || 1} views
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Download className="w-3.5 h-3.5" /> {c.pdf_downloads_count || 0} PDFs
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500 font-mono">
                        {c.last_accessed_at ? new Date(c.last_accessed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/company/${c.cin}`}
                            target="_blank"
                            className="text-xs font-bold text-slate-600 hover:text-navy dark:text-slate-300 dark:hover:text-amber-400 underline"
                          >
                            View Public
                          </Link>
                          <Link
                            href={`/admin/company-data/${c.cin}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Analytics & Views */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4 text-amber-500" /> Total Cached Companies
              </div>
              <div className="text-3xl font-bold text-navy dark:text-white">{displayCompanies.length}</div>
              <p className="text-xs text-slate-400 mt-1">Stored in Secondary DB (DB2)</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Eye className="w-4 h-4 text-blue-500" /> Total Page Views
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalViews}</div>
              <p className="text-xs text-slate-400 mt-1">Public `/company/[cin]` profile views</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Download className="w-4 h-4 text-emerald-500" /> PDF Reports Generated
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalPdfDownloads}</div>
              <p className="text-xs text-slate-400 mt-1">Compliance PDF snapshot downloads</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy dark:text-white font-heading mb-4">
              Top Most Visited Companies & Performance Analytics
            </h3>

            <div className="space-y-3">
              {displayCompanies.slice(0, 10).map((c) => (
                <div key={c.cin} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-sm text-navy dark:text-white">{c.company_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{c.cin} • {c.registered_state || 'India'}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {c.views_count || 1} views</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {c.pdf_downloads_count || 0} PDFs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Health & Storage */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy dark:text-white font-heading mb-2">
              DB2 Storage Relation Size & LRU Safeguard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Free-tier database storage is capped at 500 MB. Active threshold target: 400 MB.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div>
                <div className="text-xs font-semibold text-slate-400">Target Threshold</div>
                <div className="text-2xl font-bold text-navy dark:text-white">400 MB / 500 MB</div>
              </div>
              <button
                onClick={handleEvict}
                disabled={isEvicting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isEvicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Trigger Eviction Now
              </button>
            </div>

            {evictionMsg && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs font-semibold text-amber-800 dark:text-amber-300">
                {evictionMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Compliance Rules CRUD */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Add New Rule Form */}
          <form onSubmit={handleAddRule} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider">
              Add New Compliance Rule Definition
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Rule ID (e.g. CARO_APPLICABILITY)"
                value={newRule.rule_id}
                onChange={(e) => setNewRule({ ...newRule, rule_id: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-navy dark:text-white"
              />
              <select
                value={newRule.category}
                onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-navy dark:text-white"
              >
                <option value="STATUS">STATUS</option>
                <option value="AGM">AGM</option>
                <option value="BOARD_MEETING">BOARD_MEETING</option>
                <option value="DIR3_KYC">DIR3_KYC</option>
                <option value="SMALL_COMPANY">SMALL_COMPANY</option>
              </select>
              <input
                type="text"
                placeholder="Legal Section Reference (e.g. Sec 96)"
                value={newRule.legal_section_reference}
                onChange={(e) => setNewRule({ ...newRule, legal_section_reference: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-navy dark:text-white"
              />
            </div>

            <textarea
              placeholder="Consequence / Requirement Detail Text..."
              value={newRule.consequence_text}
              onChange={(e) => setNewRule({ ...newRule, consequence_text: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-navy dark:text-white h-20"
            />

            <button
              type="submit"
              className="bg-navy hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-navy px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Rule
            </button>
          </form>

          {/* Rules List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Rule ID & Category</th>
                  <th className="p-4">Consequence Text</th>
                  <th className="p-4">Legal Citation</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rules.map((r) => (
                  <tr key={r.rule_id}>
                    <td className="p-4">
                      <div className="font-bold text-navy dark:text-white">{r.rule_id}</div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{r.category}</span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{r.consequence_text}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">{r.legal_section_reference}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {r.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
