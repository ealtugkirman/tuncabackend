import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { detectLanguage, DEFAULT_LANGUAGE, generateSlug } from '@/lib/i18n'
import { Language } from '@prisma/client'

// GET /api/lawyers - Get all lawyers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // partners, interns, all
    const practiceArea = searchParams.get('practiceArea')
    const language = (searchParams.get('language') as Language) || DEFAULT_LANGUAGE
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 1000 // Default to 1000 if no limit specified
    const skip = (page - 1) * limit
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'order'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    
    // Search parameter
    const search = searchParams.get('search')
    
    // Filter parameters
    const isFounder = searchParams.get('isFounder')
    const isPartner = searchParams.get('isPartner')

    let whereClause: any = {}

    if (type === 'partners') {
      whereClause.isPartner = true
    } else if (type === 'interns') {
      whereClause.isIntern = true
    }

    if (practiceArea) {
      whereClause.practiceAreas = {
        has: practiceArea
      }
    }

    if (isFounder !== null && isFounder !== '') {
      whereClause.isFounder = isFounder === 'true'
    }

    if (isPartner !== null && isPartner !== '') {
      whereClause.isPartner = isPartner === 'true'
    }

    // Search in translations
    if (search) {
      whereClause.translations = {
        some: {
          language,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
            { education: { contains: search, mode: 'insensitive' } },
            { languages: { contains: search, mode: 'insensitive' } },
            { bar: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    if (sortBy === 'name') {
      orderBy = { translations: { _count: 'desc' } }
    } else if (sortBy === 'isFounder') {
      orderBy = { isFounder: sortOrder }
    } else if (sortBy === 'isPartner') {
      orderBy = { isPartner: sortOrder }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    const [lawyers, totalCount] = await Promise.all([
      prisma.lawyer.findMany({
        where: whereClause,
        include: {
          translations: true
        },
        orderBy: search ? [{ createdAt: sortOrder }] : [orderBy],
        skip,
        take: limit
      }),
      prisma.lawyer.count({ where: whereClause })
    ])

    // Transform to include translation data at root level
    const result = lawyers.map(lawyer => {
      const translation = lawyer.translations[0]
      return {
        ...lawyer,
        name: translation?.name || '',
        bio: translation?.bio || '',
        education: translation?.education || '',
        languages: translation?.languages || '',
        practiceAreas: translation?.practiceAreas || [],
        bar: translation?.bar || '',
        phone: translation?.phone || '',
        email: translation?.email || '',
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
    console.error('Error fetching lawyers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lawyers' },
      { status: 500 }
    )
  }
}

// POST /api/lawyers - Create new lawyer (admin only)
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
      image,
      imagePublicId,
      isPartner,
      isFounder,
      isIntern,
      language = DEFAULT_LANGUAGE,
      translations = []
    } = body

    // Get name from first translation for slug generation
    const firstTranslation = translations.find((t: any) => t.name)
    const name = firstTranslation?.name || 'lawyer'
    const slug = generateSlug(name, language)

    const lawyer = await prisma.lawyer.create({
      data: {
        slug,
        image,
        imagePublicId,
        isPartner: isPartner || false,
        isFounder: isFounder || false,
        isIntern: isIntern || false,
        translations: {
          create: translations.map((translation: any) => ({
            language: translation.language,
            name: translation.name,
            bio: translation.bio,
            education: translation.education,
            languages: translation.languages,
            practiceAreas: translation.practiceAreas,
            bar: translation.bar,
            phone: translation.phone,
            email: translation.email
          }))
        }
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json(lawyer, { status: 201 })
  } catch (error) {
    console.error('Error creating lawyer:', error)
    return NextResponse.json(
      { error: 'Failed to create lawyer' },
      { status: 500 }
    )
  }
}
