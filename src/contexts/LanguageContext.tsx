"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import trTranslations from '@/locales/tr.json'
import enTranslations from '@/locales/en.json'

type Locale = 'tr' | 'en'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  isLoading: boolean
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: React.ReactNode
}

const translations = {
  tr: trTranslations,
  en: enTranslations
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('tr')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // URL'den locale'i çıkar
  const getLocaleFromPath = (path: string): Locale => {
    if (path.startsWith('/en')) return 'en'
    if (path.startsWith('/tr')) return 'tr'
    return 'tr' // default
  }

  // Path'den locale'i kaldır
  const getPathWithoutLocale = (path: string): string => {
    if (path.startsWith('/en/')) return path.slice(3)
    if (path.startsWith('/tr/')) return path.slice(3)
    if (path === '/en' || path === '/tr') return '/'
    return path
  }

  // Locale değiştirme
  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return
    
    setIsLoading(true)
    
    // Mevcut path'i al ve locale'i değiştir
    const currentPath = getPathWithoutLocale(pathname)
    const newPath = `/${newLocale}${currentPath}`
    
    setLocaleState(newLocale)
    
    // URL'i güncelle
    router.push(newPath)
    
    // Loading'i kısa bir süre sonra kapat
    setTimeout(() => setIsLoading(false), 300)
  }

  // Çeviri fonksiyonu
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations[locale]

    // Nested key'leri takip et
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to Turkish if key not found
        value = translations.tr
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if not found anywhere
          }
        }
        break
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Parametreleri değiştir
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{{${paramKey}}}`, String(paramValue))
      })
    }

    return value
  }

  // URL değiştiğinde locale'i güncelle
  useEffect(() => {
    const newLocale = getLocaleFromPath(pathname)
    if (newLocale !== locale) {
      setLocaleState(newLocale)
    }
  }, [pathname, locale])

  const value: LanguageContextType = {
    locale,
    setLocale,
    isLoading,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
