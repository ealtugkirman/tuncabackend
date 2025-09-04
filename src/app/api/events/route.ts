import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { detectLanguage, DEFAULT_LANGUAGE, generateSlug, generateUniqueSlug } from '@/lib/i18n'
import { Language } from '@prisma/client'

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // removed: year, category
    const eventType = searchParams.get('eventType')
    const search = searchParams.get('search')
    const published = searchParams.get('published')
    const language = (searchParams.get('language') as Language) || DEFAULT_LANGUAGE
    
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

    // removed: year, category filters

    if (eventType) {
      whereClause.eventType = eventType
    }

    if (published !== null) {
      whereClause.published = published === 'true'
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
    const totalCount = await prisma.event.count({
      where: whereClause
    })

    // Get events with pagination
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        translations: {
          where: { language }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    })

    // Transform to include translation data at root level
    const result = events.map(event => {
      const translation = event.translations[0]
      return {
        ...event,
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
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create new event (admin only)
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
      gallery,
      eventType,
      published,
      language = DEFAULT_LANGUAGE,
      translations = []
    } = body

    // Generate slug from first translation or fallback
    const firstTranslation = translations[0]
    const slug = firstTranslation ? generateUniqueSlug(firstTranslation.title, firstTranslation.language) : generateUniqueSlug('event', language)

    const event = await prisma.event.create({
      data: {
        slug,
        date: new Date(date),
        image,
        gallery: gallery || [],
        eventType,
        published: published || false,
        translations: {
          create: translations.map((translation: any) => ({
            language: translation.language,
            title: translation.title,
            excerpt: translation.excerpt,
            content: translation.content
          }))
        }
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
