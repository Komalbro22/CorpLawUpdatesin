/* eslint-disable */
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, ExternalLink, Upload, Loader2, Sparkles, Filter } from 'lucide-react'
import { useToast } from '@/components/Toast'
import CategoryBadge from '@/components/CategoryBadge'
import { Category } from '@/types'

type GlossaryTerm = {
  id: string
  term: string
  slug: string
  definition: string
  category: string
  is_verified: boolean
  related_terms: string[]
  created_at: string
  keywords: string[]
  extended_note: string
  faqs?: any[]
}

export default function AdminGlossaryPage() {
  const { showToast } = useToast()
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/glossary')
      const json = await res.json()

      if (!res.ok) {
        console.error('Error fetching glossary:', json.error)
        showToast('Failed to load glossary entries: ' + (json.error || 'Unknown error'), 'error')
      } else {
        const data = json.terms as GlossaryTerm[]
        setTerms(data || [])
      }
    } catch (err) {
      console.error('Error loading glossary terms:', err)
      showToast('Error connecting to glossary database', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, termName: string) => {
    if (!confirm(`Are you sure you want to delete "${termName}"? This cannot be undone.`)) return
    
    try {
      const res = await fetch(`/api/admin/glossary/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        showToast('Failed to delete term: ' + (json.error || 'Delete failed'), 'error')
      } else {
        showToast(`Glossary term "${termName}" deleted successfully.`, 'success')
        setTerms(prev => prev.filter(t => t.id !== id))
      }
    } catch (e) {
      showToast('Network error while deleting term', 'error')
    }
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/glossary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !currentStatus, dirtyFields: ['is_verified'] }),
      })
      if (res.ok) {
        setTerms(terms.map(t => t.id === id ? { ...t, is_verified: !currentStatus } : t))
        showToast(`Term status set to ${!currentStatus ? 'Verified (Live)' : 'Draft'}.`, 'success')
      } else {
        showToast('Failed to update term verification status.', 'error')
      }
    } catch (e) {
      showToast('Network error while updating status', 'error')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        if (!text) throw new Error('File is empty')

        const lines = text.split(/\r?\n/).filter(line => line.trim())
        if (lines.length < 2) throw new Error('No data rows found')
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const termIdx = headers.indexOf('term')
        const definitionIdx = headers.indexOf('definition')
        
        if (termIdx === -1 || definitionIdx === -1) {
          throw new Error('CSV must contain "term" and "definition" columns')
        }

        const categoryIdx = headers.indexOf('category')
        const slugIdx = headers.indexOf('slug')

        const payload = lines.slice(1).map(line => {
          const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
          const row = line.split(regex).map(cell => cell.replace(/^"(.*)"$/, '$1').trim())
          
          const term = row[termIdx] || ''
          const slug = slugIdx !== -1 && row[slugIdx] ? row[slugIdx] : term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          
          return {
            term,
            slug,
            definition: row[definitionIdx] || '',
            category: categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'General',
            is_verified: true,
            keywords: [],
            related_terms: []
          }
        }).filter(item => item.term)

        const res = await fetch('/api/admin/glossary/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to import')
        }

        showToast(`Successfully imported ${payload.length} terms`, 'success')
        fetchTerms()
      } catch (err: any) {
        showToast('Import failed: ' + err.message, 'error')
      } finally {
        setIsImporting(false)
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const allCategories = useMemo(() => {
    const set = new Set<string>()
    terms.forEach(t => {
      if (t.category) set.add(t.category)
    })
    return Array.from(set).sort()
  }, [terms])

  const filteredTerms = useMemo(() => {
    return terms.filter(t => {
      const matchesSearch = 
        (t.term || '').toLowerCase().includes(search.toLowerCase()) || 
        (t.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.slug || '').toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'verified' ? t.is_verified :
        !t.is_verified

      const matchesCategory =
        categoryFilter === 'all' ? true :
        (t.category || '').toUpperCase() === categoryFilter.toUpperCase()

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [terms, search, statusFilter, categoryFilter])

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-navy font-heading">Legal Glossary</h1>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage legal terminology, statutory definitions, rich partial-HTML guides, and SEO metadata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 transition-colors">
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isImporting ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isImporting} />
          </label>
          <Link 
            href="/admin/glossary/new"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Term
          </Link>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-210px)]">
        <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by term, slug, or regulator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === 'all' ? 'bg-white text-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({terms.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === 'verified' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live ({terms.filter(t => t.is_verified).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === 'draft' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Draft ({terms.filter(t => !t.is_verified).length})
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Regulators</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredTerms.length} of {terms.length}
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs shadow-xs z-10 border-b border-slate-200/80">
              <tr>
                <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Term & Summary</th>
                <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Regulator</th>
                <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Content Depth</th>
                <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                    <p className="font-semibold text-sm">Loading glossary database...</p>
                  </td>
                </tr>
              ) : filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <p className="font-bold text-slate-700">No glossary terms match your criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search or category filter.</p>
                  </td>
                </tr>
              ) : (
                filteredTerms.map(term => {
                  const hasExtendedNote = Boolean(term.extended_note && term.extended_note.length > 300)
                  const cleanDef = term.definition ? term.definition.replace(/<[^>]*>/g, '').trim() : ''

                  return (
                    <tr key={term.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-3.5 align-top max-w-md">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/glossary/${term.id}/edit`}
                            className="font-bold text-navy hover:text-amber-600 transition-colors text-sm sm:text-base font-heading"
                          >
                            {term.term}
                          </Link>
                          {term.is_verified && (
                            <a
                              href={`/glossary/${term.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-amber-600 transition-colors p-0.5 rounded-sm"
                              title="View live public URL"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          /glossary/{term.slug}
                        </p>
                        {cleanDef && (
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                            {cleanDef}
                          </p>
                        )}
                      </td>

                      <td className="p-3.5 align-top whitespace-nowrap">
                        {term.category ? (
                          <CategoryBadge category={term.category as Category} />
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-3.5 align-top whitespace-nowrap">
                        {hasExtendedNote ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            ★ Full Article ({Math.round(term.extended_note.length / 5)}w)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            Definition only
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleVerification(term.id, term.is_verified)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                            term.is_verified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {term.is_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {term.is_verified ? 'Live' : 'Draft'}
                        </button>
                      </td>

                      <td className="p-3.5 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/glossary/${term.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Term in CMS"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(term.id, term.term)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Term"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
