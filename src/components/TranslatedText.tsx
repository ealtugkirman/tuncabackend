"use client"

import { useLanguage } from '@/contexts/LanguageContext'

interface TranslatedTextProps {
  translationKey: string
  params?: Record<string, string | number>
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function TranslatedText({ 
  translationKey, 
  params, 
  className = '',
  as: Component = 'span'
}: TranslatedTextProps) {
  const { t } = useLanguage()
  
  return (
    <Component className={className}>
      {t(translationKey, params)}
    </Component>
  )
}
