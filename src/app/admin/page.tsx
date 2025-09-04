import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  // Get dashboard statistics
  const [
    lawyerCount,
    announcementCount,
    eventCount,
    publicationCount,
    contactCount,
    careerCount,
    newsletterCount
  ] = await Promise.all([
    prisma.lawyer.count(),
    prisma.announcement.count(),
    prisma.event.count(),
    prisma.publication.count(),
    prisma.contactMessage.count(),
    prisma.careerApplication.count(),
    prisma.newsletterSubscriber.count({ where: { subscribed: true } })
  ])

  // Get recent activity
  const recentContacts = await prisma.contactMessage.findMany({
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

  const recentApplications = await prisma.careerApplication.findMany({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400">Hoş geldiniz, {user.name}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Avukatlar</p>
                <p className="text-2xl font-semibold text-slate-100">{lawyerCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Duyurular</p>
                <p className="text-2xl font-semibold text-slate-100">{announcementCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Etkinlikler</p>
                <p className="text-2xl font-semibold text-slate-100">{eventCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Yayınlar</p>
                <p className="text-2xl font-semibold text-slate-100">{publicationCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">İletişim Mesajları</p>
                <p className="text-2xl font-semibold text-slate-100">{contactCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Kariyer Başvuruları</p>
                <p className="text-2xl font-semibold text-slate-100">{careerCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Bülten Aboneleri</p>
                <p className="text-2xl font-semibold text-slate-100">{newsletterCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-slate-100 mb-4">Son İletişim Mesajları</h3>
            <div className="space-y-3">
              {recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">{contact.name}</p>
                    <p className="text-sm text-slate-300">{contact.subject}</p>
                    <p className="text-xs text-slate-400">{new Date(contact.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    contact.status === 'NEW' ? 'badge-error' :
                    contact.status === 'READ' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {contact.status === 'NEW' ? 'Yeni' : contact.status === 'READ' ? 'Okundu' : 'Yanıtlandı'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-slate-100 mb-4">Son Kariyer Başvuruları</h3>
            <div className="space-y-3">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">{application.fullName}</p>
                    <p className="text-sm text-slate-300">{application.positionType}</p>
                    <p className="text-xs text-slate-400">{new Date(application.appliedAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    application.status === 'PENDING' ? 'badge-warning' :
                    application.status === 'REVIEWED' ? 'badge-info' :
                    application.status === 'ACCEPTED' ? 'badge-success' :
                    'badge-error'
                  }`}>
                    {application.status === 'PENDING' ? 'Beklemede' :
                     application.status === 'REVIEWED' ? 'İncelendi' :
                     application.status === 'ACCEPTED' ? 'Kabul' : 'Reddedildi'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
