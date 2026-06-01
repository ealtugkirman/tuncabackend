/**
 * Ensures users.username exists and creates/updates tuncaadmin.
 * Run against the target DB (local or production):
 *   npx tsx scripts/setup-admin-user.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import {
  TUNCA_ADMIN_EMAIL,
  TUNCA_ADMIN_USERNAME,
} from '../src/lib/login-identifier'

const prisma = new PrismaClient()
const PASSWORD = 'tuncaadmin2025?!'

async function main() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT'
  )
  await prisma.$executeRawUnsafe(
    'CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username")'
  )

  const hashedPassword = await bcrypt.hash(PASSWORD, 12)

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

  console.log('✅ Admin user ready')
  console.log('   Username:', TUNCA_ADMIN_USERNAME)
  console.log('   Email (internal):', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
