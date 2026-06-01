import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import {
  TUNCA_ADMIN_EMAIL,
  TUNCA_ADMIN_USERNAME,
} from '@/lib/login-identifier'

export const DEFAULT_ADMIN_PASSWORD = 'tuncaadmin2025?!'

/** Ensures DB schema + tuncaadmin user on the connected DATABASE_URL (e.g. Vercel runtime). */
export async function bootstrapAdminUser(password = DEFAULT_ADMIN_PASSWORD) {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT'
  )
  await prisma.$executeRawUnsafe(
    'CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username")'
  )

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email: TUNCA_ADMIN_EMAIL },
    update: {
      username: TUNCA_ADMIN_USERNAME,
      password: hashedPassword,
      name: 'Tunca Admin',
      role: 'SUPERADMIN',
    },
    create: {
      username: TUNCA_ADMIN_USERNAME,
      email: TUNCA_ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Tunca Admin',
      role: 'SUPERADMIN',
    },
  })

  const passwordOk = await bcrypt.compare(password, user.password)

  return {
    ok: true as const,
    username: TUNCA_ADMIN_USERNAME,
    email: user.email,
    role: user.role,
    passwordVerified: passwordOk,
  }
}
