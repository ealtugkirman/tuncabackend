import { getCurrentUser } from '@/lib/auth-utils'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { DbConnectionBanner } from '@/components/admin/DbConnectionBanner'
import Link from 'next/link'

/** Admin uses session + DB; never prerender at build time (Vercel). */
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return (
      <div className="admin-app flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Access denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-app min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AdminSidebar user={user} />
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminHeader user={user} />
          <main className="relative flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
            <DbConnectionBanner />
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
