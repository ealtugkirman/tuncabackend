import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, generateUniqueSlug, parseLanguageParam } from '@/lib/i18n'
import { Language } from '@prisma/client'
import {
  isValidAnnouncementPracticeAreaSlug,
  sanitizePublicationPracticeAreaSlugs,
} from '@/lib/announcement-practice-areas'

// GET /api/publications - Get all publications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const published = searchParams.get('published')
    const practiceAreaParam =
      searchParams.get('practiceArea') ?? searchParams.get('alan')
    const language = parseLanguageParam(searchParams.get('language'))
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let whereClause: any = {}

    if (year) {
      const parsedYear = parseInt(year as string, 10)
      if (!Number.isNaN(parsedYear)) {
        whereClause.year = parsedYear
      }
    }

    // removed: practiceArea, category, author

    if (published !== null && published !== '') {
      whereClause.published = published === 'true'
    }

    if (practiceAreaParam && isValidAnnouncementPracticeAreaSlug(practiceAreaParam)) {
      whereClause.practiceAreaSlugs = { has: practiceAreaParam }
    }

    // Search in translations
    if (search) {
      whereClause.translations = {
        some: {
          language,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    if (sortBy === 'title') {
      orderBy = { translations: { _count: 'desc' } }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    // Run sequentially to avoid exhausting DB pool under load
    const publications = await prisma.publication.findMany({
      where: whereClause,
      include: {
        translations: {
          where: { language }
        },
        lawyers: {
          select: {
            id: true,
            image: true,
            translations: {
              where: { language }
            }
          }
        }
      },
      orderBy: search ? { createdAt: sortOrder as any } : orderBy,
      skip,
      take: limit
    })

    const totalCount = await prisma.publication.count({ where: whereClause })

    // Transform to include translation data at root level
    const result = publications.map(publication => {
      const translation = publication.translations[0]
      const firstLawyer = publication.lawyers?.[0]
      const lawyerTranslation = firstLawyer?.translations?.[0]
      return {
        ...publication,
        title: translation?.title || '',
        excerpt: translation?.excerpt || '',
        content: translation?.content || '',
        lawyerName: lawyerTranslation?.name || '',
        translations: undefined, // Remove translations from response
        lawyers: publication.lawyers?.map(l => ({
          id: l.id,
          image: l.image,
          name: l.translations?.[0]?.name || ''
        }))
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching publications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  }
}

// POST /api/publications - Create new publication (admin only)
export async function POST(request: NextRequest) {
  console.log("🚀 API: Yayın oluşturma isteği alındı")
  
  try {
    const user = await getCurrentUser()
    console.log("👤 Kullanıcı kontrolü:", { 
      user: user ? { id: user.id, email: user.email, role: user.role } : null 
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      console.log("❌ Yetkisiz erişim")
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("📥 Gelen veri:", body)
    
    const {
      date,
      year,
      tags,
      published,
      lawyerId,
      lawyerIds = [],
      language = DEFAULT_LANGUAGE,
      translations = [],
      image,
      imagePublicId,
      practiceAreaSlugs: rawPracticeAreaSlugs,
    } = body

    console.log("🔍 Ayrıştırılan veriler:", {
      date,
      year,
      tags,
      published,
      lawyerId,
      lawyerIds,
      language,
      translationsCount: translations.length
    })

    // Convert tags string to array
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    console.log("🏷️ Etiketler:", tagsArray)

    // Convert single lawyerId to array if provided
    const finalLawyerIds = lawyerId ? [lawyerId] : lawyerIds
    console.log("👥 Avukat ID'leri:", finalLawyerIds)

    const practiceAreaSlugs = sanitizePublicationPracticeAreaSlugs(rawPracticeAreaSlugs)

    // Generate slug from first translation or fallback
    const firstTranslation = translations[0]
    const slug = firstTranslation ? generateUniqueSlug(firstTranslation.title, firstTranslation.language) : generateUniqueSlug('publication', language)
    console.log("🔗 Oluşturulan slug:", slug)

    console.log("💾 Database'e kayıt başlatılıyor...")
    
    const publicationData = {
      slug,
      date: new Date(date),
      year: parseInt(year),
      tags: tagsArray,
      published: published || false,
      image: image || null,
      imagePublicId: imagePublicId || null,
      practiceAreaSlugs,
      lawyers: {
        connect: finalLawyerIds.filter(Boolean).map((id: string) => ({ id }))
      },
      translations: {
        create: translations.map((translation: any) => ({
          language: translation.language,
          title: translation.title,
          excerpt: translation.excerpt,
          content: translation.content
        }))
      }
    }
    
    console.log("📊 Database'e gönderilecek veri:", publicationData)

    const publication = await prisma.publication.create({
      data: publicationData,
      include: {
        translations: true,
        lawyers: {
          select: {
            id: true,
            image: true,
            translations: {
              where: { language }
            }
          }
        }
      }
    })

    console.log("✅ Yayın başarıyla oluşturuldu:", {
      id: publication.id,
      slug: publication.slug,
      title: publication.translations[0]?.title,
      translationsCount: publication.translations.length,
      lawyersCount: publication.lawyers.length
    })

    return NextResponse.json(publication, { status: 201 })
  } catch (error) {
    console.error('💥 Yayın oluşturma hatası:', error)
    console.error('📋 Hata detayları:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Failed to create publication', details: error.message },
      { status: 500 }
    )
  }
}
