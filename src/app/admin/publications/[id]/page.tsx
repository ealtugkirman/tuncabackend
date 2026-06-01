import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, User, Tag, Calendar } from 'lucide-react'

interface PublicationDetailPageProps {
  params: {
    id: string
  }
}

export default async function PublicationDetailPage({ params }: PublicationDetailPageProps) {
  const user = await getCurrentUser()
  
  const publication = await prisma.publication.findUnique({
    where: { id: params.id },
    include: {
      lawyer: {
        select: {
          id: true,
          name: true,
          title: true,
          image: true
        }
      }
    }
  })

  if (!publication) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/publications"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{publication.title}</h1>
            <p className="text-muted-foreground">Yayın detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/publications/${publication.id}/edit`}
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
          {/* Publication Content */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">İçerik</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: publication.content }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Publication Status */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Durum</h3>
            <div className="flex items-center space-x-2">
              {publication.published ? (
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
          </div>

          {/* Publication Details */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Detaylar</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Yazar</p>
                  <p className="text-sm text-muted-foreground">{publication.author}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Çalışma Alanı</p>
                  <p className="text-sm text-muted-foreground">{publication.practiceArea}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Kategori</p>
                  <p className="text-sm text-muted-foreground">{publication.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Tarih</p>
                  <p className="text-sm text-muted-foreground">{publication.date}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Oluşturulma Tarihi</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(publication.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Son Güncelleme</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(publication.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Lawyer */}
          {publication.lawyer && (
            <div className="bg-card shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">İlgili Avukat</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  {publication.lawyer.image ? (
                    <img 
                      src={publication.lawyer.image} 
                      alt={publication.lawyer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{publication.lawyer.name}</p>
                  <p className="text-sm text-muted-foreground">{publication.lawyer.title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="bg-card shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {publication.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Publication Excerpt */}
          <div className="bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Özet</h3>
            <p className="text-sm text-muted-foreground">{publication.excerpt}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
