import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, parseLanguageParam } from '@/lib/i18n'
import { Language } from '@prisma/client'
import { sanitizePublicationPracticeAreaSlugs } from '@/lib/announcement-practice-areas'

// GET /api/publications/[id] - Get single publication
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
      const publication = await prisma.publication.findUnique({
        where: { id },
        include: {
          translations: true,
          lawyers: { select: { id: true } },
        },
      })

      if (!publication) {
        return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
      }

      const { translations, lawyers, ...rest } = publication
      return NextResponse.json({
        ...rest,
        date: publication.date.toISOString().slice(0, 10),
        year: String(publication.year),
        tags: publication.tags?.length ? publication.tags.join(', ') : '',
        translations: translations.map((t) => ({
          language: t.language,
          title: t.title,
          excerpt: t.excerpt,
          content: t.content,
        })),
        lawyerIds: lawyers.map((l) => l.id),
        practiceAreaSlugs: publication.practiceAreaSlugs ?? [],
      })
    }

    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
        lawyers: {
          select: {
            id: true,
            image: true,
            translations: { where: { language } },
          },
        },
      },
    })

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    const translation = publication.translations[0]
    const firstLawyer = publication.lawyers[0]
    const lawyerName = firstLawyer?.translations[0]?.name

    const result = {
      ...publication,
      title: translation?.title || '',
      excerpt: translation?.excerpt || '',
      content: translation?.content || '',
      lawyer: firstLawyer
        ? {
            id: firstLawyer.id,
            name: lawyerName,
            image: firstLawyer.image,
          }
        : null,
      translations: undefined,
      lawyers: undefined,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching publication:', error)
    return NextResponse.json({ error: 'Failed to fetch publication' }, { status: 500 })
  }
}

// PUT /api/publications/[id] - Update publication (admin only)
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
      year,
      excerpt,
      content,
      tags,
      published,
      language = DEFAULT_LANGUAGE,
      translations = [],
      image,
      imagePublicId,
      lawyerIds = [],
      practiceAreaSlugs: rawPracticeAreaSlugs,
    } = body

    const tagsArray = Array.isArray(tags)
      ? tags
      : tags
        ? String(tags)
            .split(',')
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : []

    const additional = (translations as { language: Language; title: string; excerpt: string; content: string }[]).filter(
      (t) => t.language !== language
    )

    const practiceAreaSlugs =
      rawPracticeAreaSlugs !== undefined
        ? sanitizePublicationPracticeAreaSlugs(rawPracticeAreaSlugs)
        : undefined

    const publication = await prisma.publication.update({
      where: { id },
      data: {
        date: new Date(date),
        year: typeof year === 'string' ? parseInt(year, 10) : year,
        tags: tagsArray,
        published: published ?? false,
        image: image ?? null,
        imagePublicId: imagePublicId ?? null,
        ...(practiceAreaSlugs !== undefined ? { practiceAreaSlugs } : {}),
        lawyers: {
          set: (lawyerIds as string[]).filter(Boolean).map((lid) => ({ id: lid })),
        },
        translations: {
          upsert: [
            {
              where: {
                publicationId_language: {
                  publicationId: id,
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
                publicationId_language: {
                  publicationId: id,
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

    return NextResponse.json(publication)
  } catch (error) {
    console.error('Error updating publication:', error)
    return NextResponse.json({ error: 'Failed to update publication' }, { status: 500 })
  }
}

// DELETE /api/publications/[id] - Delete publication (admin only)
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

    await prisma.publication.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Publication deleted successfully' })
  } catch (error) {
    console.error('Error deleting publication:', error)
    return NextResponse.json({ error: 'Failed to delete publication' }, { status: 500 })
  }
}
