'use client'

import { useState } from 'react'
import { Language } from '@prisma/client'
import { CONTENT_LANGUAGES, getLanguageName } from '@/lib/i18n'
import { Globe, Check } from 'lucide-react'

interface LanguageSelectorProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
  className?: string
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  className = '' 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const languages = CONTENT_LANGUAGES

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span>{getLanguageName(selectedLanguage)}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border border-border z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => {
                    onLanguageChange(language)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${
                    selectedLanguage === language ? 'bg-muted' : ''
                  }`}
                >
                  <span>{getLanguageName(language)}</span>
                  {selectedLanguage === language && (
                    <Check className="w-4 h-4 text-primary" />
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
