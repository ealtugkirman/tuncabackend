"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImageUpload from "@/components/ImageUpload"
import { MultilingualForm } from "@/components/admin/MultilingualForm"
import { AdminFormShell } from "@/components/admin/AdminFormShell"
import { AdminFormSection } from "@/components/admin/AdminFormSection"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Language } from "@prisma/client"
import { normalizeLawyerPracticeAreaSlugs } from "@/lib/lawyer-practice-areas"
import {
  flagsToPosition,
  LAWYER_POSITION_OPTIONS_TR,
  type LawyerPosition,
} from "@/lib/lawyer-position"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LawyerApiResponse {
  id: string
  slug: string
  image?: string
  imagePublicId?: string
  linkedinUrl?: string | null
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  isLawyer: boolean
  isConsultant?: boolean | null
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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [image, setImage] = useState("")
  const [imagePublicId, setImagePublicId] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [position, setPosition] = useState<LawyerPosition>("LAWYER")

  const [translations, setTranslations] = useState<LawyerApiResponse["translations"]>([
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

  const fetchLawyer = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/lawyers/${lawyerId}`)
      if (!response.ok) {
        throw new Error("Avukat getirilemedi")
      }

      const data = await response.json()
      const lawyerData: LawyerApiResponse = data.data
      setLawyer(lawyerData)

      setImage(lawyerData.image || "")
      setImagePublicId(lawyerData.imagePublicId || "")
      setLinkedinUrl(lawyerData.linkedinUrl || "")
      setPosition(
        flagsToPosition({
          isPartner: Boolean(lawyerData.isPartner),
          isFounder: Boolean(lawyerData.isFounder),
          isIntern: Boolean(lawyerData.isIntern),
          isLawyer: Boolean(lawyerData.isLawyer),
          isConsultant: Boolean(lawyerData.isConsultant),
        })
      )

      if (lawyerData.translations && lawyerData.translations.length > 0) {
        const mergedSlugs = normalizeLawyerPracticeAreaSlugs(
          lawyerData.translations.flatMap((t) =>
            Array.isArray(t.practiceAreas) ? t.practiceAreas : []
          )
        )

        const normalized = lawyerData.translations.map((t) => ({
          language: t.language,
          name: t.name || "",
          bio: t.bio || "",
          education: t.education || "",
          languages: t.languages || "",
          practiceAreas: mergedSlugs,
          bar: t.bar || "",
          phone: t.phone || "",
          email: t.email || "",
        }))

        const languagesPresent = new Set(normalized.map((t) => t.language))
        if (!languagesPresent.has(Language.TR)) {
          normalized.push({
            language: Language.TR,
            name: "",
            bio: "",
            education: "",
            languages: "",
            practiceAreas: mergedSlugs,
            bar: "",
            phone: "",
            email: "",
          })
        }
        if (!languagesPresent.has(Language.EN)) {
          normalized.push({
            language: Language.EN,
            name: "",
            bio: "",
            education: "",
            languages: "",
            practiceAreas: mergedSlugs,
            bar: "",
            phone: "",
            email: "",
          })
        }
        if (!languagesPresent.has(Language.RU)) {
          normalized.push({
            language: Language.RU,
            name: "",
            bio: "",
            education: "",
            languages: "",
            practiceAreas: mergedSlugs,
            bar: "",
            phone: "",
            email: "",
          })
        }

        setTranslations(normalized)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
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
      setError("")
      setSuccess("")

      const payload = {
        image,
        imagePublicId,
        linkedinUrl,
        position,
        translations,
      }

      const response = await fetch(`/api/lawyers/${lawyerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Güncelleme başarısız")
      }

      setSuccess("Kayıt güncellendi.")
      setTimeout(() => router.push("/admin/lawyers"), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        </div>
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className="mx-auto max-w-lg">
        <Alert variant="destructive" className="border-destructive/50">
          <AlertDescription>Avukat bulunamadı.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <AdminFormShell
      title="Edit lawyer"
      subtitle="Update profile content and publishing flags."
      actions={
        <Button type="button" size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>
      }
    >
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm text-primary">
          {success}
        </div>
      )}

      <AdminFormSection
        title="Multilingual content"
        description="Turkish and English fields for name, bio, practice areas, and contact."
      >
        <MultilingualForm translations={translations} onTranslationsChange={setTranslations} />
      </AdminFormSection>

      <AdminFormSection title="Profile photo">
        <ImageUpload
          value={image}
          onChange={(url, publicId) => {
            setImage(url)
            setImagePublicId(publicId || "")
          }}
          folder="lawyers"
          className="w-full"
        />
      </AdminFormSection>

      <AdminFormSection
        title="LinkedIn"
        description="Profil linki (tek dil; boş bırakılabilir)."
      >
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/..."
            autoComplete="off"
          />
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="Pozisyon"
        description="Tek seçim: Ortak, Kurucu ortak, Danışman, Avukat veya Stajyer avukat."
      >
        <div className="space-y-2">
          <Label htmlFor="position">Rol</Label>
          <Select
            value={position}
            onValueChange={(v) => setPosition(v as LawyerPosition)}
          >
            <SelectTrigger id="position" className="w-full max-w-md">
              <SelectValue placeholder="Pozisyon seçin" />
            </SelectTrigger>
            <SelectContent>
              {LAWYER_POSITION_OPTIONS_TR.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminFormSection>

      <AdminFormSection title="Display order">
        <p className="text-2xl font-semibold tabular-nums text-foreground">#{lawyer.order + 1}</p>
        <p className="text-xs text-muted-foreground">
          To change order, use{" "}
          <Link href="/admin/lawyers/order-new" className="text-primary underline-offset-4 hover:underline">
            lawyer ordering
          </Link>
          .
        </p>
      </AdminFormSection>
    </AdminFormShell>
  )
}
