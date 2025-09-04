'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Event {
  id: string
  date: string
  category: string
  location?: string
  published: boolean
  createdAt: string
  title: string
  excerpt: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Filter states
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [year, setYear] = useState('all')
  const [published, setPublished] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        language: 'TR',
        sortBy,
        sortOrder,
      })

      if (search) params.append('search', search)
      if (category !== 'all') params.append('category', category)
      if (year !== 'all') params.append('year', year)
      if (published !== 'all') params.append('published', published)

      const response = await fetch(`/api/events?${params}`)
      if (response.ok) {
        const result = await response.json()
        setEvents(result.data || [])
        setPagination(result.pagination || null)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentPage, search, category, year, published, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (filterType: string, value: string) => {
    // Convert "all" values to empty string for API
    const apiValue = value === 'all' ? '' : value
    
    switch (filterType) {
      case 'category':
        setCategory(apiValue)
        break
      case 'year':
        setYear(apiValue)
        break
      case 'published':
        setPublished(apiValue)
        break
      case 'sortBy':
        setSortBy(value) // Don't convert sortBy
        break
      case 'sortOrder':
        setSortOrder(value) // Don't convert sortOrder
        break
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setYear('all')
    setPublished('all')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh the events list
        fetchEvents()
      } else {
        alert('Etkinlik silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Etkinlik silinirken bir hata oluştu')
    } finally {
      setDeletingId(null)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
          <p className="text-gray-600">Etkinlikleri yönetin</p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Etkinlik</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
          <Button variant="outline" onClick={clearFilters} className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Temizle</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Arama</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Başlık, özet veya içerik..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <Select value={category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm kategoriler</SelectItem>
                <SelectItem value="Birleşme ve Devralmalar">Birleşme ve Devralmalar</SelectItem>
                <SelectItem value="Bankacılık ve Finans Hukuku">Bankacılık ve Finans Hukuku</SelectItem>
                <SelectItem value="Uluslararası Ticaret Hukuku">Uluslararası Ticaret Hukuku</SelectItem>
                <SelectItem value="Sağlık ve İlaç Hukuku">Sağlık ve İlaç Hukuku</SelectItem>
                <SelectItem value="Dava Takibi ve Tahkim">Dava Takibi ve Tahkim</SelectItem>
                <SelectItem value="Enerji Hukuku">Enerji Hukuku</SelectItem>
                <SelectItem value="Kamu İhale Hukuku">Kamu İhale Hukuku</SelectItem>
                <SelectItem value="İş Hukuku">İş Hukuku</SelectItem>
                <SelectItem value="Maden ve Petrol Hukuku">Maden ve Petrol Hukuku</SelectItem>
                <SelectItem value="Vergi Hukuku">Vergi Hukuku</SelectItem>
                <SelectItem value="Gayrimenkul ve İnşaat Hukuku">Gayrimenkul ve İnşaat Hukuku</SelectItem>
                <SelectItem value="Şirketler Hukuku">Şirketler Hukuku</SelectItem>
                <SelectItem value="Spor Hukuku">Spor Hukuku</SelectItem>
                <SelectItem value="Fikri Mülkiyet Hukuku">Fikri Mülkiyet Hukuku</SelectItem>
                <SelectItem value="Rekabet Hukuku">Rekabet Hukuku</SelectItem>
                <SelectItem value="Corporate Law & Mergers, Acquisitions and Spin-offs">Corporate Law & Mergers, Acquisitions and Spin-offs</SelectItem>
                <SelectItem value="Banking and Finance Law">Banking and Finance Law</SelectItem>
                <SelectItem value="International Commercial Law & Arbitration">International Commercial Law & Arbitration</SelectItem>
                <SelectItem value="Health and Pharmaceutical Law">Health and Pharmaceutical Law</SelectItem>
                <SelectItem value="International Commercial Arbitration & Investment Arbitration">International Commercial Arbitration & Investment Arbitration</SelectItem>
                <SelectItem value="Energy and Mining Law">Energy and Mining Law</SelectItem>
                <SelectItem value="Public Procurement Law">Public Procurement Law</SelectItem>
                <SelectItem value="Labor and Social Security Law">Labor and Social Security Law</SelectItem>
                <SelectItem value="Tax Law">Tax Law</SelectItem>
                <SelectItem value="Construction and Zoning Law">Construction and Zoning Law</SelectItem>
                <SelectItem value="Sports Law">Sports Law</SelectItem>
                <SelectItem value="Intellectual and Industrial Property Law">Intellectual and Industrial Property Law</SelectItem>
                <SelectItem value="Competition Law">Competition Law</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Yıl</label>
            <Select value={year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm yıllar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm yıllar</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Published Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Durum</label>
            <Select value={published} onValueChange={(value) => handleFilterChange('published', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm durumlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm durumlar</SelectItem>
                <SelectItem value="true">Yayında</SelectItem>
                <SelectItem value="false">Taslak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sırala:</label>
              <Select value={sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Oluşturma Tarihi</SelectItem>
                  <SelectItem value="title">Başlık</SelectItem>
                  <SelectItem value="date">Tarih</SelectItem>
                  <SelectItem value="category">Kategori</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Azalan</SelectItem>
                <SelectItem value="asc">Artan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tüm Etkinlikler</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {events.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Henüz etkinlik bulunmuyor.
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                    {event.published ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Eye className="w-3 h-3 mr-1" />
                        Yayında
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Taslak
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.excerpt}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Tarih: {event.date}</span>
                    <span>Kategori: {event.category}</span>
                    {event.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </span>
                    )}
                    <span>Oluşturulma: {new Date(event.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="text-blue-600 hover:text-blue-900"
                    title="Görüntüle"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Toplam {pagination.totalCount} etkinlik, sayfa {pagination.page} / {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Önceki
                </Button>
                <span className="text-sm text-gray-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
