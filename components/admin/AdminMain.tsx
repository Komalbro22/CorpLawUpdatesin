'use client'

import { usePathname } from 'next/navigation'

export default function AdminMain({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div
            key={pathname}
            className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 admin-main-fade admin-scrollbar sm:p-6 lg:p-8"
        >
            {children}
        </div>
    )
}
