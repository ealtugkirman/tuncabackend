import { prisma } from '@/lib/prisma'
import { RichTextRenderer } from '@/components/ui/rich-text-renderer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Mail, Tag } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Language } from '@prisma/client'
import Link from 'next/link'
import {
  getAnnouncementPracticeAreaLabel,
  isValidAnnouncementPracticeAreaSlug,
} from '@/lib/announcement-practice-areas'
import { lawyerRoleLabelTr } from '@/lib/lawyer-position'
import { lawyerPublicProfileHref } from '@/lib/lawyer-profile-url'

interface AnnouncementPageProps {
  params: Promise<{ slug: string }>
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { slug } = await params

  const announcement = await prisma.announcement.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      translations: true,
      lawyer: {
        include: {
          translations: true,
        },
      },
    },
  })

  if (!announcement) {
    notFound()
  }

  const trTranslation = announcement.translations.find((t) => t.language === Language.TR)
  const enTranslation = announcement.translations.find((t) => t.language === Language.EN)
  const translation = trTranslation || enTranslation

  if (!translation) {
    notFound()
  }

  const lawyerTranslation =
    announcement.lawyer?.translations.find((t) => t.language === translation.language) ??
    announcement.lawyer?.translations[0]

  const areaLabel =
    announcement.practiceAreaSlug &&
    isValidAnnouncementPracticeAreaSlug(announcement.practiceAreaSlug)
      ? getAnnouncementPracticeAreaLabel(announcement.practiceAreaSlug, 'tr')
      : null

  const profileHref = announcement.lawyer
    ? lawyerPublicProfileHref(announcement.lawyer.slug)
    : null
  const isExternalProfile = profileHref.startsWith('http')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {areaLabel && (
                  <Link
                    href={`/announcements?alan=${encodeURIComponent(announcement.practiceAreaSlug)}`}
                    className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {areaLabel}
                  </Link>
                )}
                <Badge variant="outline">
                  <Calendar className="mr-1 h-3 w-3" />
                  {announcement.date.toLocaleDateString('tr-TR')}
                </Badge>
              </div>

              <h1 className="mb-4 text-4xl font-bold text-foreground">{translation.title}</h1>

              <p className="text-lg text-muted-foreground">{translation.excerpt}</p>
            </div>

            {announcement.image && (
              <div className="mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={announcement.image}
                  alt={translation.title}
                  className="h-64 w-full rounded-lg object-cover shadow-lg"
                />
              </div>
            )}

            <Card>
              <CardContent className="p-8">
                <RichTextRenderer content={translation.content} />
              </CardContent>
            </Card>

            <div className="mt-8 border-t border-border pt-8 text-sm text-muted-foreground">
              Yayın tarihi: {announcement.date.toLocaleDateString('tr-TR')}
            </div>
          </div>

          {announcement.lawyer && lawyerTranslation && profileHref && (
            <aside className="w-full shrink-0 lg:sticky lg:top-8 lg:w-80">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">İletişim</h2>
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                  {announcement.lawyer.image ? (
                    isExternalProfile ? (
                      <a
                        href={profileHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block shrink-0 overflow-hidden rounded-full ring-2 ring-border transition hover:opacity-90"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={announcement.lawyer.image}
                          alt={lawyerTranslation.name}
                          className="h-24 w-24 object-cover"
                        />
                      </a>
                    ) : (
                      <Link
                        href={profileHref}
                        className="block shrink-0 overflow-hidden rounded-full ring-2 ring-border transition hover:opacity-90"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={announcement.lawyer.image}
                          alt={lawyerTranslation.name}
                          className="h-24 w-24 object-cover"
                        />
                      </Link>
                    )
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-medium text-muted-foreground">
                      {lawyerTranslation.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold text-foreground">
                      {isExternalProfile ? (
                        <a
                          href={profileHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {lawyerTranslation.name}
                        </a>
                      ) : (
                        <Link href={profileHref} className="hover:underline">
                          {lawyerTranslation.name}
                        </Link>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lawyerRoleLabelTr(announcement.lawyer)}
                    </p>
                    {lawyerTranslation.email && (
                      <a
                        href={`mailto:${lawyerTranslation.email}`}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4 shrink-0" />
                        {lawyerTranslation.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
