import { NextRequest, NextResponse } from 'next/server'
import { bootstrapAdminUser } from '@/lib/admin-bootstrap'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSetupSecret(request: NextRequest): string | null {
  const header = request.headers.get('x-admin-setup-secret')
  if (header) return header

  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7)
  }

  return request.nextUrl.searchParams.get('secret')
}

/** One-time admin user setup on Vercel (uses production DATABASE_URL). */
export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_SETUP_SECRET
  if (!expected || expected.length < 16) {
    return NextResponse.json(
      {
        error:
          'ADMIN_SETUP_SECRET is not set (min 16 chars). Add it in Vercel → Settings → Environment Variables, redeploy, then call this endpoint again.',
      },
      { status: 503 }
    )
  }

  const provided = getSetupSecret(request)
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await bootstrapAdminUser()
    return NextResponse.json({
      message: 'Admin user created or updated.',
      login: {
        username: result.username,
        url: '/login',
      },
      passwordVerified: result.passwordVerified,
    })
  } catch (error) {
    console.error('bootstrap admin failed:', error)
    return NextResponse.json(
      {
        error: 'Database setup failed',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    usage:
      'POST with header x-admin-setup-secret or ?secret= matching ADMIN_SETUP_SECRET in Vercel env',
  })
}
