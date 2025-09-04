import { NextResponse } from 'next/server'
import { generateHomepageSEO } from '@/lib/seo'

export async function GET() {
  try {
    const seoData = await generateHomepageSEO()
    return NextResponse.json(seoData)
  } catch (error) {
    console.error('Error generating homepage SEO:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEO data' },
      { status: 500 }
    )
  }
}
