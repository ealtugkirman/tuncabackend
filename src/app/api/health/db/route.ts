import { NextResponse } from 'next/server'
import { prisma, getDatabaseConfigHint } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const configHint = getDatabaseConfigHint()
  if (configHint) {
    return NextResponse.json({ ok: false, error: configHint }, { status: 503 })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    const [lawyers, announcements, events] = await Promise.all([
      prisma.lawyer.count(),
      prisma.announcement.count(),
      prisma.event.count(),
    ])
    return NextResponse.json({
      ok: true,
      counts: { lawyers, announcements, events },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'
    console.error('[health/db]', error)
    return NextResponse.json(
      {
        ok: false,
        error:
          'Veritabanına bağlanılamadı. Vercel’de DATABASE_URL’i Supabase Session pooler (6543) ile ayarlayın.',
        detail: message,
      },
      { status: 503 }
    )
  }
}
