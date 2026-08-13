'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function AdminMain({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Scroll to top on route change
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }, [pathname])

    return (
        <div
            id="admin-main-scroll"
            ref={scrollRef}
            key={pathname}
            className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent p-4 admin-main-fade admin-scrollbar sm:p-6 lg:p-8"
        >
            {children}
        </div>
    )
}
