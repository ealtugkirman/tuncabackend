import { prisma } from '@/lib/prisma'
import { RichTextRenderer } from '@/components/ui/rich-text-renderer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, User, Tag } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Language } from '@prisma/client'

interface AnnouncementPageProps {
  params: {
    slug: string
  }
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const announcement = await prisma.announcement.findFirst({
    where: {
      slug: params.slug,
      published: true
    },
    include: {
      translations: true
    }
  })

  if (!announcement) {
    notFound()
  }

  // Get Turkish translation first, fallback to English
  const trTranslation = announcement.translations.find(t => t.language === Language.TR)
  const enTranslation = announcement.translations.find(t => t.language === Language.EN)
  const translation = trTranslation || enTranslation

  // If no translation exists, show not found
  if (!translation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              <Tag className="w-3 h-3 mr-1" />
              {announcement.category}
            </Badge>
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1" />
              {announcement.date.toLocaleDateString('tr-TR')}
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {translation.title}
          </h1>
          
          <p className="text-lg text-muted-foreground">
            {translation.excerpt}
          </p>
        </div>

        {/* Featured Image */}
        {announcement.image && (
          <div className="mb-8">
            <img
              src={announcement.image}
              alt={translation.title}
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            <RichTextRenderer content={translation.content} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Yayın Tarihi: {announcement.date.toLocaleDateString('tr-TR')}</span>
              <span>Kategori: {announcement.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
