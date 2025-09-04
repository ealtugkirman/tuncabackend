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
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

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

interface EventTranslation {
  language: Language
  title?: string
  excerpt?: string
  content?: string
}

interface EventMultilingualFormProps {
  translations: EventTranslation[]
  onTranslationsChange: (translations: EventTranslation[]) => void
}

export function EventMultilingualForm({ 
  translations, 
  onTranslationsChange 
}: EventMultilingualFormProps) {
  const [activeTab, setActiveTab] = useState<string>(Language.TR)

  const getTranslation = (language: Language): EventTranslation => {
    return translations.find(t => t.language === language) || {
      language,
      title: '',
      excerpt: '',
      content: ''
    }
  }

  const updateTranslation = (language: Language, field: keyof Omit<EventTranslation, 'language'>, value: string) => {
    const updatedTranslations = translations.map(t => 
      t.language === language 
        ? { ...t, [field]: value }
        : t
    )

    // If translation doesn't exist, add it
    if (!translations.find(t => t.language === language)) {
      updatedTranslations.push({
        language,
        [field]: value,
        title: '',
        excerpt: '',
        content: ''
      })
    }

    onTranslationsChange(updatedTranslations)
  }

  const addTranslation = (language: Language) => {
    const exists = translations.find(t => t.language === language)
    if (!exists) {
      const newTranslation: EventTranslation = {
        language,
        title: '',
        excerpt: '',
        content: ''
      }
      onTranslationsChange([...translations, newTranslation])
    }
  }

  const removeTranslation = (language: Language) => {
    onTranslationsChange(translations.filter(t => t.language !== language))
  }

  const availableLanguages = [Language.TR, Language.EN]
  const existingLanguages = translations.map(t => t.language)

  return (
    <div className="space-y-4">
      {/* Language Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {availableLanguages.map((language) => {
            const exists = existingLanguages.includes(language)
            return (
              <TabsTrigger 
                key={language} 
                value={language}
                className="flex items-center space-x-2"
              >
                <span>{getLanguageName(language)}</span>
                {exists && <span className="text-green-500">✓</span>}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {availableLanguages.map((language) => {
          const translation = getTranslation(language)
          const exists = existingLanguages.includes(language)

          return (
            <TabsContent key={language} value={language} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {getLanguageName(language)} İçerik
                </h3>
                <div className="flex space-x-2">
                  {!exists && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTranslation(language)}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ekle</span>
                    </Button>
                  )}
                  {exists && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTranslation(language)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Kaldır</span>
                    </Button>
                  )}
                </div>
              </div>

              {exists && (
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`title-${language}`}>
                      Başlık {language === Language.TR ? '(Türkçe)' : '(İngilizce)'}
                    </Label>
                    <Input
                      id={`title-${language}`}
                      value={translation.title || ''}
                      onChange={(e) => updateTranslation(language, 'title', e.target.value)}
                      placeholder={language === Language.TR ? 'Etkinlik başlığını girin...' : 'Enter event title...'}
                      className="w-full"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label htmlFor={`excerpt-${language}`}>
                      Özet {language === Language.TR ? '(Türkçe)' : '(İngilizce)'}
                    </Label>
                    <Textarea
                      id={`excerpt-${language}`}
                      value={translation.excerpt || ''}
                      onChange={(e) => updateTranslation(language, 'excerpt', e.target.value)}
                      placeholder={language === Language.TR ? 'Kısa açıklama girin...' : 'Enter short description...'}
                      rows={3}
                      className="w-full"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor={`content-${language}`}>
                      İçerik {language === Language.TR ? '(Türkçe)' : '(İngilizce)'}
                    </Label>
                    <RichTextEditor
                      content={translation.content || ''}
                      onChange={(content) => updateTranslation(language, 'content', content)}
                      placeholder={language === Language.TR ? 'Etkinlik içeriğini yazın...' : 'Write event content...'}
                    />
                  </div>
                </div>
              )}

              {!exists && (
                <div className="text-center py-8 text-gray-500">
                  <p>Bu dil için henüz içerik eklenmemiş.</p>
                  <p className="text-sm">Yukarıdaki "Ekle" butonuna tıklayarak içerik ekleyebilirsiniz.</p>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Çeviri Durumu:</h4>
        <div className="flex space-x-4 text-sm">
          {availableLanguages.map((language) => {
            const exists = existingLanguages.includes(language)
            return (
              <div key={language} className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${exists ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>{getLanguageName(language)}: {exists ? 'Mevcut' : 'Yok'}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
