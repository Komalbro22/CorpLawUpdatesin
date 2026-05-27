'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function HideOnAdmin({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')
    const isDrafting = pathname?.startsWith('/tools/drafting-copilot')
    
    if (isAdmin || isDrafting) {
        return null
    }
    
    return <>{children}</>
}
