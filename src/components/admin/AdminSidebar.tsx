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
  User,
  Upload,
  Search,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface AdminSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Avukatlar', href: '/admin/lawyers', icon: Users },
    { name: 'Duyurular', href: '/admin/announcements', icon: Megaphone },
    { name: 'Etkinlikler', href: '/admin/events', icon: Calendar },
    { name: 'Yayınlar', href: '/admin/publications', icon: BookOpen },
    { name: 'İletişim', href: '/admin/contact', icon: Mail },
    { name: 'Kariyer', href: '/admin/career', icon: Briefcase },
    { name: 'Bülten', href: '/admin/newsletter', icon: Newspaper },
    { name: 'Upload Test', href: '/admin/test-upload', icon: Upload },
    { name: 'SEO Test', href: '/admin/seo-test', icon: Search },
    { name: 'Rich Text Test', href: '/admin/rich-text-test', icon: FileText },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="w-64 bg-card border-r border-border shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
