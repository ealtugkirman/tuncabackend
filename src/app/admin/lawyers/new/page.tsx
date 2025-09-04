'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

const lawyerSchema = z.object({
  name: z.string().min(1, 'Ad soyad gereklidir'),
  title: z.string().min(1, 'Ünvan gereklidir'),
  education: z.string().optional(),
  bar: z.string().min(1, 'Baro bilgisi gereklidir'),
  languages: z.string().optional(),
  practiceAreas: z.string().optional(),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  isPartner: z.boolean().default(false),
  isFounder: z.boolean().default(false),
  isIntern: z.boolean().default(false),
  hasPhD: z.boolean().default(false),
  certifications: z.string().optional(),
  bio: z.string().optional()
})

type LawyerForm = z.infer<typeof lawyerSchema>

export default function NewLawyerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LawyerForm>({
    resolver: zodResolver(lawyerSchema),
    defaultValues: {
      isPartner: false,
      isFounder: false,
      isIntern: false,
      hasPhD: false
    }
  })

  const isPartner = watch('isPartner')
  const isFounder = watch('isFounder')
  const isIntern = watch('isIntern')
  const hasPhD = watch('hasPhD')

  const onSubmit = async (data: LawyerForm) => {
    setIsLoading(true)
    setError('')

    try {
      // Convert comma-separated strings to arrays
      const educationArray = data.education ? data.education.split(',').map(item => item.trim()).filter(item => item) : []
      const languagesArray = data.languages ? data.languages.split(',').map(item => item.trim()).filter(item => item) : []
      const practiceAreasArray = data.practiceAreas ? data.practiceAreas.split(',').map(item => item.trim()).filter(item => item) : []
      const certificationsArray = data.certifications ? data.certifications.split(',').map(item => item.trim()).filter(item => item) : []

      const response = await fetch('/api/lawyers', {
        method: 'POST',
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
        throw new Error('Avukat oluşturulamadı')
      }

      const lawyer = await response.json()
      router.push('/admin/lawyers')
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
          className="flex items-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Yeni Avukat</h1>
          <p className="text-slate-400">Yeni bir avukat ekleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                Ad Soyad *
              </label>
              <input
                {...register('name')}
                type="text"
                className="form-input"
                placeholder="Dr. Mehmet Tunca"
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Ünvan *
              </label>
              <input
                {...register('title')}
                type="text"
                className="form-input"
                placeholder="ORTAK AVUKAT"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Baro *
              </label>
              <input
                {...register('bar')}
                type="text"
                className="form-input"
                placeholder="Ankara Barosu"
              />
              {errors.bar && (
                <p className="form-error">{errors.bar.message}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="form-label">
                Profil Fotoğrafı
              </label>
              <ImageUpload
                value={watch('image')}
                onChange={(url, publicId) => {
                  setValue('image', url)
                  setValue('imagePublicId', publicId || '')
                }}
                folder="lawyers"
                className="w-full"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="form-label">
                Eğitim
              </label>
              <textarea
                {...register('education')}
                rows={2}
                className="form-textarea"
                placeholder="Ankara Üniversitesi Hukuk Fakültesi, LL.M. Harvard Law School (virgülle ayırın)"
              />
              <p className="form-help">
                Eğitim bilgilerini virgülle ayırarak girin
              </p>
            </div>

            <div>
              <label className="form-label">
                Diller
              </label>
              <input
                {...register('languages')}
                type="text"
                className="form-input"
                placeholder="İngilizce, Almanca (virgülle ayırın)"
              />
              <p className="form-help">
                Dilleri virgülle ayırarak girin
              </p>
            </div>

            <div>
              <label className="form-label">
                Çalışma Alanları
              </label>
              <input
                {...register('practiceAreas')}
                type="text"
                className="form-input"
                placeholder="Kurumsal Hukuk, Birleşme ve Devralmalar (virgülle ayırın)"
              />
              <p className="form-help">
                Çalışma alanlarını virgülle ayırarak girin
              </p>
            </div>

            <div>
              <label className="form-label">
                Sertifikalar
              </label>
              <input
                {...register('certifications')}
                type="text"
                className="form-input"
                placeholder="CFA, CPA (virgülle ayırın)"
              />
              <p className="form-help">
                Sertifikaları virgülle ayırarak girin
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className="form-label">
                Biyografi
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="form-textarea"
                placeholder="Avukat hakkında kısa biyografi"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-100">Özellikler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      {...register('isPartner')}
                      type="checkbox"
                      id="isPartner"
                      className="form-checkbox"
                    />
                    <label htmlFor="isPartner" className="ml-2 block text-sm text-slate-200">
                      Ortak
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('isFounder')}
                      type="checkbox"
                      id="isFounder"
                      className="form-checkbox"
                    />
                    <label htmlFor="isFounder" className="ml-2 block text-sm text-slate-200">
                      Kurucu
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('isIntern')}
                      type="checkbox"
                      id="isIntern"
                      className="form-checkbox"
                    />
                    <label htmlFor="isIntern" className="ml-2 block text-sm text-slate-200">
                      Stajyer
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('hasPhD')}
                      type="checkbox"
                      id="hasPhD"
                      className="form-checkbox"
                    />
                    <label htmlFor="hasPhD" className="ml-2 block text-sm text-slate-200">
                      Doktora
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            {isLoading ? (
              <>
                <div className="spinner mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
