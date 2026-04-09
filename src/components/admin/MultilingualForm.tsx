'use client'

import { useState } from 'react'
import { getLanguageName, pickByLanguage } from '@/lib/i18n'
import { Language } from '@prisma/client'
import { X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ALL_LAWYER_PRACTICE_AREAS,
  getLawyerPracticeAreaLabel,
} from '@/lib/lawyer-practice-areas'

function sortPracticeAreasByLabel(slugs: string[], loc: 'tr' | 'en' | 'ru'): string[] {
  const locale = loc === 'tr' ? 'tr' : loc === 'ru' ? 'ru' : 'en'
  return [...slugs].sort((a, b) =>
    getLawyerPracticeAreaLabel(a, loc).localeCompare(
      getLawyerPracticeAreaLabel(b, loc),
      locale,
      { sensitivity: 'base' }
    )
  )
}

function sortedPracticeAreaOptionsForLocale(loc: 'tr' | 'en' | 'ru') {
  const locale = loc === 'tr' ? 'tr' : loc === 'ru' ? 'ru' : 'en'
  return [...ALL_LAWYER_PRACTICE_AREAS].sort((a, b) =>
    getLawyerPracticeAreaLabel(a.slug, loc).localeCompare(
      getLawyerPracticeAreaLabel(b.slug, loc),
      locale,
      { sensitivity: 'base' }
    )
  )
}

interface Translation {
  language: Language
  name?: string
  bio?: string
  education?: string
  languages?: string
  /** Kanonik slug listesi (duyurular + TMT ile aynı id’ler); TR/EN çevirilerde aynı dizi */
  practiceAreas?: string[]
  bar?: string
  phone?: string
  email?: string
}

interface MultilingualFormProps {
  translations: Translation[]
  onTranslationsChange: (translations: Translation[]) => void
  className?: string
}

