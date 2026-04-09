'use client'

import { useState } from 'react'
import {
  ANNOUNCEMENT_PRACTICE_AREAS,
  getAnnouncementPracticeAreaLabel,
} from '@/lib/announcement-practice-areas'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

export type LawyerOption = { id: string; name?: string }

interface PublicationLawyerPracticeFieldsProps {
  lawyers: LawyerOption[]
  lawyerIds: string[]
  onLawyerIdsChange: (ids: string[]) => void
  practiceAreaSlugs: string[]
  onPracticeAreaSlugsChange: (slugs: string[]) => void
}

export function PublicationLawyerPracticeFields({
  lawyers,
  lawyerIds,
  onLawyerIdsChange,
  practiceAreaSlugs,
  onPracticeAreaSlugsChange,
}: PublicationLawyerPracticeFieldsProps) {
  const [areaPickerKey, setAreaPickerKey] = useState(0)

  const sortedLawyers = [...lawyers].sort((a, b) =>
    (a.name ?? a.id).localeCompare(b.name ?? b.id, 'tr')
  )

  const toggleLawyer = (id: string) => {
    if (lawyerIds.includes(id)) {
      onLawyerIdsChange(lawyerIds.filter((x) => x !== id))
    } else {
      onLawyerIdsChange([...lawyerIds, id])
    }
  }

  const availableAreas = ANNOUNCEMENT_PRACTICE_AREAS.filter(
    (a) => !practiceAreaSlugs.includes(a.slug)
  )

  const addAreaFromSelect = (slug: string) => {
    if (practiceAreaSlugs.includes(slug)) return
    onPracticeAreaSlugsChange([...practiceAreaSlugs, slug])
    setAreaPickerKey((k) => k + 1)
  }

  const removeArea = (slug: string) => {
    onPracticeAreaSlugsChange(practiceAreaSlugs.filter((s) => s !== slug))
  }

  const moveArea = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= practiceAreaSlugs.length) return
    const copy = [...practiceAreaSlugs]
    const t = copy[index]!
    copy[index] = copy[next]!
    copy[next] = t
    onPracticeAreaSlugsChange(copy)
  }

  return (
    <div className="space-y-6 lg:col-span-2">
      <div className="space-y-2">
        <Label>İlişkili avukatlar</Label>
        <p className="text-xs text-muted-foreground">
          Birden fazla avukat işaretleyebilirsiniz.
        </p>
        <div className="max-h-56 overflow-y-auto rounded-md border border-border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sortedLawyers.map((l) => {
              const checked = lawyerIds.includes(l.id)
              return (
                <label
                  key={l.id}
                  className="flex cursor-pointer items-center gap-2 rounded border border-border px-2 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLawyer(l.id)}
                    className="h-4 w-4 shrink-0 rounded border-border"
                  />
                  <span className="min-w-0 truncate">{l.name ?? l.id}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Çalışma alanları (sıralı)</Label>
        <p className="text-xs text-muted-foreground">
          Menüden ekleyin; sırayı yukarı / aşağı ile değiştirin.
        </p>

        <Select
          key={areaPickerKey}
          disabled={availableAreas.length === 0}
          onValueChange={addAreaFromSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                availableAreas.length === 0
                  ? 'Tüm alanlar eklendi'
                  : 'Çalışma alanı ekleyin…'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableAreas.map((area) => (
              <SelectItem key={area.slug} value={area.slug}>
                {area.tr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {practiceAreaSlugs.length > 0 && (
          <ul className="divide-y rounded-md border border-border">
            {practiceAreaSlugs.map((slug, index) => (
              <li
                key={slug}
                className="flex items-center gap-2 px-2 py-2 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  {getAnnouncementPracticeAreaLabel(slug, 'tr')}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => moveArea(index, -1)}
                    aria-label="Yukarı taşı"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === practiceAreaSlugs.length - 1}
                    onClick={() => moveArea(index, 1)}
                    aria-label="Aşağı taşı"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeArea(slug)}
                    aria-label="Kaldır"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
