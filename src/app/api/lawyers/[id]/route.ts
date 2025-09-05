import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

// GET /api/lawyers/[id] - Get single lawyer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 GET /api/lawyers/[id] called:', params.id)
    
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

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: params.id },
      include: {
        translations: true
      }
    })

    if (!lawyer) {
      console.log('❌ Lawyer not found:', params.id)
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    console.log('✅ Lawyer found:', lawyer.id)
    return NextResponse.json({
      success: true,
      data: lawyer
    })

  } catch (error) {
    console.error('❌ Error fetching lawyer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lawyer' },
      { status: 500 }
    )
  }
}

// PUT /api/lawyers/[id] - Update lawyer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 PUT /api/lawyers/[id] called:', params.id)
    
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
    
    const {
      name,
      title,
      bio,
      email,
      phone,
      address,
      image,
      isPartner,
      isFounder,
      isIntern,
      isLawyer,
      translations
    } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if lawyer exists
    const existingLawyer = await prisma.lawyer.findUnique({
      where: { id: params.id }
    })

    if (!existingLawyer) {
      console.log('❌ Lawyer not found:', params.id)
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    // Update lawyer
    console.log('🔄 Updating lawyer in database...')
    const updatedLawyer = await prisma.lawyer.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        title: title?.trim() || '',
        bio: bio?.trim() || '',
        email: email?.trim() || '',
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        image: image || '',
        isPartner: Boolean(isPartner),
        isFounder: Boolean(isFounder),
        isIntern: Boolean(isIntern),
        isLawyer: Boolean(isLawyer)
      },
      include: {
        translations: true
      }
    })

    console.log('✅ Lawyer updated:', updatedLawyer.id)

    // Update translations if provided
    if (translations && Array.isArray(translations)) {
      console.log('🔄 Updating translations...')
      
      // Delete existing translations
      await prisma.lawyerTranslation.deleteMany({
        where: { lawyerId: params.id }
      })

      // Create new translations
      const translationData = translations
        .filter(t => t.name && t.name.trim() !== '')
        .map(t => ({
          lawyerId: params.id,
          language: t.language,
          name: t.name.trim(),
          title: t.title?.trim() || '',
          bio: t.bio?.trim() || ''
        }))

      if (translationData.length > 0) {
        await prisma.lawyerTranslation.createMany({
          data: translationData
        })
        console.log('✅ Translations updated:', translationData.length)
      }
    }

    // Fetch updated lawyer with translations
    const finalLawyer = await prisma.lawyer.findUnique({
      where: { id: params.id },
      include: {
        translations: true
      }
    })

    console.log('📤 Returning updated lawyer:', finalLawyer?.id)
    return NextResponse.json({
      success: true,
      message: 'Lawyer updated successfully',
      data: finalLawyer
    })

  } catch (error) {
    console.error('❌ Error updating lawyer:', error)
    return NextResponse.json(
      { error: 'Failed to update lawyer' },
      { status: 500 }
    )
  }
}

// DELETE /api/lawyers/[id] - Delete lawyer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 DELETE /api/lawyers/[id] called:', params.id)
    
    const user = await getCurrentUser()
    console.log('👤 User:', user?.email, user?.role)
    
    if (!user) {
      console.log('❌ No user found - authentication failed')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (user.role !== 'SUPERADMIN') {
      console.log('❌ Insufficient permissions:', user.role)
      return NextResponse.json(
        { error: 'Only super admin can delete lawyers' },
        { status: 403 }
      )
    }

    // Check if lawyer exists
    const existingLawyer = await prisma.lawyer.findUnique({
      where: { id: params.id }
    })

    if (!existingLawyer) {
      console.log('❌ Lawyer not found:', params.id)
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    // Delete lawyer (translations will be deleted automatically due to cascade)
    console.log('🔄 Deleting lawyer from database...')
    await prisma.lawyer.delete({
      where: { id: params.id }
    })

    console.log('✅ Lawyer deleted:', params.id)
    return NextResponse.json({
      success: true,
      message: 'Lawyer deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting lawyer:', error)
    return NextResponse.json(
      { error: 'Failed to delete lawyer' },
      { status: 500 }
    )
  }
}