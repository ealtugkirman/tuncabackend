import { prisma } from './prisma'
import { Language, DEFAULT_LANGUAGE } from './i18n'

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonical: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  structuredData?: any
}

export interface PageSEOData extends SEOData {
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
}

// Base SEO configuration
export const baseSEO = {
  siteName: {
    TR: 'Tunca Avukatlık',
    EN: 'Tunca Law Firm'
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tuncalaw.com',
  defaultImage: '/images/tunca-law-og-image.jpg',
  twitterHandle: '@tuncalaw',
  defaultKeywords: {
    TR: [
      'avukat',
      'hukuk bürosu',
      'ankara avukat',
      'kurumsal hukuk',
      'birleşme devralma',
      'iş hukuku',
      'ticaret hukuku',
      'sermaye piyasaları'
    ],
    EN: [
      'lawyer',
      'law firm',
      'ankara lawyer',
      'corporate law',
      'mergers acquisitions',
      'labor law',
      'commercial law',
      'capital markets'
    ]
  }
}

// Generate SEO data for homepage
export async function generateHomepageSEO(): Promise<SEOData> {
  const lawyers = await prisma.lawyer.findMany({
    where: { isPartner: true },
    take: 3
  })

  const practiceAreas = await prisma.lawyer.findMany({
    select: { practiceAreas: true }
  })

  const allPracticeAreas = practiceAreas
    .flatMap(lawyer => lawyer.practiceAreas)
    .filter((area, index, arr) => arr.indexOf(area) === index)
    .slice(0, 10)

  return {
    title: 'Tunca Avukatlık - Ankara Hukuk Bürosu | Kurumsal Hukuk Uzmanları',
    description: 'Ankara\'da kurumsal hukuk, birleşme ve devralma, iş hukuku alanlarında uzman avukatlar. Dr. Mehmet Tunca liderliğinde profesyonel hukuki danışmanlık hizmetleri.',
    keywords: [
      ...baseSEO.defaultKeywords,
      ...allPracticeAreas,
      'dr mehmet tunca',
      'profesyonel hukuki danışmanlık',
      'ankara hukuk bürosu'
    ],
    canonical: baseSEO.siteUrl,
    ogTitle: 'Tunca Avukatlık - Ankara Hukuk Bürosu',
    ogDescription: 'Kurumsal hukuk, birleşme ve devralma, iş hukuku alanlarında uzman avukatlar. Profesyonel hukuki danışmanlık hizmetleri.',
    ogImage: `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Tunca Avukatlık - Ankara Hukuk Bürosu',
    twitterDescription: 'Kurumsal hukuk, birleşme ve devralma, iş hukuku alanlarında uzman avukatlar.',
    twitterImage: `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      name: 'Tunca Avukatlık',
      description: 'Ankara\'da kurumsal hukuk, birleşme ve devralma, iş hukuku alanlarında uzman avukatlar.',
      url: baseSEO.siteUrl,
      logo: `${baseSEO.siteUrl}/images/tunca-law-logo.png`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ankara',
        addressCountry: 'TR'
      },
      telephone: '+90 312 XXX XX XX',
      email: 'info@tuncalaw.com',
      areaServed: 'Turkey',
      serviceType: [
        'Kurumsal Hukuk',
        'Birleşme ve Devralma',
        'İş Hukuku',
        'Ticaret Hukuku',
        'Sermaye Piyasaları'
      ],
      employee: lawyers.map(lawyer => ({
        '@type': 'Person',
        name: lawyer.name,
        jobTitle: lawyer.title,
        worksFor: {
          '@type': 'LegalService',
          name: 'Tunca Avukatlık'
        }
      }))
    }
  }
}

