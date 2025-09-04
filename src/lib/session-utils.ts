import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

type SessionUser = {
  role: string
}

export async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions) as { user?: SessionUser } | null
  return session
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'ADMIN' || userRole === 'SUPERADMIN'
}
