'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, User, Award, GraduationCap, Eye, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Lawyer {
  id: string
  email: string
  phone?: string
  isFounder: boolean
  isPartner: boolean
  isIntern: boolean
  order: number
  createdAt: string
  name: string
  title: string
  bio: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AdminLawyersPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Filter states
  const [search, setSearch] = useState('')
  const [isFounder, setIsFounder] = useState('all')
  const [isPartner, setIsPartner] = useState('all')
  const [sortBy, setSortBy] = useState('order')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchLawyers = async () => {
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
      if (isFounder !== 'all') params.append('isFounder', isFounder)
      if (isPartner !== 'all') params.append('isPartner', isPartner)

      const response = await fetch(`/api/lawyers?${params}`)
      if (response.ok) {
        const result = await response.json()
        setLawyers(result.data || [])
        setPagination(result.pagination || null)
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLawyers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, isFounder, isPartner, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    const apiValue = value === 'all' ? '' : value
    
    switch (filterType) {
      case 'isFounder':
        setIsFounder(apiValue)
        break
      case 'isPartner':
        setIsPartner(apiValue)
        break
      case 'sortBy':
        setSortBy(value)
        break
      case 'sortOrder':
        setSortOrder(value)
        break
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setIsFounder('all')
    setIsPartner('all')
    setSortBy('createdAt')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu avukatı silmek istediğinizden emin misiniz?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/lawyers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchLawyers()
      } else {
        alert('Avukat silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting lawyer:', error)
      alert('Avukat silinirken bir hata oluştu')
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
          <h1 className="text-2xl font-bold text-foreground">Avukatlar</h1>
          <p className="text-muted-foreground">Ekip üyelerini yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/lawyers/order">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sırala
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/lawyers/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Avukat
            </Link>
          </Button>
        </div>
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
                placeholder="İsim, unvan veya bio..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Founder Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kurucu</label>
            <Select value={isFounder} onValueChange={(value) => handleFilterChange('isFounder', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Kurucu</SelectItem>
                <SelectItem value="false">Kurucu Değil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partner Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ortak</label>
            <Select value={isPartner} onValueChange={(value) => handleFilterChange('isPartner', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Ortak</SelectItem>
                <SelectItem value="false">Ortak Değil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sırala</label>
            <Select value={sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Oluşturma Tarihi</SelectItem>
                <SelectItem value="name">İsim</SelectItem>
                <SelectItem value="isFounder">Kurucu Durumu</SelectItem>
                <SelectItem value="isPartner">Ortak Durumu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sıralama:</label>
              <Select value={sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Artan</SelectItem>
                  <SelectItem value="desc">Azalan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Avukatlar</CardTitle>
          <CardDescription>Ekip üyelerinin listesi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lawyers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz avukat bulunmuyor.
              </div>
            ) : (
              lawyers.map((lawyer) => (
                <div key={lawyer.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-foreground">{lawyer.name || 'İsimsiz Avukat'}</h4>
                        {lawyer.isFounder && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Kurucu
                          </Badge>
                        )}
                        {lawyer.isPartner && (
                          <Badge variant="default" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Ortak
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{lawyer.title || 'Ünvan yok'}</p>
                      <p className="text-sm text-muted-foreground">{lawyer.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">{lawyer.bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/lawyers/${lawyer.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/lawyers/${lawyer.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(lawyer.id)}
                      disabled={deletingId === lawyer.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                  Toplam {pagination.totalCount} avukat, sayfa {pagination.page} / {pagination.totalPages}
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
        </CardContent>
      </Card>
    </div>
  )
}