import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, User } from 'lucide-react'

export default async function AdminPublicationsPage() {
  const user = await getCurrentUser()
  const publications = await prisma.publication.findMany({
    include: {
      lawyer: {
        select: {
          id: true,
          name: true,
          title: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yayınlar</h1>
          <p className="text-gray-600">Yayınları yönetin</p>
        </div>
        <Link
          href="/admin/publications/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Yayın</span>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tüm Yayınlar</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {publications.map((publication) => (
            <div key={publication.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-medium text-gray-900">{publication.title}</h4>
                  {publication.published ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Eye className="w-3 h-3 mr-1" />
                      Yayında
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Taslak
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{publication.excerpt}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {publication.author}
                  </span>
                  <span>Çalışma Alanı: {publication.practiceArea}</span>
                  <span>Kategori: {publication.category}</span>
                  <span>Tarih: {publication.date}</span>
                </div>
                {publication.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {publication.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    {publication.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{publication.tags.length - 3} daha
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/publications/${publication.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
