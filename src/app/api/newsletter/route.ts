import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

// GET /api/newsletter - Get all newsletter subscribers (admin only)
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
    const subscribed = searchParams.get('subscribed')
    const source = searchParams.get('source')

    let whereClause: any = {}

    if (subscribed !== null) {
      whereClause.subscribed = subscribed === 'true'
    }

    if (source) {
      whereClause.source = source
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: whereClause,
      orderBy: { subscribedAt: 'desc' }
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'website' } = body

    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 400 }
        )
      } else {
        // Re-subscribe
        const subscriber = await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            subscribed: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            source,
            ipAddress: ip,
            userAgent
          }
        })
        return NextResponse.json(subscriber, { status: 200 })
      }
    }

    // Create new subscription
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        subscribed: true,
        source,
        ipAddress: ip,
        userAgent
      }
    })

    // TODO: Send welcome email
    // TODO: Send notification to admin

    return NextResponse.json(subscriber, { status: 201 })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
