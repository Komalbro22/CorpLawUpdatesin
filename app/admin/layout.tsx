import { cookies } from 'next/headers'
import Sidebar from '@/components/admin/Sidebar'
import TopBar from '@/components/admin/TopBar'

export const metadata = {
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        }
    }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = cookies().get('admin_session')

    if (!session) {
        return <>{children}</>
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
