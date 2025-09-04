import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, User, GraduationCap, MapPin, Award, Calendar } from 'lucide-react'

interface LawyerDetailPageProps {
  params: {
    id: string
  }
}

export default async function LawyerDetailPage({ params }: LawyerDetailPageProps) {
  const user = await getCurrentUser()
  
  const lawyer = await prisma.lawyer.findUnique({
    where: { id: params.id },
    include: {
      publications: {
        select: {
          id: true,
          title: true,
          date: true,
          published: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }
    }
  })

  if (!lawyer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/lawyers"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lawyer.name}</h1>
            <p className="text-gray-600">Avukat detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/lawyers/${lawyer.id}/edit`}
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
          {/* Lawyer Image and Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {lawyer.image ? (
                  <img
                    src={lawyer.image}
                    alt={lawyer.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{lawyer.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{lawyer.title}</p>
                
                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {lawyer.isPartner && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ortak
                    </span>
                  )}
                  {lawyer.isFounder && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Kurucu
                    </span>
                  )}
                  {lawyer.isIntern && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Stajyer
                    </span>
                  )}
                  {lawyer.hasPhD && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Doktora
                    </span>
                  )}
                </div>

                {lawyer.bio && (
                  <p className="text-gray-700">{lawyer.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Publications */}
          {lawyer.publications && lawyer.publications.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Son Yayınlar</h3>
              <div className="space-y-3">
                {lawyer.publications.map((publication) => (
                  <div key={publication.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{publication.title}</p>
                      <p className="text-sm text-gray-600">{publication.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        publication.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {publication.published ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İletişim Bilgileri</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Baro</p>
                  <p className="text-sm text-gray-600">{lawyer.bar}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Oluşturulma Tarihi</p>
                  <p className="text-sm text-gray-600">
                    {new Date(lawyer.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Son Güncelleme</p>
                  <p className="text-sm text-gray-600">
                    {new Date(lawyer.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          {lawyer.education && lawyer.education.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Eğitim</h3>
              <div className="space-y-2">
                {lawyer.education.map((edu, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{edu}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {lawyer.languages && lawyer.languages.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Diller</h3>
              <div className="flex flex-wrap gap-2">
                {lawyer.languages.map((language, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Practice Areas */}
          {lawyer.practiceAreas && lawyer.practiceAreas.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Çalışma Alanları</h3>
              <div className="flex flex-wrap gap-2">
                {lawyer.practiceAreas.map((area, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {lawyer.certifications && lawyer.certifications.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sertifikalar</h3>
              <div className="space-y-2">
                {lawyer.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{cert}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
