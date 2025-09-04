'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Announcement {
  id: string
  title: string
  date: string
  excerpt: string
  published: boolean
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AdminAnnouncementsPage() {
  // const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter states
  const [search, setSearch] = useState('')
  const [published, setPublished] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

    const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        language: 'TR'
      })

      if (search) params.append('search', search)
      if (published) params.append('published', published)

      const response = await fetch(`/api/announcements?${params}`)
        if (response.ok) {
          const data = await response.json()
        setAnnouncements(data.data)
        setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    fetchAnnouncements()
  }, [currentPage, sortBy, sortOrder, search, published]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (filterType: string, value: string) => {
    // Convert "all" values to empty string for API
    const apiValue = value === 'all' ? '' : value
    
    switch (filterType) {
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
    setPublished('all')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh the list after deletion
        fetchAnnouncements()
      } else {
        alert('Duyuru silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Duyuru silinirken bir hata oluştu')
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
          <h1 className="text-2xl font-bold text-gray-900">Duyurular</h1>
          <p className="text-gray-600">Duyuruları yönetin</p>
        </div>
        <Link
          href="/admin/announcements/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Duyuru</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Arama ve Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
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

            <Button variant="outline" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Duyurular</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="divide-y divide-gray-200">
          {announcements.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Henüz duyuru bulunmuyor.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{announcement.title}</h4>
                    {announcement.published ? (
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
                  <p className="text-sm text-gray-600 mt-1">{announcement.excerpt}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Tarih: {announcement.date}</span>
                    <span>Oluşturulma: {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/announcements/${announcement.id}`}
                    className="text-blue-600 hover:text-blue-900"
                    title="Görüntüle"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/announcements/${announcement.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(announcement.id)}
                    disabled={deletingId === announcement.id}
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
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-700">
              Toplam {pagination.totalCount} duyuru, sayfa {pagination.page} / {pagination.totalPages}
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
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i
                if (pageNum > pagination.totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
              
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
        )}
        </CardContent>
      </Card>
    </div>
  )
}
