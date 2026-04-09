import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, parseLanguageParam } from '@/lib/i18n'
import { Language } from '@prisma/client'

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const language = parseLanguageParam(searchParams.get('language'))
    const allTranslations = searchParams.get('allTranslations') === '1'

    if (allTranslations) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          translations: true,
        },
      })

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      const { translations, ...rest } = event
      return NextResponse.json({
        ...rest,
        date: event.date.toISOString().slice(0, 10),
        translations: translations.map((t) => ({
          language: t.language,
          title: t.title,
          excerpt: t.excerpt,
          content: t.content,
        })),
      })
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const translation = event.translations[0]
    const result = {
      ...event,
      title: translation?.title || '',
      excerpt: translation?.excerpt || '',
      content: translation?.content || '',
      translations: undefined,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      date,
      excerpt,
      content,
      image,
      gallery,
      eventType,
      published,
      language = DEFAULT_LANGUAGE,
      translations = [],
    } = body

    const additional = (translations as { language: Language; title: string; excerpt: string; content: string }[]).filter(
      (t) => t.language !== language
    )

    const event = await prisma.event.update({
      where: { id },
      data: {
        date: new Date(date),
        image,
        gallery: gallery || [],
        eventType,
        published: published ?? false,
        translations: {
          upsert: [
            {
              where: {
                eventId_language: {
                  eventId: id,
                  language,
                },
              },
              update: {
                title,
                excerpt,
                content,
              },
              create: {
                language,
                title,
                excerpt,
                content,
              },
            },
            ...additional.map((translation) => ({
              where: {
                eventId_language: {
                  eventId: id,
                  language: translation.language,
                },
              },
              update: {
                title: translation.title,
                excerpt: translation.excerpt,
                content: translation.content,
              },
              create: {
                language: translation.language,
                title: translation.title,
                excerpt: translation.excerpt,
                content: translation.content,
              },
            })),
          ],
        },
      },
      include: {
        translations: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
