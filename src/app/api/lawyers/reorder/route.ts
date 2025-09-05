import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

// PUT /api/lawyers/reorder - Update lawyer order
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/lawyers/reorder called')
    
    const user = await getCurrentUser()
    console.log('👤 User:', user?.email, user?.role)
    
    if (!user) {
      console.log('❌ No user found - authentication failed')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      console.log('❌ Insufficient permissions:', user.role)
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('📥 Request body:', body)
    
    const { lawyers } = body

    if (!Array.isArray(lawyers)) {
      console.log('❌ Lawyers is not an array:', lawyers)
      return NextResponse.json(
        { error: 'Lawyers must be an array' },
        { status: 400 }
      )
    }

    // Validate that all lawyers have id and order
    for (const lawyer of lawyers) {
      if (!lawyer.id || typeof lawyer.order !== 'number') {
        console.log('❌ Invalid lawyer data:', lawyer)
        return NextResponse.json(
          { error: 'Each lawyer must have id and order' },
          { status: 400 }
        )
      }
    }

    // Update all lawyers in a transaction
    console.log('🔄 Updating lawyers in database...')
    const updatePromises = lawyers.map((lawyer) => {
      console.log(`📝 Updating lawyer ${lawyer.id} to order ${lawyer.order}`)
      return prisma.lawyer.update({
        where: { id: lawyer.id },
        data: { order: lawyer.order }
      })
    })

    const results = await prisma.$transaction(updatePromises)
    console.log('✅ Database update completed:', results)

    // Return updated lawyers
    const updatedLawyers = await prisma.lawyer.findMany({
      orderBy: { order: 'asc' },
      include: {
        translations: true
      }
    })

    console.log('📤 Returning updated lawyers:', updatedLawyers.length)

    return NextResponse.json({
      success: true,
      message: 'Lawyer order updated successfully',
      lawyers: updatedLawyers
    })

  } catch (error) {
    console.error('❌ Error updating lawyer order:', error)
    return NextResponse.json(
      { error: 'Failed to update lawyer order' },
      { status: 500 }
    )
  }
}
