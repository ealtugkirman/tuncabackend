'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AnnouncementMultilingualForm } from '@/components/admin/AnnouncementMultilingualForm'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { AdminFormSection } from '@/components/admin/AdminFormSection'
import { Language } from '@prisma/client'
import {
  ANNOUNCEMENT_PRACTICE_AREAS,
  isValidAnnouncementPracticeAreaSlug,
} from '@/lib/announcement-practice-areas'

const announcementSchema = z.object({
  date: z.string().min(1, 'Tarih gereklidir'),
  practiceAreaSlug: z
    .string()
    .min(1, 'Çalışma alanı seçiniz')
    .refine(isValidAnnouncementPracticeAreaSlug, 'Geçersiz çalışma alanı'),
  lawyerId: z.string().optional(),
  image: z.string().optional(),
  isDark: z.boolean().default(false),
  published: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  translations: z.array(z.any()).optional(),
})

type AnnouncementForm = z.infer<typeof announcementSchema>

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lawyerOptions, setLawyerOptions] = useState<{ id: string; name: string }[]>([])
  const [translations, setTranslations] = useState<
    Array<{
      language: Language
      title?: string
      excerpt?: string
      content?: string
    }>
  >([
    {
      language: Language.TR,
      title: '',
      excerpt: '',
      content: '',
    },
  ])

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
      practiceAreaSlug: '',
      lawyerId: '',
      language: Language.TR,
      translations: [
        {
          language: Language.TR,
          title: '',
          excerpt: '',
          content: '',
        },
      ],
    },
  })

  useEffect(() => {
    setValue('translations', translations)
  }, [translations, setValue])

  useEffect(() => {
    let cancelled = false
    fetch('/api/lawyers?language=TR&sortBy=order&sortOrder=asc&limit=2000')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.data) return
        setLawyerOptions(
          json.data.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name }))
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (data: AnnouncementForm) => {
    setIsLoading(true)
    setError('')

    if (!translations || translations.length === 0) {
      setError('En az bir dil için çeviri eklemelisiniz')
      setIsLoading(false)
      return
    }

    const validTranslations = translations.filter(
      (t) =>
        t.title?.trim() &&
        t.excerpt?.trim() &&
        t.content?.trim()
    )

    if (validTranslations.length === 0) {
      setError('Her çeviri için başlık, özet ve içerik doldurulmalıdır.')
      setIsLoading(false)
      return
    }

    const requestBody = {
      ...data,
      lawyerId: data.lawyerId?.trim() || undefined,
      translations: validTranslations,
    }

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Duyuru oluşturulamadı')
      }

      await response.json()
      router.push('/admin/announcements')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminFormShell title="New announcement" subtitle="Schedule date, visuals, and bilingual copy.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AdminFormSection title="Content" description="Turkish / English tabs for title, excerpt, and body.">
          <AnnouncementMultilingualForm translations={translations} onTranslationsChange={setTranslations} />
        </AdminFormSection>

        <AdminFormSection title="Details" description="Date, cover image, and publish options.">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="practiceAreaSlug">Çalışma alanı *</Label>
              <select
                id="practiceAreaSlug"
                {...register('practiceAreaSlug')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Seçiniz</option>
                {ANNOUNCEMENT_PRACTICE_AREAS.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.tr}
                  </option>
                ))}
              </select>
              {errors.practiceAreaSlug && (
                <p className="text-xs text-destructive">{errors.practiceAreaSlug.message}</p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="lawyerId">İletişim (duyuru ile ilişkili avukat)</Label>
              <select
                id="lawyerId"
                {...register('lawyerId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Seçmeyin</option>
                {lawyerOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Seçilen avukat, duyuru sayfasında sağda İletişim bölümünde görünür.
              </p>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Cover image</Label>
              <ImageUpload
                value={watch('image')}
                onChange={(url) => setValue('image', url)}
                folder="announcements"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-4 lg:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={watch('published')}
                  onCheckedChange={(c) => setValue('published', c === true)}
                />
                <span>Published</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={watch('isDark')}
                  onCheckedChange={(c) => setValue('isDark', c === true)}
                />
                <span>Dark theme on public card</span>
              </label>
            </div>
          </div>
        </AdminFormSection>

        {error && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
