'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Calendar,
  BookOpen,
  Mail,
  Briefcase,
  Newspaper,
  LogOut,
  Hexagon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AdminSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

function isNavActive(href: string, pathname: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Ana Sayfa', href: '/admin', icon: LayoutDashboard },
    { name: 'Lawyers', href: '/admin/lawyers', icon: Users },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Publications', href: '/admin/publications', icon: BookOpen },
    { name: 'Contact', href: '/admin/contact', icon: Mail },
    { name: 'Careers', href: '/admin/career', icon: Briefcase },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Newspaper },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <aside className="flex h-screen w-[15.5rem] shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-5">
        <div className="flex items-center gap-2.5">
          <Hexagon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">Tunca Hukuk</p>
            <p className="text-[10px] text-muted-foreground">Yönetim paneli</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navigation.map((item) => {
          const active = isNavActive(item.href, pathname)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                active
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-sm bg-primary"
                  aria-hidden
                />
              )}
              <item.icon className="h-[17px] w-[17px] shrink-0 opacity-90" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-border p-3">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[10px] font-medium text-muted-foreground">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{user.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="h-8 w-full justify-start gap-2 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
