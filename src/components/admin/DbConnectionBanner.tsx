'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

type DbHealth = {
  ok: boolean
  error?: string
  detail?: string
  hint?: string
  config?: {
    projectRef?: string
    host?: string
    port?: string
    hasPgbouncer?: boolean
  }
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
        {health.config?.projectRef ? (
          <p className="text-xs">
            Vercel şu an bağlanmaya çalışıyor:{' '}
            <code>postgres.{health.config.projectRef}</code>
            {health.config.host ? (
              <>
                {' '}
                @ <code>{health.config.host}</code>
              </>
            ) : null}
          </p>
        ) : null}
        {health.detail ? (
          <p className="font-mono text-xs opacity-90">{health.detail}</p>
        ) : null}
        {health.hint ? <p className="text-xs">{health.hint}</p> : null}
        <p className="text-xs">
          Supabase panelinden <strong>Transaction pooler (6543)</strong> URI’yi kopyalayıp Vercel →
          Production → <code>DATABASE_URL</code> olarak yapıştırın, sonra <strong>Redeploy</strong>.
        </p>
      </AlertDescription>
    </Alert>
  )
}
