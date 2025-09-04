import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, generateSlug } from '@/lib/i18n'
import { Language } from '@prisma/client'

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('language') as Language) || DEFAULT_LANGUAGE

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        translations: {
          where: { language }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Transform to include translation data at root level
    const translation = event.translations[0]
    const result = {
      ...event,
      title: translation?.title || '',
      excerpt: translation?.excerpt || '',
      content: translation?.content || '',
      translations: undefined // Remove translations from response
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Update event (admin only)
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
      gallery,
      eventType,
      category,
      location,
      published,
      language = DEFAULT_LANGUAGE,
      translations = []
    } = body

    // Update or create translations
    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        date,
        year,
        image,
        gallery: gallery || [],
        eventType,
        category,
        location,
        published: published || false,
        translations: {
          upsert: [
            // Main translation
            {
              where: {
                eventId_language: {
                  eventId: params.id,
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
                eventId_language: {
                  eventId: params.id,
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

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
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

    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
