import { NextResponse } from 'next/server'
import { prisma, getDatabaseConfigHint } from '@/lib/prisma'
import { getDatabaseUrlDiagnostics } from '@/lib/database-url-info'

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
    const config = getDatabaseUrlDiagnostics()
    console.error('[health/db]', error)

    const tenantNotFound =
      message.includes('not found') || message.includes('Tenant or user')

    return NextResponse.json(
      {
        ok: false,
        error: tenantNotFound
          ? 'Supabase proje referansı veya host yanlış (tenant/user not found). Vercel’deki DATABASE_URL, Supabase panelindeki URI ile birebir aynı olmalı.'
          : 'Veritabanına bağlanılamadı. DATABASE_URL’i kontrol edin.',
        detail: message,
        config,
        hint: tenantNotFound
          ? 'Supabase → Project Settings → Database → Connect → Transaction pooler (6543) → URI kopyalayın. Kullanıcı: postgres.PROJE_REF. Eski/silinmiş projelerin URL’ini kullanmayın.'
          : undefined,
      },
      { status: 503 }
    )
  }
}
