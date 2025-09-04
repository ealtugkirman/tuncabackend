import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { RichTextRenderer } from '@/components/ui/rich-text-renderer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Tag, ArrowRight } from 'lucide-react'
import { Language } from '@prisma/client'

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: {
      published: true
    },
    include: {
      translations: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Duyurular
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hukuk büromuzdan güncel duyurular, mevzuat değişiklikleri ve önemli gelişmeler
          </p>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement) => {
            // Get Turkish translation first, fallback to English
            const trTranslation = announcement.translations.find(t => t.language === Language.TR)
            const enTranslation = announcement.translations.find(t => t.language === Language.EN)
            const translation = trTranslation || enTranslation

            // Only render if there's at least one translation
            if (!translation) return null

            return (
              <Card key={announcement.id} className="h-full flex flex-col">
                {/* Featured Image */}
                {announcement.image && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={announcement.image}
                      alt={translation.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {announcement.category}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {announcement.date.toLocaleDateString('tr-TR')}
                    </Badge>
                  </div>
                  
                  <CardTitle className="line-clamp-2">
                    {translation.title}
                  </CardTitle>
                  
                  <CardDescription className="line-clamp-3">
                    {translation.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Content Preview */}
                  <div className="flex-1 mb-4">
                    <div className="prose prose-sm max-w-none line-clamp-4">
                      <RichTextRenderer 
                        content={translation.content.substring(0, 200) + '...'} 
                      />
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/announcement/${announcement.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
                  >
                    Devamını Oku
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {announcements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Henüz duyuru yok</h3>
              <p>Yakında güncel duyurular burada görünecek.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
