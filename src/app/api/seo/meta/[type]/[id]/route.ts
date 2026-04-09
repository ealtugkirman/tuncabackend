import { NextRequest, NextResponse } from 'next/server'
import { 
  generateHomepageSEO, 
  generateLawyerSEO, 
  generateAnnouncementSEO, 
  generateEventSEO, 
  generatePublicationSEO,
  generateMetaTags 
} from '@/lib/seo'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    let seoData

    switch (type) {
      case 'homepage':
        seoData = await generateHomepageSEO()
        break
      case 'lawyer':
        seoData = await generateLawyerSEO(id)
        break
      case 'announcement':
        seoData = await generateAnnouncementSEO(id)
        break
      case 'event':
        seoData = await generateEventSEO(id)
        break
      case 'publication':
        seoData = await generatePublicationSEO(id)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid SEO type' },
          { status: 400 }
        )
    }

    const metaTags = generateMetaTags(seoData)
    
    return new NextResponse(metaTags, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error generating meta tags:', error)
    return NextResponse.json(
      { error: 'Failed to generate meta tags' },
      { status: 500 }
    )
  }
}
