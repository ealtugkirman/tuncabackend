import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

// GET /api/career - Get all career applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const positionType = searchParams.get('positionType')
    const search = searchParams.get('search')

    let whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (positionType) {
      whereClause.positionType = positionType
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { education: { contains: search, mode: 'insensitive' } },
        { experience: { contains: search, mode: 'insensitive' } }
      ]
    }

    const applications = await prisma.careerApplication.findMany({
      where: whereClause,
      orderBy: { appliedAt: 'desc' }
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching career applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch career applications' },
      { status: 500 }
    )
  }
}

// POST /api/career - Create new career application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      positionType,
      fullName,
      email,
      phone,
      cv,
      coverLetter,
      education,
      experience,
      languages
    } = body

    const application = await prisma.careerApplication.create({
      data: {
        positionType,
        fullName,
        email,
        phone,
        cv,
        coverLetter,
        education,
        experience,
        languages: languages || []
      }
    })

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to applicant

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating career application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
