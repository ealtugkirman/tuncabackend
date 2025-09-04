# SEO Sistemi Kılavuzu

Bu kılavuz, Tunca Avukatlık backend'inde otomatik SEO oluşturma sisteminin nasıl kullanılacağını açıklar.

## 🎯 Özellikler

### ✅ Otomatik SEO Oluşturma
- **Meta Tags**: Title, description, keywords otomatik oluşturulur
- **Open Graph**: Facebook, LinkedIn paylaşımları için optimize edilmiş
- **Twitter Cards**: Twitter paylaşımları için optimize edilmiş
- **Structured Data**: JSON-LD formatında zengin snippet'ler
- **Canonical URLs**: Duplicate content sorunlarını önler

### ✅ Dinamik Sitemap
- Tüm yayınlanmış içerikler otomatik dahil edilir
- Son güncelleme tarihleri takip edilir
- Öncelik ve sıklık değerleri optimize edilir

### ✅ Robots.txt
- Arama motorları için yönlendirme
- Admin ve API rotaları engellenir
- Önemli sayfalar izin verilir

## 📁 Dosya Yapısı

```
src/
├── lib/
│   └── seo.ts                    # SEO utility fonksiyonları
├── app/
│   ├── sitemap.xml/
│   │   └── route.ts             # Dinamik sitemap
│   ├── robots.txt/
│   │   └── route.ts             # Robots.txt
│   ├── api/seo/
│   │   ├── homepage/
│   │   │   └── route.ts         # Ana sayfa SEO
│   │   ├── lawyer/[id]/
│   │   │   └── route.ts         # Avukat SEO
│   │   ├── announcement/[id]/
│   │   │   └── route.ts         # Duyuru SEO
│   │   ├── event/[id]/
│   │   │   └── route.ts         # Etkinlik SEO
│   │   ├── publication/[id]/
│   │   │   └── route.ts         # Yayın SEO
│   │   └── meta/[type]/[id]/
│   │       └── route.ts         # Meta tag HTML
│   └── admin/
│       └── seo-test/
│           └── page.tsx         # SEO test aracı
```

## 🔧 API Endpoint'leri

### 1. Ana Sayfa SEO
```http
GET /api/seo/homepage
```

**Response:**
```json
{
  "title": "Tunca Avukatlık - Ankara Hukuk Bürosu",
  "description": "Kurumsal hukuk, birleşme ve devralma...",
  "keywords": ["avukat", "hukuk bürosu", ...],
  "canonical": "https://tuncalaw.com",
  "ogTitle": "Tunca Avukatlık - Ankara Hukuk Bürosu",
  "ogDescription": "Kurumsal hukuk, birleşme ve devralma...",
  "ogImage": "https://tuncalaw.com/images/tunca-law-og-image.jpg",
  "ogType": "website",
  "structuredData": { ... }
}
```

### 2. Avukat SEO
```http
GET /api/seo/lawyer/lawyer-1
```

### 3. Duyuru SEO
```http
GET /api/seo/announcement/announcement-1
```

### 4. Etkinlik SEO
```http
GET /api/seo/event/event-1
```

### 5. Yayın SEO
```http
GET /api/seo/publication/publication-1
```

### 6. Meta Tag HTML
```http
GET /api/seo/meta/homepage
GET /api/seo/meta/lawyer/lawyer-1
GET /api/seo/meta/announcement/announcement-1
```

## 🗺️ Sitemap ve Robots

### Sitemap
```http
GET /sitemap.xml
```

**Özellikler:**
- Tüm yayınlanmış içerikler otomatik dahil
- Son güncelleme tarihleri
- Öncelik ve sıklık değerleri
- XML formatında

### Robots.txt
```http
GET /robots.txt
```

**İçerik:**
- Sitemap referansı
- Admin rotaları engellenir
- API rotaları engellenir
- Önemli sayfalar izin verilir

## 🏗️ Structured Data

### Ana Sayfa - LegalService
```json
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Tunca Avukatlık",
  "description": "Ankara'da kurumsal hukuk...",
  "url": "https://tuncalaw.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ankara",
    "addressCountry": "TR"
  },
  "serviceType": [
    "Kurumsal Hukuk",
    "Birleşme ve Devralma",
    "İş Hukuku"
  ]
}
```

### Avukat - Person
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Dr. Mehmet Tunca",
  "jobTitle": "ORTAK AVUKAT",
  "worksFor": {
    "@type": "LegalService",
    "name": "Tunca Avukatlık"
  },
  "knowsAbout": ["Kurumsal Hukuk", "Birleşme ve Devralma"],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "name": "CFA"
    }
  ]
}
```

### Duyuru - Article
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Büyük Birleşme ve Devralma İşlemi",
  "description": "Müvekkilimiz ABC Şirketi...",
  "datePublished": "2024-12-15T00:00:00.000Z",
  "author": {
    "@type": "Organization",
    "name": "Tunca Avukatlık"
  }
}
```

