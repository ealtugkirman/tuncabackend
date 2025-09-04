'use client'

import { useState, useEffect } from 'react'
import { Eye, Code, Globe, Search } from 'lucide-react'

interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonical: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  structuredData?: any
}

export default function SEOTestPage() {
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedType, setSelectedType] = useState('homepage')
  const [selectedId, setSelectedId] = useState('')

  const seoTypes = [
    { value: 'homepage', label: 'Ana Sayfa', id: '' },
    { value: 'lawyer', label: 'Avukat Profili', id: 'lawyer-1' },
    { value: 'announcement', label: 'Duyuru', id: 'announcement-1' },
    { value: 'event', label: 'Etkinlik', id: 'event-1' },
    { value: 'publication', label: 'Yayın', id: 'publication-1' }
  ]

  const fetchSEOData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const currentType = seoTypes.find(t => t.value === selectedType)
      const id = currentType?.id || selectedId
      
      const response = await fetch(`/api/seo/${selectedType}${id ? `/${id}` : ''}`)
      
      if (!response.ok) {
        throw new Error('SEO verisi alınamadı')
      }
      
      const data = await response.json()
      setSeoData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const generateMetaTags = (data: SEOData) => {
    return `<!-- SEO Meta Tags -->
<title>${data.title}</title>
<meta name="description" content="${data.description}">
<meta name="keywords" content="${data.keywords.join(', ')}">
<link rel="canonical" href="${data.canonical}">

<!-- Open Graph -->
<meta property="og:title" content="${data.ogTitle || data.title}">
<meta property="og:description" content="${data.ogDescription || data.description}">
<meta property="og:image" content="${data.ogImage || ''}">
<meta property="og:url" content="${data.canonical}">
<meta property="og:type" content="${data.ogType || 'website'}">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${data.ogTitle || data.title}">
<meta name="twitter:description" content="${data.ogDescription || data.description}">
<meta name="twitter:image" content="${data.ogImage || ''}">

<!-- Structured Data -->
${data.structuredData ? `<script type="application/ld+json">
${JSON.stringify(data.structuredData, null, 2)}
</script>` : ''}`
  }

  useEffect(() => {
    const currentType = seoTypes.find(t => t.value === selectedType)
    if (currentType?.id) {
      setSelectedId(currentType.id)
    }
  }, [selectedType])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Test Aracı</h1>
        <p className="text-gray-600">SEO meta tag'lerini ve structured data'yı test edin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              SEO Verisi Seç
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İçerik Türü
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {seoTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedType !== 'homepage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID
                  </label>
                  <input
                    type="text"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Örnek: lawyer-1"
                  />
                </div>
              )}

              <button
                onClick={fetchSEOData}
                disabled={loading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Yükleniyor...' : 'SEO Verisini Getir'}
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              SEO Endpoint'leri
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sitemap:</span>
                <a href="/sitemap.xml" target="_blank" className="text-indigo-600 hover:underline">
                  /sitemap.xml
                </a>
              </div>
              <div className="flex justify-between">
                <span>Robots.txt:</span>
                <a href="/robots.txt" target="_blank" className="text-indigo-600 hover:underline">
                  /robots.txt
                </a>
              </div>
              <div className="flex justify-between">
                <span>Homepage SEO:</span>
                <a href="/api/seo/homepage" target="_blank" className="text-indigo-600 hover:underline">
                  /api/seo/homepage
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {seoData && (
            <>
              {/* Preview */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  SEO Önizleme
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
                      {seoData.title}
                    </h4>
                    <p className="text-sm text-green-600">{seoData.canonical}</p>
                    <p className="text-sm text-gray-600 mt-1">{seoData.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {seoData.keywords.slice(0, 5).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meta Tags */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Meta Tags
                </h3>
                <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
                  {generateMetaTags(seoData)}
                </pre>
              </div>

              {/* Structured Data */}
              {seoData.structuredData && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Structured Data (JSON-LD)</h3>
                  <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
                    {JSON.stringify(seoData.structuredData, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
