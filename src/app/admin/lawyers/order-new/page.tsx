"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SimpleLawyerOrder } from '@/components/admin/SimpleLawyerOrder'
import { useLanguage } from '@/contexts/LanguageContext'

interface Lawyer {
  id: string
  name: string
  title: string
  image?: string
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  isConsultant?: boolean
  isLawyer?: boolean
  order: number
  translations: Array<{
    language: string
    name: string
    title: string
  }>
}

export default function LawyerOrderNewPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLawyers = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      console.log('🔄 Fetching lawyers...')
      const response = await fetch(`/api/lawyers?language=${locale.toUpperCase()}&sortBy=order&sortOrder=asc`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch lawyers')
      }
      
      const data = await response.json()
      console.log('📥 Lawyers fetched:', data)
      
      // Transform data to include translation info
      const transformedLawyers = data.data.map((lawyer: any) => {
        // API already provides name at root level, but we can also check translations
        const translation = lawyer.translations?.find((t: any) => t.language === locale.toUpperCase())
        return {
          id: lawyer.id,
          name: lawyer.name || translation?.name || 'Unknown',
          title: lawyer.title || translation?.title || '',
          image: lawyer.image,
          isPartner: lawyer.isPartner,
          isFounder: lawyer.isFounder,
          isIntern: lawyer.isIntern,
          isConsultant: lawyer.isConsultant ?? false,
          isLawyer: lawyer.isLawyer ?? true,
          order: lawyer.order || 0,
          translations: lawyer.translations || []
        }
      })
      
      console.log('🔄 Transformed lawyers:', transformedLawyers)
      setLawyers(transformedLawyers)
    } catch (err) {
      console.error('❌ Error fetching lawyers:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLawyers()
  }, [locale])

  const handleSave = async (updatedLawyers: Lawyer[]) => {
    console.log('🔄 handleSave called with:', updatedLawyers)
    console.log('🔍 Checking order values:', updatedLawyers.map(l => ({ id: l.id, name: l.name, order: l.order })))
    
    try {
      setError('')
      
      const payload = {
        lawyers: updatedLawyers.map(lawyer => ({
          id: lawyer.id,
          order: lawyer.order
        }))
      }
      
      console.log('📤 Sending payload:', payload)
      
      const response = await fetch('/api/lawyers/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to save order')
      }

      const result = await response.json()
      console.log('✅ API Success:', result)
      
      // Refresh the list to get updated data
      await fetchLawyers()
      
    } catch (err) {
      console.error('❌ handleSave error:', err)
      throw err // Re-throw to let SimpleLawyerOrder handle the error display
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Avukat Sıralaması
              </h1>
              <p className="text-muted-foreground">
                Avukat sıralamasını yönetin
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lawyer Order Manager */}
        {lawyers.length > 0 ? (
          <SimpleLawyerOrder
            lawyers={lawyers}
            onSave={handleSave}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Avukat bulunamadı
              </p>
              <Button
                onClick={fetchLawyers}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
