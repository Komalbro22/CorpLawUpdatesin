import { cookies } from 'next/headers'
import Sidebar from '@/components/admin/Sidebar'
import TopBar from '@/components/admin/TopBar'
import AdminMain from '@/components/admin/AdminMain'
import { AdminToastProvider } from '@/components/admin/AdminToast'

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    if (!session) {
        return <>{children}</>
    }

    return (
        <AdminToastProvider>
            <div className="flex h-screen flex-col lg:flex-row admin-mesh-bg" style={{ overflow: 'hidden' }}>
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <TopBar />
                    <AdminMain>{children}</AdminMain>
                </div>
            </div>
        </AdminToastProvider>
    )
}
