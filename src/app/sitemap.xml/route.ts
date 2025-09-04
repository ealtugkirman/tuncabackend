import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { baseSEO } from '@/lib/seo'

export async function GET() {
  try {
    const siteUrl = baseSEO.siteUrl

    // Get all published content
    const [lawyers, announcements, events, publications] = await Promise.all([
      prisma.lawyer.findMany({
        select: { id: true, updatedAt: true }
      }),
      prisma.announcement.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true }
      }),
      prisma.event.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true }
      }),
      prisma.publication.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true }
      })
    ])

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>${siteUrl}/avukatlar</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/duyurular</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/etkinlikler</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/yayinlar</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/iletisim</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/kariyer</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Lawyers -->
  ${lawyers.map(lawyer => `
  <url>
    <loc>${siteUrl}/avukatlar/${lawyer.id}</loc>
    <lastmod>${lawyer.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}

  <!-- Announcements -->
  ${announcements.map(announcement => `
  <url>
    <loc>${siteUrl}/duyurular/${announcement.id}</loc>
    <lastmod>${announcement.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}

  <!-- Events -->
  ${events.map(event => `
  <url>
    <loc>${siteUrl}/etkinlikler/${event.id}</loc>
    <lastmod>${event.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}

  <!-- Publications -->
  ${publications.map(publication => `
  <url>
    <loc>${siteUrl}/yayinlar/${publication.id}</loc>
    <lastmod>${publication.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
