"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { MultilingualForm } from "@/components/admin/MultilingualForm"
import { AdminFormShell } from "@/components/admin/AdminFormShell"
import { AdminFormSection } from "@/components/admin/AdminFormSection"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Language } from "@prisma/client"
import {
  LAWYER_POSITION_OPTIONS_TR,
  LAWYER_POSITION_VALUES,
  type LawyerPosition,
} from "@/lib/lawyer-position"

const lawyerSchema = z.object({
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  linkedinUrl: z
    .string()
    .optional()
    .refine(
      (s) =>
        !s?.trim() ||
        /^https?:\/\/.+/i.test(s.trim()),
      { message: "Geçerli bir URL girin (https://...)" }
    ),
  position: z.enum(LAWYER_POSITION_VALUES),
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
        email: z
          .string()
          .refine((val) => !val || z.string().email().safeParse(val).success, {
            message: "Geçerli bir email adresi girin",
          })
          .optional(),
      })
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
    formState: { errors },
    watch,
    setValue,
  } = useForm<LawyerForm>({
    resolver: zodResolver(lawyerSchema),
    defaultValues: {
      linkedinUrl: "",
      position: "LAWYER" satisfies LawyerPosition,
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

  const onSubmit = async (data: LawyerForm) => {
    setIsLoading(true)
    setError("")

    try {
      const requestBody = {
        ...data,
        linkedinUrl: data.linkedinUrl?.trim() || undefined,
        position: data.position,
        translations: translations,
      }

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

      await response.json()
      router.push("/admin/lawyers")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminFormShell title="New lawyer" subtitle="Create a multilingual profile for the team directory.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AdminFormSection
          title="Multilingual content"
          description="Turkish and English fields for name, bio, practice areas, and contact."
        >
          <MultilingualForm translations={translations} onTranslationsChange={setTranslations} />
        </AdminFormSection>

        <AdminFormSection title="Profile photo" description="Square image recommended; used on the website team page.">
          <ImageUpload
            value={watch("image")}
            onChange={(url, publicId) => {
              setValue("image", url)
              setValue("imagePublicId", publicId || "")
            }}
            folder="lawyers"
            className="w-full"
          />
        </AdminFormSection>

        <AdminFormSection title="LinkedIn" description="Optional public profile URL.">
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              {...register("linkedinUrl")}
              placeholder="https://www.linkedin.com/in/..."
              autoComplete="off"
            />
            {errors.linkedinUrl && (
              <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>
            )}
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Pozisyon"
          description="Ortak, kurucu ortak, danışman, avukat veya stajyer avukat (tek seçim)."
        >
          <div className="space-y-2">
            <Label htmlFor="position">Rol</Label>
            <Select
              value={watch("position")}
              onValueChange={(v) => setValue("position", v as LawyerPosition)}
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
            {errors.position && (
              <p className="text-xs text-destructive">{errors.position.message}</p>
            )}
          </div>
        </AdminFormSection>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </form>
    </AdminFormShell>
  )
}
