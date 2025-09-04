import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    if (!subscriber.subscribed) {
      return NextResponse.json(
        { error: 'Email already unsubscribed' },
        { status: 400 }
      )
    }

    const updatedSubscriber = await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        subscribed: false,
        unsubscribedAt: new Date()
      }
    })

    // TODO: Send confirmation email

    return NextResponse.json({ message: 'Successfully unsubscribed' })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
