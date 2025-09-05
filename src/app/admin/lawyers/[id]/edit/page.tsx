"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, User, Mail, Phone, MapPin, Crown, Star, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ImageUpload from '@/components/ImageUpload'
import { useLanguage } from '@/contexts/LanguageContext'

interface LawyerTranslation {
  language: string
  name: string
  title: string
  bio: string
}

interface Lawyer {
  id: string
  name: string
  title: string
  bio: string
  email: string
  phone: string
  address: string
  image?: string
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  order: number
  translations: LawyerTranslation[]
}

export default function EditLawyerPage() {
  const router = useRouter()
  const params = useParams()
  const { locale } = useLanguage()
  const lawyerId = params.id as string

  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [image, setImage] = useState('')
  const [isPartner, setIsPartner] = useState(false)
  const [isFounder, setIsFounder] = useState(false)
  const [isIntern, setIsIntern] = useState(false)
  const [isLawyer, setIsLawyer] = useState(false)

  // Translation states
  const [translations, setTranslations] = useState<LawyerTranslation[]>([
    { language: 'TR', name: '', title: '', bio: '' },
    { language: 'EN', name: '', title: '', bio: '' }
  ])

  const fetchLawyer = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      console.log('🔄 Fetching lawyer:', lawyerId)
      const response = await fetch(`/api/lawyers/${lawyerId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch lawyer')
      }
      
      const data = await response.json()
      console.log('📥 Lawyer fetched:', data)
      
      const lawyerData = data.data
      setLawyer(lawyerData)
      
      // Set form values
      setName(lawyerData.name || '')
      setTitle(lawyerData.title || '')
      setBio(lawyerData.bio || '')
      setEmail(lawyerData.email || '')
      setPhone(lawyerData.phone || '')
      setAddress(lawyerData.address || '')
      setImage(lawyerData.image || '')
      setIsPartner(lawyerData.isPartner || false)
      setIsFounder(lawyerData.isFounder || false)
      setIsIntern(lawyerData.isIntern || false)
      setIsLawyer(!lawyerData.isPartner && !lawyerData.isFounder && !lawyerData.isIntern)
      
      // Set translations
      if (lawyerData.translations && lawyerData.translations.length > 0) {
        setTranslations(lawyerData.translations)
      }
      
    } catch (err) {
      console.error('❌ Error fetching lawyer:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [lawyerId, locale])

  useEffect(() => {
    if (lawyerId) {
      fetchLawyer()
    }
  }, [lawyerId, fetchLawyer])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')
      
      console.log('🔄 Saving lawyer...')
      
      const payload = {
        name,
        title,
        bio,
        email,
        phone,
        address,
        image,
        isPartner,
        isFounder,
        isIntern,
        isLawyer,
        translations
      }
      
      console.log('📤 Sending payload:', payload)
      
      const response = await fetch(`/api/lawyers/${lawyerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to save lawyer')
      }

      const result = await response.json()
      console.log('✅ API Success:', result)
      
      setSuccess('Avukat başarıyla güncellendi!')
      
      // Redirect to lawyers list after a short delay
      setTimeout(() => {
        router.push('/admin/lawyers')
      }, 2000)
      
    } catch (err) {
      console.error('❌ handleSave error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save lawyer')
    } finally {
      setIsSaving(false)
    }
  }

  const updateTranslation = (index: number, field: keyof LawyerTranslation, value: string) => {
    const newTranslations = [...translations]
    newTranslations[index] = {
      ...newTranslations[index],
      [field]: value
    }
    setTranslations(newTranslations)
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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertDescription>Avukat bulunamadı</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Avukat Düzenle
              </h1>
              <p className="text-muted-foreground">
                {lawyer.name} - Bilgilerini düzenleyin
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Temel Bilgiler
                </CardTitle>
                <CardDescription>
                  Avukatın temel bilgilerini düzenleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Ünvan</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ünvan"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biyografi</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Biyografi"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-posta
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Telefon"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Adres
                  </Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adres"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Çeviriler</CardTitle>
                <CardDescription>
                  Farklı dillerdeki çevirileri düzenleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {translations.map((translation, index) => (
                  <div key={translation.language} className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium text-foreground">
                      {translation.language === 'TR' ? '🇹🇷 Türkçe' : '🇺🇸 English'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ad Soyad</Label>
                        <Input
                          value={translation.name}
                          onChange={(e) => updateTranslation(index, 'name', e.target.value)}
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ünvan</Label>
                        <Input
                          value={translation.title}
                          onChange={(e) => updateTranslation(index, 'title', e.target.value)}
                          placeholder="Ünvan"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Biyografi</Label>
                      <Textarea
                        value={translation.bio}
                        onChange={(e) => updateTranslation(index, 'bio', e.target.value)}
                        placeholder="Biyografi"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Fotoğraf
                </CardTitle>
                <CardDescription>
                  Avukat fotoğrafını yükleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={image}
                  onChange={setImage}
                  folder="lawyers"
                />
              </CardContent>
            </Card>

            {/* Role Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Özellikler</CardTitle>
                <CardDescription>
                  Avukatın özel niteliklerini seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isLawyer"
                    checked={isLawyer}
                    onCheckedChange={(checked) => {
                      setIsLawyer(checked as boolean)
                      if (checked) {
                        setIsFounder(false)
                        setIsPartner(false)
                        setIsIntern(false)
                      }
                    }}
                  />
                  <Label htmlFor="isLawyer" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Avukat
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPartner"
                    checked={isPartner}
                    onCheckedChange={(checked) => {
                      setIsPartner(checked as boolean)
                      if (checked) {
                        setIsFounder(false)
                        setIsIntern(false)
                        setIsLawyer(false)
                      }
                    }}
                  />
                  <Label htmlFor="isPartner" className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" />
                    Ortak
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFounder"
                    checked={isFounder}
                    onCheckedChange={(checked) => {
                      setIsFounder(checked as boolean)
                      if (checked) {
                        setIsPartner(false)
                        setIsIntern(false)
                        setIsLawyer(false)
                      }
                    }}
                  />
                  <Label htmlFor="isFounder" className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Kurucu
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isIntern"
                    checked={isIntern}
                    onCheckedChange={(checked) => {
                      setIsIntern(checked as boolean)
                      if (checked) {
                        setIsFounder(false)
                        setIsPartner(false)
                        setIsLawyer(false)
                      }
                    }}
                  />
                  <Label htmlFor="isIntern" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-green-500" />
                    Stajyer
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Order */}
            <Card>
              <CardHeader>
                <CardTitle>Sıralama</CardTitle>
                <CardDescription>
                  Avukatın sıralama pozisyonu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    #{lawyer.order + 1}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sıralama değiştirmek için <br />
                    <Link 
                      href="/admin/lawyers/order-new" 
                      className="text-primary hover:underline"
                    >
                      Sıralama sayfasına
                    </Link> gidin
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
