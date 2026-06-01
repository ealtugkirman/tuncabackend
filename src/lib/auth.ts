import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { usernameToEmail } from './login-identifier'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const raw =
          credentials?.username ??
          (credentials as { email?: string } | undefined)?.email ??
          ''
        const identifier = raw.trim().toLowerCase()
        const password = credentials?.password ?? ''

        if (!identifier || !password) {
          return null
        }

        const email = identifier.includes('@')
          ? identifier
          : usernameToEmail(identifier)

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
