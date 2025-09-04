'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'

const lawyerSchema = z.object({
  name: z.string().min(1, 'Ad soyad gereklidir'),
  title: z.string().min(1, 'Ünvan gereklidir'),
  education: z.string().optional(),
  bar: z.string().min(1, 'Baro bilgisi gereklidir'),
  languages: z.string().optional(),
  practiceAreas: z.string().optional(),
  image: z.string().optional(),
  isPartner: z.boolean().default(false),
  isFounder: z.boolean().default(false),
  isIntern: z.boolean().default(false),
  hasPhD: z.boolean().default(false),
  certifications: z.string().optional(),
  bio: z.string().optional()
})

type LawyerForm = z.infer<typeof lawyerSchema>

interface EditLawyerPageProps {
  params: {
    id: string
  }
}

export default function EditLawyerPage({ params }: EditLawyerPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<LawyerForm>({
    resolver: zodResolver(lawyerSchema)
  })

  const isPartner = watch('isPartner')
  const isFounder = watch('isFounder')
  const isIntern = watch('isIntern')
  const hasPhD = watch('hasPhD')

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const response = await fetch(`/api/lawyers/${params.id}`)
        if (!response.ok) {
          throw new Error('Avukat bulunamadı')
        }
        const lawyer = await response.json()
        
        // Convert arrays back to comma-separated strings for form
        const formData = {
          ...lawyer,
          education: lawyer.education ? lawyer.education.join(', ') : '',
          languages: lawyer.languages ? lawyer.languages.join(', ') : '',
          practiceAreas: lawyer.practiceAreas ? lawyer.practiceAreas.join(', ') : '',
          certifications: lawyer.certifications ? lawyer.certifications.join(', ') : ''
        }
        reset(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchLawyer()
  }, [params.id, reset])

  const onSubmit = async (data: LawyerForm) => {
    setIsLoading(true)
    setError('')

    try {
      // Convert comma-separated strings to arrays
      const educationArray = data.education ? data.education.split(',').map(item => item.trim()).filter(item => item) : []
      const languagesArray = data.languages ? data.languages.split(',').map(item => item.trim()).filter(item => item) : []
      const practiceAreasArray = data.practiceAreas ? data.practiceAreas.split(',').map(item => item.trim()).filter(item => item) : []
      const certificationsArray = data.certifications ? data.certifications.split(',').map(item => item.trim()).filter(item => item) : []

      const response = await fetch(`/api/lawyers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          education: educationArray,
          languages: languagesArray,
          practiceAreas: practiceAreasArray,
          certifications: certificationsArray
        }),
      })

      if (!response.ok) {
        throw new Error('Avukat güncellenemedi')
      }

      router.push('/admin/lawyers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avukat Düzenle</h1>
          <p className="text-gray-600">Avukat bilgilerini güncelleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Dr. Mehmet Tunca"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ünvan *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ORTAK AVUKAT"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baro *
              </label>
              <input
                {...register('bar')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ankara Barosu"
              />
              {errors.bar && (
                <p className="mt-1 text-sm text-red-600">{errors.bar.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Görsel URL
              </label>
              <input
                {...register('image')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eğitim
              </label>
              <textarea
                {...register('education')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ankara Üniversitesi Hukuk Fakültesi, LL.M. Harvard Law School (virgülle ayırın)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Eğitim bilgilerini virgülle ayırarak girin
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diller
              </label>
              <input
                {...register('languages')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="İngilizce, Almanca (virgülle ayırın)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Dilleri virgülle ayırarak girin
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışma Alanları
              </label>
              <input
                {...register('practiceAreas')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Kurumsal Hukuk, Birleşme ve Devralmalar (virgülle ayırın)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Çalışma alanlarını virgülle ayırarak girin
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sertifikalar
              </label>
              <input
                {...register('certifications')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="CFA, CPA (virgülle ayırın)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Sertifikaları virgülle ayırarak girin
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biyografi
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Avukat hakkında kısa biyografi"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Özellikler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      {...register('isPartner')}
                      type="checkbox"
                      id="isPartner"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPartner" className="ml-2 block text-sm text-gray-900">
                      Ortak
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('isFounder')}
                      type="checkbox"
                      id="isFounder"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFounder" className="ml-2 block text-sm text-gray-900">
                      Kurucu
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('isIntern')}
                      type="checkbox"
                      id="isIntern"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isIntern" className="ml-2 block text-sm text-gray-900">
                      Stajyer
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('hasPhD')}
                      type="checkbox"
                      id="hasPhD"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasPhD" className="ml-2 block text-sm text-gray-900">
                      Doktora
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Güncelleniyor...' : 'Güncelle'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
