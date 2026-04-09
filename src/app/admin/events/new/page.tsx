'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { EventMultilingualForm } from '@/components/admin/EventMultilingualForm'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { AdminFormSection } from '@/components/admin/AdminFormSection'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Language } from '@prisma/client'

const eventSchema = z.object({
  date: z.string().min(1, 'Tarih gereklidir'),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  eventType: z.string().min(1, 'Etkinlik türü gereklidir'),
  published: z.boolean().default(false),
  language: z.nativeEnum(Language).default(Language.TR),
  translations: z
    .array(
      z.object({
        language: z.nativeEnum(Language),
        title: z.string().min(1, 'Başlık gereklidir'),
        excerpt: z.string().min(1, 'Özet gereklidir'),
        content: z.string().min(1, 'İçerik gereklidir'),
      })
    )
    .optional(),
})

type EventForm = z.infer<typeof eventSchema>

export default function NewEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
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
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      published: false,
      language: Language.TR,
      translations: [],
    },
  })

  const onSubmit = async (data: EventForm) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          gallery: galleryImages,
          translations: translations,
        }),
      })

      if (!response.ok) {
        throw new Error('Etkinlik oluşturulamadı')
      }

      await response.json()
      router.push('/admin/events')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminFormShell title="New event" subtitle="Bilingual program copy, media, and schedule.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AdminFormSection title="Content" description="Add TR/EN translations before publishing.">
          <EventMultilingualForm translations={translations} onTranslationsChange={setTranslations} />
        </AdminFormSection>

        <AdminFormSection title="Schedule & media">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event type *</Label>
              <select
                id="eventType"
                {...register('eventType')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select</option>
                <option value="Sürdürülebilirlik">Sürdürülebilirlik</option>
                <option value="Hukuk Semineri">Hukuk Semineri</option>
                <option value="Konferans">Konferans</option>
                <option value="Workshop">Workshop</option>
                <option value="Diğer">Diğer</option>
              </select>
              {errors.eventType && (
                <p className="text-xs text-destructive">{errors.eventType.message}</p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Cover image</Label>
              <ImageUpload
                value={watch('image')}
                onChange={(url) => setValue('image', url)}
                folder="events"
                className="w-full"
              />
            </div>

            <div className="space-y-3 lg:col-span-2">
              <Label>Gallery (optional)</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {galleryImages.map((imageUrl, index) => (
                  <div key={imageUrl} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-24 w-full rounded-md border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <ImageUpload
                value=""
                onChange={(url) => {
                  if (url && !galleryImages.includes(url)) {
                    setGalleryImages([...galleryImages, url])
                  }
                }}
                folder="events/gallery"
                className="w-full"
              />
              {galleryImages.length > 0 && (
                <p className="text-xs text-muted-foreground">{galleryImages.length} images</p>
              )}
            </div>

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
