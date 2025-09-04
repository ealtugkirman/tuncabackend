'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { Language, getLanguageName, removeLanguageFromPath, addLanguageToPath } from '@/lib/i18n'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const languages: Language[] = ['TR', 'EN']
  
  // Get current language from pathname
  const currentLanguage = pathname.startsWith('/en') ? 'EN' : 'TR'

  const handleLanguageChange = (newLanguage: Language) => {
    const cleanPath = removeLanguageFromPath(pathname)
    const newPath = addLanguageToPath(cleanPath, newLanguage)
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>{getLanguageName(currentLanguage)}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                    currentLanguage === language ? 'bg-gray-50' : ''
                  }`}
                >
                  <span>{getLanguageName(language)}</span>
                  {currentLanguage === language && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