// Generate SEO data for lawyer profile
export async function generateLawyerSEO(lawyerId: string): Promise<PageSEOData> {
  const lawyer = await prisma.lawyer.findUnique({
    where: { id: lawyerId }
  })

  if (!lawyer) {
    throw new Error('Lawyer not found')
  }

  const title = `${lawyer.name} - ${lawyer.title} | Tunca Avukatlık`
  const description = `${lawyer.name}, ${lawyer.practiceAreas.join(', ')} alanlarında uzman ${lawyer.title}. ${lawyer.bio || ''}`.substring(0, 160)

  return {
    title,
    description,
    keywords: [
      lawyer.name,
      lawyer.title,
      ...lawyer.practiceAreas,
      ...lawyer.languages,
      'tunca avukatlık',
      'ankara avukat'
    ],
    canonical: `${baseSEO.siteUrl}/avukatlar/${lawyerId}`,
    ogTitle: title,
    ogDescription: description,
    ogImage: lawyer.image || `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    ogType: 'profile',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: lawyer.image || `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    breadcrumbs: [
      { name: 'Ana Sayfa', url: baseSEO.siteUrl },
      { name: 'Avukatlar', url: `${baseSEO.siteUrl}/avukatlar` },
      { name: lawyer.name, url: `${baseSEO.siteUrl}/avukatlar/${lawyerId}` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: lawyer.name,
      jobTitle: lawyer.title,
      description: lawyer.bio,
      image: lawyer.image,
      worksFor: {
        '@type': 'LegalService',
        name: 'Tunca Avukatlık',
        url: baseSEO.siteUrl
      },
      knowsAbout: lawyer.practiceAreas,
      knowsLanguage: lawyer.languages,
      hasCredential: lawyer.certifications.map(cert => ({
        '@type': 'EducationalOccupationalCredential',
        name: cert
      })),
      alumniOf: lawyer.education.map(edu => ({
        '@type': 'EducationalOrganization',
        name: edu
      }))
    }
  }
}

// Generate SEO data for announcement
export async function generateAnnouncementSEO(announcementId: string): Promise<PageSEOData> {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId }
  })

  if (!announcement) {
    throw new Error('Announcement not found')
  }

  const title = `${announcement.title} | Tunca Avukatlık Duyuruları`
  const description = announcement.excerpt.substring(0, 160)

  return {
    title,
    description,
    keywords: [
      announcement.title,
      announcement.category,
      'tunca avukatlık',
      'hukuk duyuruları',
      'ankara avukat'
    ],
    canonical: `${baseSEO.siteUrl}/duyurular/${announcementId}`,
    ogTitle: title,
    ogDescription: description,
    ogImage: announcement.image || `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: announcement.image || `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    breadcrumbs: [
      { name: 'Ana Sayfa', url: baseSEO.siteUrl },
      { name: 'Duyurular', url: `${baseSEO.siteUrl}/duyurular` },
      { name: announcement.title, url: `${baseSEO.siteUrl}/duyurular/${announcementId}` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: announcement.title,
      description: announcement.excerpt,
      image: announcement.image,
      datePublished: announcement.createdAt,
      dateModified: announcement.updatedAt,
      author: {
        '@type': 'Organization',
        name: 'Tunca Avukatlık',
        url: baseSEO.siteUrl
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tunca Avukatlık',
        url: baseSEO.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseSEO.siteUrl}/images/tunca-law-logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseSEO.siteUrl}/duyurular/${announcementId}`
      }
    }
  }
}

// Generate SEO data for event
export async function generateEventSEO(eventId: string): Promise<PageSEOData> {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  const title = `${event.title} | Tunca Avukatlık Etkinlikleri`
  const description = event.excerpt.substring(0, 160)

  return {
    title,
    description,
    keywords: [
      event.title,
      event.eventType,
      event.category,
      'hukuk etkinlikleri',
      'tunca avukatlık',
      'ankara etkinlik'
    ],
    canonical: `${baseSEO.siteUrl}/etkinlikler/${eventId}`,
    ogTitle: title,
    ogDescription: description,
    ogImage: event.image || `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    ogType: 'event',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: event.image || `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    breadcrumbs: [
      { name: 'Ana Sayfa', url: baseSEO.siteUrl },
      { name: 'Etkinlikler', url: `${baseSEO.siteUrl}/etkinlikler` },
      { name: event.title, url: `${baseSEO.siteUrl}/etkinlikler/${eventId}` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.excerpt,
      image: event.image,
      startDate: event.date,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: event.location ? {
        '@type': 'Place',
        name: event.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: event.location,
          addressCountry: 'TR'
        }
      } : undefined,
      organizer: {
        '@type': 'Organization',
        name: 'Tunca Avukatlık',
        url: baseSEO.siteUrl
      }
    }
  }
}

// Generate SEO data for publication
export async function generatePublicationSEO(publicationId: string): Promise<PageSEOData> {
  const publication = await prisma.publication.findUnique({
    where: { id: publicationId },
    include: { lawyer: true }
  })

  if (!publication) {
    throw new Error('Publication not found')
  }

  const title = `${publication.title} | Tunca Avukatlık Yayınları`
  const description = publication.excerpt.substring(0, 160)

  return {
    title,
    description,
    keywords: [
      publication.title,
      publication.practiceArea,
      publication.category,
      ...publication.tags,
      'hukuk yayınları',
      'tunca avukatlık'
    ],
    canonical: `${baseSEO.siteUrl}/yayinlar/${publicationId}`,
    ogTitle: title,
    ogDescription: description,
    ogImage: `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${baseSEO.siteUrl}${baseSEO.defaultImage}`,
    breadcrumbs: [
      { name: 'Ana Sayfa', url: baseSEO.siteUrl },
      { name: 'Yayınlar', url: `${baseSEO.siteUrl}/yayinlar` },
      { name: publication.title, url: `${baseSEO.siteUrl}/yayinlar/${publicationId}` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: publication.title,
      description: publication.excerpt,
      datePublished: publication.createdAt,
      dateModified: publication.updatedAt,
      author: publication.lawyer ? {
        '@type': 'Person',
        name: publication.lawyer.name,
        jobTitle: publication.lawyer.title,
        worksFor: {
          '@type': 'LegalService',
          name: 'Tunca Avukatlık'
        }
      } : {
        '@type': 'Organization',
        name: 'Tunca Avukatlık'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tunca Avukatlık',
        url: baseSEO.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseSEO.siteUrl}/images/tunca-law-logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseSEO.siteUrl}/yayinlar/${publicationId}`
      },
      keywords: publication.tags.join(', ')
    }
  }
}

