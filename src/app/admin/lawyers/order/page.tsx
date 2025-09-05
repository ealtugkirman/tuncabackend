"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LawyerOrderManager } from '@/components/admin/LawyerOrderManager'
import { useLanguage } from '@/contexts/LanguageContext'

interface Lawyer {
  id: string
  name: string
  title: string
  image?: string
  isPartner: boolean
  isFounder: boolean
  isIntern: boolean
  order: number
  translations: Array<{
    language: string
    name: string
    title: string
  }>
}

export default function LawyerOrderPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchLawyers = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/lawyers?language=${locale.toUpperCase()}&sortBy=order&sortOrder=asc`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch lawyers')
      }
      
      const data = await response.json()
      
      // Transform data to include translation info
      const transformedLawyers = data.data.map((lawyer: any) => {
        const translation = lawyer.translations?.find((t: any) => t.language === locale.toUpperCase())
        return {
          id: lawyer.id,
          name: translation?.name || lawyer.name || 'Unknown',
          title: translation?.title || lawyer.title || '',
          image: lawyer.image,
          isPartner: lawyer.isPartner,
          isFounder: lawyer.isFounder,
          isIntern: lawyer.isIntern,
          order: lawyer.order || 0,
          translations: lawyer.translations || []
        }
      })
      
      setLawyers(transformedLawyers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLawyers()
  }, [locale])

  const handleOrderChange = (updatedLawyers: Lawyer[]) => {
    console.log('🔄 Order changed in parent:', updatedLawyers)
    setLawyers(updatedLawyers)
  }

  const handleSave = async (updatedLawyers: Lawyer[]) => {
    console.log('🔄 handleSave called with:', updatedLawyers)
    console.log('🔍 Checking order values:', updatedLawyers.map(l => ({ id: l.id, name: l.name, order: l.order })))
    
    try {
      setError('')
      setSuccess('')
      
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
      
      setSuccess(t('admin.lawyer_order_updated'))
      
      // Refresh the list
      await fetchLawyers()
      
    } catch (err) {
      console.error('❌ handleSave error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save order')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
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
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('admin.lawyer_order')}
              </h1>
              <p className="text-muted-foreground">
                {t('admin.manage_lawyer_order')}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Lawyer Order Manager */}
        {lawyers.length > 0 ? (
          <LawyerOrderManager
            lawyers={lawyers}
            onOrderChange={handleOrderChange}
            onSave={handleSave}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('admin.no_lawyers_found')}
              </p>
              <Button
                onClick={fetchLawyers}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('common.refresh')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
