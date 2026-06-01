import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Eye, CheckCircle, XCircle } from 'lucide-react'

export default async function AdminContactPage() {
  const user = await getCurrentUser()

  const contactMessages = await prisma.contactMessage.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">İletişim Mesajları</h1>
        <p className="text-muted-foreground">Gelen iletişim mesajlarını yönetin</p>
      </div>

      {contactMessages.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <p className="text-muted-foreground">Henüz iletişim mesajı bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Konu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {contactMessages.map((message) => (
                <tr key={message.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {message.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {message.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {message.phone || 'Belirtilmemiş'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {message.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      message.status === 'NEW' ? 'bg-red-100 text-red-800' :
                      message.status === 'READ' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-500/15 text-green-400'
                    }`}>
                      {message.status === 'NEW' ? 'Yeni' : 
                       message.status === 'READ' ? 'Okundu' : 'Yanıtlandı'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/contact/${message.id}`}
                      className="text-primary hover:text-primary/80 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Görüntüle</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
