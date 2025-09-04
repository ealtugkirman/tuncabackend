import { NextResponse } from 'next/server'
import { baseSEO } from '@/lib/seo'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseSEO.siteUrl}/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /_next/
Disallow: /test-upload/

# Allow important pages
Allow: /lawyers/
Allow: /announcements/
Allow: /events/
Allow: /publications/
Allow: /announcement/
Allow: /event/
Allow: /lawyer/
Allow: /publication/

# Crawl delay (optional)
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
