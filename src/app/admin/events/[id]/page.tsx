'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, MapPin, Calendar, Tag } from 'lucide-react'

interface Event {
  id: string
  title: string
  date: string
  year: string
  excerpt: string
  content: string
  image?: string
  eventType: string
  category: string
  location?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

interface EventDetailPageProps {
  params: {
    id: string
  }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data)
        } else if (response.status === 404) {
          router.push('/admin/events')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, router])

  const handleDelete = async () => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/events')
      } else {
        alert('Etkinlik silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Etkinlik silinirken bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Etkinlik Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız etkinlik bulunamadı.</p>
          <Link
            href="/admin/events"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Etkinliklere Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/events"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600">Etkinlik detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Düzenle</span>
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Siliniyor...' : 'Sil'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.image && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Görsel</h3>
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Event Content */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İçerik</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: event.content }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Event Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Durum</h3>
            <div className="flex items-center space-x-2">
              {event.published ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Eye className="w-4 h-4 mr-2" />
                  Yayında
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Taslak
                </span>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detaylar</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tarih</p>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Etkinlik Türü</p>
                  <p className="text-sm text-gray-600">{event.eventType}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Kategori</p>
                  <p className="text-sm text-gray-600">{event.category}</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Konum</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Oluşturulma Tarihi</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Son Güncelleme</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Excerpt */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Özet</h3>
            <p className="text-sm text-gray-600">{event.excerpt}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
