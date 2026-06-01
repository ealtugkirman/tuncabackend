/** Safe diagnostics from DATABASE_URL (no password). */
export function getDatabaseUrlDiagnostics() {
  const url = process.env.DATABASE_URL ?? ''
  if (!url) {
    return { configured: false as const }
  }

  let projectRef: string | undefined
  let host: string | undefined
  let port: string | undefined
  let hasPgbouncer = false

  try {
    const parsed = new URL(url.replace(/^postgresql:/, 'postgres:'))
    const user = parsed.username
    if (user.startsWith('postgres.')) {
      projectRef = user.slice('postgres.'.length)
    }
    host = parsed.hostname
    port = parsed.port || '5432'
    hasPgbouncer = parsed.searchParams.get('pgbouncer') === 'true'
  } catch {
    const refMatch = url.match(/postgres\.([^:@/]+)/)
    projectRef = refMatch?.[1]
    const hostMatch = url.match(/@([^:/]+)/)
    host = hostMatch?.[1]
    hasPgbouncer = url.includes('pgbouncer=true')
  }

  return {
    configured: true as const,
    projectRef,
    host,
    port,
    hasPgbouncer,
  }
}
