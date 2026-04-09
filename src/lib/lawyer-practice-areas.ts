import { ANNOUNCEMENT_PRACTICE_AREAS } from '@/lib/announcement-practice-areas'

/** TMT — sitedeki duyuru listesiyle aynı yapı; avukat birleşik listesine eklenir */
export const TMT_LAWYER_PRACTICE_AREA = {
  slug: 'teknoloji-medya-ve-telekomunikasyon-tmt-hukuku',
  tr: 'Teknoloji, Medya ve Telekomünikasyon (TMT) Hukuku',
  en: 'Technology, Media and Telecommunications (TMT) Law',
} as const

/**
 * Duyuru alanları + TMT. `practiceAreas[]` içinde saklanan kanonik değerler `slug` alanıdır.
 */
export const ALL_LAWYER_PRACTICE_AREAS = [
  ...ANNOUNCEMENT_PRACTICE_AREAS.map((a) => ({ slug: a.slug, tr: a.tr, en: a.en })),
  {
    slug: TMT_LAWYER_PRACTICE_AREA.slug,
    tr: TMT_LAWYER_PRACTICE_AREA.tr,
    en: TMT_LAWYER_PRACTICE_AREA.en,
  },
] as const

export type LawyerPracticeAreaSlug = (typeof ALL_LAWYER_PRACTICE_AREAS)[number]['slug']

const SLUG_SET = new Set<string>(ALL_LAWYER_PRACTICE_AREAS.map((a) => a.slug))

function buildLegacyAliasMap(): Record<string, string> {
  const m: Record<string, string> = {}
  const add = (alias: string, slug: string) => {
    const a = alias.trim()
    if (!a) return
    m[a] = slug
  }

  for (const row of ALL_LAWYER_PRACTICE_AREAS) {
    add(row.slug, row.slug)
    add(row.tr, row.slug)
    add(row.en, row.slug)
  }

  /** Eski admin MultilingualForm + seed / metin varyantları → kanonik slug */
  const legacyPairs: [string, string][] = [
    ['Birleşme ve Devralmalar', 'birlesme-ve-devralmalar'],
    ['Mergers and Acquisitions', 'birlesme-ve-devralmalar'],
    ['Bankacılık ve Finans Hukuku', 'bankacilik-ve-finans-hukuku'],
    ['Banking and Finance Law', 'bankacilik-ve-finans-hukuku'],
    ['Sağlık ve İlaç Hukuku', 'saglik-ve-ilac-hukuku'],
    ['Health and Pharmaceutical Law', 'saglik-ve-ilac-hukuku'],
    ['Dava Takibi ve Tahkim', 'dava-takibi-ve-tahkim'],
    ['Litigation and Arbitration', 'dava-takibi-ve-tahkim'],
    ['Enerji Hukuku', 'enerji-hukuku'],
    ['Energy Law', 'enerji-hukuku'],
    ['Kamu İhale Hukuku', 'kamu-ihale-hukuku'],
    ['Public Procurement Law', 'kamu-ihale-hukuku'],
    ['İş Hukuku', 'is-hukuku'],
    ['Labor Law', 'is-hukuku'],
    ['Maden ve Petrol Hukuku', 'maden-ve-petrol-hukuku'],
    ['Mining and Petroleum Law', 'maden-ve-petrol-hukuku'],
    ['Vergi Hukuku', 'vergi-hukuku'],
    ['Tax Law', 'vergi-hukuku'],
    ['Gayrimenkul ve İnşaat Hukuku', 'gayrimenkul-ve-insaat-hukuku'],
    ['Real Estate and Construction Law', 'gayrimenkul-ve-insaat-hukuku'],
    ['Kişisel Verilerin Korunması Hukuku', 'kisisel-verilerin-korunmasi-hukuku'],
    ['Personal Data Protection Law', 'kisisel-verilerin-korunmasi-hukuku'],
    ['Ticaret Hukuku ve Sermaye Piyasaları', 'ticaret-hukuku-ve-sermaye-piyasalari'],
    ['Commercial, Corporate Law and Capital Markets', 'ticaret-hukuku-ve-sermaye-piyasalari'],
    ['Uluslararası Ticaret Hukuku ve Sermaye Piyasaları', 'ticaret-hukuku-ve-sermaye-piyasalari'],
    ['International Commercial Law & Arbitration', 'ticaret-hukuku-ve-sermaye-piyasalari'],
    ['Spor Hukuku', 'spor-hukuku'],
    ['Sports Law', 'spor-hukuku'],
    ['Fikri Mülkiyet Hukuku', 'fikri-mulkiyet-hukuku'],
    ['Intellectual Property Law', 'fikri-mulkiyet-hukuku'],
    ['Rekabet Hukuku', 'rekabet-hukuku'],
    ['Competition Law', 'rekabet-hukuku'],
  ]

  for (const [alias, slug] of legacyPairs) {
    add(alias, slug)
  }

  return m
}

const LEGACY_ALIAS_TO_SLUG = buildLegacyAliasMap()

export function isValidLawyerPracticeAreaSlug(s: string): s is LawyerPracticeAreaSlug {
  return SLUG_SET.has(s)
}

/** Tek ham değeri kanonik slug’a çevirir; bilinmeyeni olduğu gibi döndürür */
export function normalizeLawyerPracticeAreaSlug(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  if (SLUG_SET.has(t)) return t
  if (LEGACY_ALIAS_TO_SLUG[t]) return LEGACY_ALIAS_TO_SLUG[t]
  const hit = Object.keys(LEGACY_ALIAS_TO_SLUG).find((k) => k.toLowerCase() === t.toLowerCase())
  if (hit) return LEGACY_ALIAS_TO_SLUG[hit]
  const row = ALL_LAWYER_PRACTICE_AREAS.find((r) => r.tr === t || r.en === t)
  if (row) return row.slug
  return t
}

export function normalizeLawyerPracticeAreaSlugs(areas: string[]): string[] {
  const next = areas.map((a) => normalizeLawyerPracticeAreaSlug(a)).filter(Boolean)
  return [...new Set(next)]
}

export function getLawyerPracticeAreaLabel(slug: string, lang: 'tr' | 'en' | 'ru'): string {
  const row = ALL_LAWYER_PRACTICE_AREAS.find((a) => a.slug === slug)
  if (row) {
    if (lang === 'tr') return row.tr
    if (lang === 'ru') return row.en
    return row.en
  }
  return slug
}

/** Filtre: DB’de slug veya eski TR/EN metinleri olabilir */
export function expandSlugForPracticeAreaFilter(slug: string): string[] {
  const normalized = normalizeLawyerPracticeAreaSlug(slug)
  const set = new Set<string>([normalized])
  for (const [alias, s] of Object.entries(LEGACY_ALIAS_TO_SLUG)) {
    if (s === normalized) set.add(alias)
  }
  const row = ALL_LAWYER_PRACTICE_AREAS.find((r) => r.slug === normalized)
  if (row) {
    set.add(row.tr)
    set.add(row.en)
    set.add(row.slug)
  }
  return [...set]
}
