import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER'

type SessionUser = {
  id: string
  email: string
  name: string
  role: string
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions) as { user?: SessionUser } | null
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/admin/login')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    redirect('/admin/login')
  }
  return user
}

export async function requireSuperAdmin() {
  const user = await requireAuth()
  if (user.role !== 'SUPERADMIN') {
    redirect('/admin/login')
  }
  return user
}

export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole as UserRole)
}

export function canAccessAdmin(userRole: string): boolean {
  return hasRole(userRole, ['ADMIN', 'SUPERADMIN'])
}
