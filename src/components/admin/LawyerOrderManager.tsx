"use client"

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, User, Crown, Star, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

interface LawyerOrderManagerProps {
  lawyers: Lawyer[]
  onOrderChange: (lawyers: Lawyer[]) => void
  onSave: (lawyers: Lawyer[]) => Promise<void>
  isLoading?: boolean
}

export function LawyerOrderManager({ 
  lawyers, 
  onOrderChange, 
  onSave, 
  isLoading = false 
}: LawyerOrderManagerProps) {
  const { t } = useLanguage()
  const [items, setItems] = useState<Lawyer[]>(lawyers)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setItems(lawyers)
    setHasChanges(false)
  }, [lawyers])

  const handleDragEnd = (result: DropResult) => {
    console.log('🎯 Drag ended:', result)
    if (!result.destination) {
      console.log('❌ No destination, drag cancelled')
      return
    }

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    // Update order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))
    
    console.log('🔢 Order values assigned:', updatedItems.map(item => ({ id: item.id, name: item.name, order: item.order })))

    console.log('🔄 Updated items with new order:', updatedItems)
    setItems(updatedItems)
    onOrderChange(updatedItems)
    setHasChanges(true)
  }

  const handleSave = async () => {
    console.log('🔄 Saving lawyer order...', items)
    setIsSaving(true)
    try {
      await onSave(items)
      setHasChanges(false)
      console.log('✅ Order saved successfully')
    } catch (error) {
      console.error('❌ Error saving order:', error)
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
    if (lawyer.isFounder) return t('admin.founder')
    if (lawyer.isPartner) return t('admin.partner')
    if (lawyer.isIntern) return t('admin.intern')
    return t('admin.associate')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t('admin.lawyer_order')}
          </h2>
          <p className="text-muted-foreground">
            {t('admin.drag_to_reorder')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-orange-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              {t('admin.unsaved_changes')}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>

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
                            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                                  // If image fails to load, hide it and show icon instead
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling.style.display = 'flex'
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
                              {lawyer.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getRoleText(lawyer)}
                            </p>
                          </div>

                          {/* Order Badge */}
                          <div className="text-sm text-muted-foreground">
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
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            i
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              {t('admin.how_to_reorder')}
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {t('admin.drag_handle_instruction')}</li>
              <li>• {t('admin.drop_instruction')}</li>
              <li>• {t('admin.save_instruction')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
