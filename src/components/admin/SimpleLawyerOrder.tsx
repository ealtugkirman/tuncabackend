"use client"

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GripVertical, Save, User, Crown, Star, GraduationCap } from 'lucide-react'
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
}

interface SimpleLawyerOrderProps {
  lawyers: Lawyer[]
  onSave: (lawyers: Lawyer[]) => Promise<void>
}

export function SimpleLawyerOrder({ lawyers, onSave }: SimpleLawyerOrderProps) {
  const { t } = useLanguage()
  const [items, setItems] = useState<Lawyer[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Initialize items when lawyers prop changes
  useEffect(() => {
    console.log('🔄 Initializing lawyers:', lawyers)
    setItems(lawyers)
    setHasChanges(false)
  }, [lawyers])

  const handleDragEnd = (result: DropResult) => {
    console.log('🎯 Drag ended:', result)
    
    if (!result.destination) {
      console.log('❌ No destination, drag cancelled')
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) {
      console.log('❌ Same position, no change needed')
      return
    }

    // Create new array with reordered items
    const newItems = Array.from(items)
    const [movedItem] = newItems.splice(sourceIndex, 1)
    newItems.splice(destinationIndex, 0, movedItem)

    // Update order values based on new positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))

    console.log('🔄 Updated items with new order:', updatedItems)
    setItems(updatedItems)
    setHasChanges(true)
    setError('')
  }

  const handleSave = async () => {
    console.log('🔄 Saving lawyer order...', items)
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await onSave(items)
      setHasChanges(false)
      setSuccess('Avukat sıralaması başarıyla güncellendi!')
      console.log('✅ Order saved successfully')
    } catch (error) {
      console.error('❌ Error saving order:', error)
      setError(error instanceof Error ? error.message : 'Sıralama kaydedilemedi')
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleIcon = (lawyer: Lawyer) => {
    if (lawyer.isFounder) return <Crown className="w-4 h-4 text-yellow-500" />
    if (lawyer.isPartner) return <Star className="w-4 h-4 text-blue-500" />
    if (lawyer.isIntern) return <GraduationCap className="w-4 h-4 text-green-500" />
    return <User className="w-4 h-4 text-gray-500" />
  }

  const getRoleText = (lawyer: Lawyer) => {
    if (lawyer.isFounder) return 'Kurucu'
    if (lawyer.isPartner) return 'Ortak'
    if (lawyer.isIntern) return 'Stajyer'
    return 'Avukat'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Avukat Sıralaması
          </h2>
          <p className="text-muted-foreground">
            Sıralamayı değiştirmek için sürükleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-orange-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Kaydedilmemiş değişiklikler
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Drag & Drop List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lawyers">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-2 p-4 rounded-lg border-2 border-dashed transition-colors ${
                snapshot.isDraggingOver 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {items.map((lawyer, index) => (
                <Draggable key={lawyer.id} draggableId={lawyer.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-all duration-200 ${
                        snapshot.isDragging
                          ? 'shadow-lg scale-105 rotate-2'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors"
                          >
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>

                          {/* Order Number */}
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                            {index + 1}
                          </div>

                          {/* Lawyer Image */}
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {lawyer.image ? (
                              <img
                                src={lawyer.image}
                                alt={lawyer.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling!.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <User className="w-6 h-6 text-gray-400" style={{ display: lawyer.image ? 'none' : 'flex' }} />
                          </div>

                          {/* Lawyer Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {lawyer.name}
                              </h3>
                              {getRoleIcon(lawyer)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {lawyer.title || getRoleText(lawyer)}
                            </p>
                          </div>

                          {/* Order Display */}
                          <div className="text-sm text-muted-foreground font-mono">
                            #{lawyer.order + 1}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Nasıl Sıralama Yapılır?
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Grip simgesini tutup sürükleyin</li>
            <li>• İstediğiniz konuma bırakın</li>
            <li>• Değişiklikleri kaydetmek için Kaydet butonuna tıklayın</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
