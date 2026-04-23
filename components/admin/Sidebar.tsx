'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
    const pathname = usePathname()

    const links = [
        { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { href: '/admin/articles/new', icon: '✍️', label: 'New Article' },
        { href: '/admin/articles', icon: '📋', label: 'All Articles' },
        { href: '/admin/subscribers', icon: '👥', label: 'Subscribers' },
        { href: '/admin/newsletter', icon: '📧', label: 'Newsletter' },
        { href: '/admin/settings', icon: '⚙️', label: 'Settings' }
    ]

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin/login'
    }

    return (
        <div className="w-[240px] h-screen bg-[#0F172A] flex flex-col justify-between shrink-0">
            <div>
                <div className="px-6 py-5">
                    <h2 className="font-heading text-lg font-bold">
                        <span className="text-white">CorpLawUpdates</span>
                        <span className="text-gold">.in</span>
                    </h2>
                </div>
                <nav className="mt-4 flex flex-col space-y-1">
                    {links.map((link) => {
                        const active = pathname === link.href
                        return (
                            <Link href={link.href} key={link.href}
                                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${active
                                    ? 'bg-white/10 text-gold border-l-2 border-gold font-medium'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                                    }`}
                            >
                                <span className="mr-3">{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="mb-6 px-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <span className="mr-3">🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
