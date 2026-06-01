import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { Mail, CheckCircle, XCircle, Calendar, Globe } from 'lucide-react'

export default async function AdminNewsletterPage() {
  const user = await getCurrentUser()
  
  const [subscribers, totalCount, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
      take: 50
    }),
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { subscribed: true } })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bülten Aboneleri</h1>
        <p className="text-muted-foreground">Newsletter abonelerini yönetin</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Toplam Abone</p>
              <p className="text-2xl font-semibold text-foreground">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Aktif Abone</p>
              <p className="text-2xl font-semibold text-foreground">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">İptal Edilen</p>
              <p className="text-2xl font-semibold text-foreground">{totalCount - activeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Son 50 Abone</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Kaynak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Abone Olma Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  İptal Tarihi
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                      <div className="text-sm font-medium text-foreground">
                        {subscriber.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscriber.subscribed 
                        ? 'bg-green-500/15 text-green-400' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.subscribed ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          İptal
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-4 h-4 mr-2" />
                      {subscriber.source}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(subscriber.subscribedAt).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {subscriber.unsubscribedAt 
                        ? new Date(subscriber.unsubscribedAt).toLocaleDateString('tr-TR')
                        : '-'
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
