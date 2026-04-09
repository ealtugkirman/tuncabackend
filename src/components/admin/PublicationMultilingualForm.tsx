'use client'

import { useState } from 'react'
import { getLanguageName, localizedFieldBracket, pickByLanguage } from '@/lib/i18n'
import { Language } from '@prisma/client'
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
  "Uluslararası Ticaret Hukuku ve Sermaye Piyasaları",
  "Sağlık ve İlaç Hukuku",
  "Dava Takibi ve Tahkim",
  "Enerji Hukuku",
  "Kamu İhale Hukuku",
  "İş Hukuku",
  "Maden ve Petrol Hukuku",
  "Vergi Hukuku",
  "Gayrimenkul ve İnşaat Hukuku",
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

interface PublicationTranslation {
  language: Language
  title?: string
  excerpt?: string
  content?: string
}

interface PublicationMultilingualFormProps {
  translations: PublicationTranslation[]
  onTranslationsChange: (translations: PublicationTranslation[]) => void
}

export function PublicationMultilingualForm({ 
  translations, 
  onTranslationsChange 
}: PublicationMultilingualFormProps) {
  const [activeTab, setActiveTab] = useState<string>(Language.TR)

  const getTranslation = (language: Language): PublicationTranslation => {
    return translations.find(t => t.language === language) || {
      language,
      title: '',
      excerpt: '',
      content: ''
    }
  }

  const updateTranslation = (language: Language, field: keyof Omit<PublicationTranslation, 'language'>, value: string) => {
    const existingTranslation = translations.find(t => t.language === language)

    if (existingTranslation) {
      const updatedTranslations = translations.map(t =>
        t.language === language ? { ...t, [field]: value } : t
      )
      onTranslationsChange(updatedTranslations)
    } else {
      const newTranslation: PublicationTranslation = {
        language,
        title: field === 'title' ? value : '',
        excerpt: field === 'excerpt' ? value : '',
        content: field === 'content' ? value : '',
      }
      onTranslationsChange([...translations, newTranslation])
    }
  }

  const addTranslation = (language: Language) => {
    const exists = translations.find(t => t.language === language)
    if (!exists) {
      const newTranslation: PublicationTranslation = {
        language,
        title: '',
        excerpt: '',
        content: '',
      }
      onTranslationsChange([...translations, newTranslation])
    }
  }

  const removeTranslation = (language: Language) => {
    onTranslationsChange(translations.filter(t => t.language !== language))
  }

  const availableLanguages = [Language.TR, Language.EN, Language.RU]
  const existingLanguages = translations.map(t => t.language)

  return (
    <div className="space-y-4">
      {/* Language Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-9 w-full grid-cols-3 bg-muted/50 p-1">
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
                      Başlık {localizedFieldBracket(language)}
                    </Label>
                    <Input
                      id={`title-${language}`}
                      value={translation.title || ''}
                      onChange={(e) => {
                        console.log(`📝 Title onChange: ${language} - value: "${e.target.value}"`)
                        updateTranslation(language, 'title', e.target.value)
                      }}
                      placeholder={pickByLanguage(
                        language,
                        'Yayın başlığını girin...',
                        'Enter publication title...',
                        'Введите заголовок публикации...'
                      )}
                      className="w-full"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label htmlFor={`excerpt-${language}`}>
                      Özet {localizedFieldBracket(language)}
                    </Label>
                    <Textarea
                      id={`excerpt-${language}`}
                      value={translation.excerpt || ''}
                      onChange={(e) => {
                        console.log(`📝 Excerpt onChange: ${language} - value: "${e.target.value}"`)
                        updateTranslation(language, 'excerpt', e.target.value)
                      }}
                      placeholder={pickByLanguage(
                        language,
                        'Kısa açıklama girin...',
                        'Enter short description...',
                        'Краткое описание...'
                      )}
                      rows={3}
                      className="w-full"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor={`content-${language}`}>
                      İçerik {localizedFieldBracket(language)}
                    </Label>
                    <RichTextEditor
                      content={translation.content || ''}
                      onChange={(content) => {
                        console.log(`📝 RichTextEditor onChange: ${language} - content length: ${content.length}`)
                        updateTranslation(language, 'content', content)
                      }}
                      placeholder={pickByLanguage(
                        language,
                        'Yayın içeriğini yazın...',
                        'Write publication content...',
                        'Текст публикации...'
                      )}
                    />
                  </div>
                </div>
              )}

              {!exists && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <p>No content for this language yet.</p>
                  <p className="mt-1">Use Add to create a translation.</p>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
