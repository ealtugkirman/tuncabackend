'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

type DbHealth = {
  ok: boolean
  error?: string
  detail?: string
  counts?: { lawyers: number; announcements: number; events: number }
}

export function DbConnectionBanner() {
  const [health, setHealth] = useState<DbHealth | null>(null)

  useEffect(() => {
    fetch('/api/health/db')
      .then((r) => r.json())
      .then((data: DbHealth) => setHealth(data))
      .catch(() =>
        setHealth({
          ok: false,
          error: 'Veritabanı durumu kontrol edilemedi.',
        })
      )
  }, [])

  if (!health || health.ok) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Veritabanı bağlantısı yok</AlertTitle>
      <AlertDescription className="space-y-1">
        <p>{health.error}</p>
        {health.detail ? (
          <p className="font-mono text-xs opacity-90">{health.detail}</p>
        ) : null}
        <p className="text-xs">
          Vercel → Environment Variables → Production: <code>DATABASE_URL</code> (Supabase
          &quot;Transaction&quot; pooler, port 6543, <code>?pgbouncer=true</code>). Değişiklikten sonra
          Redeploy yapın.
        </p>
      </AlertDescription>
    </Alert>
  )
}
