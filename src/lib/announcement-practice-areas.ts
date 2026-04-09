/**
 * Canonical practice areas for announcements (TR | EN) + URL slug for filtering.
 * Order matches the firm grid / site structure.
 */
export const ANNOUNCEMENT_PRACTICE_AREAS = [
  {
    slug: 'other',
    tr: 'Diğer',
    en: 'Other',
  },
  {
    slug: 'bankacilik-ve-finans-hukuku',
    tr: 'Bankacılık ve Finans Hukuku',
    en: 'Banking and Finance Law',
  },
  {
    slug: 'birlesme-ve-devralmalar',
    tr: 'Birleşme ve Devralmalar',
    en: 'Mergers and Acquisitions',
  },
  {
    slug: 'saglik-ve-ilac-hukuku',
    tr: 'Sağlık ve İlaç Hukuku',
    en: 'Health and Pharmaceutical Law',
  },
  {
    slug: 'dava-takibi-ve-tahkim',
    tr: 'Dava Takibi ve Tahkim',
    en: 'Litigation and Arbitration',
  },
  {
    slug: 'enerji-hukuku',
    tr: 'Enerji Hukuku',
    en: 'Energy Law',
  },
  {
    slug: 'kamu-ihale-hukuku',
    tr: 'Kamu İhale Hukuku',
    en: 'Public Procurement Law',
  },
  {
    slug: 'is-hukuku',
    tr: 'İş Hukuku',
    en: 'Labor Law',
  },
  {
    slug: 'maden-ve-petrol-hukuku',
    tr: 'Maden ve Petrol Hukuku',
    en: 'Mining and Petroleum Law',
  },
  {
    slug: 'vergi-hukuku',
    tr: 'Vergi Hukuku',
    en: 'Tax Law',
  },
  {
    slug: 'gayrimenkul-ve-insaat-hukuku',
    tr: 'Gayrimenkul ve İnşaat Hukuku',
    en: 'Real Estate and Construction Law',
  },
  {
    slug: 'kisisel-verilerin-korunmasi-hukuku',
    tr: 'Kişisel Verilerin Korunması Hukuku',
    en: 'Personal Data Protection Law',
  },
  {
    slug: 'ticaret-hukuku-ve-sermaye-piyasalari',
    tr: 'Şirketler Hukuku ve Sermaye Piyasaları',
    en: 'Corporate Law and Capital Markets',
  },
  {
    slug: 'spor-hukuku',
    tr: 'Spor Hukuku',
    en: 'Sports Law',
  },
  {
    slug: 'fikri-mulkiyet-hukuku',
    tr: 'Fikri Mülkiyet Hukuku',
    en: 'Intellectual Property Law',
  },
  {
    slug: 'rekabet-hukuku',
    tr: 'Rekabet Hukuku',
    en: 'Competition Law',
  },
] as const

export type AnnouncementPracticeAreaSlug = (typeof ANNOUNCEMENT_PRACTICE_AREAS)[number]['slug']

const SLUG_SET = new Set<string>(ANNOUNCEMENT_PRACTICE_AREAS.map((a) => a.slug))

export function isValidAnnouncementPracticeAreaSlug(s: string): s is AnnouncementPracticeAreaSlug {
  return SLUG_SET.has(s)
}

export function getAnnouncementPracticeAreaLabel(slug: string, lang: 'tr' | 'en' | 'ru'): string {
  const row = ANNOUNCEMENT_PRACTICE_AREAS.find((a) => a.slug === slug)
  if (!row) return slug
  if (lang === 'tr') return row.tr
  if (lang === 'ru') return row.en
  return row.en
}

/** For API / forms: keep only known announcement-area slugs. */
export function sanitizePublicationPracticeAreaSlugs(input: unknown): AnnouncementPracticeAreaSlug[] {
  if (!Array.isArray(input)) return []
  return input.filter((s): s is AnnouncementPracticeAreaSlug => typeof s === 'string' && isValidAnnouncementPracticeAreaSlug(s))
}
