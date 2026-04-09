import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, generateUniqueSlug, parseLanguageParam } from '@/lib/i18n'
import { Language } from '@prisma/client'
import { isValidAnnouncementPracticeAreaSlug } from '@/lib/announcement-practice-areas'

// GET /api/announcements - Get all announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const published = searchParams.get('published')
    const language = parseLanguageParam(searchParams.get('language'))
    const yearParam = searchParams.get('year')
    const practiceAreaParam =
      searchParams.get('practiceArea') ?? searchParams.get('alan')

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Date range filters
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let whereClause: any = {}

    if (published && published !== 'all') {
      whereClause.published = published === 'true'
    }

    // Year filtering
    if (yearParam) {
      const parsedYear = parseInt(yearParam)
      if (!Number.isNaN(parsedYear)) {
        whereClause.year = parsedYear
      }
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo)
      }
    }

    if (practiceAreaParam && isValidAnnouncementPracticeAreaSlug(practiceAreaParam)) {
      whereClause.practiceAreaSlug = practiceAreaParam
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

    // Get total count for pagination
    const totalCount = await prisma.announcement.count({
      where: whereClause
    })

    // Get announcements with pagination
    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        translations: {
          where: { language }
        }
      },
      orderBy: sortBy === 'date' ? { date: sortOrder } : { createdAt: sortOrder },
      skip,
      take: limit
    })

    // Transform to include translation data at root level
    const result = announcements.map(announcement => {
      const translation = announcement.translations[0]
      return {
        ...announcement,
        title: translation?.title || '',
        excerpt: translation?.excerpt || '',
        content: translation?.content || '',
        translations: undefined // Remove translations from response
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
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/announcements - Create new announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      date,
      image,
      isDark,
      published,
      practiceAreaSlug,
      category,
      translations = [],
      lawyerId: lawyerIdRaw,
    } = body

    const lawyerId =
      lawyerIdRaw != null && String(lawyerIdRaw).trim() !== ''
        ? String(lawyerIdRaw).trim()
        : null
    if (lawyerId) {
      const lawyer = await prisma.lawyer.findUnique({ where: { id: lawyerId } })
      if (!lawyer) {
        return NextResponse.json({ error: 'Seçilen avukat bulunamadı' }, { status: 400 })
      }
    }

    if (!practiceAreaSlug || !isValidAnnouncementPracticeAreaSlug(practiceAreaSlug)) {
      return NextResponse.json(
        { error: 'Geçerli bir çalışma alanı (practiceAreaSlug) seçilmelidir' },
        { status: 400 }
      )
    }

    // Generate unique slug from first translation or fallback
    const firstTranslation = translations.find(t => t.title && t.title.trim())
    const slug = firstTranslation ? generateUniqueSlug(firstTranslation.title, firstTranslation.language) : generateUniqueSlug('announcement', 'TR')

    const announcement = await prisma.announcement.create({
      data: {
        slug,
        date: new Date(date),
        year: new Date(date).getFullYear(),
        image,
        isDark: isDark || false,
        published: published || false,
        practiceAreaSlug,
        ...(lawyerId ? { lawyerId } : {}),
        ...(category != null && category !== '' ? { category } : {}),
        translations: {
          create: translations
            .filter((translation: any) => translation.title && translation.title.trim())
            .map((translation: any) => ({
              language: translation.language,
              title: translation.title,
              excerpt: translation.excerpt || '',
              content: translation.content || ''
            }))
        }
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
