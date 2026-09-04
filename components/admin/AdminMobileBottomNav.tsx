'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Radio,
  PenSquare,
  BarChart3,
  Settings,
  Menu,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/radar', label: 'Radar', icon: Radio },
  { href: '/admin/articles/new', label: 'New Post', icon: PenSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminMobileBottomNav() {
  const pathname = usePathname() || ''

  return (
    <nav
      aria-label="Mobile Admin Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-2 py-1 shadow-lg shadow-slate-950/5 safe-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-amber-600 font-semibold scale-105'
                  : 'text-slate-500 hover:text-slate-900 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-amber-600 stroke-[2.2]' : 'text-slate-500 stroke-[1.8]'
                  }`}
                />
                {item.href === '/admin/radar' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
