'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { EventMultilingualForm } from '@/components/admin/EventMultilingualForm'
import { Language } from '@prisma/client'

const eventSchema = z.object({
  date: z.string().min(1, 'Tarih gereklidir'),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  eventType: z.string().min(1, 'Etkinlik türü gereklidir'),
  published: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  translations: z.array(z.object({
    language: z.nativeEnum(Language),
    title: z.string().min(1, 'Başlık gereklidir'),
    excerpt: z.string().min(1, 'Özet gereklidir'),
    content: z.string().min(1, 'İçerik gereklidir')
  })).optional()
})

type EventForm = z.infer<typeof eventSchema>

export default function NewEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
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
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      published: false,
      language: Language.TR,
      translations: []
    }
  })

  const published = watch('published')

  const onSubmit = async (data: EventForm) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          gallery: galleryImages,
          translations: translations
        }),
      })

      if (!response.ok) {
        throw new Error('Etkinlik oluşturulamadı')
      }

      const event = await response.json()
      router.push('/admin/events')
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
          <h1 className="text-2xl font-bold text-gray-900">Yeni Etkinlik</h1>
          <p className="text-gray-600">Yeni bir etkinlik oluşturun</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Multilingual Content */}
        <EventMultilingualForm
          translations={translations}
          onTranslationsChange={setTranslations}
        />

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* The following block for errors.title is not needed, as title is handled in translations */}
          </div>

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
              Etkinlik Türü *
            </label>
            <select
              {...register('eventType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seçiniz</option>
              <option value="Sürdürülebilirlik">Sürdürülebilirlik</option>
              <option value="Hukuk Semineri">Hukuk Semineri</option>
              <option value="Konferans">Konferans</option>
              <option value="Workshop">Workshop</option>
              <option value="Diğer">Diğer</option>
            </select>
            {errors.eventType && (
              <p className="mt-1 text-sm text-red-600">{errors.eventType.message}</p>
            )}
          </div>

          

          

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etkinlik Görseli
            </label>
            <ImageUpload
              value={watch('image')}
              onChange={(url) => setValue('image', url)}
              folder="events"
              className="w-full"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etkinlik Galerisi (Opsiyonel)
            </label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Galeri ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <ImageUpload
                value=""
                onChange={(url) => {
                  if (url && !galleryImages.includes(url)) {
                    setGalleryImages([...galleryImages, url])
                  }
                }}
                folder="events/gallery"
                className="w-full"
              />
              {galleryImages.length > 0 && (
                <p className="text-sm text-gray-500">
                  {galleryImages.length} resim eklendi
                </p>
              )}
            </div>
          </div>

          {/* The excerpt and content fields are not needed here, as they are handled in translations via MultilingualForm */}

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
