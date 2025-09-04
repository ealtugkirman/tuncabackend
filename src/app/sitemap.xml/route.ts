import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { baseSEO } from '@/lib/seo'

export async function GET() {
  try {
    const siteUrl = baseSEO.siteUrl

    // Get all published content with slugs
    const [lawyers, announcements, events, publications] = await Promise.all([
      prisma.lawyer.findMany({
        select: { id: true, slug: true, updatedAt: true }
      }),
      prisma.announcement.findMany({
        where: { published: true },
        select: { id: true, slug: true, updatedAt: true }
      }),
      prisma.event.findMany({
        where: { published: true },
        select: { id: true, slug: true, updatedAt: true }
      }),
      prisma.publication.findMany({
        where: { published: true },
        select: { id: true, slug: true, updatedAt: true }
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
    <loc>${siteUrl}/lawyers</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/announcements</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/events</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${siteUrl}/publications</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  ${announcements.map(announcement => `
  <!-- Announcement: ${announcement.slug} -->
  <url>
    <loc>${siteUrl}/announcement/${announcement.slug}</loc>
    <lastmod>${announcement.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
  
  ${events.map(event => `
  <!-- Event: ${event.slug} -->
  <url>
    <loc>${siteUrl}/event/${event.slug}</loc>
    <lastmod>${event.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
  
  ${publications.map(publication => `
  <!-- Publication: ${publication.slug} -->
  <url>
    <loc>${siteUrl}/publication/${publication.slug}</loc>
    <lastmod>${publication.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
  
  ${lawyers.map(lawyer => `
  <!-- Lawyer: ${lawyer.slug} -->
  <url>
    <loc>${siteUrl}/lawyer/${lawyer.slug}</loc>
    <lastmod>${lawyer.updatedAt.toISOString()}</lastmod>
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