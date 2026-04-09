import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { RichTextRenderer } from '@/components/ui/rich-text-renderer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ArrowRight } from 'lucide-react'
import { Language } from '@prisma/client'
import {
  ANNOUNCEMENT_PRACTICE_AREAS,
  getAnnouncementPracticeAreaLabel,
  isValidAnnouncementPracticeAreaSlug,
} from '@/lib/announcement-practice-areas'

type SearchParams = { alan?: string; practiceArea?: string }

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const areaFilter = sp.practiceArea ?? sp.alan

  const where = {
    published: true as const,
    ...(areaFilter && isValidAnnouncementPracticeAreaSlug(areaFilter)
      ? { practiceAreaSlug: areaFilter }
      : {}),
  }

  const announcements = await prisma.announcement.findMany({
    where,
    include: {
      translations: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Duyurular</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Hukuk büromuzdan güncel duyurular, mevzuat değişiklikleri ve önemli gelişmeler
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/announcements"
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              !areaFilter ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
            }`}
          >
            Tümü
          </Link>
          {ANNOUNCEMENT_PRACTICE_AREAS.map((a) => (
            <Link
              key={a.slug}
              href={`/announcements?alan=${encodeURIComponent(a.slug)}`}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                areaFilter === a.slug
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {a.tr}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => {
            const trTranslation = announcement.translations.find((t) => t.language === Language.TR)
            const enTranslation = announcement.translations.find((t) => t.language === Language.EN)
            const translation = trTranslation || enTranslation

            if (!translation) return null

            const areaLabel =
              announcement.practiceAreaSlug &&
              isValidAnnouncementPracticeAreaSlug(announcement.practiceAreaSlug)
                ? getAnnouncementPracticeAreaLabel(announcement.practiceAreaSlug, 'tr')
                : null

            return (
              <Card key={announcement.id} className="flex h-full flex-col">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  {announcement.image ? (
                    <Image
                      src={announcement.image}
                      alt={translation.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Calendar className="mb-2 h-10 w-10 opacity-50" />
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      <Calendar className="mr-1 h-3 w-3" />
                      {announcement.date.toLocaleDateString('tr-TR')}
                    </Badge>
                    {areaLabel && (
                      <Link
                        href={`/announcements?alan=${encodeURIComponent(announcement.practiceAreaSlug)}`}
                        className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                      >
                        {areaLabel}
                      </Link>
                    )}
                    {announcement.isDark && (
                      <Badge variant="outline">Koyu tema</Badge>
                    )}
                  </div>

                  <CardTitle className="line-clamp-2">{translation.title}</CardTitle>

                  <CardDescription className="line-clamp-3">{translation.excerpt}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col">
                  <div className="mb-4 flex-1">
                    <div className="prose prose-sm line-clamp-4 max-w-none">
                      <RichTextRenderer
                        content={translation.content.substring(0, 200) + '...'}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/announcement/${announcement.slug}`}
                    className="group inline-flex items-center font-medium text-primary hover:text-primary/80"
                  >
                    Devamını Oku
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {announcements.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">Henüz duyuru yok</h3>
              <p>Bu kriterlere uygun duyuru bulunmuyor.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
