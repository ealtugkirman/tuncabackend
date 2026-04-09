"use client"

import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  variant?: 'default' | 'admin'
}

export function SimpleLanguageSwitcher({ variant = 'default' }: Props) {
  const { locale, setLocale, isLoading } = useLanguage()

  const isAdmin = variant === 'admin'

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      <Globe className={cn('h-4 w-4 shrink-0', isAdmin ? 'text-muted-foreground' : '')} />
      <button
        type="button"
        onClick={() => setLocale('tr')}
        disabled={isLoading}
        className={cn(
          'rounded-md px-2 py-1 text-xs font-medium transition-colors md:text-sm',
          isAdmin
            ? locale === 'tr'
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            : locale === 'tr'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          isLoading && 'cursor-not-allowed opacity-50'
        )}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        disabled={isLoading}
        className={cn(
          'rounded-md px-2 py-1 text-xs font-medium transition-colors md:text-sm',
          isAdmin
            ? locale === 'en'
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            : locale === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          isLoading && 'cursor-not-allowed opacity-50'
        )}
      >
        EN
      </button>
    </div>
  )
}
