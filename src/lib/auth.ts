import CredentialsProvider from 'next-auth/providers/credentials'
import { checkHardcodedAdmin, HARDCODED_ADMIN } from './hardcoded-admin'

// TEMP fallback so Vercel login works if NEXTAUTH_SECRET was not set
const authSecret =
  process.env.NEXTAUTH_SECRET ||
  'tunca-admin-temp-secret-min-32-characters-long'

export const authOptions = {
  secret: authSecret,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = (credentials?.email ?? '').trim().toLowerCase()
        const password = credentials?.password ?? ''

        if (!checkHardcodedAdmin(username, password)) {
          return null
        }

        return {
          id: HARDCODED_ADMIN.id,
          email: HARDCODED_ADMIN.email,
          name: HARDCODED_ADMIN.name,
          role: HARDCODED_ADMIN.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = (token.id as string) || token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