// Generate meta tags HTML
export function generateMetaTags(seoData: SEOData): string {
  const tags = [
    `<title>${seoData.title}</title>`,
    `<meta name="description" content="${seoData.description}">`,
    `<meta name="keywords" content="${seoData.keywords.join(', ')}">`,
    `<link rel="canonical" href="${seoData.canonical}">`,
    
    // Open Graph
    `<meta property="og:title" content="${seoData.ogTitle || seoData.title}">`,
    `<meta property="og:description" content="${seoData.ogDescription || seoData.description}">`,
    `<meta property="og:image" content="${seoData.ogImage || baseSEO.defaultImage}">`,
    `<meta property="og:url" content="${seoData.canonical}">`,
    `<meta property="og:type" content="${seoData.ogType || 'website'}">`,
    `<meta property="og:site_name" content="${baseSEO.siteName}">`,
    
    // Twitter
    `<meta name="twitter:card" content="${seoData.twitterCard || 'summary_large_image'}">`,
    `<meta name="twitter:title" content="${seoData.twitterTitle || seoData.title}">`,
    `<meta name="twitter:description" content="${seoData.twitterDescription || seoData.description}">`,
    `<meta name="twitter:image" content="${seoData.twitterImage || seoData.ogImage || baseSEO.defaultImage}">`,
    `<meta name="twitter:site" content="${baseSEO.twitterHandle}">`,
    
    // Additional meta tags
    `<meta name="robots" content="index, follow">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    `<meta charset="UTF-8">`
  ]

  // Add structured data if available
  if (seoData.structuredData) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(seoData.structuredData, null, 2)}</script>`)
  }

  return tags.join('\n')
}
