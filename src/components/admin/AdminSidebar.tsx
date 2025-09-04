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
  Search
} from 'lucide-react'
import { clsx } from 'clsx'

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
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-100">Admin Panel</h2>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.role}</p>
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
                className={clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100 rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          Sign out
        </button>
      </div>
    </div>
  )
}
