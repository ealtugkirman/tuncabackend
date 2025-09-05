import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Megaphone, Calendar, BookOpen, Mail, Briefcase, Newspaper } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  // Get dashboard statistics with error handling
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
    // Sequential queries to avoid connection pool timeout
    lawyerCount = await prisma.lawyer.count()
    announcementCount = await prisma.announcement.count()
    eventCount = await prisma.event.count()
    publicationCount = await prisma.publication.count()
    contactCount = await prisma.contactMessage.count()
    careerCount = await prisma.careerApplication.count()
    newsletterCount = await prisma.newsletterSubscriber.count({ where: { subscribed: true } })

    // Get recent activity
    recentContacts = await prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
        status: true
      }
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
        status: true
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    // Continue with default values if database is unavailable
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Hoş geldiniz, {user.name}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avukatlar</p>
                <p className="text-2xl font-semibold text-foreground">{lawyerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Duyurular</p>
                <p className="text-2xl font-semibold text-foreground">{announcementCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Etkinlikler</p>
                <p className="text-2xl font-semibold text-foreground">{eventCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Yayınlar</p>
                <p className="text-2xl font-semibold text-foreground">{publicationCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">İletişim Mesajları</p>
                <p className="text-2xl font-semibold text-foreground">{contactCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Kariyer Başvuruları</p>
                <p className="text-2xl font-semibold text-foreground">{careerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Bülten Aboneleri</p>
                <p className="text-2xl font-semibold text-foreground">{newsletterCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son İletişim Mesajları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.subject}</p>
                    <p className="text-xs text-muted-foreground">{new Date(contact.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <Badge variant={
                    contact.status === 'NEW' ? 'destructive' :
                    contact.status === 'READ' ? 'secondary' :
                    'default'
                  }>
                    {contact.status === 'NEW' ? 'Yeni' : contact.status === 'READ' ? 'Okundu' : 'Yanıtlandı'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Kariyer Başvuruları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{application.fullName}</p>
                    <p className="text-sm text-muted-foreground">{application.positionType}</p>
                    <p className="text-xs text-muted-foreground">{new Date(application.appliedAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <Badge variant={
                    application.status === 'PENDING' ? 'secondary' :
                    application.status === 'REVIEWED' ? 'default' :
                    application.status === 'ACCEPTED' ? 'default' :
                    'destructive'
                  }>
                    {application.status === 'PENDING' ? 'Beklemede' :
                     application.status === 'REVIEWED' ? 'İncelendi' :
                     application.status === 'ACCEPTED' ? 'Kabul' : 'Reddedildi'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
