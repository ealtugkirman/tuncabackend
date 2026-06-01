import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Calendar, Tag } from 'lucide-react'

interface AnnouncementDetailPageProps {
  params: {
    id: string
  }
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const user = await getCurrentUser()
  
  const announcement = await prisma.announcement.findUnique({
    where: { id: params.id }
  })

  if (!announcement) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/announcements"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{announcement.title}</h1>
            <p className="text-muted-foreground">Duyuru detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/announcements/${announcement.id}/edit`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Düzenle</span>
          </Link>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
            <Trash2 className="w-4 h-4" />
            <span>Sil</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Announcement Image */}
          {announcement.image && (
            <div className="bg-card shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Görsel</h3>
              <img
                src={announcement.image}
                alt={announcement.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Announcement Content */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">İçerik</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Announcement Status */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Durum</h3>
            <div className="flex items-center space-x-2">
              {announcement.published ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/15 text-green-400">
                  <Eye className="w-4 h-4 mr-2" />
                  Yayında
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-foreground">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Taslak
                </span>
              )}
            </div>
            {announcement.isDark && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-white">
                  Koyu Tema
                </span>
              </div>
            )}
          </div>

          {/* Announcement Details */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Detaylar</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Tarih</p>
                  <p className="text-sm text-muted-foreground">{announcement.date}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Kategori</p>
                  <p className="text-sm text-muted-foreground">{announcement.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Oluşturulma Tarihi</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Son Güncelleme</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(announcement.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Excerpt */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Özet</h3>
            <p className="text-sm text-muted-foreground">{announcement.excerpt}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
