import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

// GET /api/publications - Get all publications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const practiceArea = searchParams.get('practiceArea')
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const published = searchParams.get('published')

    let whereClause: any = {}

    if (year) {
      whereClause.year = year
    }

    if (practiceArea) {
      whereClause.practiceArea = practiceArea
    }

    if (category) {
      whereClause.category = category
    }

    if (author) {
      whereClause.author = { contains: author, mode: 'insensitive' }
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    if (published !== null) {
      whereClause.published = published === 'true'
    }

    const publications = await prisma.publication.findMany({
      where: whereClause,
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            title: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(publications)
  } catch (error) {
    console.error('Error fetching publications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  }
}

// POST /api/publications - Create new publication (admin only)
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

    const publication = await prisma.publication.create({
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

    return NextResponse.json(publication, { status: 201 })
  } catch (error) {
    console.error('Error creating publication:', error)
    return NextResponse.json(
      { error: 'Failed to create publication' },
      { status: 500 }
    )
  }
}
