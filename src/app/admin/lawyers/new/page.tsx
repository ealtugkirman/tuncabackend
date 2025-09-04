"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, User, Languages, Award, Camera } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MultilingualForm } from "@/components/admin/MultilingualForm"
import { Language } from "@prisma/client"

const lawyerSchema = z.object({
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  isPartner: z.boolean().default(false),
  isFounder: z.boolean().default(false),
  isIntern: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  translations: z
    .array(
      z.object({
        language: z.nativeEnum(Language),
        name: z.string().optional(),
        bio: z.string().optional(),
        education: z.string().optional(),
        languages: z.string().optional(),
        practiceAreas: z.array(z.string()).optional(),
        bar: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().refine((val) => !val || z.string().email().safeParse(val).success, {
          message: "Geçerli bir email adresi girin"
        }).optional(),
      }),
    )
    .optional(),
})

type LawyerForm = z.infer<typeof lawyerSchema>

export default function NewLawyerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [translations, setTranslations] = useState<
    Array<{
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
  >([
    {
      language: Language.TR,
      name: "",
      bio: "",
      education: "",
      languages: "",
      practiceAreas: [],
      bar: "",
      phone: "",
      email: "",
    },
  ])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<LawyerForm>({
    resolver: zodResolver(lawyerSchema),
    defaultValues: {
      isPartner: false,
      isFounder: false,
      isIntern: false,
      language: Language.TR,
      translations: [
        {
          language: Language.TR,
          name: "",
          bio: "",
          education: "",
          languages: "",
          practiceAreas: [],
          bar: "",
          phone: "",
          email: "",
        },
      ],
    },
  })

  const isPartner = watch("isPartner")
  const isFounder = watch("isFounder")
  const isIntern = watch("isIntern")

  const onSubmit = async (data: LawyerForm) => {
    console.log("🚀 FORM SUBMITTED!")
    console.log("Form submitted with data:", data)
    console.log("Translations:", translations)
    setIsLoading(true)
    setError("")

    try {
      const requestBody = {
        ...data,
        translations: translations,
      }
      console.log("Request body:", requestBody)
      
      const response = await fetch("/api/lawyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Avukat oluşturulamadı")
      }

      const lawyer = await response.json()
      router.push("/admin/lawyers")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
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
                Yeni Avukat
              </h1>
              <p className="text-slate-400 mt-1">Yeni bir avukat profili oluşturun</p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p><strong>Debug Info:</strong></p>
          <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
          <p>Errors: {JSON.stringify(errors, null, 2)}</p>
          <p>Translations Count: {translations.length}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Multilingual Content */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-white flex items-center">
                <Languages className="w-5 h-5 mr-2 text-pink-400" />
                Çok Dilli Avukat Bilgileri
              </CardTitle>
              <CardDescription className="text-slate-400">Avukatın tüm bilgilerini Türkçe ve İngilizce olarak girin</CardDescription>
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
              <CardDescription className="text-slate-400">Avukatın profil fotoğrafını yükleyin</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ImageUpload
                value={watch("image")}
                onChange={(url, publicId) => {
                  setValue("image", url)
                  setValue("imagePublicId", publicId || "")
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
                    {...register("isPartner")}
                    type="checkbox"
                    id="isPartner"
                    className="w-4 h-4 text-pink-400 bg-slate-700 border-slate-600 rounded focus:ring-pink-400 focus:ring-2"
                  />
                  <label htmlFor="isPartner" className="ml-3 text-slate-200 font-medium">
                    Ortak
                  </label>
                </div>

                <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                  <input
                    {...register("isFounder")}
                    type="checkbox"
                    id="isFounder"
                    className="w-4 h-4 text-pink-400 bg-slate-700 border-slate-600 rounded focus:ring-pink-400 focus:ring-2"
                  />
                  <label htmlFor="isFounder" className="ml-3 text-slate-200 font-medium">
                    Kurucu
                  </label>
                </div>

                <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                  <input
                    {...register("isIntern")}
                    type="checkbox"
                    id="isIntern"
                    className="w-4 h-4 text-pink-400 bg-slate-700 border-slate-600 rounded focus:ring-pink-400 focus:ring-2"
                  />
                  <label htmlFor="isIntern" className="ml-3 text-slate-200 font-medium">
                    Stajyer
                  </label>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 py-3 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => console.log("🔴 BUTTON CLICKED!")}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
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
        </form>
      </div>
    </div>
  )
}
