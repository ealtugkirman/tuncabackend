/**
 * Local / CLI admin setup. On Vercel use POST /api/admin/bootstrap instead.
 *   npx tsx scripts/setup-admin-user.ts
 */
import { bootstrapAdminUser } from '../src/lib/admin-bootstrap'
import { prisma } from '../src/lib/prisma'

async function main() {
  const result = await bootstrapAdminUser()
  console.log('✅ Admin user ready')
  console.log('   Username:', result.username)
  console.log('   Email (internal):', result.email)
  console.log('   Password verified:', result.passwordVerified)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
