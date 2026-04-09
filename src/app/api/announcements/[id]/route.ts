import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, generateSlug, parseLanguageParam } from '@/lib/i18n'
import { Language } from '@prisma/client'
import { isValidAnnouncementPracticeAreaSlug } from '@/lib/announcement-practice-areas'
import { lawyerRoleLabelTr } from '@/lib/lawyer-position'

// GET /api/announcements/[id] - Get single announcement
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
      const announcement = await prisma.announcement.findUnique({
        where: { id },
        include: {
          translations: true,
        },
      })

      if (!announcement) {
        return NextResponse.json(
          { error: 'Announcement not found' },
          { status: 404 }
        )
      }

      const { translations, ...rest } = announcement
      return NextResponse.json({
        ...rest,
        date: announcement.date.toISOString().slice(0, 10),
        year: String(announcement.year),
        translations: translations.map((t) => ({
          language: t.language,
          title: t.title,
          excerpt: t.excerpt,
          content: t.content,
        })),
      })
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
        lawyer: {
          include: {
            translations: {
              where: { language },
            },
          },
        },
      },
    })

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    // Transform to include translation data at root level
    const translation = announcement.translations[0]
    const lw = announcement.lawyer
    const lawyerTranslation = lw?.translations[0]
    const contactLawyer =
      lw && lawyerTranslation
        ? {
            id: lw.id,
            slug: lw.slug,
            image: lw.image,
            name: lawyerTranslation.name,
            email: lawyerTranslation.email,
            positionLabel: lawyerRoleLabelTr(lw),
          }
        : lw
          ? {
              id: lw.id,
              slug: lw.slug,
              image: lw.image,
              name: '',
              email: '',
              positionLabel: lawyerRoleLabelTr(lw),
            }
          : null

    const { lawyer, ...rest } = announcement
    const result = {
      ...rest,
      title: translation?.title || '',
      excerpt: translation?.excerpt || '',
      content: translation?.content || '',
      translations: undefined,
      lawyerId: announcement.lawyerId,
      contactLawyer,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      isDark,
      published,
      language = DEFAULT_LANGUAGE,
      translations = [],
      practiceAreaSlug,
      category,
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

    if (
      practiceAreaSlug != null &&
      practiceAreaSlug !== '' &&
      !isValidAnnouncementPracticeAreaSlug(practiceAreaSlug)
    ) {
      return NextResponse.json({ error: 'Invalid practiceAreaSlug' }, { status: 400 })
    }

    // Update or create translations
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(date != null && date !== '' ? { date: new Date(date), year: new Date(date).getFullYear() } : {}),
        ...(year != null && year !== '' && (date == null || date === '')
          ? { year: typeof year === 'number' ? year : parseInt(String(year), 10) }
          : {}),
        image,
        isDark: isDark || false,
        published: published || false,
        ...(practiceAreaSlug && isValidAnnouncementPracticeAreaSlug(practiceAreaSlug)
          ? { practiceAreaSlug }
          : {}),
        ...(category !== undefined ? { category: category === '' ? null : category } : {}),
        ...(lawyerIdRaw !== undefined ? { lawyerId } : {}),
        translations: {
          upsert: [
            // Main translation
            {
              where: {
                announcementId_language: {
                  announcementId: id,
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
                  announcementId: id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.announcement.delete({
      where: { id }
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
