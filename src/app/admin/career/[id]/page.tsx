import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, User, GraduationCap, Briefcase, FileText, Download } from 'lucide-react'

interface CareerDetailPageProps {
  params: {
    id: string
  }
}

export default async function CareerDetailPage({ params }: CareerDetailPageProps) {
  const user = await getCurrentUser()
  
  const application = await prisma.careerApplication.findUnique({
    where: { id: params.id }
  })

  if (!application) {
    notFound()
  }

  const getPositionTypeText = (type: string) => {
    switch (type) {
      case 'LAWYER':
        return 'Avukat Pozisyonu'
      case 'LEGAL_INTERN':
        return 'Yasal Staj'
      case 'SUMMER_INTERN':
        return 'Yaz Stajı'
      default:
        return type
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede'
      case 'REVIEWED':
        return 'İncelendi'
      case 'ACCEPTED':
        return 'Kabul Edildi'
      case 'REJECTED':
        return 'Reddedildi'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/career"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kariyer Başvurusu</h1>
            <p className="text-gray-600">Başvuru detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {getStatusText(application.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ön Yazı</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Education */}
          {application.education && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Eğitim Bilgileri</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{application.education}</p>
              </div>
            </div>
          )}

          {/* Experience */}
          {application.experience && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Deneyim Bilgileri</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{application.experience}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Applicant Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Başvuran Bilgileri</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{application.fullName}</p>
                  <p className="text-sm text-gray-600">Ad Soyad</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{application.email}</p>
                  <p className="text-sm text-gray-600">Email</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{application.phone}</p>
                  <p className="text-sm text-gray-600">Telefon</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{getPositionTypeText(application.positionType)}</p>
                  <p className="text-sm text-gray-600">Pozisyon</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(application.appliedAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm text-gray-600">Başvuru Tarihi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Başvuru Detayları</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Durum</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>

              {application.reviewedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-900">İncelenme Tarihi</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(application.reviewedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}

              {application.languages && application.languages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Diller</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {application.languages.map((language, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CV Download */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dosyalar</h3>
            <div className="space-y-3">
              <a
                href={application.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                CV İndir
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İşlemler</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                <Mail className="w-4 h-4 mr-2" />
                Email Gönder
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
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
