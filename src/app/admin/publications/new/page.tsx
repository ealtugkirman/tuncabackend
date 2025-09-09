'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Language } from '@prisma/client'
import { PublicationMultilingualForm } from '@/components/admin/PublicationMultilingualForm'
import ImageUpload from '@/components/ImageUpload'

const publicationSchema = z.object({
  date: z.string().min(1, '📅 Tarih seçimi zorunludur'),
  year: z.string().min(1, '📆 Yıl bilgisi zorunludur'),
  tags: z.string().optional(),
  published: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  image: z.string().optional(),
  lawyerIds: z.array(z.string()).optional()
})

type PublicationForm = z.infer<typeof publicationSchema>

export default function NewPublicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lawyers, setLawyers] = useState([])
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<string[]>([])
  const [imagePublicId, setImagePublicId] = useState('')
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
      translations: [],
      lawyerIds: []
    }
  })

  const published = watch('published')
  const image = watch('image')

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
    console.log("🚀 Yayın oluşturma başlatıldı")
    console.log("📝 Form data:", data)
    console.log("🌐 Translations:", translations)
    console.log("👥 Seçilen Avukatlar:", selectedLawyerIds)
    console.log("🖼️ Image:", image, imagePublicId)
    console.log("🔍 Form validasyonu başarılı, onSubmit çağrıldı")

    setIsLoading(true)
    setError('')

    // Check if translations are empty
    if (!translations || translations.length === 0) {
      console.log("❌ Hata: Çeviri bulunamadı")
      console.log("📊 Translations state:", translations)
      setError('🌐 Lütfen en az bir dil için çeviri ekleyin (Türkçe veya İngilizce)')
      setIsLoading(false)
      return
    }

    console.log("📋 Mevcut çeviriler:", translations)

    // Check if all required fields are filled
    const hasValidTranslations = translations.every(t => 
      t.title && t.title.trim() && 
      t.excerpt && t.excerpt.trim() && 
      t.content && t.content.trim()
    )

    console.log("✅ Validasyon sonucu:", hasValidTranslations)

    if (!hasValidTranslations) {
      console.log("❌ Hata: Çeviri alanları eksik")
      console.log("📋 Çeviri detayları:", translations.map(t => ({
        language: t.language,
        hasTitle: !!t.title,
        hasExcerpt: !!t.excerpt,
        hasContent: !!t.content,
        titleLength: t.title?.length || 0,
        excerptLength: t.excerpt?.length || 0,
        contentLength: t.content?.length || 0,
        titleValue: t.title,
        excerptValue: t.excerpt,
        contentValue: t.content
      })))
      
      const missingFields = translations.map(t => {
        const missing = []
        if (!t.title || !t.title.trim()) missing.push('başlık')
        if (!t.excerpt || !t.excerpt.trim()) missing.push('özet')
        if (!t.content || !t.content.trim()) missing.push('içerik')
        return { language: t.language, missing }
      }).filter(t => t.missing.length > 0)
      
      setError(`📝 Eksik alanlar: ${missingFields.map(m => `${m.language} - ${m.missing.join(', ')}`).join('; ')}`)
      setIsLoading(false)
      return
    }

    console.log("✅ Form validasyonu başarılı")

    const requestBody = {
      ...data,
      translations,
      image,
      imagePublicId,
      lawyerIds: selectedLawyerIds
    }

    console.log("📤 API'ye gönderilecek veri:", requestBody)

    try {
      console.log("🌐 API isteği başlatılıyor...")
      const response = await fetch('/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📡 API yanıtı alındı:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log("❌ API hatası:", errorData)
        throw new Error(errorData.error || 'Yayın oluşturulamadı')
      }

      const publication = await response.json()
      console.log("✅ Yayın başarıyla oluşturuldu:", publication)
      router.push('/admin/publications')
    } catch (err) {
      console.log("💥 Hata oluştu:", err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
      console.log("🏁 İşlem tamamlandı")
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

      <form onSubmit={(e) => {
        e.preventDefault()
        console.log("📝 Form submit event tetiklendi")
        
        // Manuel validasyon
        const formData = new FormData(e.currentTarget)
        const data = {
          date: formData.get('date') as string,
          year: formData.get('year') as string,
          tags: formData.get('tags') as string,
          published: formData.get('published') === 'on'
        }
        
        console.log("📊 Form verileri:", data)
        console.log("🌐 Translations:", translations)
        console.log("👥 Seçilen Avukatlar:", selectedLawyerIds)
        
        // Validasyon
        const errors = []
        if (!data.date) errors.push('📅 Tarih seçimi zorunludur')
        if (!data.year) errors.push('📆 Yıl bilgisi zorunludur')
        if (!translations || translations.length === 0) {
          errors.push('🌐 En az bir dil için çeviri eklenmelidir')
        } else {
          const hasValidTranslations = translations.every(t => 
            t.title && t.title.trim() && 
            t.excerpt && t.excerpt.trim() && 
            t.content && t.content.trim()
          )
          if (!hasValidTranslations) {
            errors.push('📝 Tüm çeviriler için başlık, özet ve içerik alanları doldurulmalıdır')
          }
        }
        
        if (errors.length > 0) {
          setError(`⚠️ ${errors.join(', ')}`)
          return
        }
        
        // Form validasyonu başarılı, onSubmit'i çağır
        onSubmit(data as any)
      }} className="space-y-6">
        {/* Multilingual Content */}
        <PublicationMultilingualForm
          translations={translations}
          onTranslationsChange={(newTranslations) => {
            console.log("🔄 Translations state güncelleniyor:", newTranslations)
            setTranslations(newTranslations)
          }}
        />

        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title handled in translations */}

            {/* Image Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapak Görseli
              </label>
              <ImageUpload
                value={image}
                onChange={(url, publicId) => {
                  setValue('image', url)
                  setImagePublicId(publicId || '')
                }}
                folder="publications"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih *
              </label>
              <input
                {...register('date')}
                name="date"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıl *
              </label>
              <input
                {...register('year')}
                name="year"
                type="number"
                min="2020"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2024"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.year.message}
                </p>
              )}
            </div>

            {/* Lawyers Multi-select */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yazar(lar)
              </label>
              <div className="max-h-56 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-2 border border-gray-200 rounded-md p-3">
                {lawyers && Array.isArray(lawyers) && lawyers.map((lawyer: any) => {
                  const checked = selectedLawyerIds.includes(lawyer.id)
                  return (
                    <label key={lawyer.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedLawyerIds(prev => e.target.checked ? [...prev, lawyer.id] : prev.filter(id => id !== lawyer.id))
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-gray-800">{lawyer.name}</span>
                    </label>
                  )
                })}
              </div>
              {selectedLawyerIds.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">Seçilen: {selectedLawyerIds.length}</p>
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
                <option value="Uluslararası Ticaret Hukuku ve Sermaye Piyasaları">Uluslararası Ticaret Hukuku ve Sermaye Piyasaları</option>
                <option value="Sağlık ve İlaç Hukuku">Sağlık ve İlaç Hukuku</option>
                <option value="Dava Takibi ve Tahkim">Dava Takibi ve Tahkim</option>
                <option value="Enerji Hukuku">Enerji Hukuku</option>
                <option value="Kamu İhale Hukuku">Kamu İhale Hukuku</option>
                <option value="İş Hukuku">İş Hukuku</option>
                <option value="Maden ve Petrol Hukuku">Maden ve Petrol Hukuku</option>
                <option value="Vergi Hukuku">Vergi Hukuku</option>
                <option value="Gayrimenkul ve İnşaat Hukuku">Gayrimenkul ve İnşaat Hukuku</option>
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

            {/* Category removed */}

            

            

            {/* Excerpt handled in translations */}

            {/* Content handled in translations */}

            <div className="lg:col-span-2">
              <div className="flex items-center">
                <input
                  {...register('published')}
                  name="published"
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
            <div className="flex items-start">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
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
            onClick={() => {
              console.log("🖱️ Kaydet butonuna tıklandı")
              console.log("📊 Form durumu:", {
                isLoading,
                translationsCount: translations.length,
                lawyersCount: lawyers.length,
                translations: translations
              })
            }}
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
