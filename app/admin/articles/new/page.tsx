/* eslint-disable */
'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { slugify, calculateReadingTime } from '@/lib/utils'
import CategoryBadge from '@/components/CategoryBadge'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { Category } from '@/types'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES: Category[] = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']

export default function NewArticle() {
    const router = useRouter()

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

    // Default to current datetime formatted for datetime-local
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    const defaultDate = now.toISOString().slice(0, 16)
    const [publishedAt, setPublishedAt] = useState(defaultDate)

    const [isFeatured, setIsFeatured] = useState(false)

    const [keyChange, setKeyChange] = useState('')
    const [effectiveDate, setEffectiveDate] = useState('')
    const [impactLevel, setImpactLevel] = useState<'high' | 'medium' | 'low' | ''>('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
    const [uploadingImage, setUploadingImage] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleTitleChange = (val: string) => {
        setTitle(val)
        if (!slugEdited) {
            setSlug(slugify(val))
        }
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
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/admin/articles/upload-image', {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                const data = await res.json()
                const imageMarkdown = `\n![image](${data.url})\n`
                setContent((prev) => prev + imageMarkdown)
            } else {
                alert('Image upload failed')
            }
        } catch (err) {
            alert('Image upload error')
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

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/admin/articles', {
                method: 'POST',
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
                    published_at: publishedAtValue,
                    is_featured: isFeatured,
                    key_change: keyChange.trim() || null,
                    effective_date: effectiveDate || null,
                    impact_level: impactLevel || null,
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/admin/articles')
                }, 2000)
            } else {
                setError(data.error || 'Failed to save article')
                setLoading(false)
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading font-bold text-2xl text-navy">New Article</h1>

                {/* Mobile Tabs */}
                <div className="flex lg:hidden bg-slate-200 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('write')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'write' ? 'bg-white text-navy shadow' : 'text-slate-600'}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white text-navy shadow' : 'text-slate-600'}`}
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
                            className="w-full bg-transparent font-heading font-bold text-3xl placeholder:text-slate-300 text-navy border-none focus:outline-none focus:ring-0 p-0"
                            autoFocus
                        />
                    </div>

                    {/* Slug */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-navy mb-1">URL Slug</label>
                            <div className="flex gap-2 items-start">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlugEdited(true)
                                        setSlug(e.target.value)
                                    }}
                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none font-mono"
                                />
                                {slugEdited && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSlugEdited(false)
                                            setSlug(slugify(title))
                                        }}
                                        className="text-xs font-medium text-slate-500 hover:text-navy px-3 py-2 bg-slate-100 rounded-lg"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-mono">
                                corplawupdates.in/updates/{slug || '...'}
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-navy mb-1">Regulator / Category <span className="text-red-500">*</span></label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none"
                            >
                                <option value="" disabled>Select a category...</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                        <label className="block text-sm font-bold text-navy mb-1">Summary <span className="text-red-500">*</span></label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            maxLength={300}
                            rows={3}
                            placeholder="Brief summary shown in article cards..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none resize-none"
                        />
                        <div className="text-right text-xs text-slate-400 mt-1">
                            {summary.length}/300
                        </div>
                    </div>

                    {/* Key Change, Effective Date, Impact Level */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-5">
                        <div>
                            <label htmlFor="keyChange" className="block text-sm font-semibold text-navy mb-2">
                                Key Change Summary
                                <span className="text-slate-400 font-normal ml-2 text-xs">
                                    (optional — shown as highlighted box on article)
                                </span>
                            </label>
                            <input
                                id="keyChange"
                                type="text"
                                value={keyChange}
                                onChange={(e) => setKeyChange(e.target.value)}
                                placeholder="e.g. DIR-3 KYC filing fee increased to ₹5,000 for late filing"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                maxLength={200}
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                {keyChange.length}/200 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="effectiveDate" className="block text-sm font-semibold text-navy mb-2">
                                Effective Date
                                <span className="text-slate-400 font-normal ml-2 text-xs">
                                    (optional — when does this change take effect?)
                                </span>
                            </label>
                            <input
                                id="effectiveDate"
                                type="date"
                                value={effectiveDate}
                                onChange={(e) => setEffectiveDate(e.target.value)}
                                className="border border-slate-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent w-full"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Shown on article card and page for quick reference
                            </p>
                        </div>

                        <div>
                            <label htmlFor="impactLevel" className="block text-sm font-semibold text-navy mb-2">
                                Impact Level
                                <span className="text-slate-400 font-normal ml-2 text-xs">
                                    (optional)
                                </span>
                            </label>
                            <select
                                id="impactLevel"
                                value={impactLevel}
                                onChange={(e) => setImpactLevel(e.target.value as 'high' | 'medium' | 'low' | '')}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                            >
                                <option value="">Select impact level...</option>
                                <option value="high">🔴 High Impact — Major regulatory change</option>
                                <option value="medium">🟡 Medium Impact — Amendment to existing rule</option>
                                <option value="low">🟢 Low Impact — Clarification or minor circular</option>
                            </select>
                            <p className="text-xs text-slate-400 mt-1">
                                Shown as badge on article card and page
                            </p>
                        </div>
                    </div>

                    {/* Content Markdown */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm" data-color-mode="light">
                        {content.includes('ibb.co') && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
                                <span>⚠️</span>
                                <span><strong>SEO Warning:</strong> Re-upload image to Supabase for better SEO. (Found 'ibb.co' in content)</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end mb-3">
                            <label className="block text-sm font-bold text-navy">Article Content (Markdown)</label>
                            <div className="relative">
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
                                    className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded disabled:opacity-50 flex items-center gap-1 transition-colors"
                                >
                                    {uploadingImage ? '⏳ Uploading...' : '📎 Upload Image'}
                                </button>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-lg overflow-hidden">
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
                        <p className="text-sm font-medium text-slate-500 mt-3 pt-2">
                            Tip: Use two blank lines after images for spacing, or manually add &lt;br/&gt;.
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                        <label className="block text-sm font-bold text-navy mb-1">Tags (press Enter to add)</label>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onPaste={handleTagPaste}
                            placeholder="Type tag and press Enter or comma, or paste multiple tags separated by commas"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none mb-3"
                            disabled={tags.length >= 10}
                        />
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 bg-gold/20 text-navy text-xs font-medium px-2.5 py-1 rounded">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="text-navy hover:text-red-500 ml-1">×</button>
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Press Enter or comma to add. Paste multiple tags separated by commas. {tags.length}/10 tags added.
                        </p>
                    </div>

                    {/* Source and Advanced */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-navy mb-1">Source Name</label>
                            <input
                                type="text"
                                value={sourceName}
                                onChange={(e) => setSourceName(e.target.value)}
                                placeholder="e.g. MCA Official Circular"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-navy mb-1">Source URL</label>
                            <input
                                type="url"
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-navy mb-1">Publish Date & Time</label>
                            <input
                                type="datetime-local"
                                value={publishedAt}
                                onChange={(e) => setPublishedAt(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:outline-none"
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
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${isFeatured ? 'bg-gold' : 'bg-slate-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isFeatured ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-navy">Featured Article</span>
                                    <span className="block text-xs text-slate-500">Appears on the homepage</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - PREVIEW */}
                <div className={`w-full lg:w-[40%] ${activeTab === 'write' ? 'hidden lg:block' : 'block'}`}>
                    <div className="sticky top-24 border border-slate-200 rounded-xl p-6 bg-white shadow-sm min-h-[600px]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">Live Preview</h3>

                        {!title && !content ? (
                            <div className="text-center text-slate-400 mt-20 italic">Preview will appear here...</div>
                        ) : (
                            <div className="prose prose-slate max-w-none">
                                {category && (
                                    <div className="mb-4">
                                        <CategoryBadge category={category as Category} />
                                    </div>
                                )}

                                {title && (
                                    <h1 className="font-heading font-bold text-3xl text-navy mb-4 leading-tight">{title}</h1>
                                )}

                                {content && (
                                    <div className="mb-8 text-sm text-slate-500 font-medium">
                                        {calculateReadingTime(content)} min read
                                    </div>
                                )}

                                {summary && !content && (
                                    <p className="text-lg text-slate-600 mb-8">{summary}</p>
                                )}

                                {content && (
                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <MarkdownRenderer content={content} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STICKY BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-40 shadow-lg">
                <div className="flex-1">
                    {error && <span className="text-red-500 text-sm font-medium">⚠ {error}</span>}
                    {success && <span className="text-emerald-600 text-sm font-medium">✨ Article {publishedAt ? 'published' : 'saved'} successfully! Redirecting...</span>}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => handleSave(null)}
                        disabled={loading || success}
                        className="px-5 py-2 border border-navy text-navy font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(publishedAt)}
                        disabled={loading || success}
                        className="px-5 py-2 border border-gold text-gold font-semibold rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-50 text-sm hidden sm:block"
                    >
                        Schedule
                    </button>
                    <button
                        onClick={() => handleSave(new Date().toISOString())}
                        disabled={loading || success}
                        className="px-5 py-2 bg-navy text-gold font-semibold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50 text-sm"
                    >
                        {loading ? 'Saving...' : 'Publish Now'}
                    </button>
                </div>
            </div>
        </div>
    )
}
