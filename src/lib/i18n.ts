import { Language } from '@prisma/client'

export const SUPPORTED_LANGUAGES = {
  TR: 'tr',
  EN: 'en',
  RU: 'ru',
} as const

/** Prisma `Language` values that can appear in translation rows / API. */
export const CONTENT_LANGUAGES: Language[] = [Language.TR, Language.EN, Language.RU]

export const DEFAULT_LANGUAGE: Language = 'TR'

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

/** Safe parse for `?language=` query params (TR | EN | RU). */
export function parseLanguageParam(value: string | null | undefined): Language {
  const v = value?.trim().toUpperCase()
  if (v === 'TR' || v === 'EN' || v === 'RU') return v as Language
  return DEFAULT_LANGUAGE
}

// Get localized content from translation array
export function getLocalizedContent<T extends { language: Language }>(
  translations: T[],
  language: Language,
  fallbackLanguage: Language = DEFAULT_LANGUAGE
): T | null {
  let content = translations.find((t) => t.language === language)

  if (!content && language !== fallbackLanguage) {
    content = translations.find((t) => t.language === fallbackLanguage)
  }

  if (!content && translations.length > 0) {
    content = translations[0]
  }

  return content || null
}

const MAX_SLUG_SEGMENT = 120

/** Fold Turkish letters so slug keeps readable Latin (URLs). */
function foldTurkishForSlug(s: string): string {
  return s
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

// Generate slug from title
export function generateSlug(title: string, language: Language = DEFAULT_LANGUAGE): string {
  const raw = title.trim()

  if (language === 'TR') {
    const lower = raw.toLocaleLowerCase('tr-TR')
    const folded = foldTurkishForSlug(lower)
    let baseSlug = folded
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    if (baseSlug.length > MAX_SLUG_SEGMENT) {
      baseSlug = baseSlug.slice(0, MAX_SLUG_SEGMENT).replace(/-+$/, '')
    }
    return baseSlug
  }

  if (language === 'RU') {
    const lower = raw.toLocaleLowerCase('ru-RU')
    let baseSlug = lower
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    if (baseSlug.length > MAX_SLUG_SEGMENT) {
      baseSlug = baseSlug.slice(0, MAX_SLUG_SEGMENT).replace(/-+$/, '')
    }
    return baseSlug
  }

  const lower = raw.toLowerCase()
  const folded = lower.normalize('NFD').replace(/\p{M}/gu, '')
  let baseSlug = folded
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (baseSlug.length > MAX_SLUG_SEGMENT) {
    baseSlug = baseSlug.slice(0, MAX_SLUG_SEGMENT).replace(/-+$/, '')
  }

  return baseSlug
}

// Generate unique slug with timestamp
export function generateUniqueSlug(title: string, language: Language = DEFAULT_LANGUAGE): string {
  let baseSlug = generateSlug(title, language)
  if (!baseSlug.replace(/-/g, '')) {
    baseSlug = 'content'
  }
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  TR: 'Türkçe',
  EN: 'English',
  RU: 'Русский',
}

// Get language name
export function getLanguageName(language: Language): string {
  return LANGUAGE_NAMES[language]
}

/** Short label for form fields: (Türkçe) / (English) / (Русский) */
export function localizedFieldBracket(language: Language): string {
  switch (language) {
    case Language.TR:
      return '(Türkçe)'
    case Language.EN:
      return '(English)'
    case Language.RU:
      return '(Русский)'
    default:
      return ''
  }
}

/** TR / EN / RU metin seçimi (form placeholder ve kısa yardımlar için). */
export function pickByLanguage(lang: Language, tr: string, en: string, ru: string): string {
  if (lang === Language.TR) return tr
  if (lang === Language.RU) return ru
  return en
}

// Check if language is RTL
export function isRTL(language: Language): boolean {
  return false
}

/** Strip `/tr`, `/en`, `/ru` prefix from pathname (public site routing). */
export function removeLanguageFromPath(path: string): string {
  if (path.startsWith('/en/')) return path.slice(3)
  if (path.startsWith('/tr/')) return path.slice(3)
  if (path.startsWith('/ru/')) return path.slice(3)
  if (path === '/en' || path === '/tr' || path === '/ru') return '/'
  return path
}

/** Prefix path with locale segment (`/tr`, `/en`, `/ru`). */
export function addLanguageToPath(path: string, language: Language): string {
  const seg = language === 'TR' ? 'tr' : language === 'EN' ? 'en' : 'ru'
  const clean = path.startsWith('/') ? path : `/${path}`
  if (clean === '/') return `/${seg}`
  return `/${seg}${clean}`
}
