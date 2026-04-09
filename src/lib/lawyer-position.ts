/**
 * Tek seçimli avukat pozisyonu; veritabanında boolean bayraklarına çevrilir.
 */
export const LAWYER_POSITION_VALUES = [
  'PARTNER',
  'FOUNDING_PARTNER',
  'CONSULTANT',
  'LAWYER',
  'INTERN',
] as const

export type LawyerPosition = (typeof LAWYER_POSITION_VALUES)[number]

export const LAWYER_POSITION_OPTIONS_TR: { value: LawyerPosition; label: string }[] = [
  { value: 'PARTNER', label: 'Ortak' },
  { value: 'FOUNDING_PARTNER', label: 'Kurucu ortak' },
  { value: 'CONSULTANT', label: 'Danışman' },
  { value: 'LAWYER', label: 'Avukat' },
  { value: 'INTERN', label: 'Stajyer avukat' },
]

export function isLawyerPosition(s: string): s is LawyerPosition {
  return (LAWYER_POSITION_VALUES as readonly string[]).includes(s)
}

export function positionToFlags(position: string): {
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  isLawyer: boolean
  isConsultant: boolean
} {
  switch (position) {
    case 'PARTNER':
      return {
        isPartner: true,
        isFounder: false,
        isIntern: false,
        isLawyer: false,
        isConsultant: false,
      }
    case 'FOUNDING_PARTNER':
      return {
        isPartner: true,
        isFounder: true,
        isIntern: false,
        isLawyer: false,
        isConsultant: false,
      }
    case 'CONSULTANT':
      return {
        isPartner: false,
        isFounder: false,
        isIntern: false,
        isLawyer: false,
        isConsultant: true,
      }
    case 'LAWYER':
      return {
        isPartner: false,
        isFounder: false,
        isIntern: false,
        isLawyer: true,
        isConsultant: false,
      }
    case 'INTERN':
      return {
        isPartner: false,
        isFounder: false,
        isIntern: true,
        isLawyer: false,
        isConsultant: false,
      }
    default:
      return {
        isPartner: false,
        isFounder: false,
        isIntern: false,
        isLawyer: true,
        isConsultant: false,
      }
  }
}

export function flagsToPosition(lawyer: {
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  isLawyer: boolean
  isConsultant?: boolean
}): LawyerPosition {
  if (lawyer.isIntern) return 'INTERN'
  if (lawyer.isConsultant) return 'CONSULTANT'
  if (lawyer.isFounder && lawyer.isPartner) return 'FOUNDING_PARTNER'
  if (lawyer.isPartner) return 'PARTNER'
  if (lawyer.isLawyer) return 'LAWYER'
  /** Eski kayıt: sadece kurucu bayrağı */
  if (lawyer.isFounder) return 'FOUNDING_PARTNER'
  return 'LAWYER'
}

/** API gövdesi: öncelik `position`; yoksa eski boolean alanları */
export function resolveLawyerFlagsFromBody(body: Record<string, unknown>): {
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  isLawyer: boolean
  isConsultant: boolean
} {
  const pos = body.position
  if (typeof pos === 'string' && isLawyerPosition(pos)) {
    return positionToFlags(pos)
  }
  return {
    isPartner: Boolean(body.isPartner),
    isFounder: Boolean(body.isFounder),
    isIntern: Boolean(body.isIntern),
    isLawyer: body.isLawyer !== undefined ? Boolean(body.isLawyer) : true,
    isConsultant: Boolean(body.isConsultant),
  }
}

/** Tek satır Türkçe rol etiketi (liste / rozet) */
export function lawyerRoleLabelTr(lawyer: {
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  isLawyer: boolean
  isConsultant?: boolean | null
}): string {
  const p = flagsToPosition({
    ...lawyer,
    isConsultant: Boolean(lawyer.isConsultant),
  })
  return LAWYER_POSITION_OPTIONS_TR.find((o) => o.value === p)?.label ?? 'Avukat'
}
