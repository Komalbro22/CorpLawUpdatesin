/* eslint-disable */
'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  ArrowLeft, Save, Sparkles, CheckCircle2, HelpCircle, Plus, 
  Trash2, X, Loader2, FileText, Layers, Hash, BookOpen, Upload, RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { slugify } from '@/lib/utils'
import { smartCleanContent } from '@/lib/html-to-markdown'
import { optimizeImageClientSide } from '@/lib/image-optimizer'
import CategoryBadge from '@/components/CategoryBadge'
import { Category } from '@/types'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES: Category[] = ['MCA', 'SEBI', 'RBI', 'IBC', 'NCLT', 'FEMA', 'CCI', 'LABOUR', 'IFSCA', 'INCOME_TAX']

interface KeyNumberItem {
  value: string
  label: string
  detail?: string
}

interface FaqItem {
  q: string
  a: string
}

export default function NewGlossaryTermPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [isSaving, setIsSaving] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'seo'>('edit')

  // Form Fields
  const [term, setTerm] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [category, setCategory] = useState<string>('MCA')
  const [isVerified, setIsVerified] = useState(false)

  // Structured Content Fields
  const [fullForm, setFullForm] = useState('')
  const [definition, setDefinition] = useState('')
  const [extendedNote, setExtendedNote] = useState('')
  const [hideDefinition, setHideDefinition] = useState(false)

  // Executive Takeaways (TL;DR)
  const [tldrPoints, setTldrPoints] = useState<string[]>([])
  const [tldrInput, setTldrInput] = useState('')
  const [bulkTldrText, setBulkTldrText] = useState('')
  const [showBulkTldr, setShowBulkTldr] = useState(false)

  // Key Numbers at a Glance
  const [keyNumbers, setKeyNumbers] = useState<KeyNumberItem[]>([])

  // FAQs
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [bulkFaqText, setBulkFaqText] = useState('')
  const [showBulkFaq, setShowBulkFaq] = useState(false)

  // Acronyms / Synonyms
  const [synonyms, setSynonyms] = useState<string[]>([])
  const [synonymInput, setSynonymInput] = useState('')

  // Tags / Keywords
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')

  // Related Terms
  const [relatedTerms, setRelatedTerms] = useState('')

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop')

  // HTML Cleaner & Image Uploading states
  const [showCleanConfirm, setShowCleanConfirm] = useState(false)
  const [cleanPreview, setCleanPreview] = useState('')
  const [cleanStats, setCleanStats] = useState<{
    tagsRemoved: number
    tablesKept: number
    styledDivsKept: number
  } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Word count & reading time calculation
  const getWordCount = (text: string): number => {
    if (!text) return 0
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return clean ? clean.split(/\s+/).length : 0
  }

  const defWords = getWordCount(definition)
  const noteWords = getWordCount(extendedNote)
  const totalWords = defWords + noteWords
  const readingTime = Math.max(1, Math.round(totalWords / 200))

  // Handlers
  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTerm(val)
    if (!slugEdited) {
      setSlug(slugify(val))
    }
  }

  // Synonyms tag input
  const handleSynonymKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = synonymInput.trim()
      if (val) {
        const items = val.split(/[,\n]/).map(s => s.trim()).filter(s => s && !synonyms.includes(s))
        if (items.length > 0) setSynonyms([...synonyms, ...items])
        setSynonymInput('')
      }
    } else if (e.key === 'Backspace' && !synonymInput && synonyms.length > 0) {
      setSynonyms(synonyms.slice(0, -1))
    }
  }

  const handleRemoveSynonym = (index: number) => {
    setSynonyms(synonyms.filter((_, i) => i !== index))
  }

  // Keywords tag input
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = keywordInput.trim()
      if (val) {
        const items = val.split(/[,\n]/).map(s => s.trim()).filter(s => s && !keywords.includes(s))
        if (items.length > 0) setKeywords([...keywords, ...items])
        setKeywordInput('')
      }
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1))
    }
  }

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  // TLDR point handlers
  const handleAddTldrPoint = () => {
    const val = tldrInput.trim()
    if (val) {
      setTldrPoints([...tldrPoints, val])
      setTldrInput('')
    }
  }

  const handleBulkTldrImport = () => {
    if (!bulkTldrText.trim()) return
    const lines = bulkTldrText.split('\n')
    const parsed: string[] = []
    for (const line of lines) {
      let trimmed = line.trim()
      if (!trimmed) continue
      trimmed = trimmed.replace(/^(?:[-*•+>]|\d+\.|\d+\))\s*/, '').trim()
      if (trimmed) parsed.push(trimmed)
    }
    if (parsed.length > 0) {
      setTldrPoints([...tldrPoints, ...parsed])
      setBulkTldrText('')
      setShowBulkTldr(false)
      showToast(`Imported ${parsed.length} takeaway points!`, 'success')
    }
  }

  // Key Numbers handlers
  const handleAddKeyNumber = () => {
    setKeyNumbers([...keyNumbers, { value: '', label: '', detail: '' }])
  }

  const handleUpdateKeyNumber = (index: number, field: keyof KeyNumberItem, val: string) => {
    const updated = [...keyNumbers]
    updated[index] = { ...updated[index], [field]: val }
    setKeyNumbers(updated)
  }

  const handleRemoveKeyNumber = (index: number) => {
    setKeyNumbers(keyNumbers.filter((_, i) => i !== index))
  }

  // FAQs handlers
  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }])
  }

  const handleUpdateFaq = (index: number, field: 'q' | 'a', val: string) => {
    const updated = [...faqs]
    updated[index] = { ...updated[index], [field]: val }
    setFaqs(updated)
  }

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const handleBulkFaqImport = () => {
    if (!bulkFaqText.trim()) return
    const lines = bulkFaqText.split('\n')
    const items: FaqItem[] = []
    let currentQ = ''
    let currentA: string[] = []

    const commit = () => {
      if (currentQ.trim() && currentA.join(' ').trim()) {
        items.push({ q: currentQ.trim(), a: currentA.join('\n').trim() })
      }
      currentQ = ''
      currentA = []
    }

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const isQuestionMarker = /^(?:Q|Question)\s*[\d\.]*[:\.-]?\s+/i.test(trimmed)
      const isQuestionEnding = trimmed.endsWith('?') && trimmed.length < 200

      if (isQuestionMarker || isQuestionEnding) {
        commit()
        currentQ = trimmed.replace(/^(?:Q|Question)\s*[\d\.]*[:\.-]?\s*/i, '').trim()
      } else {
        if (!currentQ && trimmed.endsWith('?') && trimmed.length < 200) {
          currentQ = trimmed
        } else if (currentQ) {
          currentA.push(trimmed)
        }
      }
    }
    commit()

    if (items.length > 0) {
      setFaqs([...faqs, ...items])
      setBulkFaqText('')
      setShowBulkFaq(false)
      showToast(`Imported ${items.length} FAQs successfully!`, 'success')
    } else {
      showToast('No valid Q&A pairs found.', 'info')
    }
  }

  // HTML Cleaner
  const handleCleanHtml = () => {
    if (!extendedNote.trim()) return
    const { cleaned, stats } = smartCleanContent(extendedNote)
    setCleanPreview(cleaned)
    setCleanStats(stats)
    setShowCleanConfirm(true)
  }

  const confirmCleanHtml = () => {
    setExtendedNote(cleanPreview)
    setShowCleanConfirm(false)
    setCleanPreview('')
    setCleanStats(null)
    showToast('HTML cleaned successfully while preserving styled elements!', 'success')
  }

  // Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const { file: optimizedFile, originalSize, optimizedSize, savingsPercent } = await optimizeImageClientSide(file)
      const formData = new FormData()
      formData.append('file', optimizedFile)

      const res = await fetch('/api/admin/articles/upload-image', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        const imageMarkdown = `\n![${term || 'image'}](${data.url})\n`
        setExtendedNote(prev => prev + imageMarkdown)
        const origMb = (originalSize / (1024 * 1024)).toFixed(2)
        const optKb = (optimizedSize / 1024).toFixed(0)
        showToast(`Uploaded optimized image! (${origMb}MB → ${optKb}KB, saved ${savingsPercent}%)`, 'success')
      } else {
        showToast('Image upload failed', 'error')
      }
    } catch (err) {
      showToast('Image upload failed', 'error')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Submit Handler
  const handleSubmit = async () => {
    if (!term.trim()) {
      showToast('Term name is required', 'error')
      return
    }

    setIsSaving(true)

    const payload = {
      term: term.trim(),
      slug: (slug || slugify(term)).trim(),
      category: category || 'MCA',
      is_verified: isVerified,
      definition: definition.trim(),
      body: extendedNote,
      hide_definition: hideDefinition,
      seo_title: seoTitle.trim(),
      seo_description: seoDescription.trim(),
      full_form: fullForm.trim(),
      tldr: tldrPoints.filter(Boolean),
      key_numbers: keyNumbers.filter(k => k.value.trim() && k.label.trim()),
      keywords,
      synonyms,
      related_terms: relatedTerms.split(',').map(s => s.trim()).filter(Boolean),
      faqs: faqs.filter(f => f.q.trim() && f.a.trim())
    }

    try {
      const res = await fetch('/api/admin/glossary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (!res.ok) {
        showToast('Error creating term: ' + (json.error || 'Creation failed'), 'error')
      } else {
        showToast('Glossary term created successfully!', 'success')
        router.push(`/admin/glossary/${json.term.id}/edit`)
      }
    } catch (e) {
      console.error(e)
      showToast('Network error while creating term.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen text-slate-800">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/glossary"
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200/60"
            title="Back to Glossary list"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy font-heading">
                New Glossary Term
              </h1>
              {category && <CategoryBadge category={category as Category} />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Create an article-style legal glossary definition with rich metadata and full AI SEO support.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Creating Term...' : 'Save & Create Entry'}
          </button>
        </div>
      </div>

      {/* MOBILE TABS */}
      <div className="flex lg:hidden bg-slate-100 rounded-lg p-1 mb-6 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveMobileTab('edit')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
            activeMobileTab === 'edit' ? 'bg-white text-navy shadow-xs' : 'text-slate-600'
          }`}
        >
          Editor & Content
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('seo')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
            activeMobileTab === 'seo' ? 'bg-white text-navy shadow-xs' : 'text-slate-600'
          }`}
        >
          SEO & Meta
        </button>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CORE EDITORIAL CONTENT (65%) */}
        <div className={`lg:col-span-8 space-y-6 ${activeMobileTab === 'seo' ? 'hidden lg:block' : 'block'}`}>
          {/* Term Title & Slug */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Term Name (Page H1) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={term}
                onChange={handleTermChange}
                placeholder="e.g. Insolvency and Bankruptcy Board of India (IBBI)"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-2.5 text-xl font-heading font-bold text-navy focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(true)
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))
                    }}
                    placeholder="ibbi"
                    className="flex-1 bg-slate-50/50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                  {slugEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlugEdited(false)
                        setSlug(slugify(term))
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
                      title="Reset slug from Term"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  /glossary/{slug || '...'}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Regulator / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Full Form & Acronyms / Synonyms */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Full Form & Synonyms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Form
                  <span className="text-slate-400 font-normal ml-1">(shown under title & powers abbreviation search)</span>
                </label>
                <input
                  type="text"
                  value={fullForm}
                  onChange={(e) => setFullForm(e.target.value)}
                  placeholder="e.g. Insolvency and Bankruptcy Board of India"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acronyms / Synonyms
                  <span className="text-slate-400 font-normal ml-1">(powers pill chips on page)</span>
                </label>
                <div className="border border-slate-300 rounded-lg p-2 bg-white flex flex-wrap gap-1.5 items-center min-h-[38px]">
                  {synonyms.map((syn, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      {syn}
                      <button
                        type="button"
                        onClick={() => handleRemoveSynonym(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={synonymInput}
                    onChange={(e) => setSynonymInput(e.target.value)}
                    onKeyDown={handleSynonymKeyDown}
                    placeholder={synonyms.length === 0 ? "Type and press Enter or comma..." : "Add more..."}
                    className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-hidden p-0.5 text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Definition (Summary Card) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <label className="text-sm font-bold text-navy flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Primary Definition
                <span className="text-xs font-normal text-slate-400">(concise statutory summary)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={hideDefinition}
                  onChange={(e) => setHideDefinition(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                Hide Definition Card on page (use when Body has full layout)
              </label>
            </div>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={3}
              placeholder="Under the Insolvency and Bankruptcy Code, 2016, IBBI is the statutory regulator overseeing..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-hidden bg-white leading-relaxed resize-y"
            />
            <div className="text-right text-[11px] text-slate-400">
              {defWords} words · {definition.length} characters
            </div>
          </div>

          {/* Executive Takeaways (TL;DR) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <label className="text-sm font-bold text-navy flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Executive Takeaways (TL;DR)
                <span className="text-xs font-normal text-slate-400">({tldrPoints.length} points)</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkTldr(!showBulkTldr)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  {showBulkTldr ? 'Close Bulk Import' : 'Bulk Import Points'}
                </button>
              </div>
            </div>

            {showBulkTldr && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <p className="text-xs text-amber-900 font-medium">
                  Paste bullet points copied from notes, chats, or statutory circulars. Prefix bullets (•, -, *, 1.) will be cleanly stripped.
                </p>
                <textarea
                  value={bulkTldrText}
                  onChange={(e) => setBulkTldrText(e.target.value)}
                  placeholder="• Apex regulatory authority under IBC 2016&#10;• Regulates Insolvency Professionals (IPs) & IPAs&#10;• Headquartered in New Delhi"
                  rows={4}
                  className="w-full border border-amber-200 rounded-lg p-2.5 text-xs text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleBulkTldrImport}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  Import Takeaways
                </button>
              </div>
            )}

            <div className="space-y-2">
              {tldrPoints.map((point, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-amber-500 font-bold select-none text-xs w-4 text-center">•</span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const updated = [...tldrPoints]
                      updated[idx] = e.target.value
                      setTldrPoints(updated)
                    }}
                    placeholder={`Takeaway ${idx + 1}...`}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-hidden bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setTldrPoints(tldrPoints.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Remove point"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={tldrInput}
                  onChange={(e) => setTldrInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTldrPoint()
                    }
                  }}
                  placeholder="Add a new takeaway point..."
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-hidden bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddTldrPoint}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 transition-colors"
                >
                  + Add Point
                </button>
              </div>
            </div>
          </div>

          {/* Key Numbers at a Glance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <label className="text-sm font-bold text-navy flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-500" />
                Key Numbers at a Glance
                <span className="text-xs font-normal text-slate-400">(structured stat cards)</span>
              </label>
              <button
                type="button"
                onClick={handleAddKeyNumber}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                + Add Metric Card
              </button>
            </div>

            {keyNumbers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No key numbers added. If added, they will render as high-impact statutory metric cards.
              </p>
            ) : (
              <div className="space-y-3">
                {keyNumbers.map((kn, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/70">
                    <input
                      type="text"
                      value={kn.value}
                      onChange={(e) => handleUpdateKeyNumber(idx, 'value', e.target.value)}
                      placeholder="Value (e.g. ₹10Cr, 30 days)"
                      className="w-full sm:w-1/4 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-navy bg-white focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={kn.label}
                      onChange={(e) => handleUpdateKeyNumber(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Statutory threshold)"
                      className="w-full sm:w-1/2 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={kn.detail || ''}
                      onChange={(e) => handleUpdateKeyNumber(idx, 'detail', e.target.value)}
                      placeholder="Detail/Section (optional)"
                      className="w-full sm:w-1/4 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 bg-white focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyNumber(idx)}
                      className="text-slate-400 hover:text-red-500 self-end sm:self-center p-1"
                      title="Remove metric"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Body — Partial HTML & Markdown Editor */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3" data-color-mode="light">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <label className="text-sm font-bold text-navy flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  Body (Partial-HTML & Markdown)
                </label>
                <p className="text-xs text-slate-400">
                  Full article-style content. Supports raw styled HTML, code mode, Markdown, and custom components.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCleanHtml}
                  title="Clean pasted HTML while preserving styled cards, tables, and colors"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  🧹 Clean HTML
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>

            {/* Clean HTML Preview Confirmation */}
            {showCleanConfirm && cleanStats && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">HTML Clean Preview Ready</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Stripped {cleanStats.tagsRemoved} junk tags · Preserved {cleanStats.tablesKept} tables & {cleanStats.styledDivsKept} styled containers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCleanConfirm(false)}
                    className="text-amber-800 hover:text-amber-950"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={confirmCleanHtml}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                  >
                    Apply Cleaned Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCleanConfirm(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <MDEditor
                value={extendedNote}
                onChange={(val) => setExtendedNote(val || '')}
                height={550}
                preview="edit"
                hideToolbar={false}
                previewOptions={{
                  rehypePlugins: [[require('rehype-raw')]]
                }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>{noteWords} words · {readingTime} min read</span>
              <span>Styled HTML paste directly supported</span>
            </div>
          </div>

          {/* FAQs Management */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <label className="text-sm font-bold text-navy flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Frequently Asked Questions ({faqs.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkFaq(!showBulkFaq)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  {showBulkFaq ? 'Close Bulk Import' : 'Bulk Import FAQs'}
                </button>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  + Add FAQ
                </button>
              </div>
            </div>

            {showBulkFaq && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <p className="text-xs text-amber-900 font-medium">
                  Paste questions and answers formatted as Q1. / Answer or Question: / Answer: or lines ending in '?'.
                </p>
                <textarea
                  value={bulkFaqText}
                  onChange={(e) => setBulkFaqText(e.target.value)}
                  placeholder="Q1. What is the role of IBBI?&#10;IBBI is the apex regulator overseeing insolvency proceedings under IBC 2016.&#10;&#10;Q2. Who appoints the IBBI chairperson?&#10;The Central Government appoints the chairperson and members."
                  rows={6}
                  className="w-full border border-amber-200 rounded-lg p-2.5 text-xs text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleBulkFaqImport}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  Parse & Import FAQs
                </button>
              </div>
            )}

            {faqs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No manual FAQs entered. Dynamic baseline FAQs will be automatically generated unless added here.
              </p>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-navy">Question {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Remove FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                      placeholder="e.g. What is the statutory role of IBBI?"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                    />
                    <textarea
                      value={faq.a}
                      onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                      rows={2}
                      placeholder="Enter the detailed answer..."
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Keywords & Related Terms */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2 border-b border-slate-100 pb-2">
              <Hash className="w-4 h-4 text-amber-500" />
              Search Keywords & Related Terms
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search Keywords (Related Searches on page)
                </label>
                <div className="border border-slate-300 rounded-lg p-2 bg-white flex flex-wrap gap-1.5 items-center min-h-[38px]">
                  {keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    placeholder={keywords.length === 0 ? "Type keyword and press Enter..." : "Add keyword..."}
                    className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-hidden p-0.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Related Terms
                  <span className="text-slate-400 font-normal ml-1">(comma-separated exact term names for reciprocal cards)</span>
                </label>
                <input
                  type="text"
                  value={relatedTerms}
                  onChange={(e) => setRelatedTerms(e.target.value)}
                  placeholder="e.g. CIRP, Insolvency Professional, Committee of Creditors"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SEO, SERP PREVIEW, PUBLISHING (35%) */}
        <div className={`lg:col-span-4 space-y-6 lg:sticky lg:top-6 ${activeMobileTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
          {/* Publishing & Verification Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center justify-between border-b border-slate-100 pb-2">
              <span>Publishing & Status</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isVerified ? 'Live on Site' : 'Draft'}
              </span>
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div>
                <p className="text-xs font-bold text-slate-800">Publish in Directory & Sitemap</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isVerified ? 'Included in sitemap.xml & crawlable' : 'Hidden from sitemap.xml'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Reading Time:</span>
                <span className="font-semibold text-slate-700">{readingTime} min read</span>
              </div>
              <div className="flex justify-between">
                <span>Total Words:</span>
                <span className="font-semibold text-slate-700">{totalWords} words</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Creating Term...' : 'Save & Create Entry'}
            </button>
          </div>

          {/* SEO & Search Engine Optimization Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Search Engine Optimization (SEO)
            </h3>

            {/* SEO Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">SEO Title</label>
                <span className={`text-[10px] font-mono font-semibold ${
                  seoTitle.length > 80 ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {seoTitle.length}/80
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`${term || 'Term'} — Meaning, Definition | CorpLawUpdates`}
                className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:outline-hidden ${
                  seoTitle.length > 80 ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-300 focus:ring-1 focus:ring-amber-400'
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Keep ≤ 80 characters. Add primary search keywords (e.g. 'full form', section number).
              </p>
            </div>

            {/* SEO Meta Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">SEO Meta Description</label>
                <span className={`text-[10px] font-mono font-semibold ${
                  seoDescription.length > 250 ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {seoDescription.length}/250
                </span>
              </div>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                placeholder="Comprehensive overview of statutory rules, penalties, and compliance checklists..."
                className={`w-full border rounded-lg p-2.5 text-xs text-slate-900 bg-white focus:outline-hidden resize-none ${
                  seoDescription.length > 250 ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-300 focus:ring-1 focus:ring-amber-400'
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Keep ≤ 250 characters. Concise factual summary for Google SERP & AI overviews.
              </p>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Google Search Preview
                </span>
                <div className="flex bg-slate-100 rounded-md p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSerpDevice('desktop')}
                    className={`px-2 py-0.5 rounded-sm transition-colors ${
                      serpDevice === 'desktop' ? 'bg-white text-navy shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpDevice('mobile')}
                    className={`px-2 py-0.5 rounded-sm transition-colors ${
                      serpDevice === 'mobile' ? 'bg-white text-navy shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 font-sans text-left space-y-1">
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <span>https://www.corplawupdates.in</span>
                  <span>›</span>
                  <span>glossary</span>
                  <span>›</span>
                  <span className="text-slate-700 font-semibold">{slug || 'term'}</span>
                </div>
                <div className="text-sm font-semibold text-blue-700 hover:underline line-clamp-2 leading-snug cursor-pointer">
                  {seoTitle || `${term || 'Term'} — Meaning, Definition | CorpLawUpdates Legal Glossary`}
                </div>
                <div className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {seoDescription || definition || 'Comprehensive statutory compliance guide, definitions, and legal overview under Indian Corporate Law.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
