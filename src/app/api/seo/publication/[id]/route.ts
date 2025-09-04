import { NextRequest, NextResponse } from 'next/server'
import { generatePublicationSEO } from '@/lib/seo'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const seoData = await generatePublicationSEO(params.id)
    return NextResponse.json(seoData)
  } catch (error) {
    console.error('Error generating publication SEO:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEO data' },
      { status: 500 }
    )
  }
}
