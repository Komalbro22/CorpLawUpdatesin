'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Download, Mail, Loader2, X, FileText, Heart, Share2, Copy, Check } from 'lucide-react'

interface DownloadGatewayModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  fileType?: 'docx' | 'pdf' | 'document'
  docTitle?: string
  onProceedDownload: () => void
}

export default function DownloadGatewayModal({
  isOpen,
  onClose,
  fileName,
  fileType = 'document',
  docTitle,
  onProceedDownload,
}: DownloadGatewayModalProps) {
  const [progress, setProgress] = useState(0)
  const [downloadTriggered, setDownloadTriggered] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [subError, setSubError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasTriggeredRef = useRef(false)

  // Reset and start countdown when opened
  useEffect(() => {
    if (isOpen) {
      setProgress(0)
      setDownloadTriggered(false)
      hasTriggeredRef.current = false
      setSubError(null)

      const startTime = Date.now()
      const totalDuration = 3000 // 3 seconds

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100))
        setProgress(pct)

        if (pct >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true
            setDownloadTriggered(true)
            onProceedDownload()
          }
        }
      }, 50)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen, onProceedDownload])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getStepText = (pct: number) => {
    if (pct < 35) return 'Compiling statutory clauses & compliance terms...'
    if (pct < 75) return 'Applying professional Indian corporate formatting...'
    if (pct < 100) return 'Finalizing secure verified export...'
    return 'Ready! Download started automatically.'
  }

  const handleManualDownload = () => {
    setDownloadTriggered(true)
    onProceedDownload()
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setSubError('Please enter a valid email address.')
      return
    }

    setSubscribing(true)
    setSubError(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()
      if (res.ok) {
        setSubscribed(true)
      } else {
        setSubError(data.error || 'Unable to subscribe. Please try again.')
      }
    } catch {
      setSubError('Network error. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 id="download-modal-title" className="text-base font-bold text-navy dark:text-white leading-tight">
                {docTitle || 'Preparing Your Document'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[280px]">
                {fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">
                {getStepText(progress)}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">
                {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-75 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Download Status & Manual Fallback */}
            {progress >= 100 && (
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="size-4" /> Download initiated
                </span>
                <button
                  onClick={handleManualDownload}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Download className="size-3.5" /> Didn&apos;t start? Click here
                </button>
              </div>
            )}
          </div>

          {/* Community Support & Friend Share Card */}
          <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                <Heart className="size-3.5 fill-rose-500 text-rose-500" />
              </span>
              <span className="text-xs font-bold text-rose-950 dark:text-rose-200">
                Running 100% Free for India&apos;s Legal &amp; Corporate Community
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              If this free tool or document helped you, <strong>please share CorpLawUpdates with 1 colleague or friend</strong>. Your support motivates us to keep every calculator, template, and statutory update completely free!
            </p>

            <div className="flex items-center gap-2">
              <a
                href="https://api.whatsapp.com/send?text=Hey!%20Check%20out%20CorpLawUpdates.in%20for%20free%20corporate%20law%20calculators,%20MCA%20updates,%20and%20legal%20document%20generators:%20https://www.corplawupdates.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Share2 className="size-3.5" /> Share on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://www.corplawupdates.in')
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-slate-400" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* EMAIL CAPTURE: Weekly Free Newsletter */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-navy dark:text-white font-bold text-sm">
                <Mail className="size-4 text-amber-500" />
                <span>Subscribe to Weekly Corporate Law Digest</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive curated summaries of latest MCA, SEBI, and RBI notifications every Friday. 100% free. No spam, no advertisements, unsubscribe anytime.
              </p>
            </div>

            {subscribed ? (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span>You&apos;re subscribed! Check your inbox for your Friday regulatory digest.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your professional email..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-navy dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-4 py-2 bg-navy hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-navy text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="size-3 animate-spin" /> Subscribing...
                      </>
                    ) : (
                      'Subscribe Free'
                    )}
                  </button>
                </div>
                {subError && (
                  <p className="text-[11px] text-rose-500 font-medium">{subError}</p>
                )}
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  🔒 100% Free. No spam. No promotions. One-click unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
