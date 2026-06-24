/* eslint-disable */
'use client'

import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FilePenLine } from 'lucide-react'
import { slugify, calculateReadingTime, formatDate } from '@/lib/utils'
import { smartCleanContent } from '@/lib/html-to-markdown'
import CategoryBadge from '@/components/CategoryBadge'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { useToast } from '@/components/Toast'
import { Category } from '@/types'
import SeoScorePanel from '@/components/admin/SeoScorePanel'
import { optimizeImageClientSide } from '@/lib/image-optimizer'
import LinkChecker from '@/components/admin/LinkChecker'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES: Category[] = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']

export default function EditArticle({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { showToast } = useToast()
    const { id } = params

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [slugEdited, setSlugEdited] = useState(false)
    const [summary, setSummary] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState<string>('')

    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    const [sourceName, setSourceName] = useState('')
    const [sourceUrl, setSourceUrl] = useState('')
    const [sources, setSources] = useState<{name: string, url: string}[]>([])

    const [seoTitle, setSeoTitle] = useState('')
    const [seoDescription, setSeoDescription] = useState('')

    const [publishedAt, setPublishedAt] = useState('')
    const [isFeatured, setIsFeatured] = useState(false)

    const [keyChange, setKeyChange] = useState('')
    const [keyChanges, setKeyChanges] = useState<string[]>([])
    const [effectiveDate, setEffectiveDate] = useState('')
    const [bulkTldrText, setBulkTldrText] = useState('')
    const [showBulkTldr, setShowBulkTldr] = useState(false)
    const [impactLevel, setImpactLevel] = useState<'high' | 'medium' | 'low' | ''>('')
    const [quickAnswer, setQuickAnswer] = useState('')
    const [regulationRef, setRegulationRef] = useState('')
    const [lastVerified, setLastVerified] = useState('')
    const [lastAmended, setLastAmended] = useState('')
    const [keyTakeaways, setKeyTakeaways] = useState<string[]>([])
    const [hasSteps, setHasSteps] = useState(false)
    const [stepsJson, setStepsJson] = useState<{heading: string, description: string}[]>([])

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
    const [uploadingImage, setUploadingImage] = useState(false)

    const [showCleanConfirm, setShowCleanConfirm] = useState(false)
    const [cleanPreview, setCleanPreview] = useState('')
    const [cleanStats, setCleanStats] = useState<{
        tagsRemoved: number
        tablesKept: number
        styledDivsKept: number
    } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const AUTOSAVE_KEY = `article_autosave_${id}`
    const [lastAutosaved, setLastAutosaved] = useState<Date | null>(null)

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/admin/articles/${id}`)
                if (!res.ok) {
                    setError('Failed to fetch article')
                    setPageLoading(false)
                    return
                }
                const data = await res.json()
                setTitle(data.title || '')
                setSlug(data.slug || '')
                setSlugEdited(true)
                setSummary(data.summary || '')
                setContent(data.content || '')
                setCategory(data.category || '')
                setTags(data.tags || [])
                setSourceName(data.source_name || '')
                setSourceUrl(data.source_url || '')
                setSources(data.sources || [])
                setSeoTitle(data.seo_title || '')
                setSeoDescription(data.seo_description || '')
                setIsFeatured(data.is_featured || false)
                setKeyChange(data.key_change || '')
                setKeyChanges(data.key_changes || [])
                setEffectiveDate(data.effective_date || '')
                setImpactLevel(data.impact_level || '')
                setQuickAnswer(data.quick_answer || '')
                setRegulationRef(data.regulation_ref || '')
                setLastVerified(data.last_verified || '')
                setLastAmended(data.last_amended || '')
                setKeyTakeaways(data.key_takeaways || [])
                setHasSteps(data.has_steps || false)
                setStepsJson(data.steps_json || [])

                if (data.published_at) {
                    // Convert to datetime-local format
                    const date = new Date(data.published_at)
                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
                    setPublishedAt(date.toISOString().slice(0, 16))
                } else {
                    const now = new Date()
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
                    setPublishedAt(now.toISOString().slice(0, 16))
                }
            } catch (err) {
                console.error(err)
            } finally {
                setPageLoading(false)
            }
        }
        fetchArticle()
    }, [id])

    // Load from autosave after page loads
    useEffect(() => {
        if (pageLoading) return
        const saved = localStorage.getItem(AUTOSAVE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // Basic check if draft is newer than DB (for MVP we just ask)
                if (confirm('A local draft was found. Do you want to restore it?')) {
                    if (parsed.title) setTitle(parsed.title)
                    if (parsed.slug) setSlug(parsed.slug)
                    if (parsed.content) setContent(parsed.content)
                    if (parsed.summary) setSummary(parsed.summary)
                    if (parsed.category) setCategory(parsed.category)
                    setLastAutosaved(new Date())
                } else {
                    localStorage.removeItem(AUTOSAVE_KEY)
                }
            } catch (e) {}
        }
    }, [pageLoading, AUTOSAVE_KEY])

    // Autosave interval
    useEffect(() => {
        if (pageLoading) return
        const interval = setInterval(() => {
            if (title || content || summary) {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
                    title, slug, content, summary, category
                }))
                setLastAutosaved(new Date())
            }
        }, 10000)
        return () => clearInterval(interval)
    }, [title, slug, content, summary, category, pageLoading, AUTOSAVE_KEY])

    const handleTitleChange = (val: string) => {
        setTitle(val)
        if (!slugEdited) {
            setSlug(slugify(val))
        }
    }

    const addKeyChange = () => setKeyChanges([...keyChanges, ''])
    const updateKeyChange = (index: number, value: string) => {
        const newArr = [...keyChanges]
        newArr[index] = value
        setKeyChanges(newArr)
    }
    const removeKeyChange = (index: number) => {
        setKeyChanges(keyChanges.filter((_, i) => i !== index))
    }

    const addKeyTakeaway = () => setKeyTakeaways([...keyTakeaways, ''])
    const updateKeyTakeaway = (index: number, value: string) => {
        const newArr = [...keyTakeaways]
        newArr[index] = value
        setKeyTakeaways(newArr)
    }
    const removeKeyTakeaway = (index: number) => {
        setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index))
    }

    const addStep = () => setStepsJson([...stepsJson, { heading: '', description: '' }])
    const updateStep = (index: number, field: 'heading'|'description', value: string) => {
        const newArr = [...stepsJson]
        newArr[index][field] = value
        setStepsJson(newArr)
    }
    const removeStep = (index: number) => {
        setStepsJson(stepsJson.filter((_, i) => i !== index))
    }

    const handleBulkTldrImport = () => {
        if (!bulkTldrText.trim()) return
        const lines = bulkTldrText.split('\n')
        const parsed: string[] = []
        for (const line of lines) {
            let trimmed = line.trim()
            if (!trimmed) continue
            // Clean prefix bullets (- * • + 1. etc.)
            trimmed = trimmed
                .replace(/^(?:[-*•+>]|\d+\.|\d+\))\s*/, '')
                .trim()
            if (trimmed) {
                parsed.push(trimmed)
            }
        }
        if (parsed.length > 0) {
            setKeyChanges([...keyChanges, ...parsed])
            setBulkTldrText('')
            setShowBulkTldr(false)
        }
    }

    const addSource = () => setSources([...sources, {name: '', url: ''}])
    const updateSource = (index: number, field: 'name'|'url', value: string) => {
        const newArr = [...sources]
        newArr[index][field] = value
        setSources(newArr)
    }
    const removeSource = (index: number) => {
        setSources(sources.filter((_, i) => i !== index))
    }

    function handleClean() {
        if (!content.trim()) return

        const { cleaned, stats } = smartCleanContent(content)
        setCleanPreview(cleaned)
        setCleanStats(stats)
        setShowCleanConfirm(true)
    }

    function confirmClean() {
        setContent(cleanPreview)
        setShowCleanConfirm(false)
        setCleanPreview('')
        setCleanStats(null)
    }

    function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const val = tagInput.trim()
            if (!val) return
            const newTags = val
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0 && !tags.includes(t))
            if (newTags.length) {
                setTags(prev => [...prev, ...newTags])
                setTagInput('')
            }
        }
        if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(prev => prev.slice(0, -1))
        }
    }

    function handleTagPaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text')
        const newTags = pasted
            .split(/[,\n\t]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0 && !tags.includes(t))
        if (newTags.length) {
            setTags(prev => [...prev, ...newTags])
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage(true)

        try {
            const { file: optimizedFile, originalSize, optimizedSize, savingsPercent } = await optimizeImageClientSide(file)
            
            const formData = new FormData()
            formData.append('file', optimizedFile)

            // Using ID specific route for image upload
            const res = await fetch(`/api/admin/articles/${id}/image`, {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                const data = await res.json()
                const imageMarkdown = `\n![image](${data.url})\n`
                setContent((prev) => prev + imageMarkdown)
                
                const origMb = (originalSize / (1024 * 1024)).toFixed(2)
                const optKb = (optimizedSize / 1024).toFixed(0)
                const msg = savingsPercent > 0 
                    ? `Uploaded optimized WebP! (${origMb}MB → ${optKb}KB, saved ${savingsPercent}%)`
                    : 'Image inserted into article'
                showToast(msg, 'success')
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

    const handleSave = async (publishedAtValue: string | null) => {
        if (!title.trim() || !category || !summary.trim()) {
            setError('Title, category, and summary are required.')
            return
        }

        setSaving(true)
        setError('')

        try {
            const res = await fetch(`/api/admin/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    slug: slug || slugify(title),
                    summary,
                    content,
                    category,
                    tags,
                    source_url: sourceUrl || null,
                    source_name: sourceName || null,
                    sources: sources.filter(s => s.name.trim() || s.url.trim()).length > 0 ? sources.filter(s => s.name.trim() || s.url.trim()) : null,
                    seo_title: seoTitle.trim() || null,
                    seo_description: seoDescription.trim() || null,
                    published_at: publishedAtValue,
                    is_featured: isFeatured,
                    key_change: keyChange.trim() || null,
                    key_changes: keyChanges.filter(k => k.trim()).length > 0 ? keyChanges.filter(k => k.trim()) : null,
                    effective_date: effectiveDate || null,
                    impact_level: impactLevel || null,
                    quick_answer: quickAnswer.trim() || null,
                    regulation_ref: regulationRef.trim() || null,
                    last_verified: lastVerified || null,
                    last_amended: lastAmended || null,
                    key_takeaways: keyTakeaways.filter(k => k.trim()).length > 0 ? keyTakeaways.filter(k => k.trim()) : null,
                    has_steps: hasSteps,
                    steps_json: stepsJson.filter(s => s.heading.trim() || s.description.trim()).length > 0 ? stepsJson.filter(s => s.heading.trim() || s.description.trim()) : null,
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                showToast('Article saved', 'success')
                setSaving(false)
                setTimeout(() => {
                    router.push('/admin/articles')
                }, 1500)
            } else {
                setError(data.error || 'Failed to save article')
                setSaving(false)
                showToast(data.error || 'Failed to save article', 'error')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setSaving(false)
            showToast('Something went wrong. Please try again.', 'error')
        }
    }

    const handleUnpublish = async () => {
        if (!confirm('Are you sure you want to unpublish this article? It will remain as a draft.')) return
        await handleSave(null)
    }

    if (pageLoading) {
        return (
            <div className="space-y-6">
                <h1 className="font-heading font-bold text-2xl text-slate-900">Edit Article</h1>
                <div className="h-20 w-full"><LoadingSkeleton /></div>
                <div className="h-64 w-full"><LoadingSkeleton /></div>
                <div className="h-40 w-full"><LoadingSkeleton /></div>
            </div>
        )
    }

    return (
        <div className="pb-24 content-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
                    <FilePenLine className="w-7 h-7 text-amber-600 shrink-0" aria-hidden />
                    Edit article
                </h1>

                {/* Mobile Tabs */}
                <div className="flex lg:hidden bg-slate-200 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('write')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'write' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT COLUMN - FORM */}
                <div className={`w-full lg:w-[60%] space-y-6 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    {/* Title */}
                    <div>
                        <input
                            type="text"
                            placeholder="Article title..."
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full bg-transparent font-heading font-bold text-3xl placeholder:text-slate-500 text-slate-900 border-none focus:outline-none focus:ring-0 p-0"
                            autoFocus
                        />
                    </div>

                    {/* Slug */}
                    <div className="border border-slate-200/80  rounded-xl p-5 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02] space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-900  mb-1">URL Slug</label>
                            <div className="flex gap-2 items-start">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlugEdited(true)
                                        setSlug(e.target.value)
                                    }}
                                    className="flex-1 border border-slate-300  rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none font-mono text-slate-900 bg-white bg-slate-50"
                                />
                                {slugEdited && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSlugEdited(false)
                                            setSlug(slugify(title))
                                        }}
                                        className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-800 px-3 py-2 bg-slate-100  rounded-lg text-slate-700"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-500  mt-2 font-mono">
                                corplawupdates.in/updates/{slug || '...'}
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900  mb-1">Regulator / Category <span className="text-red-500">*</span></label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none text-slate-900 bg-white bg-slate-50"
                            >
                                <option value="" disabled>Select a category...</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="border border-slate-200/80  rounded-xl p-5 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02]">
                        <label className="block text-sm font-bold text-slate-900  mb-1">Summary <span className="text-red-500">*</span></label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            maxLength={300}
                            rows={3}
                            placeholder="Brief summary shown in article cards..."
                            className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none text-slate-900 bg-white  resize-none"
                        />
                        <div className="text-right text-xs text-slate-500  mt-1">
                            {summary.length}/300
                        </div>
                    </div>

                    {/* Key Change, Effective Date, Impact Level */}
                    <div className="border border-slate-200/80  rounded-xl p-5 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02] space-y-5">
                        <div>
                            <label htmlFor="keyChange" className="block text-sm font-semibold text-slate-900  mb-2">
                                Key Change Pill
                                <span className="text-slate-500  font-normal ml-2 text-xs">
                                    (optional — one-liner shown as highlighted box)
                                </span>
                            </label>
                            <input
                                id="keyChange"
                                type="text"
                                value={keyChange}
                                onChange={(e) => setKeyChange(e.target.value)}
                                placeholder="e.g. DIR-3 KYC filing fee increased to ₹5,000"
                                className="w-full border border-slate-300  rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-900">
                                    TL;DR — Executive Summary
                                    <span className="text-slate-500  font-normal ml-2 text-xs">
                                        (optional — key takeaways optimized for SEO & AI quick scan)
                                    </span>
                                </label>
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowBulkTldr(!showBulkTldr)} 
                                        className="text-xs bg-slate-100  hover:bg-slate-200  text-slate-900  font-semibold px-2.5 py-1 rounded transition-colors"
                                    >
                                        {showBulkTldr ? 'Close Bulk Import' : 'Bulk Import Points'}
                                    </button>
                                    <button type="button" onClick={addKeyChange} className="text-xs bg-slate-100  hover:bg-slate-200  text-slate-700  px-2.5 py-1 rounded transition-colors">+ Add Point</button>
                                </div>
                            </div>

                            {showBulkTldr ? (
                                <div className="space-y-2 bg-slate-50 bg-slate-50 border border-slate-200  p-3 rounded-lg mb-3">
                                    <span className="text-[11px] text-slate-500  block font-medium">Paste bulleted lines here (copied from chat/docs). Clean formatting is applied automatically.</span>
                                    <textarea 
                                        value={bulkTldrText}
                                        onChange={(e) => setBulkTldrText(e.target.value)}
                                        placeholder="• Bullet 1&#10;• Bullet 2&#10;• Bullet 3"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-slate-300  rounded-lg text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none text-slate-900 bg-white bg-white"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleBulkTldrImport}
                                        className="w-full py-1.5 text-xs btn-vibrant-amber text-white font-bold rounded-lg transition-colors shadow-sm"
                                    >
                                        Parse & Import Takeaways
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {keyChanges.map((kc, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={kc}
                                                onChange={(e) => updateKeyChange(idx, e.target.value)}
                                                placeholder={`Key takeaway point ${idx + 1}...`}
                                                className="flex-1 border border-slate-300  rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-slate-900 bg-white bg-slate-50"
                                            />
                                            <button type="button" onClick={() => removeKeyChange(idx)} className="text-slate-500 hover:text-red-500 px-2">×</button>
                                        </div>
                                    ))}
                                    {keyChanges.length === 0 && (
                                        <div className="text-xs text-slate-500  italic">No executive points added. Click '+ Add Point' to add.</div>
                                    )}
                                </div>
                            )}

                            {/* AI Citation Guidelines & Pre-fill Templates */}
                            <details className="mt-3 bg-slate-50 bg-slate-50 border border-slate-200  rounded-xl overflow-hidden transition-all duration-200">
                                <summary className="cursor-pointer text-xs font-semibold text-slate-700  hover:text-slate-900 dark:hover:text-slate-800 px-4 py-3 bg-slate-105/50 bg-white/50 flex justify-between items-center select-none">
                                    <span>💡 Google & Bing AI SEO Guidelines & Templates</span>
                                    <span className="text-slate-450  text-[10px]">Click to expand</span>
                                </summary>
                                <div className="p-4 space-y-4 text-xs text-slate-600  leading-relaxed border-t border-slate-200">
                                    {/* 1. Bullet Takeaways */}
                                    <div>
                                        <p className="font-bold text-slate-900  mb-1">1. Writing High-Density Takeaways (TL;DR):</p>
                                        <p>
                                            To make your bullet points highly quoteable by Gemini & Copilot RAG grounding engines, ensure they contain:
                                        </p>
                                        <ul className="list-disc list-inside mt-1 ml-1 space-y-1 text-slate-500">
                                            <li><strong>Exact circular numbers</strong> and dates.</li>
                                            <li><strong>Specific entities affected</strong> (e.g."Listed companies with assets &gt; ₹250 Cr").</li>
                                            <li><strong>Explicit penalties</strong> for non-compliance.</li>
                                        </ul>
                                        <div className="flex gap-2 flex-wrap mt-2.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setKeyChanges(["MCA vide Circular No. [Circular_No] dated [Date] has [extended/modified] the compliance deadline for [Form Name].","This is applicable to [Target Entities/Companies] having a paid-up capital of [X] or more.","Non-compliance will attract an additional fee of [X] per day under Section [Y] of the Companies Act, 2013."
                                                    ])
                                                    showToast('Companies Act template applied!', 'success')
                                                }}
                                                className="bg-white bg-white hover:bg-amber-50  border border-slate-200  hover:border-amber-400 dark:hover:border-amber-500 text-slate-700  px-3 py-1.5 rounded-lg font-medium transition-all"
                                            >
                                                🏛️ Companies Act Template
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setKeyChanges(["SEBI vide Circular SEBI/HO/[Dept]/[Circular_No] dated [Date] has introduced new guidelines for [Subject].","Applicable immediately to all listed companies having a market capitalization of [X] or more.","Compliance reports must be submitted on a [quarterly/annual] basis within [X] days from [event]."
                                                    ])
                                                    showToast('SEBI Circular template applied!', 'success')
                                                }}
                                                className="bg-white bg-white hover:bg-amber-50  border border-slate-200  hover:border-amber-400 dark:hover:border-amber-500 text-slate-700  px-3 py-1.5 rounded-lg font-medium transition-all"
                                            >
                                                📈 SEBI Circular Template
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setKeyChanges(["RBI Notification RBI/[Year]/[No] / [Ref] dated [Date] modifies the [Policy/Rule Name].","Applies to all [Scheduled Commercial Banks / NBFCs / Payment Gateways].","The effective date for implementation of the revised rules is [Date]."
                                                    ])
                                                    showToast('RBI Notification template applied!', 'success')
                                                }}
                                                className="bg-white bg-white hover:bg-amber-50  border border-slate-200  hover:border-amber-400 dark:hover:border-amber-500 text-slate-700  px-3 py-1.5 rounded-lg font-medium transition-all"
                                            >
                                                🏦 RBI Circular Template
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Writing Format Guidance */}
                                    <div className="border-t border-slate-200/80  pt-3">
                                        <p className="font-bold text-slate-900  mb-1">2. Core Prose & Q&A Formatting (Google & Bing AI Search):</p>
                                        <ul className="list-disc list-inside space-y-1.5 text-slate-500">
                                            <li><strong>Answer-First Structure</strong>: Always put direct, bolded regulatory answers in the first sentence under heading tags (`## Heading`). Move details and explanations further down.</li>
                                            <li><strong>Trigger FAQ Schema</strong>: Format questions inside your markdown using clear prefixes like <code>Q1: [Question]?</code> or <code>Question 1: [Question]?</code>. The site template automatically parses these to build schema indexing metadata!</li>
                                        </ul>
                                    </div>

                                    {/* 3. Human E-E-A-T credentials */}
                                    <div className="border-t border-slate-200/80  pt-3">
                                        <p className="font-bold text-slate-900  mb-1">3. Human E-E-A-T Trust Bio Credentials (Bottom of Article):</p>
                                        <p className="mb-2">To prevent search engines from filtering your legal content, always copy and paste one of these verified, high-trust bio templates at the very bottom of your Article Content box:</p>
                                        <div className="space-y-2">
                                            <div className="bg-white admin-card-glass  p-2.5 rounded-lg">
                                                <p className="font-semibold text-slate-900  text-[10px] uppercase mb-0.5">Template 1 — Editorial Board Bio</p>
                                                <code className="text-slate-600  select-all block bg-slate-55 bg-slate-50 p-1.5 rounded font-mono text-[10px] border border-slate-100">
                                                    *This compliance alert was prepared by the editorial board of CorpLawUpdates.in, specializing in real-time corporate regulatory intelligence in India.*
                                                </code>
                                            </div>
                                            <div className="bg-white admin-card-glass  p-2.5 rounded-lg">
                                                <p className="font-semibold text-slate-900  text-[10px] uppercase mb-0.5">Template 2 — Chief Editor Bio</p>
                                                <code className="text-slate-600  select-all block bg-slate-55  p-1.5 rounded font-mono text-[10px] border border-slate-100">
                                                    *Factual summary prepared by the Editorial Team at CorpLawUpdates.in.*
                                                </code>
                                            </div>
                                            <div className="bg-white admin-card-glass  p-2.5 rounded-lg">
                                                <p className="font-semibold text-slate-900  text-[10px] uppercase mb-0.5">Template 3 — Research Team Bio</p>
                                                <code className="text-slate-600  select-all block bg-slate-55  p-1.5 rounded font-mono text-[10px] border border-slate-100">
                                                    *This article has been researched and compiled by the corporate intelligence team at CorpLawUpdates.in to provide verified regulatory updates.*
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>

                        <div>
                            <label htmlFor="effectiveDate" className="block text-sm font-semibold text-slate-900  mb-2">
                                Effective Date
                                <span className="text-slate-500  font-normal ml-2 text-xs">
                                    (optional — when does this change take effect?)
                                </span>
                            </label>
                            <input
                                id="effectiveDate"
                                type="date"
                                value={effectiveDate}
                                onChange={(e) => setEffectiveDate(e.target.value)}
                                className="border border-slate-300  rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent w-full bg-white"
                            />
                            <p className="text-xs text-slate-500  mt-1">
                                Shown on article card and page for quick reference
                            </p>
                        </div>

                        <div>
                            <label htmlFor="impactLevel" className="block text-sm font-semibold text-slate-900  mb-2">
                                Impact Level
                                <span className="text-slate-500  font-normal ml-2 text-xs">
                                    (optional)
                                </span>
                            </label>
                            <select
                                id="impactLevel"
                                value={impactLevel}
                                onChange={(e) => setImpactLevel(e.target.value as 'high' | 'medium' | 'low' | '')}
                                className="w-full border border-slate-300  rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                            >
                                <option value="">Select impact level...</option>
                                <option value="high">🔴 High Impact — Major regulatory change</option>
                                <option value="medium">🟡 Medium Impact — Amendment to existing rule</option>
                                <option value="low">🟢 Low Impact — Clarification or minor circular</option>
                            </select>
                            <p className="text-xs text-slate-500  mt-1">
                                Shown as badge on article card and page
                            </p>
                        </div>
                        </div>

                        {/* GEO Fields Added for AI Optimization */}
                        <div className="pt-4 border-t border-slate-200/80  space-y-5">
                            <h4 className="font-bold text-slate-900  text-sm">Generative Engine Optimization (GEO)</h4>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-900  mb-2">Quick Answer (AI Box)</label>
                                <textarea
                                    value={quickAnswer}
                                    onChange={(e) => setQuickAnswer(e.target.value)}
                                    placeholder="Direct 1-2 sentence answer to the most common query about this article..."
                                    rows={2}
                                    className="w-full border border-slate-300  rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900  mb-2">Regulation Ref</label>
                                    <input
                                        type="text"
                                        value={regulationRef}
                                        onChange={(e) => setRegulationRef(e.target.value)}
                                        placeholder="e.g. Section 135 of Companies Act"
                                        className="w-full border border-slate-300  rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900  mb-2">Last Amended</label>
                                    <input
                                        type="date"
                                        value={lastAmended}
                                        onChange={(e) => setLastAmended(e.target.value)}
                                        className="w-full border border-slate-300  rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900  mb-2">Last Verified By Team</label>
                                <input
                                    type="date"
                                    value={lastVerified}
                                    onChange={(e) => setLastVerified(e.target.value)}
                                    className="w-full border border-slate-300  rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-900">Key Takeaways (Bullet points)</label>
                                    <button type="button" onClick={addKeyTakeaway} className="text-xs bg-slate-100  hover:bg-slate-200 text-slate-700  px-2.5 py-1 rounded">+ Add Point</button>
                                </div>
                                <div className="space-y-2">
                                    {keyTakeaways.map((kt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={kt}
                                                onChange={(e) => updateKeyTakeaway(idx, e.target.value)}
                                                placeholder={`Takeaway point ${idx + 1}...`}
                                                className="flex-1 border border-slate-300  rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white bg-slate-50"
                                            />
                                            <button type="button" onClick={() => removeKeyTakeaway(idx)} className="text-slate-500 hover:text-red-500 px-2">×</button>
                                        </div>
                                    ))}
                                    {keyTakeaways.length === 0 && <div className="text-xs text-slate-500 italic">No takeaways added.</div>}
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900  mb-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasSteps}
                                        onChange={(e) => setHasSteps(e.target.checked)}
                                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                    />
                                    Contains"How-To" Steps (Generates HowTo Schema)
                                </label>
                                
                                {hasSteps && (
                                    <div className="space-y-3 bg-slate-50 admin-card-glass  p-4 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-900">Steps Builder</span>
                                            <button type="button" onClick={addStep} className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-2.5 py-1 rounded">+ Add Step</button>
                                        </div>
                                        {stepsJson.map((step, idx) => (
                                            <div key={idx} className="flex gap-3 bg-white bg-slate-50 p-3 rounded-lg border border-slate-200  flex-col sm:flex-row">
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={step.heading}
                                                        onChange={(e) => updateStep(idx, 'heading', e.target.value)}
                                                        placeholder={`Step ${idx + 1} Heading...`}
                                                        className="w-full border border-slate-300  rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 bg-transparent text-slate-900"
                                                    />
                                                    <textarea
                                                        value={step.description}
                                                        onChange={(e) => updateStep(idx, 'description', e.target.value)}
                                                        placeholder={`Step ${idx + 1} Description...`}
                                                        rows={2}
                                                        className="w-full border border-slate-300  rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 bg-transparent resize-none text-slate-900"
                                                    />
                                                </div>
                                                <button type="button" onClick={() => removeStep(idx)} className="text-slate-500 hover:text-red-500 pt-1 shrink-0">×</button>
                                            </div>
                                        ))}
                                        {stepsJson.length === 0 && <div className="text-xs text-slate-500 italic">No steps added.</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    {/* Content Markdown */}
                    <div className="border border-slate-200/80  rounded-xl p-5 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02]" data-color-mode="dark">
                        {content.includes('ibb.co') && (
                            <div className="text-amber-600 text-sm mt-1 mb-2">
                                <span><strong>SEO Warning:</strong> Please upload this image directly to our Supabase Storage instead of using 'ibb.co' or third-party hosts.</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end mb-3">
                            <label className="block text-sm font-bold text-slate-900">Article Content (Markdown)</label>
                            <div className="flex items-center gap-2 relative">
                                <button
                                    type="button"
                                    onClick={handleClean}
                                    title="Convert HTML to clean Markdown (keeps styled boxes and tables)"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300  text-slate-600  rounded-lg bg-white bg-slate-50 hover:bg-slate-50  hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
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
                                    className="text-xs font-medium bg-slate-100  hover:bg-slate-200  text-slate-700  px-3 py-1.5 rounded disabled:opacity-50 flex items-center gap-1 transition-colors"
                                >
                                    {uploadingImage ? '⏳ Uploading...' : '📎 Upload Image'}
                                </button>
                            </div>
                        </div>

                        <div className="border border-slate-200  rounded-lg overflow-hidden">
                            <MDEditor
                                value={content}
                                onChange={(val) => setContent(val || '')}
                                height={450}
                                preview="edit"
                                hideToolbar={false}
                                previewOptions={{
                                    rehypePlugins: [[require('rehype-raw')]]
                                }}
                            />
                        </div>
                        <div className="mt-2">
                            <LinkChecker content={content} />
                        </div>
                        <p className="text-sm font-medium text-slate-500  mt-3 pt-2">
                            Tip: Use two blank lines after images for spacing, or manually add &lt;br/&gt;.
                        </p>
                    </div>

                    {/* SEO Fields */}
                    <div className="border border-slate-200/80  rounded-xl p-5 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02] space-y-4">
                        <h3 className="font-bold text-slate-900  text-sm border-b border-slate-100  pb-2 mb-3">Search Engine Optimization (SEO)</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-900  mb-1">SEO Title (max 80 chars)</label>
                            <input
                                type="text"
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                placeholder="Optimized title for search engines..."
                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm text-slate-900 bg-white  focus:ring-2 focus:ring-gold focus:outline-none"
                                maxLength={80}
                            />
                            <p className="text-xs text-slate-500  mt-1 text-right">{seoTitle.length}/80</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-900  mb-1">SEO Meta Description (max 250 chars)</label>
                            <textarea
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                placeholder="Brief description to appear in search results..."
                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm text-slate-900 bg-white  focus:ring-2 focus:ring-gold focus:outline-none resize-none"
                                rows={3}
                                maxLength={250}
                            />
                            <p className="text-xs text-slate-500  mt-1 text-right">{seoDescription.length}/250</p>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="border border-slate-200/80  rounded-xl p-5 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02]">
                        <label className="block text-sm font-bold text-slate-900  mb-1">Tags (press Enter to add)</label>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onPaste={handleTagPaste}
                            placeholder="Type tag and press Enter or comma, or paste multiple tags separated by commas"
                            className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm text-slate-900 bg-white bg-slate-50 focus:ring-2 focus:ring-gold focus:outline-none mb-3"
                            disabled={tags.length >= 10}
                        />
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 bg-gold/20 text-slate-900 dark:text-amber-300 text-xs font-medium px-2.5 py-1 rounded">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="text-slate-900 dark:text-amber-300 hover:text-red-500 ml-1">×</button>
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500  mt-2">
                            Press Enter or comma to add. Paste multiple tags separated by commas. {tags.length}/10 tags added.
                        </p>
                    </div>

                    {/* Source and Advanced */}
                    <div className="border border-slate-200/80  rounded-xl p-5 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02] grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <h3 className="font-bold text-slate-900  text-sm border-b border-slate-100  pb-2 mb-4">Sources & Publishing</h3>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-900  mb-1">Primary Source Name</label>
                            <input
                                type="text"
                                value={sourceName}
                                onChange={(e) => setSourceName(e.target.value)}
                                placeholder="e.g. MCA Official Circular"
                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm text-slate-900 bg-white bg-slate-50 focus:ring-2 focus:ring-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-900  mb-1">Primary Source URL</label>
                            <input
                                type="url"
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm text-slate-900 bg-white  focus:ring-2 focus:ring-gold focus:outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 bg-slate-50  p-4 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-slate-900">Additional Sources</label>
                                <button type="button" onClick={addSource} className="text-xs bg-white admin-card-glass hover:border-amber-300 dark:hover:border-amber-500 text-slate-700  px-3 py-1.5 rounded transition-colors">+ Add Source</button>
                            </div>
                            <div className="space-y-3">
                                {sources.map((s, idx) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={s.name}
                                                onChange={(e) => updateSource(idx, 'name', e.target.value)}
                                                placeholder="Source Name"
                                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white bg-slate-50"
                                            />
                                            <input
                                                type="url"
                                                value={s.url}
                                                onChange={(e) => updateSource(idx, 'url', e.target.value)}
                                                placeholder="Source URL"
                                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeSource(idx)} className="text-slate-500 hover:text-red-500 p-2 mt-1 bg-white admin-card-glass">×</button>
                                    </div>
                                ))}
                                {sources.length === 0 && <p className="text-xs text-slate-500  italic">No additional sources added.</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-900  mb-1">Publish Date & Time</label>
                            <input
                                type="datetime-local"
                                value={publishedAt}
                                onChange={(e) => setPublishedAt(e.target.value)}
                                className="w-full border border-slate-300  rounded-lg px-3 py-2 text-sm text-slate-900 bg-white  focus:ring-2 focus:ring-gold focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <label className="flex items-center gap-3 cursor-pointer mt-4 md:mt-6">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${isFeatured ? 'bg-gold' : 'bg-slate-300 '}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isFeatured ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-slate-900">Featured Article</span>
                                    <span className="block text-xs text-slate-500">Appears on the homepage</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - PREVIEW */}
                <div className={`w-full lg:w-[40%] ${activeTab === 'write' ? 'hidden lg:block' : 'block'}`}>
                    <div className="sticky top-24 space-y-6">
                        <div className="border border-slate-200/80  rounded-xl p-6 bg-white bg-white shadow-card ring-1 ring-slate-900/[0.02] min-h-[600px]">
                        <h3 className="text-xs font-bold text-slate-500  uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">Live Preview</h3>

                        {!title && !content ? (
                            <div className="text-center text-slate-500  mt-20 italic">Preview will appear here...</div>
                        ) : (
                            <div className="prose prose-slate max-w-none dark:prose-invert">
                                {category && (
                                    <div className="mb-4">
                                        <CategoryBadge category={category as Category} />
                                    </div>
                                )}

                                {title && (
                                    <h1 className="font-heading font-bold text-3xl text-slate-900 mb-4 leading-tight">{title}</h1>
                                )}

                                {content && (
                                    <div className="mb-8 text-sm text-slate-500  font-medium">
                                        {calculateReadingTime(content)} min read
                                    </div>
                                )}

                                {summary && !content && (
                                    <p className="text-lg text-slate-600  mb-8">{summary}</p>
                                )}

                                {content && (
                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <MarkdownRenderer content={content} />
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                        <SeoScorePanel
                            title={title}
                            summary={summary}
                            content={content}
                            slug={slug}
                            tags={tags}
                            keyChange={keyChange}
                        />
                    </div>
                </div>
            </div>

            {/* STICKY BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-white  border-t border-slate-200  px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] gap-4 sm:gap-0">
                <div className="flex-1 flex gap-4 w-full sm:w-auto overflow-x-auto whitespace-nowrap">
                    {error && <span className="text-red-500 text-sm font-medium">⚠ {error}</span>}
                    {success && <span className="text-emerald-600 text-sm font-medium">✨ Article saved! Redirecting...</span>}
                    {!error && !success && publishedAt && (
                        <button
                            onClick={handleUnpublish}
                            disabled={saving}
                            className="px-4 py-2 border border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50 text-sm bg-transparent"
                        >
                            Unpublish to Draft
                        </button>
                    )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto justify-end items-center">
                    {lastAutosaved && (
                        <span className="text-xs text-slate-400 mr-2 hidden sm:inline-block">
                            Saved to drafts at {lastAutosaved.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        onClick={() => handleSave(null)}
                        disabled={saving || success}
                        className="px-5 py-2 border border-navy  text-slate-900  bg-transparent bg-white font-semibold rounded-lg hover:bg-slate-50  transition-colors disabled:opacity-50 text-sm"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString())}
                        disabled={saving || success}
                        className="px-5 py-2 bg-navy text-gold dark:text-amber-300 font-semibold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50 text-sm"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Clean HTML Modal */}
            {showCleanConfirm && cleanStats && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🧹</span>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Clean HTML Preview</h3>
                                <p className="text-slate-500  text-sm">Review changes before applying</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-green-700">{cleanStats.tagsRemoved}</div>
                                <div className="text-xs text-green-600 dark:text-green-400">HTML tags removed</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-blue-700">{cleanStats.tablesKept}</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">Tables preserved</div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-amber-700">{cleanStats.styledDivsKept}</div>
                                <div className="text-xs text-amber-600 dark:text-amber-400">Styled boxes kept</div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3">
                            <span className="text-xl flex-shrink-0">⚠️</span>
                            <div>
                                <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">This will modify your content</p>
                                <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                                    Tables and styled boxes (info panels, warning boxes) are preserved as HTML. Simple text formatting is converted to Markdown. Visual output will look the same.
                                </p>
                            </div>
                        </div>

                        {/* Preview */}
                        <div>
                            <p className="text-xs font-semibold text-slate-500  uppercase tracking-wide mb-2">Preview (first 500 chars):</p>
                            <div className="bg-slate-50 bg-slate-50 rounded-xl p-4 text-sm font-mono text-slate-700  max-h-40 overflow-y-auto whitespace-pre-wrap break-words border border-slate-100">
                                {cleanPreview.slice(0, 500)}
                                {cleanPreview.length > 500 && '...'}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCleanConfirm(false)
                                    setCleanPreview('')
                                    setCleanStats(null)
                                }}
                                className="flex-1 border border-slate-300  text-slate-600  py-3 rounded-xl font-semibold text-sm hover:bg-slate-50  bg-transparent"
                            >
                                Cancel — Keep Original
                            </button>
                            <button
                                onClick={confirmClean}
                                className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm"
                            >
                                ✅ Apply Clean Version
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
