import { NextRequest, NextResponse } from 'next/server'
import { generateEventSEO } from '@/lib/seo'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const seoData = await generateEventSEO(id)
    return NextResponse.json(seoData)
  } catch (error) {
    console.error('Error generating event SEO:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEO data' },
      { status: 500 }
    )
  }
}
