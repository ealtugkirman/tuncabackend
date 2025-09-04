'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Language } from '@prisma/client'
import { PublicationMultilingualForm } from '@/components/admin/PublicationMultilingualForm'

const publicationSchema = z.object({
  date: z.string().min(1, 'Tarih gereklidir'),
  year: z.string().min(1, 'Yıl gereklidir'),
  category: z.string().min(1, 'Kategori gereklidir'),
  lawyerIds: z.array(z.string()).min(1, 'En az bir avukat seçilmelidir'),
  published: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  translations: z
    .array(
      z.object({
        language: z.nativeEnum(Language),
        title: z.string().min(1, 'Başlık gereklidir'),
        excerpt: z.string().min(1, 'Özet gereklidir'),
        content: z.string().min(1, 'İçerik gereklidir'),
      })
    )
    .min(2, 'Türkçe ve İngilizce içerik zorunludur')
    .refine(
      (arr) => arr.some((t) => t.language === Language.TR) && arr.some((t) => t.language === Language.EN),
      { message: 'TR ve EN çevirileri zorunludur' }
    )
})

type PublicationForm = z.infer<typeof publicationSchema>

export default function NewPublicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lawyers, setLawyers] = useState([])
  const [translations, setTranslations] = useState<Array<{
    language: Language
    title?: string
    excerpt?: string
    content?: string
  }>>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PublicationForm>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      published: false,
      translations: []
    }
  })

  const published = watch('published')

  // Fetch lawyers
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await fetch('/api/lawyers?language=TR')
        if (response.ok) {
          const result = await response.json()
          setLawyers(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching lawyers:', error)
      }
    }
    fetchLawyers()
  }, [])

  const onSubmit = async (data: PublicationForm) => {
    setIsLoading(true)
    setError('')

    try {
      // Convert tags string to array
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

      const response = await fetch('/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          translations
        }),
      })

      if (!response.ok) {
        throw new Error('Yayın oluşturulamadı')
      }

      const publication = await response.json()
      router.push('/admin/publications')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Yeni Yayın</h1>
          <p className="text-gray-600">Yeni bir yayın oluşturun</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Multilingual Content */}
        <PublicationMultilingualForm
          translations={translations}
          onTranslationsChange={setTranslations}
        />

        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title handled in translations */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih *
              </label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıl *
              </label>
              <input
                {...register('year')}
                type="number"
                min="2020"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2024"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avukat (Yazar) *
              </label>
              <select
                {...register('lawyerId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Avukat seçiniz</option>
                {lawyers && Array.isArray(lawyers) && lawyers.map((lawyer: any) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name}
                  </option>
                ))}
              </select>
              {errors.lawyerIds && (
                <p className="mt-1 text-sm text-red-600">{(errors.lawyerIds as any).message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışma Alanı *
              </label>
              <select
                {...register('practiceArea')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seçiniz</option>
                <option value="Birleşme ve Devralmalar">Birleşme ve Devralmalar</option>
                <option value="Bankacılık ve Finans Hukuku">Bankacılık ve Finans Hukuku</option>
                <option value="Uluslararası Ticaret Hukuku">Uluslararası Ticaret Hukuku</option>
                <option value="Sağlık ve İlaç Hukuku">Sağlık ve İlaç Hukuku</option>
                <option value="Dava Takibi ve Tahkim">Dava Takibi ve Tahkim</option>
                <option value="Enerji Hukuku">Enerji Hukuku</option>
                <option value="Kamu İhale Hukuku">Kamu İhale Hukuku</option>
                <option value="İş Hukuku">İş Hukuku</option>
                <option value="Maden ve Petrol Hukuku">Maden ve Petrol Hukuku</option>
                <option value="Vergi Hukuku">Vergi Hukuku</option>
                <option value="Gayrimenkul ve İnşaat Hukuku">Gayrimenkul ve İnşaat Hukuku</option>
                <option value="Şirketler Hukuku">Şirketler Hukuku</option>
                <option value="Spor Hukuku">Spor Hukuku</option>
                <option value="Fikri Mülkiyet Hukuku">Fikri Mülkiyet Hukuku</option>
                <option value="Rekabet Hukuku">Rekabet Hukuku</option>
                <option value="Corporate Law & Mergers, Acquisitions and Spin-offs">Corporate Law & Mergers, Acquisitions and Spin-offs</option>
                <option value="Banking and Finance Law">Banking and Finance Law</option>
                <option value="International Commercial Law & Arbitration">International Commercial Law & Arbitration</option>
                <option value="Health and Pharmaceutical Law">Health and Pharmaceutical Law</option>
                <option value="International Commercial Arbitration & Investment Arbitration">International Commercial Arbitration & Investment Arbitration</option>
                <option value="Energy and Mining Law">Energy and Mining Law</option>
                <option value="Public Procurement Law">Public Procurement Law</option>
                <option value="Labor and Social Security Law">Labor and Social Security Law</option>
                <option value="Tax Law">Tax Law</option>
                <option value="Construction and Zoning Law">Construction and Zoning Law</option>
                <option value="Sports Law">Sports Law</option>
                <option value="Intellectual and Industrial Property Law">Intellectual and Industrial Property Law</option>
                <option value="Competition Law">Competition Law</option>
              </select>
              {errors.practiceArea && (
                <p className="mt-1 text-sm text-red-600">{errors.practiceArea.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seçiniz</option>
                <option value="Mevzuat Değişikliği">Mevzuat Değişikliği</option>
                <option value="Yargıtay Kararları">Yargıtay Kararları</option>
                <option value="Sektörel Analiz">Sektörel Analiz</option>
                <option value="Uygulama Notları">Uygulama Notları</option>
                <option value="Diğer">Diğer</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            

            

            {/* Excerpt handled in translations */}

            {/* Content handled in translations */}

            <div className="lg:col-span-2">
              <div className="flex items-center">
                <input
                  {...register('published')}
                  type="checkbox"
                  id="published"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  Yayınla
                </label>
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
            <span>{isLoading ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