export function MultilingualForm({
  translations,
  onTranslationsChange,
  className = '',
}: MultilingualFormProps) {
  const [activeLanguage, setActiveLanguage] = useState<Language>(Language.TR)
  const [practiceAreaDropdownKey, setPracticeAreaDropdownKey] = useState(0)
  const languages: Language[] = [Language.TR, Language.EN, Language.RU]

  const updateTranslation = (
    language: Language,
    field: keyof Omit<Translation, 'language'>,
    value: string | string[]
  ) => {
    if (field === 'practiceAreas' && Array.isArray(value)) {
      onTranslationsChange(translations.map((t) => ({ ...t, practiceAreas: value })))
      return
    }

    onTranslationsChange(
      translations.map((translation) =>
        translation.language === language ? { ...translation, [field]: value } : translation
      )
    )
  }

  const getTranslation = (language: Language): Translation => {
    return (
      translations.find((t) => t.language === language) || {
        language,
        name: '',
        bio: '',
        education: '',
        languages: '',
        practiceAreas: [],
        bar: '',
        phone: '',
        email: '',
      }
    )
  }

  const addTranslation = (language: Language) => {
    if (!translations.find((t) => t.language === language)) {
      const baseAreas = translations[0]?.practiceAreas || []
      onTranslationsChange([
        ...translations,
        {
          language,
          name: '',
          bio: '',
          education: '',
          languages: '',
          practiceAreas: [...baseAreas],
          bar: '',
          phone: '',
          email: '',
        },
      ])
    }
    setActiveLanguage(language)
  }

  const practiceAreaLocale = (lang: Language): 'tr' | 'en' | 'ru' =>
    lang === Language.TR ? 'tr' : lang === Language.RU ? 'ru' : 'en'

  return (
    <div className={className}>
      <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as Language)}>
        <TabsList className="grid h-9 w-full grid-cols-3 bg-muted/50 p-1">
          {languages.map((language) => (
            <TabsTrigger
              key={language}
              value={language}
              onClick={() => addTranslation(language)}
              className="text-xs sm:text-sm"
            >
              {getLanguageName(language)}
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map((language) => {
          const translation = getTranslation(language)
          const loc = practiceAreaLocale(language)
          return (
            <TabsContent key={language} value={language} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={`name-${language}`}>Ad Soyad *</Label>
                <Input
                  id={`name-${language}`}
                  value={translation.name || ''}
                  onChange={(e) => updateTranslation(language, 'name', e.target.value)}
                  placeholder={pickByLanguage(
                    language,
                    'Türkçe ad soyad girin',
                    'Enter name in English',
                    'Введите ФИО на русском'
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`bio-${language}`}>Biyografi</Label>
                <Textarea
                  id={`bio-${language}`}
                  value={translation.bio || ''}
                  onChange={(e) => updateTranslation(language, 'bio', e.target.value)}
                  placeholder={pickByLanguage(
                    language,
                    'Türkçe biyografi girin',
                    'Enter bio in English',
                    'Введите биографию на русском'
                  )}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`education-${language}`}>Eğitim</Label>
                <Textarea
                  id={`education-${language}`}
                  value={translation.education || ''}
                  onChange={(e) => updateTranslation(language, 'education', e.target.value)}
                  placeholder={pickByLanguage(
                    language,
                    'Türkçe eğitim bilgileri girin',
                    'Enter education in English',
                    'Введите образование на русском'
                  )}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`languages-${language}`}>Yabancı Dil</Label>
                <Input
                  id={`languages-${language}`}
                  value={translation.languages || ''}
                  onChange={(e) => updateTranslation(language, 'languages', e.target.value)}
                  placeholder={pickByLanguage(
                    language,
                    'Türkçe dil bilgileri girin',
                    'Enter languages in English',
                    'Укажите языки на русском'
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Çalışma alanları</Label>
                <p className="text-xs text-muted-foreground">
                  {pickByLanguage(
                    language,
                    'Açılır listeden ekleyin; seçilenler alfabetik sıralı. TR, EN ve RU aynı alan kümesini paylaşır.',
                    'Add from the dropdown; selected items are sorted alphabetically. TR, EN and RU share the same set.',
                    'Добавляйте из списка; выбранные сортируются по алфавиту. TR, EN и RU используют один набор областей.'
                  )}
                </p>
                {(() => {
                  const selected = translation.practiceAreas || []
                  const selectedSorted = sortPracticeAreasByLabel(selected, loc)
                  const options = sortedPracticeAreaOptionsForLocale(loc)
                  const available = options.filter((a) => !selected.includes(a.slug))
                  return (
                    <div className="space-y-3 rounded-lg border border-border p-3">
                      {selectedSorted.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                          {selectedSorted.map((slug) => (
                            <li
                              key={slug}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-sm"
                            >
                              <span>{getLawyerPracticeAreaLabel(slug, loc)}</span>
                              <button
                                type="button"
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label={pickByLanguage(
                                  language,
                                  'Alanı kaldır',
                                  'Remove area',
                                  'Удалить область'
                                )}
                                onClick={() =>
                                  updateTranslation(
                                    language,
                                    'practiceAreas',
                                    selected.filter((s) => s !== slug)
                                  )
                                }
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Select
                        key={`${language}-${practiceAreaDropdownKey}-${selected.length}`}
                        onValueChange={(slug) => {
                          if (!slug || selected.includes(slug)) return
                          updateTranslation(language, 'practiceAreas', [...selected, slug])
                          setPracticeAreaDropdownKey((k) => k + 1)
                        }}
                        disabled={available.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              language === Language.TR
                                ? available.length === 0
                                  ? 'Tüm alanlar seçili'
                                  : 'Alan eklemek için seçin…'
                                : language === Language.RU
                                  ? available.length === 0
                                    ? 'Все области выбраны'
                                    : 'Выберите область…'
                                  : available.length === 0
                                    ? 'All areas selected'
                                    : 'Choose an area to add…'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-72">
                          {available.map((area) => (
                            <SelectItem key={area.slug} value={area.slug}>
                              {getLawyerPracticeAreaLabel(area.slug, loc)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })()}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`bar-${language}`}>Baro Kaydı</Label>
                <Input
                  id={`bar-${language}`}
                  value={translation.bar || ''}
                  onChange={(e) => updateTranslation(language, 'bar', e.target.value)}
                  placeholder={pickByLanguage(
                    language,
                    'Türkçe baro bilgisi girin',
                    'Enter bar registration in English',
                    'Введите данные о членстве в коллегии'
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`phone-${language}`}>Telefon</Label>
                  <Input
                    id={`phone-${language}`}
                    value={translation.phone || ''}
                    onChange={(e) => updateTranslation(language, 'phone', e.target.value)}
                    placeholder={pickByLanguage(
                      language,
                      'Türkçe telefon girin',
                      'Enter phone in English',
                      'Введите телефон'
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${language}`}>E-posta</Label>
                  <Input
                    id={`email-${language}`}
                    type="email"
                    value={translation.email || ''}
                    onChange={(e) => updateTranslation(language, 'email', e.target.value)}
                    placeholder={pickByLanguage(
                      language,
                      'Türkçe e-posta girin',
                      'Enter email in English',
                      'Введите e-mail'
                    )}
                  />
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
