/**
 * Creates or updates the tuncaadmin SUPERADMIN user.
 * Run: npx tsx scripts/upsert-tunca-admin.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { TUNCA_ADMIN_EMAIL } from '../src/lib/login-identifier'

const prisma = new PrismaClient()

const PASSWORD = 'tuncaadmin2025?!'

async function main() {
  const hashedPassword = await bcrypt.hash(PASSWORD, 12)

  const user = await prisma.user.upsert({
    where: { email: TUNCA_ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      name: 'Tunca Admin',
      role: 'SUPERADMIN',
    },
    create: {
      email: TUNCA_ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Tunca Admin',
      role: 'SUPERADMIN',
    },
  })

  console.log('✅ User ready:', user.email)
  console.log('   Login username: tuncaadmin')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
