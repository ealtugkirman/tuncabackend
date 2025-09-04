import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, generateSlug } from '@/lib/i18n'
import { Language } from '@prisma/client'

// GET /api/lawyers/[id] - Get single lawyer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('language') as Language) || DEFAULT_LANGUAGE

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: params.id },
      include: {
        translations: {
          where: { language }
        },
        publications: {
          where: { published: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    // Transform to include translation data at root level
    const translation = lawyer.translations[0]
    const result = {
      ...lawyer,
      name: translation?.name || '',
      title: translation?.title || '',
      bio: translation?.bio || '',
      translations: undefined // Remove translations from response
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching lawyer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lawyer' },
      { status: 500 }
    )
  }
}

// PUT /api/lawyers/[id] - Update lawyer (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isPartner,
      isFounder,
      isIntern,
      hasPhD,
      certifications,
      bio
    } = body

    const lawyer = await prisma.lawyer.update({
      where: { id: params.id },
      data: {
        name,
        title,
        education: education || [],
        bar,
        languages: languages || [],
        practiceAreas: practiceAreas || [],
        image,
        isPartner: isPartner || false,
        isFounder: isFounder || false,
        isIntern: isIntern || false,
        hasPhD: hasPhD || false,
        certifications: certifications || [],
        bio
      }
    })

    return NextResponse.json(lawyer)
  } catch (error) {
    console.error('Error updating lawyer:', error)
    return NextResponse.json(
      { error: 'Failed to update lawyer' },
      { status: 500 }
    )
  }
}

// DELETE /api/lawyers/[id] - Delete lawyer (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.lawyer.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Lawyer deleted successfully' })
  } catch (error) {
    console.error('Error deleting lawyer:', error)
    return NextResponse.json(
      { error: 'Failed to delete lawyer' },
      { status: 500 }
    )
  }
}
