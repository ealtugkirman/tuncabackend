import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, generateSlug } from '@/lib/i18n'
import { Language } from '@prisma/client'

// GET /api/announcements/[id] - Get single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('language') as Language) || DEFAULT_LANGUAGE

    const announcement = await prisma.announcement.findUnique({
      where: { id: params.id },
      include: {
        translations: {
          where: { language }
        }
      }
    })

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    // Transform to include translation data at root level
    const translation = announcement.translations[0]
    const result = {
      ...announcement,
      title: translation?.title || '',
      excerpt: translation?.excerpt || '',
      content: translation?.content || '',
      translations: undefined // Remove translations from response
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching announcement:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
      { status: 500 }
    )
  }
}

// PUT /api/announcements/[id] - Update announcement (admin only)
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
      title,
      date,
      year,
      excerpt,
      content,
      image,
      category,
      isDark,
      published,
      language = DEFAULT_LANGUAGE,
      translations = []
    } = body

    // Update or create translations
    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        date,
        year,
        image,
        category,
        isDark: isDark || false,
        published: published || false,
        translations: {
          upsert: [
            // Main translation
            {
              where: {
                announcementId_language: {
                  announcementId: params.id,
                  language
                }
              },
              update: {
                title,
                excerpt,
                content
              },
              create: {
                language,
                title,
                excerpt,
                content
              }
            },
            // Additional translations
            ...translations.map((translation: any) => ({
              where: {
                announcementId_language: {
                  announcementId: params.id,
                  language: translation.language
                }
              },
              update: {
                title: translation.title,
                excerpt: translation.excerpt,
                content: translation.content
              },
              create: {
                language: translation.language,
                title: translation.title,
                excerpt: translation.excerpt,
                content: translation.content
              }
            }))
          ]
        }
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

// DELETE /api/announcements/[id] - Delete announcement (admin only)
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

    await prisma.announcement.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
