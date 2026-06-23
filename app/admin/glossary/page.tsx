'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/Toast'

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
}

export default function AdminGlossaryPage() {
  const { showToast } = useToast()
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

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
      } else {
        const data = json.terms as GlossaryTerm[]
        setTerms(data || [])
      }
    } catch (err) {
      console.error('Error loading glossary terms:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return
    
    const res = await fetch(`/api/admin/glossary/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json()
      showToast('Failed to delete term.' + (json.error ? ` ${json.error}` : ''), 'error')
    } else {
      showToast('Glossary term deleted successfully.', 'success')
      fetchTerms()
    }
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const res = await fetch(`/api/admin/glossary/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_verified: !currentStatus }),
    })
    if (res.ok) {
      setTerms(terms.map(t => t.id === id ? { ...t, is_verified: !currentStatus } : t))
      showToast(`Term status set to ${!currentStatus ? 'Verified' : 'Draft'}.`, 'success')
    } else {
      showToast('Failed to update term verification status.', 'error')
    }
  }

  const filteredTerms = terms.filter(t => 
    (t.term || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Legal Glossary</h1>
          <p className="text-sm text-slate-500 mt-1">Manage dictionary terms and definitions.</p>
        </div>
        <Link 
          href="/admin/glossary/new"
          className="inline-flex items-center gap-2 btn-vibrant-amber text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Term
        </Link>
      </div>

      <div className="admin-card overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-white/60 flex items-center gap-4 bg-slate-50/60">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search terms or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {filteredTerms.length} terms
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm shadow-sm z-10">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/60">Term</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/60">Category</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/60">Verified</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50/60">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 bg-slate-100/10">Loading terms...</td>
                </tr>
              ) : filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 bg-slate-100/10">No terms found.</td>
                </tr>
              ) : (
                filteredTerms.map(term => (
                  <tr key={term.id} className="hover:bg-slate-100/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{term.term}</p>
                        {term.is_verified && (
                          <Link 
                            href={`/glossary/${term.slug}`} 
                            target="_blank"
                            className="text-slate-500 hover:text-amber-500 transition-colors p-0.5 rounded"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-1">{term.slug}</p>
                      <div className="text-sm text-slate-700 mt-2 line-clamp-2">
                        {term.definition ? term.definition.replace(/<[^>]*>/g, '').trim() : ''}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-700">
                        {term.category}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <button 
                        onClick={() => toggleVerification(term.id, term.is_verified)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                          term.is_verified 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {term.is_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {term.is_verified ? 'Verified' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/glossary/${term.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Term"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(term.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                          title="Delete Term"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
