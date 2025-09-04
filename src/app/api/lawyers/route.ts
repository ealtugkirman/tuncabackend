import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

// GET /api/lawyers - Get all lawyers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // partners, interns, all
    const practiceArea = searchParams.get('practiceArea')

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

    const lawyers = await prisma.lawyer.findMany({
      where: whereClause,
      orderBy: [
        { isFounder: 'desc' },
        { isPartner: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(lawyers)
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
      name,
      title,
      education,
      bar,
      languages,
      practiceAreas,
      image,
      imagePublicId,
      isPartner,
      isFounder,
      isIntern,
      hasPhD,
      certifications,
      bio
    } = body

    const lawyer = await prisma.lawyer.create({
      data: {
        name,
        title,
        education: education || [],
        bar,
        languages: languages || [],
        practiceAreas: practiceAreas || [],
        image,
        imagePublicId,
        isPartner: isPartner || false,
        isFounder: isFounder || false,
        isIntern: isIntern || false,
        hasPhD: hasPhD || false,
        certifications: certifications || [],
        bio
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
