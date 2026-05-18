'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Plus, Trash2, X, Loader2, Eye } from 'lucide-react'
import { useToast } from '@/components/Toast'
import MarkdownRenderer from '@/components/MarkdownRenderer'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES = ['IBC', 'NCLT', 'MCA', 'SEBI', 'RBI', 'FEMA', 'GENERAL']

type Props = {
  params: { id: string }
}

export default function EditGlossaryTermPage({ params }: Props) {
  const router = useRouter()
  const { showToast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [category, setCategory] = useState('GENERAL')
  const [isVerified, setIsVerified] = useState(false)

  // Markdown Content Fields
  const [definition, setDefinition] = useState('')
  const [extendedNote, setExtendedNote] = useState('')

  // Tag inputs
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')

  const [synonyms, setSynonyms] = useState<string[]>([])
  const [synonymInput, setSynonymInput] = useState('')

  const [relatedTerms, setRelatedTerms] = useState('')

  // FAQ creator
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([])

  // Fetch the term by ID on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTermDetails()
  }, [params.id])

  const fetchTermDetails = async () => {
    try {
      const res = await fetch(`/api/admin/glossary/${params.id}`)
      const json = await res.json()

      if (!res.ok) {
        showToast('Error loading term: ' + (json.error || 'Not found'), 'error')
        router.push('/admin/glossary')
        return
      }

      const data = json.term
      if (data) {
        setTerm(data.term || '')
        setSlug(data.slug || '')
        setSlugEdited(true)
        setCategory(data.category || 'GENERAL')
        setIsVerified(data.is_verified || false)
        setDefinition(data.definition || '')
        setExtendedNote(data.extended_note || '')
        setKeywords(data.keywords || [])
        setSynonyms(data.synonyms || [])
        setRelatedTerms(data.related_terms ? data.related_terms.join(', ') : '')
        
        // Load custom FAQs
        if (data.faqs && Array.isArray(data.faqs)) {
          setFaqs(data.faqs.map((f: { q?: string; question?: string; a?: string; answer?: string }) => ({
            q: f.q || f.question || '',
            a: f.a || f.answer || ''
          })))
        }
      }
    } catch (e) {
      console.error(e)
      showToast('Failed to load glossary term', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Live word counter helper (strips HTML tags)
  const getWordCount = (text: string): number => {
    if (!text) return 0
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return clean ? clean.split(/\s+/).length : 0
  }

  const defWords = getWordCount(definition)
  const noteWords = getWordCount(extendedNote)
  const totalWords = defWords + noteWords
  const isSubstantial = totalWords >= 300

  // Slug generator
  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTerm(val)
    if (!slugEdited) {
      setSlug(generateSlug(val))
    }
  }

  // Key tag additions with comma/semicolon/newline splitting
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = keywordInput.trim()
      if (val) {
        const items = val
          .split(/[,;\n]/)
          .map(item => item.trim())
          .filter(item => item && !keywords.includes(item))
        
        if (items.length > 0) {
          setKeywords([...keywords, ...items])
        }
        setKeywordInput('')
      }
    }
  }

  const handleKeywordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const items = pastedData
      .split(/[,;\n]/)
      .map(item => item.trim())
      .filter(item => item && !keywords.includes(item))
    
    if (items.length > 0) {
      setKeywords([...keywords, ...items])
    }
    setKeywordInput('')
  }

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleSynonymKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = synonymInput.trim()
      if (val) {
        const items = val
          .split(/[,;\n]/)
          .map(item => item.trim())
          .filter(item => item && !synonyms.includes(item))
        
        if (items.length > 0) {
          setSynonyms([...synonyms, ...items])
        }
        setSynonymInput('')
      }
    }
  }

  const handleSynonymPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const items = pastedData
      .split(/[,;\n]/)
      .map(item => item.trim())
      .filter(item => item && !synonyms.includes(item))
    
    if (items.length > 0) {
      setSynonyms([...synonyms, ...items])
    }
    setSynonymInput('')
  }

  const handleRemoveSynonym = (index: number) => {
    setSynonyms(synonyms.filter((_, i) => i !== index))
  }

  // FAQ management
  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }])
  }

  const handleFaqChange = (index: number, field: 'q' | 'a', value: string) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  // Submit form
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!term.trim()) {
      showToast('Term name is required', 'error')
      return
    }
    if (!definition.trim()) {
      showToast('Term definition is required', 'error')
      return
    }

    setIsSaving(true)

    const payload = {
      term: term.trim(),
      slug: slug.trim(),
      definition: definition,
      extended_note: extendedNote,
      category,
      is_verified: isVerified,
      keywords,
      synonyms,
      related_terms: relatedTerms.split(',').map(s => s.trim()).filter(Boolean),
      faqs: faqs.filter(f => f.q.trim() && f.a.trim())
    }

    try {
      const res = await fetch(`/api/admin/glossary/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      const updated = json.term

      if (!res.ok) {
        showToast('Error updating glossary term: ' + (json.error || 'Update failed'), 'error')
      } else if (!updated) {
        showToast('Error updating glossary term: no rows updated', 'error')
      } else {
        showToast('Glossary term updated successfully!', 'success')
        router.push('/admin/glossary')
        router.refresh()
      }
    } catch (e) {
      console.error(e)
      showToast('Failed to connect to database', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-500 font-semibold">Loading term details...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/glossary"
            className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors border border-slate-200 bg-white"
            title="Back to Glossary list"
          >
            <ArrowLeft className="w-5 h-5 text-navy" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              Edit Glossary Term
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Revise details and fine-tune your legal terminology.</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button 
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-navy font-semibold rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            Live Preview
          </button>

          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-xl shadow-md shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Updating...' : 'Update Term'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Rich inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Basic Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              Term Definition & Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Term Name <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={term}
                  onChange={handleTermChange}
                  placeholder="e.g. Committee of Creditors"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">URL Slug <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setSlugEdited(true)
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono text-slate-600 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-white font-medium text-slate-800"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50/60 transition-colors bg-white">
                  <input 
                    type="checkbox" 
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800">Publish as verified</span>
                    <p className="text-xs text-slate-400">Makes term visible on the public glossary.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* MDEditor for Definition */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-semibold text-slate-700 flex justify-between items-center">
                <span>Definition <span className="text-red-500">*</span></span>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{defWords} words</span>
              </label>
              <div data-color-mode="light" className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <MDEditor 
                  value={definition}
                  onChange={(val) => setDefinition(val || '')}
                  height={220}
                  preview="edit"
                />
              </div>
            </div>

            {/* MDEditor for Extended Note */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between items-center">
                <span>Extended Note (SEO Explanatory Paragraphs)</span>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{noteWords} words</span>
              </label>
              <div data-color-mode="light" className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <MDEditor 
                  value={extendedNote}
                  onChange={(val) => setExtendedNote(val || '')}
                  height={260}
                  preview="edit"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Use HTML or Markdown tables, styling, bullets, and links to make this definition premium.</p>
            </div>
          </div>

          {/* Card: FAQ Builder */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                Frequently Asked Questions (FAQ)
              </h2>
              <button 
                type="button" 
                onClick={handleAddFaq}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors border border-amber-100"
              >
                <Plus className="w-3.5 h-3.5" />
                Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center">
                <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-medium">No custom FAQs defined.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md">The system will automatically generate 3 optimized legal FAQs in the public view and Google FAQ schemas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3 relative">
                    <button 
                      type="button"
                      onClick={() => handleRemoveFaq(i)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-white rounded-lg border border-transparent hover:border-slate-100"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-1 pr-8">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Question {i + 1}</label>
                      <input 
                        type="text" 
                        value={faq.q}
                        onChange={(e) => handleFaqChange(i, 'q', e.target.value)}
                        placeholder="e.g. What is the scope of CoC?"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Answer</label>
                      <textarea 
                        rows={2}
                        value={faq.a}
                        onChange={(e) => handleFaqChange(i, 'a', e.target.value)}
                        placeholder="Provide a clean, descriptive answer..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SEO Stats & Special Linkings */}
        <div className="space-y-6">
          
          {/* Card: SEO Indexing Progress */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              Google SEO Index Status
            </h3>

            {isSubstantial ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-800 text-sm">SEO Indexing Eligible</h4>
                    <p className="text-xs text-green-600 mt-1 leading-relaxed">
                      Excellent! The combined definition and note contains <strong>{totalWords} words</strong>. Google will index this page.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Noindex Active (Thin Content)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Current combined length: <strong>{totalWords}/300 words</strong>. Write {300 - totalWords} more words to make it indexable and remove `noindex` tag.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-1 mb-6">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Indexing Milestone Progress</span>
                <span>{Math.min(100, Math.round((totalWords / 300) * 100))}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isSubstantial ? 'bg-green-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalWords / 300) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">SEO Best Practices Checklist</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${term.trim() ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  <span className={term.trim() ? 'text-slate-700 font-medium' : 'text-slate-400'}>Term Name entered</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${isSubstantial ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  <span className={isSubstantial ? 'text-slate-700 font-medium' : 'text-slate-400'}>At least 300 words ({totalWords})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${extendedNote.trim() ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  <span className={extendedNote.trim() ? 'text-slate-700 font-medium' : 'text-slate-400'}>Extended note explanation added</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${synonyms.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  <span className={synonyms.length > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}>Synonyms/Acronyms listed ({synonyms.length})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${keywords.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  <span className={keywords.length > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}>Keywords configured ({keywords.length})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Synonyms & Acronyms for Auto-linking */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              Auto-Link Synonyms & Acronyms
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Explicit list of alternate words or acronyms (e.g. <strong>CoC</strong>, <strong>COC</strong>) that should automatically link to this glossary term in article updates.
            </p>

            <input 
              type="text" 
              value={synonymInput}
              onChange={(e) => setSynonymInput(e.target.value)}
              onKeyDown={handleSynonymKeyDown}
              onPaste={handleSynonymPaste}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
              placeholder="Add synonym (e.g. CoC, ADR) and press Enter"
            />
            
            {synonyms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                {synonyms.map((syn, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-navy text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm"
                  >
                    {syn}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSynonym(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-slate-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card: Keywords (Search queries) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              Search Query Keywords
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add query keywords (e.g. &apos;CIRP full form&apos;, &apos;insolvency process&apos;) to rank search engines.
            </p>

            <input 
              type="text" 
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onPaste={handleKeywordPaste}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
              placeholder="Add keyword query (comma-separated also supported) and press Enter"
            />
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                {keywords.map((kw, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm"
                  >
                    {kw}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveKeyword(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-slate-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card: Related Terms */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              Related Term Links
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Link other exact term names at the bottom of the definition.
            </p>

            <input 
              type="text" 
              value={relatedTerms}
              onChange={(e) => setRelatedTerms(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
              placeholder="e.g. CIRP, Insolvency (comma separated)"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center p-4 sm:p-6 md:p-10">
          <div className="relative w-full max-w-4xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-200 shrink-0">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                  <Eye className="w-3.5 h-3.5" />
                  Interactive Preview
                </span>
                <h2 className="text-lg font-bold text-navy mt-1 font-heading">Live Public View Simulation</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Content - scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-10 bg-slate-50/50">
              <div className="max-w-3xl mx-auto text-left">
                
                {/* Simulated Breadcrumb */}
                <nav className="mb-8 text-sm text-slate-500 font-medium select-none pointer-events-none">
                  <ol className="flex items-center space-x-2">
                    <li>Home</li>
                    <li><span aria-hidden="true" className="mx-1">›</span></li>
                    <li>Glossary</li>
                    <li><span aria-hidden="true" className="mx-1">›</span></li>
                    <li className="text-navy font-semibold">{term || 'New Term'}</li>
                  </ol>
                </nav>

                {/* Main Card */}
                <article className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden text-left">
                  {/* Decorative background letter */}
                  <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none" aria-hidden="true">
                    <span className="text-9xl font-heading font-bold text-slate-900 leading-none">
                      {(term || 'N').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                        {category}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-6">
                      {term || 'Committee of Creditors'}
                    </h1>
                    
                    <div className="prose prose-slate prose-lg max-w-none text-slate-700">
                      {definition ? (
                        <MarkdownRenderer content={definition} />
                      ) : (
                        <p className="text-slate-400 italic">No definition written yet. Use the editor to write the definition.</p>
                      )}
                    </div>

                    {synonyms.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1.5">Acronyms / Synonyms:</span>
                        {synonyms.map((syn) => (
                          <span key={syn} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-100">
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>

                {/* Extended Note Section */}
                {extendedNote && (
                  <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm text-left">
                    <h3 className="text-xl font-bold text-navy mb-4 font-heading">Understanding {term || 'Term'}</h3>
                    <div className="prose prose-slate max-w-none text-slate-600">
                      <MarkdownRenderer content={extendedNote} />
                    </div>
                  </section>
                )}

                {/* FAQ Section */}
                <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm text-left">
                  <h2 className="text-xl font-bold text-navy mb-6 font-heading">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {(faqs.length > 0 ? faqs.map(f => ({ q: f.q, a: f.a })) : [
                      {
                        q: `What is ${term || 'Term'} in Indian corporate law?`,
                        a: definition ? definition.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : 'Definition will be displayed here...'
                      },
                      {
                        q: `Why is ${term || 'Term'} important for compliance?`,
                        a: `${term || 'Term'} is governed under Indian ${category} law. Understanding this concept is essential for ensuring regulatory compliance, avoiding penalties, and making corporate decisions in India.`
                      }
                    ]).map((faq, i) => (
                      <div key={i} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                        <h4 className="font-semibold text-navy flex items-center justify-between">
                          <span>{faq.q || 'Question...'}</span>
                          <span className="text-slate-400 text-[10px]">▼</span>
                        </h4>
                        <p className="mt-3 text-slate-600 text-sm leading-relaxed border-t border-slate-200/50 pt-3">
                          {faq.a || 'Answer will be displayed here...'}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Related Searches Section */}
                {keywords.length > 0 && (
                  <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm text-left">
                    <h3 className="text-lg font-bold text-navy mb-4 font-heading">Related Searches</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-sm bg-slate-50 text-slate-600 border border-slate-200/60 px-4 py-2 rounded-full font-medium shadow-sm flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                        >
                          <span>{kw}</span>
                          <span className="text-slate-400 text-xs">↗</span>
                        </span>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy font-semibold rounded-xl text-sm border border-slate-200 transition-colors"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false)
                  handleSubmit()
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-amber-500/10"
              >
                Save & Publish
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
