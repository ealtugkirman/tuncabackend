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
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
            <p className="text-gray-600">Duyuru detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/announcements/${announcement.id}/edit`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
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
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Görsel</h3>
              <img
                src={announcement.image}
                alt={announcement.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Announcement Content */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İçerik</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Announcement Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Durum</h3>
            <div className="flex items-center space-x-2">
              {announcement.published ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Eye className="w-4 h-4 mr-2" />
                  Yayında
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Taslak
                </span>
              )}
            </div>
            {announcement.isDark && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-white">
                  Koyu Tema
                </span>
              </div>
            )}
          </div>

          {/* Announcement Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detaylar</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tarih</p>
                  <p className="text-sm text-gray-600">{announcement.date}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Kategori</p>
                  <p className="text-sm text-gray-600">{announcement.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Oluşturulma Tarihi</p>
                  <p className="text-sm text-gray-600">
                    {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Son Güncelleme</p>
                  <p className="text-sm text-gray-600">
                    {new Date(announcement.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Excerpt */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Özet</h3>
            <p className="text-sm text-gray-600">{announcement.excerpt}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
