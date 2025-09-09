"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Camera, Award, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
//
import { Alert, AlertDescription } from '@/components/ui/alert'
import ImageUpload from '@/components/ImageUpload'
import { MultilingualForm } from '@/components/admin/MultilingualForm'
import { Language } from '@prisma/client'

interface LawyerApiResponse {
  id: string
  slug: string
  image?: string
  imagePublicId?: string
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  isLawyer: boolean
  order: number
  translations: Array<{
    language: Language
    name?: string
    bio?: string
    education?: string
    languages?: string
    practiceAreas?: string[]
    bar?: string
    phone?: string
    email?: string
  }>
}

export default function EditLawyerPage() {
  const router = useRouter()
  const params = useParams()
  const lawyerId = params.id as string

  const [lawyer, setLawyer] = useState<LawyerApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [image, setImage] = useState('')
  const [imagePublicId, setImagePublicId] = useState('')
  const [isPartner, setIsPartner] = useState(false)
  const [isFounder, setIsFounder] = useState(false)
  const [isIntern, setIsIntern] = useState(false)
  const [isLawyer, setIsLawyer] = useState(true)

  const [translations, setTranslations] = useState<LawyerApiResponse['translations']>([
    {
      language: Language.TR,
      name: '',
      bio: '',
      education: '',
      languages: '',
      practiceAreas: [],
      bar: '',
      phone: '',
      email: ''
    },
  ])

  const fetchLawyer = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`/api/lawyers/${lawyerId}`)
      if (!response.ok) {
        throw new Error('Avukat getirilemedi')
      }

      const data = await response.json()
      const lawyerData: LawyerApiResponse = data.data
      setLawyer(lawyerData)

      setImage(lawyerData.image || '')
      setImagePublicId(lawyerData.imagePublicId || '')
      setIsPartner(Boolean(lawyerData.isPartner))
      setIsFounder(Boolean(lawyerData.isFounder))
      setIsIntern(Boolean(lawyerData.isIntern))
      setIsLawyer(Boolean(lawyerData.isLawyer))

      if (lawyerData.translations && lawyerData.translations.length > 0) {
        // Normalize each translation to ensure defaults exist
        const normalized = lawyerData.translations.map((t) => ({
          language: t.language,
          name: t.name || '',
          bio: t.bio || '',
          education: t.education || '',
          languages: t.languages || '',
          practiceAreas: Array.isArray(t.practiceAreas) ? t.practiceAreas : [],
          bar: t.bar || '',
          phone: t.phone || '',
          email: t.email || ''
        }))

        // Ensure both TR and EN exist for the form tabs
        const languagesPresent = new Set(normalized.map(t => t.language))
        if (!languagesPresent.has(Language.TR)) {
          normalized.push({
            language: Language.TR,
            name: '', bio: '', education: '', languages: '', practiceAreas: [], bar: '', phone: '', email: ''
          })
        }
        if (!languagesPresent.has(Language.EN)) {
          normalized.push({
            language: Language.EN,
            name: '', bio: '', education: '', languages: '', practiceAreas: [], bar: '', phone: '', email: ''
          })
        }

        setTranslations(normalized)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }, [lawyerId])

  useEffect(() => {
    if (lawyerId) fetchLawyer()
  }, [lawyerId, fetchLawyer])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        image,
        imagePublicId,
        isPartner,
        isFounder,
        isIntern,
        isLawyer,
        translations
      }

      const response = await fetch(`/api/lawyers/${lawyerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Güncelleme başarısız')
      }

      setSuccess('Avukat başarıyla güncellendi!')
      setTimeout(() => router.push('/admin/lawyers'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-800 bg-red-900/20 text-red-300">
            <AlertDescription>Avukat bulunamadı</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <User className="w-8 h-8 mr-3 text-pink-400" />
                Avukatı Düzenle
              </h1>
              <p className="text-slate-400 mt-1">Varolan bilgileri düzenleyin</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <p className="text-green-400 text-center">{success}</p>
          </div>
        )}

        {/* Multilingual Content */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white flex items-center">
              Çok Dilli Avukat Bilgileri
            </CardTitle>
            <CardDescription className="text-slate-400">Avukatın tüm bilgilerini Türkçe ve İngilizce olarak düzenleyin</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <MultilingualForm translations={translations} onTranslationsChange={setTranslations} />
          </CardContent>
        </Card>

        {/* Profile Image */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white flex items-center">
              <Camera className="w-5 h-5 mr-2 text-pink-400" />
              Profil Fotoğrafı
            </CardTitle>
            <CardDescription className="text-slate-400">Avukatın profil fotoğrafını güncelleyin</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ImageUpload
              value={image}
              onChange={(url, publicId) => {
                setImage(url)
                setImagePublicId(publicId || '')
              }}
              folder="lawyers"
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Special Attributes */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-pink-400" />
              Özellikler
            </CardTitle>
            <CardDescription className="text-slate-400">Avukatın özel niteliklerini seçin</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <input
                  type="checkbox"
                  id="isPartner"
                  checked={isPartner}
                  onChange={(e) => {
                    const val = e.target.checked
                    setIsPartner(val)
                    if (val) {
                      setIsFounder(false)
                      setIsIntern(false)
                      setIsLawyer(false)
                    }
                  }}
                  className="w-4 h-4 text-pink-400 bg-slate-700 border-slate-600 rounded focus:ring-pink-400 focus:ring-2"
                />
                <label htmlFor="isPartner" className="ml-3 text-slate-200 font-medium">Ortak</label>
              </div>

              <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <input
                  type="checkbox"
                  id="isFounder"
                  checked={isFounder}
                  onChange={(e) => {
                    const val = e.target.checked
                    setIsFounder(val)
                    if (val) {
                      setIsPartner(false)
                      setIsIntern(false)
                      setIsLawyer(false)
                    }
                  }}
                  className="w-4 h-4 text-pink-400 bg-slate-700 border-slate-600 rounded focus:ring-pink-400 focus:ring-2"
                />
                <label htmlFor="isFounder" className="ml-3 text-slate-2 00 font-medium">Kurucu</label>
              </div>

              <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <input
                  type="checkbox"
                  id="isIntern"
                  checked={isIntern}
                  onChange={(e) => {
                    const val = e.target.checked
                    setIsIntern(val)
                    if (val) {
                      setIsFounder(false)
                      setIsPartner(false)
                      setIsLawyer(false)
                    }
                  }}
                  className="w-4 h-4 text-pink-400 bg-slate-700 border-slate-600 rounded focus:ring-pink-400 focus:ring-2"
                />
                <label htmlFor="isIntern" className="ml-3 text-slate-200 font-medium">Stajyer</label>
              </div>

              <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <input
                  type="checkbox"
                  id="isLawyer"
                  checked={isLawyer}
                  onChange={(e) => {
                    const val = e.target.checked
                    setIsLawyer(val)
                    if (val) {
                      setIsFounder(false)
                      setIsPartner(false)
                      setIsIntern(false)
                    }
                  }}
                  className="w-4 h-4 text-pink-400 bg-slate-700 border-slate-600 rounded focus:ring-pink-400 focus:ring-2"
                />
                <label htmlFor="isLawyer" className="ml-3 text-slate-200 font-medium">Avukat</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white">Sıralama</CardTitle>
            <CardDescription className="text-slate-400">Avukatın sıralama pozisyonu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                #{lawyer.order + 1}
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Sıralama değiştirmek için <br />
                <Link 
                  href="/admin/lawyers/order-new" 
                  className="text-pink-400 hover:underline"
                >
                  Sıralama sayfasına
                </Link> gidin
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
