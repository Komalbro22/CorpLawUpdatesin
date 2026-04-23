'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
    id: number
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, 3000)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function Toast({ toast }: { toast: ToastMessage }) {
    const bgColors = {
        success: 'bg-[#10B981]',
        error: 'bg-[#EF4444]',
        info: 'bg-[#3B82F6]'
    }

    return (
        <div
            className={`transform transition-all duration-300 ease-out translate-x-0 ${bgColors[toast.type]} text-white rounded-lg shadow-lg px-4 py-3 min-w-[200px] flex items-center justify-between animate-slide-in-right`}
        >
            <p className="text-sm font-medium">{toast.message}</p>
        </div>
    )
}
