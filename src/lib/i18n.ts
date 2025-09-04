import { Language } from '@prisma/client'

export const SUPPORTED_LANGUAGES = {
  TR: 'tr',
  EN: 'en'
} as const

export const DEFAULT_LANGUAGE: Language = 'TR'

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

// Get localized content from translation array
export function getLocalizedContent<T extends { language: Language }>(
  translations: T[],
  language: Language,
  fallbackLanguage: Language = DEFAULT_LANGUAGE
): T | null {
  // Try to find content in requested language
  let content = translations.find(t => t.language === language)
  
  // Fallback to default language if not found
  if (!content && language !== fallbackLanguage) {
    content = translations.find(t => t.language === fallbackLanguage)
  }
  
  // Return first available if still not found
  if (!content && translations.length > 0) {
    content = translations[0]
  }
  
  return content || null
}

// Generate slug from title
export function generateSlug(title: string, language: Language = DEFAULT_LANGUAGE): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
  
  return baseSlug
}

// Generate unique slug with timestamp
export function generateUniqueSlug(title: string, language: Language = DEFAULT_LANGUAGE): string {
  const baseSlug = generateSlug(title, language)
  const timestamp = Date.now().toString(36) // Base36 timestamp
  return `${baseSlug}-${timestamp}`
}

// Language display names
export const LANGUAGE_NAMES = {
  TR: 'Türkçe',
  EN: 'English'
} as const

// Get language name
export function getLanguageName(language: Language): string {
  return LANGUAGE_NAMES[language]
}

// Check if language is RTL
export function isRTL(language: Language): boolean {
  // Currently no RTL languages supported
  return false
}
