"use client"

import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export function SimpleLanguageSwitcher() {
  const { locale, setLocale, isLoading, t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <button
        onClick={() => setLocale('tr')}
        disabled={isLoading}
        className={`px-2 py-1 text-sm rounded ${
          locale === 'tr' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        🇹🇷 TR
      </button>
      <button
        onClick={() => setLocale('en')}
        disabled={isLoading}
        className={`px-2 py-1 text-sm rounded ${
          locale === 'en' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        🇺🇸 EN
      </button>
    </div>
  )
}
