import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

// GET /api/publications/[id] - Get single publication
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publication = await prisma.publication.findUnique({
      where: { id: params.id },
      include: {
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

    return NextResponse.json(publication)
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
      lawyerId
    } = body

    const publication = await prisma.publication.update({
      where: { id: params.id },
      data: {
        title,
        date,
        year,
        excerpt,
        content,
        practiceArea,
        category,
        author,
        tags: tags || [],
        published: published || false,
        lawyerId
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
