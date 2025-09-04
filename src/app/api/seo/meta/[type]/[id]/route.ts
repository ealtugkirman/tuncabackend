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
  { params }: { params: { type: string; id: string } }
) {
  try {
    let seoData

    switch (params.type) {
      case 'homepage':
        seoData = await generateHomepageSEO()
        break
      case 'lawyer':
        seoData = await generateLawyerSEO(params.id)
        break
      case 'announcement':
        seoData = await generateAnnouncementSEO(params.id)
        break
      case 'event':
        seoData = await generateEventSEO(params.id)
        break
      case 'publication':
        seoData = await generatePublicationSEO(params.id)
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
