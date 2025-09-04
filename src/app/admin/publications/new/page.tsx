'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'

const publicationSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  date: z.string().min(1, 'Tarih gereklidir'),
  year: z.string().min(1, 'Yıl gereklidir'),
  excerpt: z.string().min(1, 'Özet gereklidir'),
  content: z.string().min(1, 'İçerik gereklidir'),
  practiceArea: z.string().min(1, 'Çalışma alanı gereklidir'),
  category: z.string().min(1, 'Kategori gereklidir'),
  author: z.string().min(1, 'Yazar gereklidir'),
  tags: z.string().optional(),
  published: z.boolean().default(false),
  lawyerId: z.string().optional()
})

type PublicationForm = z.infer<typeof publicationSchema>

export default function NewPublicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lawyers, setLawyers] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PublicationForm>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      published: false
    }
  })

  const published = watch('published')

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await fetch('/api/lawyers')
        if (response.ok) {
          const data = await response.json()
          setLawyers(data)
        }
      } catch (err) {
        console.error('Error fetching lawyers:', err)
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
          tags: tagsArray
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
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Yayın başlığı"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih *
              </label>
              <input
                {...register('date')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="10 Aralık 2024"
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
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2024"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yazar *
              </label>
              <input
                {...register('author')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Yazar adı"
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
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
                <option value="Kurumsal Hukuk">Kurumsal Hukuk</option>
                <option value="İş Hukuku">İş Hukuku</option>
                <option value="Ticaret Hukuku">Ticaret Hukuku</option>
                <option value="Sermaye Piyasaları">Sermaye Piyasaları</option>
                <option value="Birleşme ve Devralmalar">Birleşme ve Devralmalar</option>
                <option value="Diğer">Diğer</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avukat (Opsiyonel)
              </label>
              <select
                {...register('lawyerId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seçiniz</option>
                {lawyers.map((lawyer: any) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiketler
              </label>
              <input
                {...register('tags')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="İş Hukuku, Mevzuat, İşveren Hakları (virgülle ayırın)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Etiketleri virgülle ayırarak girin
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Özet *
              </label>
              <textarea
                {...register('excerpt')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Yayın hakkında kısa açıklama"
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İçerik *
              </label>
              <textarea
                {...register('content')}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Yayın detayları (HTML formatında)"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

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
