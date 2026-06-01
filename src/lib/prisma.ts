import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Reuse one client per serverless instance (Vercel)
globalForPrisma.prisma = prisma

export function getDatabaseConfigHint(): string | null {
  if (!process.env.DATABASE_URL) {
    return 'DATABASE_URL ortam değişkeni tanımlı değil (Vercel → Settings → Environment Variables).'
  }
  return null
}
