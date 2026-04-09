'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { Language } from '@prisma/client'
import { PublicationMultilingualForm } from '@/components/admin/PublicationMultilingualForm'
import ImageUpload from '@/components/ImageUpload'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { AdminFormSection } from '@/components/admin/AdminFormSection'
import { PublicationLawyerPracticeFields } from '@/components/admin/PublicationLawyerPracticeFields'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const publicationSchema = z.object({
  date: z.string().min(1, 'Tarih zorunludur'),
  year: z.string().min(1, 'Yıl zorunludur'),
  tags: z.string().optional(),
  published: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  image: z.string().optional(),
  lawyerIds: z.array(z.string()).optional(),
})

type PublicationForm = z.infer<typeof publicationSchema>

type LawyerRow = { id: string; name?: string }

export default function NewPublicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lawyers, setLawyers] = useState<LawyerRow[]>([])
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<string[]>([])
  const [practiceAreaSlugs, setPracticeAreaSlugs] = useState<string[]>([])
  const [imagePublicId, setImagePublicId] = useState('')
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
  } = useForm<PublicationForm>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      published: false,
      lawyerIds: [],
    },
  })

  const image = watch('image')

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await fetch('/api/lawyers?language=TR')
        if (response.ok) {
          const result = await response.json()
          setLawyers(result.data || [])
        }
      } catch {
        /* ignore */
      }
    }
    fetchLawyers()
  }, [])

  const onSubmit = async (data: PublicationForm) => {
    setError('')

    if (!translations || translations.length === 0) {
      setError('En az bir dil için çeviri ekleyin.')
      return
    }

    const hasValidTranslations = translations.every(
      (t) =>
        t.title?.trim() &&
        t.excerpt?.trim() &&
        t.content?.trim()
    )

    if (!hasValidTranslations) {
      setError('Tüm çevirilerde başlık, özet ve içerik dolu olmalıdır.')
      return
    }

    setIsLoading(true)

    const requestBody = {
      ...data,
      translations,
      image,
      imagePublicId,
      lawyerIds: selectedLawyerIds,
      practiceAreaSlugs,
    }

    try {
      const response = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Yayın oluşturulamadı')
      }

      await response.json()
      router.push('/admin/publications')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminFormShell title="New publication" subtitle="Scholarly or news items with linked authors.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AdminFormSection title="Content" description="Bilingual title, excerpt, and body.">
          <PublicationMultilingualForm translations={translations} onTranslationsChange={setTranslations} />
        </AdminFormSection>

        <AdminFormSection title="Metadata">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label>Cover image</Label>
              <ImageUpload
                value={image || ''}
                onChange={(url, publicId) => {
                  setValue('image', url)
                  setImagePublicId(publicId || '')
                }}
                folder="publications"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                min={2020}
                max={2030}
                placeholder="2024"
                {...register('year')}
              />
              {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" {...register('tags')} placeholder="ör. tahkim, ticaret" />
            </div>

            <PublicationLawyerPracticeFields
              lawyers={lawyers}
              lawyerIds={selectedLawyerIds}
              onLawyerIdsChange={setSelectedLawyerIds}
              practiceAreaSlugs={practiceAreaSlugs}
              onPracticeAreaSlugsChange={setPracticeAreaSlugs}
            />

            <div className="flex items-center gap-2 lg:col-span-2">
              <input
                {...register('published')}
                type="checkbox"
                id="published"
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="published" className="font-normal">
                Published
              </Label>
            </div>
          </div>
        </AdminFormSection>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
