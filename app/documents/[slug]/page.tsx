'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Field {
  id: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'select'
  placeholder?: string
  required: boolean
  help_text?: string
  options?: string[]
}

interface Template {
  id: string
  name: string
  slug: string
  description: string
  category: string
  template_content: string
  fields: Field[]
  regulation_reference: string
  source: string
  last_verified: string
  ai_system_prompt: string
}

export default function DocumentGeneratorPage() {
  const params = useParams()
  const slug = params.slug as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editInstruction, setEditInstruction] = useState('')
  const [editing, setEditing] = useState(false)
  const [letterheadUrl, setLetterheadUrl] = useState<string | null>(null)
  const [letterheadUploading, setLetterheadUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [useAi, setUseAi] = useState(true)
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([])

  // Load template
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/documents/${slug}`)
      .then(r => r.json())
      .then(d => {
        setTemplate(d.template)
        // Pre-fill defaults
        const defaults: Record<string, string> = {}
        const today = new Date().toISOString().split('T')[0]
        d.template?.fields?.forEach((f: Field) => {
          if (f.type === 'date') {
            defaults[f.id] = today
          }
        })
        setFormData(defaults)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  // Letterhead upload
  async function handleLetterheadUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    setLetterheadUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(
        '/api/documents/letterhead',
        { method: 'POST', body: fd }
      )
      const data = await res.json()
      const url = data.publicUrl || data.url
      if (url) setLetterheadUrl(url)
    } catch {
      // Handle error silently
    } finally {
      setLetterheadUploading(false)
    }
  }

  // Generate document
  async function handleGenerate() {
    if (!template) return
    setGenerating(true)
    try {
      const res = await fetch(
        '/api/documents/generate',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            template_slug: slug,
            form_data: formData,
            use_ai: useAi,
          }),
        }
      )
      const data = await res.json()
      if (data.content) {
        setGeneratedContent(data.content)
        setDocumentId(data.document_id)
      }
    } catch {
      // Handle error silently
    } finally {
      setGenerating(false)
    }
  }

  // AI Edit
  async function handleAiEdit() {
    if (!editInstruction.trim() || !generatedContent) return
    setEditing(true)
    try {
      const res = await fetch(
        '/api/documents/edit',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            document_id: documentId,
            current_content: generatedContent,
            edit_instruction: editInstruction,
            document_type: template?.name,
          }),
        }
      )
      const data = await res.json()
      if (data.content) {
        setGeneratedContent(data.content)
        setChatHistory(prev => [
          ...prev,
          { role: 'user', text: editInstruction },
          { role: 'ai', text: 'Done! Applied your changes.' }
        ])
        setEditInstruction('')
      }
    } catch {
      // Handle error silently
    } finally {
      setEditing(false)
    }
  }

  // Download DOCX
  async function handleDownload(
    format: 'docx' | 'pdf'
  ) {
    if (!generatedContent) return
    setDownloading(true)
    try {
      const res = await fetch(
        '/api/documents/download',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            content: generatedContent,
            document_name: template?.name,
            letterhead_url: letterheadUrl,
            format,
          }),
        }
      )
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Handle error silently
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">
            Loading template...
          </p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Template not found
      </div>
    )
  }

  const inputClass = `w-full border border-slate-300 
    rounded-xl px-3 py-2.5 text-sm text-navy
    focus:outline-none focus:ring-2 
    focus:ring-amber-400 focus:border-transparent
    bg-white`

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Page header */}
      <div className="bg-navy py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-slate-400 mb-3">
            <a href="/documents" className="hover:text-amber-400">
              Documents
            </a>
            {' → '}
            <span className="text-slate-300">
              {template.name}
            </span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
            {template.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {template.description}
          </p>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium">
              📚 {template.source}
            </span>
            <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-medium">
              ⚖️ {template.regulation_reference}
            </span>
            {template.last_verified && (
              <span className="text-xs bg-slate-500/20 text-slate-300 px-3 py-1 rounded-full">
                ✓ Verified {new Date(template.last_verified)
                  .toLocaleDateString('en-IN', {
                    month: 'long', year: 'numeric'
                  })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="space-y-6">
          
          {/* Letterhead upload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3 flex items-center gap-2">
              🏢 Company Letterhead 
              <span className="text-slate-400 font-normal text-xs">
                (optional)
              </span>
            </h3>
            
            {letterheadUrl ? (
              <div className="space-y-2">
                <img 
                  src={letterheadUrl} 
                  alt="Letterhead preview"
                  className="w-full h-20 object-contain border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => setLetterheadUrl(null)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove letterhead
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                <span className="text-2xl mb-1">📄</span>
                <span className="text-xs text-slate-500">
                  {letterheadUploading 
                    ? 'Uploading...' 
                    : 'Upload letterhead (JPG/PNG)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLetterheadUpload}
                  disabled={letterheadUploading}
                />
              </label>
            )}
          </div>

          {/* AI toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy">
                ✨ AI-Enhanced Generation
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI adds context and improves language
              </p>
            </div>
            <button
              onClick={() => setUseAi(p => !p)}
              className={`relative w-12 h-6 rounded-full transition-colors ${useAi ? 'bg-amber-400' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${useAi ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Form fields */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h3 className="font-bold text-navy text-sm">
                📝 Document Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in the details below to generate your document
              </p>
            </div>
            
            <div className="p-5 space-y-4">
              {template.fields.map((field: Field) => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    )}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[field.id] || ''}
                      onChange={e => setFormData(p => ({
                        ...p, [field.id]: e.target.value
                      }))}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.id] || ''}
                      onChange={e => setFormData(p => ({
                        ...p, [field.id]: e.target.value
                      }))}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={e => setFormData(p => ({
                        ...p, [field.id]: e.target.value
                      }))}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  )}

                  {field.help_text && (
                    <p className="text-xs text-slate-400 mt-1">
                      💡 {field.help_text}
                    </p>
                  )}
                </div>
              ))}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-amber-400 hover:bg-amber-500 text-navy font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>✨ Generate Document</>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT — Preview + AI Editor */}
        <div className="space-y-6">
          
          {generatedContent ? (
            <>
              {/* Document preview */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-navy text-sm">
                    📄 Generated Document
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload('docx')}
                      disabled={downloading}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      ⬇️ Word
                    </button>
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={downloading}
                      className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                      ⬇️ PDF
                    </button>
                  </div>
                </div>

                {/* Document text preview */}
                <div className="p-5">
                  {letterheadUrl && (
                    <div className="border-b border-slate-200 pb-4 mb-4">
                      <img 
                        src={letterheadUrl} 
                        alt="Letterhead"
                        className="w-full h-16 object-contain"
                      />
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap font-serif text-sm text-navy leading-relaxed max-h-96 overflow-y-auto">
                    {generatedContent}
                  </pre>
                </div>
              </div>

              {/* AI Chat Editor */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                  <h3 className="font-bold text-navy text-sm">
                    🤖 AI Document Editor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tell AI what to change, add or remove
                  </p>
                </div>

                {/* Chat history */}
                {chatHistory.length > 0 && (
                  <div className="p-4 space-y-2 max-h-40 overflow-y-auto border-b border-slate-100">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`text-xs p-2 rounded-lg ${msg.role === 'user' ? 'bg-navy text-white ml-8' : 'bg-green-50 text-green-800 mr-8'}`}>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit input */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editInstruction}
                      onChange={e => setEditInstruction(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAiEdit()
                        }
                      }}
                      placeholder='e.g. "Add confidentiality clause" or "Remove the seal clause"'
                      className={inputClass}
                    />
                    <button
                      onClick={handleAiEdit}
                      disabled={editing || !editInstruction.trim()}
                      className="px-4 py-2 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 disabled:opacity-60 flex-shrink-0"
                    >
                      {editing ? '...' : '→'}
                    </button>
                  </div>
                  
                  {/* Quick edit suggestions */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                      'Add confidentiality clause',
                      'Make more formal',
                      'Add penalty clause',
                      'Remove seal reference',
                      'Add witness signatures',
                    ].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setEditInstruction(suggestion)}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* What to do next */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="font-bold text-blue-900 text-sm mb-3">
                  📋 What to Do After Downloading
                </h3>
                <div className="space-y-2">
                  {[
                    'Open in Microsoft Word or Google Docs',
                    'Review all details carefully',
                    'Add your company letterhead if needed',
                    'Get all directors to review',
                    'Print and sign (or use eSign)',
                    'Affix company seal if applicable',
                    'File with MCA if required',
                    'Keep original in Minute Book',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold text-xs flex-shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <span className="text-blue-800 text-xs">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="font-bold text-navy text-lg mb-2">
                Your document will appear here
              </h3>
              <p className="text-slate-500 text-sm">
                Fill in the form on the left and click "Generate Document" to create your legally formatted document instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
