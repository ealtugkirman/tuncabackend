"use client"

import { useLanguage } from '@/contexts/LanguageContext'
import trTranslations from '@/locales/tr.json'
import enTranslations from '@/locales/en.json'

type TranslationKey = string
type TranslationParams = Record<string, string | number>

const translations = {
  tr: trTranslations,
  en: enTranslations
}

export function useTranslation() {
  const { locale } = useLanguage()

  const t = (key: TranslationKey, params?: TranslationParams): string => {
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

  return { t, locale }
}
