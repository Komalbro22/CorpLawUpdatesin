/* eslint-disable */
'use client'

import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { slugify, calculateReadingTime, formatDate } from '@/lib/utils'
import CategoryBadge from '@/components/CategoryBadge'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { Category } from '@/types'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES: Category[] = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']

export default function EditArticle({ params }: { params: { id: string } }) {
    const router = useRouter()
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

    const [publishedAt, setPublishedAt] = useState('')
    const [isFeatured, setIsFeatured] = useState(false)

    const [saving, setSaving] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
    const [uploadingImage, setUploadingImage] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

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
                setIsFeatured(data.is_featured || false)

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
                setError('Error loading article')
            } finally {
                setPageLoading(false)
            }
        }

        fetchArticle()
    }, [id])

    const handleTitleChange = (val: string) => {
        setTitle(val)
        if (!slugEdited) {
            setSlug(slugify(val))
        }
    }

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const newTag = tagInput.trim()
            if (newTag && !tags.includes(newTag) && tags.length < 10) {
                setTags([...tags, newTag])
            }
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
            // Using ID specific route for image upload
            const res = await fetch(`/api/admin/articles/${id}/image`, {
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
                    published_at: publishedAtValue,
                    is_featured: isFeatured
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/admin/articles')
                }, 1500)
            } else {
                setError(data.error || 'Failed to save article')
                setSaving(false)
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setSaving(false)
        }
    }

    const handleUnpublish = async () => {
        if (!confirm('Are you sure you want to unpublish this article? It will remain as a draft.')) return
        await handleSave(null)
    }

    if (pageLoading) {
        return (
            <div className="space-y-6">
                <h1 className="font-heading font-bold text-2xl text-navy">Edit Article</h1>
                <div className="h-20 w-full"><LoadingSkeleton /></div>
                <div className="h-64 w-full"><LoadingSkeleton /></div>
                <div className="h-40 w-full"><LoadingSkeleton /></div>
            </div>
        )
    }

    return (
        <div className="pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading font-bold text-2xl text-navy">Edit Article</h1>

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

                    {/* Content Markdown */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm" data-color-mode="light">
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
                            placeholder="e.g. Compliance, Circular..."
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
                            {tags.length > 0 && <div className="text-xs text-slate-400 mt-1.5 ml-2 w-full">{tags.length}/10 tags added</div>}
                        </div>
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
            <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] gap-4 sm:gap-0">
                <div className="flex-1 flex gap-4 w-full sm:w-auto overflow-x-auto whitespace-nowrap">
                    {error && <span className="text-red-500 text-sm font-medium">⚠ {error}</span>}
                    {success && <span className="text-emerald-600 text-sm font-medium">✨ Article saved! Redirecting...</span>}
                    {!error && !success && publishedAt && (
                        <button
                            onClick={handleUnpublish}
                            disabled={saving}
                            className="px-4 py-2 border border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                        >
                            Unpublish to Draft
                        </button>
                    )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto justify-end">
                    <button
                        onClick={() => handleSave(null)}
                        disabled={saving || success}
                        className="px-5 py-2 border border-navy text-navy font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(publishedAt)}
                        disabled={saving || success}
                        className="px-5 py-2 border border-gold text-gold font-semibold rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-50 text-sm hidden lg:block"
                    >
                        Schedule Update
                    </button>
                    <button
                        onClick={() => handleSave(new Date().toISOString())}
                        disabled={saving || success}
                        className="px-5 py-2 bg-navy text-gold font-semibold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50 text-sm"
                    >
                        {saving ? 'Saving...' : 'Update & Publish'}
                    </button>
                </div>
            </div>
        </div>
    )
}
