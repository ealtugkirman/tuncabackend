import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Trash2, User, Award, GraduationCap } from 'lucide-react'

export default async function AdminLawyersPage() {
  const user = await getCurrentUser()
  const lawyers = await prisma.lawyer.findMany({
    orderBy: [
      { isFounder: 'desc' },
      { isPartner: 'desc' },
      { name: 'asc' }
    ]
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avukatlar</h1>
          <p className="text-gray-600">Ekip üyelerini yönetin</p>
        </div>
        <Link
          href="/admin/lawyers/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Avukat</span>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tüm Avukatlar</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {lawyers.map((lawyer) => (
            <div key={lawyer.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {lawyer.image ? (
                    <img src={lawyer.image} alt={lawyer.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{lawyer.name}</h4>
                    {lawyer.isFounder && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        Kurucu
                      </span>
                    )}
                    {lawyer.isPartner && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Award className="w-3 h-3 mr-1" />
                        Ortak
                      </span>
                    )}
                    {lawyer.hasPhD && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Doktora
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{lawyer.title}</p>
                  <p className="text-sm text-gray-500">{lawyer.bar}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lawyer.practiceAreas.slice(0, 3).map((area, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {area}
                      </span>
                    ))}
                    {lawyer.practiceAreas.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{lawyer.practiceAreas.length - 3} daha
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/lawyers/${lawyer.id}/edit`}
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