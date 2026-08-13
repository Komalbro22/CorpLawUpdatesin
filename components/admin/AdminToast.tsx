'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType, duration?: number) => void
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
}

/* ── Context ─────────────────────────────────────────────────── */
const ToastCtx = createContext<ToastContextValue | null>(null)

export function useToast() {
    const ctx = useContext(ToastCtx)
    if (!ctx) throw new Error('useToast must be used inside <AdminToastProvider>')
    return ctx
}

/* ── Individual Toast Item ───────────────────────────────────── */
const ICONS: Record<ToastType, React.ElementType> = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const [exiting, setExiting] = useState(false)
    const Icon = ICONS[toast.type]

    const dismiss = useCallback(() => {
        setExiting(true)
        setTimeout(() => onDismiss(toast.id), 240)
    }, [toast.id, onDismiss])

    useEffect(() => {
        const timer = setTimeout(dismiss, toast.duration ?? 4000)
        return () => clearTimeout(timer)
    }, [dismiss, toast.duration])

    return (
        <div className={`admin-toast ${toast.type} ${exiting ? 'exiting' : ''}`} role="alert" aria-live="polite">
            <Icon className="w-4 h-4 shrink-0" aria-hidden />
            <span className="flex-1 text-sm leading-snug">{toast.message}</span>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss notification"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity rounded p-0.5"
            >
                <X className="w-3.5 h-3.5" aria-hidden />
            </button>
        </div>
    )
}

/* ── Provider ────────────────────────────────────────────────── */
export function AdminToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const counterRef = useRef(0)

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = `toast-${Date.now()}-${++counterRef.current}`
        setToasts(prev => [...prev, { id, message, type, duration }])
    }, [])

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const ctx: ToastContextValue = {
        toast: addToast,
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur),
        info: (msg, dur) => addToast(msg, 'info', dur),
    }

    return (
        <ToastCtx.Provider value={ctx}>
            {children}
            <div className="admin-toast-container" aria-label="Notifications">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastCtx.Provider>
    )
}
