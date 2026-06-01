import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

interface ContactDetailPageProps {
  params: {
    id: string
  }
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const user = await getCurrentUser()
  
  const message = await prisma.contactMessage.findUnique({
    where: { id: params.id }
  })

  if (!message) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/contact"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">İletişim Mesajı</h1>
            <p className="text-muted-foreground">Mesaj detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            message.status === 'NEW' ? 'bg-red-100 text-red-800' :
            message.status === 'READ' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-500/15 text-green-400'
          }`}>
            {message.status === 'NEW' ? 'Yeni' : 
             message.status === 'READ' ? 'Okundu' : 'Yanıtlandı'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Mesaj İçeriği</h3>
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">İletişim Bilgileri</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {message.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{message.name}</p>
                  <p className="text-sm text-muted-foreground">Ad Soyad</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{message.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>

              {message.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{message.phone}</p>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm text-muted-foreground">Gönderim Tarihi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Details */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Mesaj Detayları</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Konu</p>
                <p className="text-sm text-muted-foreground mt-1">{message.subject}</p>
              </div>

              {message.practiceArea && (
                <div>
                  <p className="text-sm font-medium text-foreground">İlgili Hukuk Alanı</p>
                  <p className="text-sm text-muted-foreground mt-1">{message.practiceArea}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-foreground">Durum</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    message.status === 'NEW' ? 'bg-red-100 text-red-800' :
                    message.status === 'READ' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-500/15 text-green-400'
                  }`}>
                    {message.status === 'NEW' ? 'Yeni' : 
                     message.status === 'READ' ? 'Okundu' : 'Yanıtlandı'}
                  </span>
                </div>
              </div>

              {message.repliedAt && (
                <div>
                  <p className="text-sm font-medium text-foreground">Yanıtlanma Tarihi</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(message.repliedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">İşlemler</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted">
                <Mail className="w-4 h-4 mr-2" />
                Email Gönder
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted">
                <Phone className="w-4 h-4 mr-2" />
                Telefon Et
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
