'use client'

import { usePathname } from 'next/navigation'

export default function AdminMain({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <main
            key={pathname}
            className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 bg-slate-50/90 admin-main-fade"
        >
            {children}
        </main>
    )
}
