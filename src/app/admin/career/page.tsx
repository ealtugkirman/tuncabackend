import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Eye, CheckCircle, XCircle, Clock, User, Mail, Phone } from 'lucide-react'

export default async function AdminCareerPage() {
  const user = await getCurrentUser()
  const applications = await prisma.careerApplication.findMany({
    orderBy: { appliedAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kariyer Başvuruları</h1>
        <p className="text-muted-foreground">Gelen kariyer başvurularını yönetin</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <p className="text-muted-foreground">Henüz kariyer başvurusu bulunmuyor.</p>
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
                  Pozisyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Başvuru Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {application.fullName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      {application.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {application.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {application.positionType === 'LAWYER' ? 'Avukat Pozisyonu' :
                       application.positionType === 'LEGAL_INTERN' ? 'Yasal Staj' :
                       'Yaz Stajı'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                      application.status === 'ACCEPTED' ? 'bg-green-500/15 text-green-400' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status === 'PENDING' ? 'Beklemede' :
                       application.status === 'REVIEWED' ? 'İncelendi' :
                       application.status === 'ACCEPTED' ? 'Kabul Edildi' : 'Reddedildi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(application.appliedAt).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/career/${application.id}`}
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
