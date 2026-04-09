'use client'

import React, { useState } from 'react'
import { getLanguageName, localizedFieldBracket, pickByLanguage } from '@/lib/i18n'
import { Language } from '@prisma/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface AnnouncementTranslation {
  language: Language
  title?: string
  excerpt?: string
  content?: string
}

interface AnnouncementMultilingualFormProps {
  translations: AnnouncementTranslation[]
  onTranslationsChange: (translations: AnnouncementTranslation[]) => void
}

export function AnnouncementMultilingualForm({ 
  translations, 
  onTranslationsChange 
}: AnnouncementMultilingualFormProps) {
  const [activeTab, setActiveTab] = useState<string>(Language.TR)

  // Ensure Turkish translation exists by default
  React.useEffect(() => {
    const hasTurkish = translations.some(t => t.language === Language.TR)
    if (!hasTurkish) {
      onTranslationsChange([
        {
          language: Language.TR,
          title: '',
          excerpt: '',
          content: ''
        },
        ...translations
      ])
    }
  }, [translations, onTranslationsChange])

  const getTranslation = (language: Language): AnnouncementTranslation => {
    return translations.find(t => t.language === language) || {
      language,
      title: '',
      excerpt: '',
      content: ''
    }
  }

  const updateTranslation = (language: Language, field: keyof Omit<AnnouncementTranslation, 'language'>, value: string) => {
    const existingTranslation = translations.find(t => t.language === language)
    
    if (existingTranslation) {
      // Update existing translation
      const updatedTranslations = translations.map(t => 
        t.language === language 
          ? { ...t, [field]: value }
          : t
      )
      onTranslationsChange(updatedTranslations)
    } else {
      // Add new translation
      const newTranslation: AnnouncementTranslation = {
        language,
        title: '',
        excerpt: '',
        content: '',
        [field]: value
      }
      onTranslationsChange([...translations, newTranslation])
    }
  }

  const addTranslation = (language: Language) => {
    const exists = translations.find(t => t.language === language)
    if (!exists) {
      const newTranslation: AnnouncementTranslation = {
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
                      onChange={(e) => updateTranslation(language, 'title', e.target.value)}
                      placeholder={pickByLanguage(
                        language,
                        'Duyuru başlığını girin...',
                        'Enter announcement title...',
                        'Введите заголовок объявления...'
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
                      onChange={(e) => updateTranslation(language, 'excerpt', e.target.value)}
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
                      onChange={(content) => updateTranslation(language, 'content', content)}
                      placeholder={pickByLanguage(
                        language,
                        'Duyuru içeriğini yazın...',
                        'Write announcement content...',
                        'Текст объявления...'
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
