'use client'

import { useState } from 'react'
import { getLanguageName } from '@/lib/i18n'
import { Language } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

const PRACTICE_AREAS_TR = [
  "Birleşme ve Devralmalar",
  "Bankacılık ve Finans Hukuku",
  "Uluslararası Ticaret Hukuku",
  "Sağlık ve İlaç Hukuku",
  "Dava Takibi ve Tahkim",
  "Enerji Hukuku",
  "Kamu İhale Hukuku",
  "İş Hukuku",
  "Maden ve Petrol Hukuku",
  "Vergi Hukuku",
  "Gayrimenkul ve İnşaat Hukuku",
  "Şirketler Hukuku",
  "Spor Hukuku",
  "Fikri Mülkiyet Hukuku",
  "Rekabet Hukuku"
]

const PRACTICE_AREAS_EN = [
  "Corporate Law & Mergers, Acquisitions and Spin-offs",
  "Banking and Finance Law",
  "International Commercial Law & Arbitration",
  "Health and Pharmaceutical Law",
  "International Commercial Arbitration & Investment Arbitration",
  "Energy and Mining Law",
  "Public Procurement Law",
  "Labor and Social Security Law",
  "Tax Law",
  "Construction and Zoning Law",
  "Sports Law",
  "Intellectual and Industrial Property Law",
  "Competition Law"
]

interface Translation {
  language: Language
  name?: string
  bio?: string
  education?: string
  languages?: string
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
  className = '' 
}: MultilingualFormProps) {
  const [activeLanguage, setActiveLanguage] = useState<Language>(Language.TR)
  const languages: Language[] = [Language.TR, Language.EN]

  const updateTranslation = (language: Language, field: keyof Omit<Translation, 'language'>, value: string | string[]) => {
    const updatedTranslations = translations.map(translation => 
      translation.language === language 
        ? { ...translation, [field]: value }
        : translation
    )
    onTranslationsChange(updatedTranslations)
  }

  const getTranslation = (language: Language): Translation => {
    return translations.find(t => t.language === language) || {
      language,
      name: '',
      bio: '',
      education: '',
      languages: '',
      practiceAreas: [],
      bar: '',
      phone: '',
      email: ''
    }
  }

  const addTranslation = (language: Language) => {
    if (!translations.find(t => t.language === language)) {
      onTranslationsChange([
        ...translations,
        {
          language,
          name: '',
          bio: '',
          education: '',
          languages: '',
          practiceAreas: [],
          bar: '',
          phone: '',
          email: ''
        }
      ])
    }
    setActiveLanguage(language)
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Çok Dilli İçerik</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as Language)}>
            <TabsList className="grid w-full grid-cols-2">
              {languages.map((language) => (
                <TabsTrigger 
                  key={language} 
                  value={language}
                  onClick={() => addTranslation(language)}
                >
                  {getLanguageName(language)}
                </TabsTrigger>
              ))}
            </TabsList>

            {languages.map((language) => {
              const translation = getTranslation(language)
              return (
                <TabsContent key={language} value={language} className="space-y-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <Label htmlFor={`name-${language}`}>
                      Ad Soyad *
                    </Label>
                    <Input
                      id={`name-${language}`}
                      value={translation.name || ''}
                      onChange={(e) => updateTranslation(language, 'name', e.target.value)}
                      placeholder={language === Language.TR ? "Türkçe ad soyad girin" : "Enter name in English"}
                    />
                  </div>

                  {/* Bio field */}
                  <div className="space-y-2">
                    <Label htmlFor={`bio-${language}`}>
                      Biyografi
                    </Label>
                    <Textarea
                      id={`bio-${language}`}
                      value={translation.bio || ''}
                      onChange={(e) => updateTranslation(language, 'bio', e.target.value)}
                      placeholder={language === Language.TR ? "Türkçe biyografi girin" : "Enter bio in English"}
                      rows={4}
                    />
                  </div>

                  {/* Education field */}
                  <div className="space-y-2">
                    <Label htmlFor={`education-${language}`}>
                      Eğitim
                    </Label>
                    <Textarea
                      id={`education-${language}`}
                      value={translation.education || ''}
                      onChange={(e) => updateTranslation(language, 'education', e.target.value)}
                      placeholder={language === Language.TR ? "Türkçe eğitim bilgileri girin" : "Enter education in English"}
                      rows={4}
                    />
                  </div>

                  {/* Languages field */}
                  <div className="space-y-2">
                    <Label htmlFor={`languages-${language}`}>
                      Yabancı Dil
                    </Label>
                    <Input
                      id={`languages-${language}`}
                      value={translation.languages || ''}
                      onChange={(e) => updateTranslation(language, 'languages', e.target.value)}
                      placeholder={language === Language.TR ? "Türkçe dil bilgileri girin" : "Enter languages in English"}
                    />
                  </div>

                  {/* Practice Areas field */}
                  <div className="space-y-2">
                    <Label>Çalışma Alanları</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                      {(language === Language.TR ? PRACTICE_AREAS_TR : PRACTICE_AREAS_EN).map((area) => (
                        <label key={area} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={translation.practiceAreas?.includes(area) || false}
                            onChange={(e) => {
                              const currentAreas = translation.practiceAreas || []
                              const newAreas = e.target.checked 
                                ? [...currentAreas, area]
                                : currentAreas.filter(a => a !== area)
                              updateTranslation(language, 'practiceAreas', newAreas)
                            }}
                            className="w-3 h-3"
                          />
                          <span>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Bar field */}
                  <div className="space-y-2">
                    <Label htmlFor={`bar-${language}`}>
                      Baro Kaydı
                    </Label>
                    <Input
                      id={`bar-${language}`}
                      value={translation.bar || ''}
                      onChange={(e) => updateTranslation(language, 'bar', e.target.value)}
                      placeholder={language === Language.TR ? "Türkçe baro bilgisi girin" : "Enter bar registration in English"}
                    />
                  </div>

                  {/* Contact fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${language}`}>
                        Telefon
                      </Label>
                      <Input
                        id={`phone-${language}`}
                        value={translation.phone || ''}
                        onChange={(e) => updateTranslation(language, 'phone', e.target.value)}
                        placeholder={language === Language.TR ? "Türkçe telefon girin" : "Enter phone in English"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`email-${language}`}>
                        E-posta
                      </Label>
                      <Input
                        id={`email-${language}`}
                        type="email"
                        value={translation.email || ''}
                        onChange={(e) => updateTranslation(language, 'email', e.target.value)}
                        placeholder={language === Language.TR ? "Türkçe e-posta girin" : "Enter email in English"}
                      />
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}