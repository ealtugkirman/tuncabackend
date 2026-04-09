'use client'

import { Bell, LayoutGrid, Search } from 'lucide-react'
import { SimpleLanguageSwitcher } from '@/components/SimpleLanguageSwitcher'
import { cn } from '@/lib/utils'

type AdminHeaderProps = {
  user: {
    name: string
    email: string
    role: string
  }
}

function roleLabel(role: string) {
  if (role === 'SUPERADMIN') return 'Managing Partner'
  if (role === 'ADMIN') return 'Administrator'
  if (role === 'EDITOR') return 'Editor'
  return role
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background px-4 md:px-6">
      <div className="flex w-full min-w-0 items-center gap-3 md:gap-5">
        <span className="shrink-0 text-xs font-semibold tracking-[0.2em] text-primary md:text-sm">
          OBSIDIAN
        </span>

        <div className="hidden min-w-0 flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              readOnly
              placeholder="Search command center…"
              className="h-9 w-full max-w-xl rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-3">
          <SimpleLanguageSwitcher variant="admin" />
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="hidden rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            aria-label="Command menu"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 border-l border-border pl-2 md:gap-3 md:pl-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[9rem] truncate text-xs font-medium text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">{roleLabel(user.role)}</p>
            </div>
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                'border border-border bg-secondary text-[10px] font-medium text-secondary-foreground'
              )}
              aria-hidden
            >
              {initials || '?'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