### Etkinlik - Event
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Sürdürülebilirlik ve Hukuk Semineri",
  "description": "Sürdürülebilirlik konularında...",
  "startDate": "20 Ocak 2025",
  "location": {
    "@type": "Place",
    "name": "Ankara"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Tunca Avukatlık"
  }
}
```

## 🧪 Test Aracı

### SEO Test Sayfası
`/admin/seo-test` sayfasında:

1. **İçerik Türü Seçin**: Homepage, Lawyer, Announcement, Event, Publication
2. **ID Girin**: Test etmek istediğiniz içeriğin ID'si
3. **SEO Verisini Getirin**: API'den SEO verilerini çekin
4. **Önizleme**: Google arama sonuçlarında nasıl görüneceğini görün
5. **Meta Tags**: HTML meta tag'lerini görün
6. **Structured Data**: JSON-LD structured data'yı görün

## ⚙️ Konfigürasyon

### Environment Variables
```env
NEXT_PUBLIC_SITE_URL="https://tuncalaw.com"
```

### SEO Ayarları
`src/lib/seo.ts` dosyasında:

```typescript
export const baseSEO = {
  siteName: 'Tunca Avukatlık',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tuncalaw.com',
  defaultImage: '/images/tunca-law-og-image.jpg',
  twitterHandle: '@tuncalaw',
  defaultKeywords: [
    'avukat',
    'hukuk bürosu',
    'ankara avukat',
    // ...
  ]
}
```

## 🚀 Frontend Entegrasyonu

### React Component Örneği
```tsx
import { useEffect, useState } from 'react'

function LawyerPage({ lawyerId }) {
  const [seoData, setSeoData] = useState(null)

  useEffect(() => {
    fetch(`/api/seo/lawyer/${lawyerId}`)
      .then(res => res.json())
      .then(setSeoData)
  }, [lawyerId])

  return (
    <>
      <Head>
        <title>{seoData?.title}</title>
        <meta name="description" content={seoData?.description} />
        <meta name="keywords" content={seoData?.keywords?.join(', ')} />
        <link rel="canonical" href={seoData?.canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoData?.ogTitle} />
        <meta property="og:description" content={seoData?.ogDescription} />
        <meta property="og:image" content={seoData?.ogImage} />
        <meta property="og:type" content={seoData?.ogType} />
        
        {/* Structured Data */}
        {seoData?.structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(seoData.structuredData)
            }}
          />
        )}
      </Head>
      
      {/* Sayfa içeriği */}
    </>
  )
}
```

### Next.js App Router Örneği
```tsx
// app/lawyers/[id]/page.tsx
import { generateLawyerSEO } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const seoData = await generateLawyerSEO(params.id)
  
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.ogTitle,
      description: seoData.ogDescription,
      images: [seoData.ogImage],
      type: seoData.ogType,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.twitterTitle,
      description: seoData.twitterDescription,
      images: [seoData.twitterImage],
    },
    alternates: {
      canonical: seoData.canonical,
    },
  }
}
```

## 📊 SEO Optimizasyonu

### Anahtar Kelime Stratejisi
- **Birincil**: Avukat, hukuk bürosu, ankara avukat
- **İkincil**: Kurumsal hukuk, birleşme devralma, iş hukuku
- **Uzun Kuyruk**: "ankara kurumsal hukuk avukatı", "birleşme devralma danışmanlığı"

### Meta Description Optimizasyonu
- 150-160 karakter arası
- Anahtar kelimeler dahil
- Call-to-action içerir
- Her sayfa için benzersiz

### Title Tag Optimizasyonu
- 50-60 karakter arası
- Anahtar kelime başta
- Marka adı sonda
- Her sayfa için benzersiz

### Structured Data Faydaları
- **Rich Snippets**: Arama sonuçlarında zengin görünüm
- **Knowledge Graph**: Google'ın içeriği daha iyi anlaması
- **Local SEO**: Yerel aramalar için optimize
- **Voice Search**: Sesli aramalar için optimize

## 🔍 SEO Monitoring

### Google Search Console
1. Sitemap'i ekleyin: `https://tuncalaw.com/sitemap.xml`
2. URL'leri manuel olarak test edin
3. Structured data'yı doğrulayın
4. Core Web Vitals'ı takip edin

### Google Rich Results Test
- URL'leri test edin: https://search.google.com/test/rich-results
- Structured data'yı doğrulayın
- Hataları düzeltin

### Lighthouse SEO Audit
- Performance skorunu optimize edin
- SEO skorunu 100'e çıkarın
- Accessibility skorunu iyileştirin

## 🎯 Sonuç

Bu SEO sistemi ile:
- ✅ Otomatik meta tag oluşturma
- ✅ Dinamik sitemap ve robots.txt
- ✅ Structured data ile zengin snippet'ler
- ✅ Social media optimizasyonu
- ✅ Test ve monitoring araçları

Tunca Avukatlık web sitesi arama motorlarında üst sıralarda yer alacak ve daha fazla organik trafik çekecektir.
