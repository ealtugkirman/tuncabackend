import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { DEFAULT_LANGUAGE, generateSlug } from '@/lib/i18n'
import { Language } from '@prisma/client'

// GET /api/publications/[id] - Get single publication
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('language') as Language) || DEFAULT_LANGUAGE

    const publication = await prisma.publication.findUnique({
      where: { id: params.id },
      include: {
        translations: {
          where: { language }
        },
        lawyer: {
          select: {
            id: true,
            name: true,
            title: true,
            image: true
          }
        }
      }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    // Transform to include translation data at root level
    const translation = publication.translations[0]
    const result = {
      ...publication,
      title: translation?.title || '',
      excerpt: translation?.excerpt || '',
      content: translation?.content || '',
      translations: undefined // Remove translations from response
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching publication:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publication' },
      { status: 500 }
    )
  }
}

// PUT /api/publications/[id] - Update publication (admin only)
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
      practiceArea,
      category,
      author,
      tags,
      published,
      lawyerId,
      language = DEFAULT_LANGUAGE,
      translations = []
    } = body

    // Update or create translations
    const publication = await prisma.publication.update({
      where: { id: params.id },
      data: {
        date,
        year,
        practiceArea,
        category,
        author,
        tags: tags || [],
        published: published || false,
        lawyerId,
        translations: {
          upsert: [
            // Main translation
            {
              where: {
                publicationId_language: {
                  publicationId: params.id,
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
                publicationId_language: {
                  publicationId: params.id,
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

    return NextResponse.json(publication)
  } catch (error) {
    console.error('Error updating publication:', error)
    return NextResponse.json(
      { error: 'Failed to update publication' },
      { status: 500 }
    )
  }
}

// DELETE /api/publications/[id] - Delete publication (admin only)
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

    await prisma.publication.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Publication deleted successfully' })
  } catch (error) {
    console.error('Error deleting publication:', error)
    return NextResponse.json(
      { error: 'Failed to delete publication' },
      { status: 500 }
    )
  }
}
