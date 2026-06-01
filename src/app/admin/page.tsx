import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Megaphone,
  Calendar,
  BookOpen,
  Mail,
  Briefcase,
  Newspaper,
  MessageSquare,
  UserSearch,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statStyle = 'rounded-[10px] border border-border bg-card p-4'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  let lawyerCount = 0
  let announcementCount = 0
  let eventCount = 0
  let publicationCount = 0
  let contactCount = 0
  let careerCount = 0
  let newsletterCount = 0
  let recentContacts: Array<{
    id: string
    name: string
    email: string
    subject: string
    createdAt: Date
    status: string
  }> = []
  let recentApplications: Array<{
    id: string
    fullName: string
    email: string
    positionType: string
    appliedAt: Date
    status: string
  }> = []

  try {
    lawyerCount = await prisma.lawyer.count()
    announcementCount = await prisma.announcement.count()
    eventCount = await prisma.event.count()
    publicationCount = await prisma.publication.count()
    contactCount = await prisma.contactMessage.count()
    careerCount = await prisma.careerApplication.count()
    newsletterCount = await prisma.newsletterSubscriber.count({ where: { subscribed: true } })

    recentContacts = await prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
        status: true,
      },
    })

    recentApplications = await prisma.careerApplication.findMany({
      take: 5,
      orderBy: { appliedAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        positionType: true,
        appliedAt: true,
        status: true,
      },
    })
  } catch (error) {
    console.error('Database connection error:', error)
  }

  const stats = [
    { label: 'STAT 01', category: 'LAWYERS', value: lawyerCount, icon: Users },
    { label: 'STAT 02', category: 'ANNOUNCEMENTS', value: announcementCount, icon: Megaphone },
    { label: 'STAT 03', category: 'EVENTS', value: eventCount, icon: Calendar },
    { label: 'STAT 04', category: 'PUBLICATIONS', value: publicationCount, icon: BookOpen },
    { label: 'STAT 05', category: 'CONTACT', value: contactCount, icon: Mail },
    { label: 'STAT 06', category: 'CAREERS', value: careerCount, icon: Briefcase },
    { label: 'STAT 07', category: 'NEWSLETTER', value: newsletterCount, icon: Newspaper },
  ]

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Ana sayfa
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hoş geldiniz, {user?.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((s) => (
          <div key={s.category} className={statStyle}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-primary opacity-90" />
            </div>
            <p className="text-3xl font-bold tabular-nums text-foreground">{s.value}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-primary/90">
              {s.category}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/90 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Recent contact messages</CardTitle>
            <Button variant="outline" size="sm" className="h-8 border-border text-xs" asChild>
              <Link href="/admin/contact">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-2xl border border-dashed border-border bg-muted/30 p-6">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground">No messages yet</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Yeni iletişim mesajları burada listelenir.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/admin/contact/${contact.id}`}
                    className="flex items-center justify-between rounded-lg border border-transparent bg-muted/40 p-3 transition-colors hover:border-border hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{contact.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{contact.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleString('en-GB')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        contact.status === 'NEW'
                          ? 'destructive'
                          : contact.status === 'READ'
                            ? 'secondary'
                            : 'default'
                      }
                      className="shrink-0"
                    >
                      {contact.status === 'NEW'
                        ? 'New'
                        : contact.status === 'READ'
                          ? 'Read'
                          : 'Replied'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Recent career applications</CardTitle>
            <Button variant="outline" size="sm" className="h-8 border-border text-xs" asChild>
              <Link href="/admin/career">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-2xl border border-dashed border-border bg-muted/30 p-6">
                  <UserSearch className="mx-auto h-10 w-10 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground">No applications yet</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  New candidates will show up here when they apply through your careers flow.
                </p>
                <Button className="mt-6 rounded-full bg-primary text-primary-foreground hover:opacity-95" asChild>
                  <Link href="/admin/career">Manage open roles</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    href={`/admin/career/${application.id}`}
                    className="flex items-center justify-between rounded-lg border border-transparent bg-muted/40 p-3 transition-colors hover:border-border hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{application.fullName}</p>
                      <p className="truncate text-sm text-muted-foreground">{application.positionType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(application.appliedAt).toLocaleString('en-GB')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        application.status === 'PENDING'
                          ? 'secondary'
                          : application.status === 'REVIEWED' || application.status === 'ACCEPTED'
                            ? 'default'
                            : 'destructive'
                      }
                      className="shrink-0"
                    >
                      {application.status === 'PENDING'
                        ? 'Pending'
                        : application.status === 'REVIEWED'
                          ? 'Reviewed'
                          : application.status === 'ACCEPTED'
                            ? 'Accepted'
                            : 'Rejected'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
