import { Language } from '@prisma/client'

// Base content interface for multilingual content
export interface MultilingualContent {
  id: string
  slug: string
  createdAt: Date
  updatedAt: Date
  // Translation fields
  title: string
  excerpt?: string
  content?: string
}

// Extended interfaces for specific content types
export interface MultilingualAnnouncement extends MultilingualContent {
  date: string
  year: string
  image?: string
  category: string
  isDark: boolean
  published: boolean
}

export interface MultilingualEvent extends MultilingualContent {
  date: Date
  year: string
  image?: string
  gallery: string[]
  eventType: string
  category: string
  location?: string
  published: boolean
}

export interface MultilingualPublication extends MultilingualContent {
  date: Date
  year: string
  practiceArea: string
  category: string
  author: string
  tags: string[]
  published: boolean
  lawyerId?: string
  lawyer?: {
    id: string
    name: string
    title: string
    image?: string
  }
}

export interface MultilingualLawyer {
  id: string
  slug: string
  email: string
  phone?: string
  image?: string
  isFounder: boolean
  isPartner: boolean
  isIntern: boolean
  practiceAreas: string[]
  education: string[]
  languages: string[]
  createdAt: Date
  updatedAt: Date
  // Translation fields
  name: string
  title: string
  bio: string
}

// Translation interfaces
export interface Translation {
  id: string
  language: Language
  title: string
  excerpt?: string
  content?: string
  createdAt: Date
  updatedAt: Date
}

export interface LawyerTranslation {
  id: string
  language: Language
  name: string
  title: string
  bio: string
  createdAt: Date
  updatedAt: Date
}

// API Response interfaces
export interface MultilingualApiResponse<T> {
  data: T[]
  language: Language
  total?: number
  page?: number
  limit?: number
}

// Form interfaces for admin
export interface MultilingualFormData {
  language: Language
  title: string
  excerpt?: string
  content?: string
  translations?: Array<{
    language: Language
    title: string
    excerpt?: string
    content?: string
  }>
}

export interface LawyerFormData {
  language: Language
  name: string
  title: string
  bio: string
  translations?: Array<{
    language: Language
    name: string
    title: string
    bio: string
  }>
}

// SEO interfaces
export interface MultilingualSEO {
  title: string
  description: string
  keywords: string[]
  canonical: string
  alternateLanguages: Array<{
    language: Language
    url: string
  }>
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

// Site settings interface
export interface SiteSettings {
  id: string
  key: string
  value: string
  language: Language
  createdAt: Date
  updatedAt: Date
}
