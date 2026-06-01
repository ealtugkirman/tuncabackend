import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@tuncalaw.com' },
    update: {
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
    create: {
      email: 'admin@tuncalaw.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
  })

  console.log('✅ Superadmin user created/updated:', superadmin.email)

  // Create additional admin user
  const adminHashedPassword = await bcrypt.hash('password123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      password: adminHashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@admin.com',
      password: adminHashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created/updated:', admin.email)

  const tuncaPassword = await bcrypt.hash('tuncaadmin2025?!', 12)

  const tuncaAdmin = await prisma.user.upsert({
    where: { email: 'tuncaadmin@tuncalaw.com' },
    update: {
      password: tuncaPassword,
      name: 'Tunca Admin',
      role: 'SUPERADMIN',
    },
    create: {
      email: 'tuncaadmin@tuncalaw.com',
      password: tuncaPassword,
      name: 'Tunca Admin',
      role: 'SUPERADMIN',
    },
  })

  console.log('✅ Tunca admin user created/updated:', tuncaAdmin.email)

  console.log('\n🔐 Admin Login Credentials:')
  console.log('Email: admin@tuncalaw.com')
  console.log('Password: admin123')
  console.log('Role: SUPERADMIN')
  console.log('\nEmail: admin@admin.com')
  console.log('Password: password123')
  console.log('Role: ADMIN')
  console.log('\nUsername: tuncaadmin')
  console.log('Password: tuncaadmin2025?!')
  console.log('Role: SUPERADMIN')
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
