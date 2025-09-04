import { getCurrentUser } from '@/lib/auth-utils'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
            return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-100 mb-4">Access Denied</h1>
              <p className="text-slate-400">You don't have permission to access this page.</p>
              <a href="/login" className="mt-4 inline-block btn-primary">
                Go to Login
              </a>
            </div>
          </div>
        )
  }
  
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex">
        <AdminSidebar user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
