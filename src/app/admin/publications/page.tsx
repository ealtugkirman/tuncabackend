"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Publication {
  id: string
  date: string
  category: string
  published: boolean
  createdAt: string
  title: string
  excerpt: string
  content: string
  lawyerName?: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AdminPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter states
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [year, setYear] = useState("all")
  const [published, setPublished] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPublications = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        language: "TR",
        sortBy,
        sortOrder,
      })

      if (search) params.append("search", search)
      if (category !== "all") params.append("category", category)
      if (year !== "all") params.append("year", year)
      if (published !== "all") params.append("published", published)

      const response = await fetch(`/api/publications?${params}`)
      if (response.ok) {
        const result = await response.json()
        setPublications(result.data || [])
        setPagination(result.pagination || null)
      }
    } catch (error) {
      console.error("Error fetching publications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPublications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, category, year, published, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    const apiValue = value === "all" ? "" : value

    switch (filterType) {
      case "category":
        setCategory(apiValue)
        break
      case "year":
        setYear(apiValue)
        break
      case "published":
        setPublished(apiValue)
        break
      case "sortBy":
        setSortBy(value)
        break
      case "sortOrder":
        setSortOrder(value)
        break
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setYear("all")
    setPublished("all")
    setSortBy("createdAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yayını silmek istediğinizden emin misiniz?")) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPublications()
      } else {
        alert("Yayın silinirken bir hata oluştu")
      }
    } catch (error) {
      console.error("Error deleting publication:", error)
      alert("Yayın silinirken bir hata oluştu")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Yayınlar</h1>
          <p className="text-muted-foreground text-lg">Yayınları yönetin ve düzenleyin</p>
        </div>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Link href="/admin/publications/new" className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Yeni Yayın</span>
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-card-foreground">Filtreler</h3>
          </div>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2 hover:bg-accent bg-transparent"
          >
            <Filter className="w-4 h-4" />
            <span>Temizle</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Arama
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Başlık, özet veya içerik..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-input border-border focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Kategori
            </label>
            <Select value={category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="bg-input border-border focus:border-primary">
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Yıl
            </label>
            <Select value={year} onValueChange={(value) => handleFilterChange("year", value)}>
              <SelectTrigger className="bg-input border-border focus:border-primary">
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Durum
            </label>
            <Select value={published} onValueChange={(value) => handleFilterChange("published", value)}>
              <SelectTrigger className="bg-input border-border focus:border-primary">
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-card-foreground">Sırala:</label>
              <Select value={sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="w-48 bg-input border-border">
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

            <Select value={sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
              <SelectTrigger className="w-32 bg-input border-border">
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

      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <h3 className="text-xl font-semibold text-card-foreground">Tüm Yayınlar</h3>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-1">Toplam {pagination.totalCount} yayın bulundu</p>
          )}
        </div>

        <div className="divide-y divide-border">
          {publications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">Henüz yayın bulunmuyor.</p>
              <p className="text-muted-foreground text-sm mt-1">Yeni bir yayın ekleyerek başlayın.</p>
            </div>
          ) : (
            publications.map((publication) => (
              <div key={publication.id} className="px-6 py-6 hover:bg-accent/50 transition-colors duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h4 className="text-lg font-semibold text-card-foreground hover:text-primary transition-colors">
                        {publication.title || "Başlık yok"}
                      </h4>
                      {publication.published ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 w-fit">
                          <Eye className="w-3 h-3 mr-1.5" />
                          Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border w-fit">
                          <EyeOff className="w-3 h-3 mr-1.5" />
                          Taslak
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{publication.excerpt || "Özet yok"}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {publication.lawyerName && (
                        <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                          <User className="w-3 h-3" />
                          {publication.lawyerName}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                        <Tag className="w-3 h-3" />
                        {publication.category}
                      </span>
                      <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                        <Calendar className="w-3 h-3" />
                        {publication.date}
                      </span>
                      <span className="text-muted-foreground/70">
                        Oluşturulma: {new Date(publication.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                    >
                      <Link href={`/admin/publications/${publication.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(publication.id)}
                      disabled={deletingId === publication.id}
                      className="hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-card/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Sayfa {pagination.page} / {pagination.totalPages} - Toplam {pagination.totalCount} yayın
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="hover:bg-accent"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Önceki
                </Button>
                <div className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-md border border-primary/20">
                  {pagination.page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="hover:bg-accent"
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
