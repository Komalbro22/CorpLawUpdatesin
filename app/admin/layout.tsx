import { cookies } from 'next/headers'
import Sidebar from '@/components/admin/Sidebar'
import TopBar from '@/components/admin/TopBar'
import AdminMain from '@/components/admin/AdminMain'

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
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <TopBar />
                <AdminMain>{children}</AdminMain>
            </div>
        </div>
    )
}
