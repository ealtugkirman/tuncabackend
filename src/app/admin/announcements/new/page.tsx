"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, Calendar, Tag, ImageIcon, Globe, Eye, Moon } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnnouncementMultilingualForm } from "@/components/admin/AnnouncementMultilingualForm"
import { Language } from "@prisma/client"

const announcementSchema = z.object({
  date: z.string().min(1, "Tarih gereklidir"),
  image: z.string().optional(),
  isDark: z.boolean().default(false),
  published: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  translations: z
    .array(
      z.object({
        language: z.nativeEnum(Language),
        title: z.string().min(1, "Başlık gereklidir"),
        excerpt: z.string().min(1, "Özet gereklidir"),
        content: z.string().min(1, "İçerik gereklidir"),
      }),
    )
    .min(1, "En az bir dil için çeviri gereklidir"),
})

type AnnouncementForm = z.infer<typeof announcementSchema>

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [translations, setTranslations] = useState<
    Array<{
      language: Language
      title?: string
      excerpt?: string
      content?: string
    }>
  >([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AnnouncementForm>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      published: false,
      isDark: false,
      language: Language.TR,
      translations: [],
    },
  })

  const onSubmit = async (data: AnnouncementForm) => {
    setIsLoading(true)
    setError("")

    console.log("Form data:", data)
    console.log("Translations:", translations)

    // Check if translations are empty
    if (!translations || translations.length === 0) {
      setError("En az bir dil için çeviri eklemelisiniz")
      setIsLoading(false)
      return
    }

    // Check if all required fields are filled
    const hasValidTranslations = translations.every(t => 
      t.title && t.title.trim() && 
      t.excerpt && t.excerpt.trim() && 
      t.content && t.content.trim()
    )

    if (!hasValidTranslations) {
      setError("Tüm çeviriler için başlık, özet ve içerik alanları doldurulmalıdır")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          translations: translations,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Duyuru oluşturulamadı")
      }

      await response.json()
      router.push("/admin/announcements")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Yeni Duyuru</h1>
              <p className="text-gray-400 mt-1">Yeni bir duyuru oluşturun ve yayınlayın</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Moon className="w-4 h-4" />
            <span>Dark Mode</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Multilingual Content Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Çoklu Dil İçeriği</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Duyurunuzu farklı dillerde oluşturun</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <AnnouncementMultilingualForm translations={translations} onTranslationsChange={setTranslations} />
            </CardContent>
          </Card>

          {/* Announcement Details Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-green-400" />
                <CardTitle className="text-white">Duyuru Bilgileri</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Duyurunun temel bilgilerini ve ayarlarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date Field */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-gray-200">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Tarih *</span>
                  </Label>
                  <input
                    {...register("date")}
                    type="date"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.date && (
                    <p className="text-sm text-red-400 flex items-center space-x-1">
                      <span>⚠</span>
                      <span>{errors.date.message}</span>
                    </p>
                  )}
                </div>



                {/* Image Upload */}
                <div className="lg:col-span-2 space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-gray-200">
                    <ImageIcon className="w-4 h-4 text-orange-400" />
                    <span>Duyuru Görseli</span>
                  </Label>
                  <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <ImageUpload
                      value={watch("image")}
                      onChange={(url) => setValue("image", url)}
                      folder="announcements"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="lg:col-span-2 space-y-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-200 flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Yayın Ayarları</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <Checkbox
                        {...register("published")}
                        id="published"
                        className="border-gray-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <Label htmlFor="published" className="text-gray-200 cursor-pointer">
                        Duyuruyu yayınla
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <Checkbox
                        {...register("isDark")}
                        id="isDark"
                        className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label htmlFor="isDark" className="text-gray-200 cursor-pointer">
                        Koyu tema kullan
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="bg-red-950 border-red-800">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 py-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Kaydediliyor..." : "Duyuruyu Kaydet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
