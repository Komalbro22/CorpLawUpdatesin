'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Save, X } from 'lucide-react'

type GlossaryTerm = {
  id: string
  term: string
  slug: string
  definition: string
  category: string
  is_verified: boolean
  related_terms: string[]
  created_at: string
}

const CATEGORIES = ['IBC', 'NCLT', 'MCA', 'SEBI', 'RBI', 'FEMA', 'GENERAL']

export default function AdminGlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    term: '',
    slug: '',
    definition: '',
    category: 'GENERAL',
    is_verified: false,
    related_terms: ''
  })

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('glossary')
      .select('*')
      .order('term', { ascending: true })
    
    if (error) {
      console.error('Error fetching glossary:', error)
    } else {
      setTerms(data || [])
    }
    setIsLoading(false)
  }

  // Auto-generate slug from term
  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({
      ...prev,
      term: val,
      // Auto-generate slug if it's a new term or if user is editing term and hasn't manually overridden heavily
      slug: prev.slug === generateSlug(prev.term) || prev.slug === '' ? generateSlug(val) : prev.slug
    }))
  }

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({ term: '', slug: '', definition: '', category: 'GENERAL', is_verified: false, related_terms: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (term: GlossaryTerm) => {
    setEditingId(term.id)
    setFormData({
      term: term.term,
      slug: term.slug,
      definition: term.definition,
      category: term.category,
      is_verified: term.is_verified,
      related_terms: term.related_terms ? term.related_terms.join(', ') : ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return
    
    const { error } = await supabase.from('glossary').delete().eq('id', id)
    if (error) {
      alert('Failed to delete term.')
      console.error(error)
    } else {
      fetchTerms()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      term: formData.term,
      slug: formData.slug,
      definition: formData.definition,
      category: formData.category,
      is_verified: formData.is_verified,
      related_terms: formData.related_terms.split(',').map(s => s.trim()).filter(Boolean)
    }

    if (editingId) {
      const { error } = await supabase.from('glossary').update(payload).eq('id', editingId)
      if (error) {
        alert('Error updating term: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase.from('glossary').insert([payload])
      if (error) {
        alert('Error adding term: ' + error.message)
        return
      }
    }

    setIsModalOpen(false)
    fetchTerms()
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('glossary').update({ is_verified: !currentStatus }).eq('id', id)
    if (!error) {
      setTerms(terms.map(t => t.id === id ? { ...t, is_verified: !currentStatus } : t))
    }
  }

  const filteredTerms = terms.filter(t => 
    t.term.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Legal Glossary</h1>
          <p className="text-sm text-slate-500 mt-1">Manage dictionary terms and definitions.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Term
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search terms or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {filteredTerms.length} terms
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Term</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Category</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Verified</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">Loading terms...</td>
                </tr>
              ) : filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">No terms found.</td>
                </tr>
              ) : (
                filteredTerms.map(term => (
                  <tr key={term.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <p className="font-bold text-navy">{term.term}</p>
                      <p className="text-xs text-slate-400 font-mono mt-1">{term.slug}</p>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{term.definition}</p>
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {term.category}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <button 
                        onClick={() => toggleVerification(term.id, term.is_verified)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-colors ${
                          term.is_verified ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {term.is_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {term.is_verified ? 'Verified' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(term)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(term.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-navy">{editingId ? 'Edit Term' : 'Add New Term'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="glossary-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Term Name <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="text" 
                      value={formData.term}
                      onChange={handleTermChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">URL Slug <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono text-slate-600 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-white"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.is_verified}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                        className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Publish to public glossary (Verified)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Definition <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.definition}
                    onChange={(e) => setFormData(prev => ({ ...prev, definition: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm resize-y"
                    placeholder="Provide a clear, plain-language definition..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Related Terms</label>
                  <input 
                    type="text" 
                    value={formData.related_terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, related_terms: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
                    placeholder="e.g. CIRP, Insolvency, Corporate Debtor (comma separated)"
                  />
                  <p className="text-xs text-slate-400">Exact term names you want to link to at the bottom of the definition.</p>
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="glossary-form"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Term' : 'Save Term'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
