/**
 * Panelde görünecek avukat listesini veritabanına yükler (idempotent: aynı slug ile tekrar çalıştırılabilir).
 * Kullanım: proje kökünden `npx tsx scripts/import-team-lawyers.ts`
 * DATABASE_URL .env içinden okunur.
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient, Language } from '@prisma/client'
import { normalizeLawyerPracticeAreaSlugs } from '../src/lib/lawyer-practice-areas'
import { positionToFlags } from '../src/lib/lawyer-position'

function loadDotEnv() {
  const p = join(process.cwd(), '.env')
  if (!existsSync(p)) return
  const content = readFileSync(p, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadDotEnv()

const prisma = new PrismaClient()

function slugifyTR(name: string): string {
  const tr = 'şŞıİğĞüÜöÖçÇ'
  const en = 'sSiIgGuUoOcC'
  let s = name.trim()
  for (let i = 0; i < tr.length; i++) {
    s = s.replace(new RegExp(tr[i], 'g'), en[i])
  }
  s = s
    .replace(/^dr\.\s+/i, '')
    .replace(/\./g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return s || 'lawyer'
}

function cleanAreaLabels(labels: string[]): string[] {
  return labels
    .map((l) => l.replace(/[\u2013\u2014\-]\s*$/, '').trim())
    .filter(Boolean)
}

type Row = {
  name: string
  position: 'LAWYER' | 'INTERN'
  education: string
  bar: string
  languages: string
  practiceAreaLabels: string[]
}

const ROWS: Row[] = [
  {
    name: 'Sidar Tunca',
    position: 'LAWYER',
    education: `TOBB Üniversitesi, Sosyal Bilimler Enstitüsü, Kamu Hukuku Yüksek Lisans Programı

Ankara Üniversitesi, Sosyal Bilimler Enstitüsü, Kamu Hukuku Yüksek Lisans Programı

Gazi Üniversitesi, Sosyal Bilimler Enstitüsü, Vergi Hukuku Yüksek Lisans Programı, 2006

Çankaya Üniversitesi, Hukuk Fakültesi, 2014`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Birleşme ve Devralmalar',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Rekabet Hukuku',
      'Sağlık ve İlaç Hukuku',
      'Kamu İhale Hukuku',
      'Gayrimenkul ve İnşaat Hukuku',
      'Dava Takibi ve Tahkim',
      'Enerji Hukuku',
      'Maden ve Petrol Hukuku',
      'Spor Hukuku',
      'Vergi Hukuku',
    ],
  },
  {
    name: 'Ahmet İlker Doğan',
    position: 'LAWYER',
    education: `Ankara Üniversitesi Hukuk Fakültesi, 1996

Bilkent Üniversitesi, İşletme Yönetimi Yüksek Lisans Programı, 2017`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Birleşme ve Devralmalar',
      'Bankacılık ve Finans Hukuku',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Rekabet Hukuku',
      'Dava Takibi ve Tahkim',
      'Enerji Hukuku',
      'Maden ve Petrol Hukuku',
      'Vergi Hukuku',
    ],
  },
  {
    name: 'Dr. Serhat Bayraktutan',
    position: 'LAWYER',
    education: `Kocaeli Üniversitesi, Sosyal Bilimler Enstitüsü, Kamu Hukuku Doktora Programı, 2016

Selçuk Üniversitesi, Sosyal Bilimler Enstitüsü, Kamu Hukuku Yüksek Lisans Programı

Marmara Üniversitesi Hukuk Fakültesi, 2000`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce, İspanyolca',
    practiceAreaLabels: ['Dava Takibi ve Tahkim', 'Enerji Hukuku', 'Kamu İhale Hukuku'],
  },
  {
    name: 'Ozan Tecirli',
    position: 'LAWYER',
    education: 'Dokuz Üniversitesi Hukuk Fakültesi, 2015',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: ['İş Hukuku', 'Kişisel Verilerin Korunması Hukuku', 'Dava Takibi ve Tahkim'],
  },
  {
    name: 'Ezgi Alımcı',
    position: 'LAWYER',
    education: `TOBB Üniversitesi, Sosyal Bilimler Enstitüsü, Kamu Hukuku Yüksek Lisans Programı

Kırıkkale Üniversitesi Hukuk Fakültesi, 2022

Eğitimler, Sertifikalar ve Katılım Belgesi:
Borsa İstanbul, Halka Arzda Bağımsız Hukukçu Raporu Eğitim Programı, 2025
İlaç ve Tıbbi Cihaz Sektöründe Uyum Sertifika Programı, 2024`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Birleşme ve Devralmalar',
      'Rekabet Hukuku',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Sağlık ve İlaç Hukuku',
      'Kamu İhale Hukuku',
    ],
  },
  {
    name: 'Ecem Özgül',
    position: 'LAWYER',
    education: 'TOBB Üniversitesi Hukuk Fakültesi, 2023',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: ['İş Hukuku', 'Dava Takibi ve Tahkim'],
  },
  {
    name: 'Mustafa Burak Aktamış',
    position: 'LAWYER',
    education: `Ankara Üniversitesi Hukuk Fakültesi, 2020

Anadolu Üniversitesi, Kamu Hukuku Yüksek Lisans Programı

Eğitimler, Sertifikalar ve Katılım Belgesi:
Avukatlar İçin Arabuluculuk Süreci ve Uygulamaları ve Son Yargıtay Kararlarının İncelenmesi, 2022
Arsa Payı Esaslı İnşaat Sözleşmeleri ve Uygulamaları, 2021
Ölüm ve Bedensel Yaralanma Hallerinde Tazminat Belirleme Esasları, 2021
KDV İadesi Reddi Davaları Eğitimi, 2021
Pandemi Döneminde Kira Sözleşmeleri- Stajyer Avukatlar İçin, 2021
6284 Sayılı Kanun ve Uygulamaları- Stajyer Avukatlar İçin, 2021
İşçi Alacaklarının Hesaplanması- Stajyer Avukatlar İçin, 2021`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce, İspanyolca',
    practiceAreaLabels: [
      'İş Hukuku',
      'Dava Takibi ve Tahkim',
      'Gayrimenkul ve İnşaat Hukuku',
      'Enerji Hukuku',
    ],
  },
  {
    name: 'Gizem Ulutaş',
    position: 'LAWYER',
    education: 'Gazi Üniversitesi Hukuk Fakültesi, 2015',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'İş Hukuku',
      'Dava Takibi ve Tahkim',
      'Gayrimenkul ve İnşaat Hukuku',
      'Enerji Hukuku',
    ],
  },
  {
    name: 'Şenay Tekin',
    position: 'LAWYER',
    education: 'Ankara Üniversitesi Hukuk Fakültesi, 2002',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: ['İş Hukuku', 'Dava Takibi ve Tahkim', 'Gayrimenkul ve İnşaat Hukuku'],
  },
  {
    name: 'Pınar Ertunç',
    position: 'LAWYER',
    education: `Konya Selçuk Üniversitesi Hukuk Fakültesi, 2003

Eğitimler, Sertifikalar ve Katılım Belgesi:
Dava şartı olan arabuluculukta taraf vekilliği, 2019
Sözleşme hukukunda güncel yargı uygulamaları, 2019
Yargıtay kararları ışığında icra hukukunda güncel konular 2019`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce, Almanca',
    practiceAreaLabels: [],
  },
  {
    name: 'Ulaş Ünsalan',
    position: 'LAWYER',
    education: `Londra Queen Mary Üniversitesi, Fikri Mülkiyet Hukuku Yüksek Lisans Programı, 2014

İhsan Doğramacı Bilkent Üniversitesi Ekonomi Hukuku Yüksek Lisans Programı, 2013

İhsan Doğramacı Bilkent Üniversitesi Hukuk Fakültesi, 2011

Eğitimler, Sertifikalar ve Katılım Belgesi:
Harvard Üniversitesi, Telif Hakkı, 2021`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Birleşme ve Devralmalar',
      'Bankacılık ve Finans Hukuku',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Fikri Mülkiyet Hukuku',
      'Dava Takibi ve Tahkim',
      'Enerji Hukuku',
    ],
  },
  {
    name: 'Tuğba Altuntaş',
    position: 'LAWYER',
    education: `Ankara Üniversitesi, Sosyal Bilimler Enstitüsü, Deniz Hukuku ve Deniz Ticareti Doktora Programı

Ankara Üniversitesi, Sosyal Bilimler Enstitüsü, Özel Hukuk Yüksek Lisans Programı, 2019

Ankara Üniversitesi Hukuk Fakültesi, 2014

Eğitimler, Sertifikalar ve Katılım Belgesi:
Tahkim yargılamalarında danışmanlık semineri
Sözleşme Dışı Mutlak Sorumlulukta Maddi Zararlar Uluslararası Konferansı
Anayasa Yargısı ve Anayasa Mahkemesi'ne Bireysel Başvuru
Ticari Uyuşmazlıklarda Arabuluculuk ve Taraf Vekilliği Özel Eğitimi
Bankacılık ve Sermaye Piyasası Hukuku
Hukuk Muhakemeleri Usulü Kanunu-İstinaf
ECDL Sertifikası (Avrupa Bilgisayar Sürücü Belgesi)
5. Eurosima Sertifikası
Arabuluculuk ve Taraf Temsilciliği Temel Eğitimi
Bilirkişilik Temel Eğitimi`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: ['Ticaret Hukuku ve Sermaye Piyasaları', 'Dava Takibi ve Tahkim', 'Enerji Hukuku'],
  },
  {
    name: 'Ozan Sert Durmuş',
    position: 'LAWYER',
    education: 'İhsan Dogramaci Bilkent Üniversitesi Hukuk Fakültesi, 2013',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Birleşme ve Devralmalar',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Dava Takibi ve Tahkim',
      'Enerji Hukuku',
      'Spor Hukuku',
      'Maden ve Petrol Hukuku',
    ],
  },
  {
    name: 'Ayşe Gül Hacıoğlu Avcı',
    position: 'LAWYER',
    education: 'Gazi Üniversitesi Hukuk Fakültesi, 2003',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: ['Dava Takibi ve Tahkim', 'Gayrimenkul ve İnşaat Hukuku'],
  },
  {
    name: 'Durukan Karakaş',
    position: 'LAWYER',
    education: '',
    bar: '',
    languages: '',
    practiceAreaLabels: [],
  },
  {
    name: 'Murat Kaya',
    position: 'LAWYER',
    education: `Ankara Üniversitesi, Sosyal Bilimler Enstitüsü, Kamu Hukuku Yüksek Lisans Programı

Ankara Üniversitesi Hukuk Fakültesi`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Birleşme ve Devralmalar',
      'Bankacılık ve Finans Hukuku',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Dava Takibi ve Tahkim',
      'Gayrimenkul ve İnşaat Hukuku',
      'Maden ve Petrol Hukuku',
    ],
  },
  {
    name: 'Fikret Çelik',
    position: 'LAWYER',
    education: `TOBB Ekonomi ve Teknoloji Üniversitesi, Ekonomi ve Sosyal Bilimler Enstitüsü, Özel Hukuk Yüksek Lisans Programı, 2025

Anadolu Üniversitesi, Sosyal Bilimler Enstitüsü, Bankacılık ve Finans Yüksek Lisans Programı, 2021

İhsan Doğramacı, Bilkent Üniversitesi, Hukuk Fakültesi, 2020

Eğitimler, Sertifikalar ve Katılım Belgesi:
Borsa İstanbul, Halka Arzlar Hakkında Bağımsız Hukuk Raporu Eğitim Programı, 2025
Spor Hukuku Eğitim Programı, 2020`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Dava Takibi ve Tahkim',
      'Fikri Mülkiyet Hukuku',
      'Spor Hukuku',
    ],
  },
  {
    name: 'Özlem Tanır',
    position: 'LAWYER',
    education: `İstanbul Üniversitesi Hukuk Fakültesi, 2012

Eğitimler, Sertifikalar ve Katılım Belgesi:
Enerji ve Maden Hukuku Uzman Arabuluculuk Eğitimi, 2024
Akredite Meb-Arb Hakemlik Eğitimi, 2023
Akredite Arabuluculuk Eğitimi, 2023
Sigorta Hukuku Uzman Arabuluculuk Eğitimi, 2023
Tüketici Hukuku Uzman Arabuluculuk Eğitimi, 2023
Ticaret Hukuku Uzman Arabuluculuk Eğitimi, 2023
İş Hukuku Uzman Arabuluculuk Eğitimi, 2023
Enerji Hukuku Sertifikası, 2021
Ceza Muhakemeleri Usulü Uygulama Hizmetleri Mesleki Eğitim Sertifikası, 2020
Konkordato Komiseri, 2019
Temel Arabuluculuk Eğitimi, 2018
Trafik Kazaları ve İş Kazalarında Aktüeryal Uzmanlık, 2017
Kriminoloji, 2011`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'İş Hukuku',
      'Dava Takibi ve Tahkim',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Sağlık ve İlaç Hukuku',
      'Gayrimenkul ve İnşaat Hukuku',
    ],
  },
  {
    name: 'Gizem Bora',
    position: 'LAWYER',
    education: 'Ankara Üniversitesi Hukuk Fakültesi, 2007',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Birleşme ve Devralmalar',
      'Ticaret Hukuku ve Sermaye Piyasaları',
      'Gayrimenkul ve İnşaat Hukuku',
      'Dava Takibi ve Tahkim',
      'İş Hukuku',
      'Fikri Mülkiyet Hukuku',
      'Kişisel Verilerin Korunması Hukuku',
      'Vergi Hukuku',
    ],
  },
  {
    name: 'Begüm Berna Yılmaz',
    position: 'LAWYER',
    education: `Anadolu Üniversitesi Özel Hukuk Yüksek Lisans Programı

Ankara Haci Bayram Veli Üniversitesi Hukuk Fakültesi, 2023

Eğitimler, Sertifikalar ve Katılım Belgesi:
TNC Group Temel Hukuk Eğitimi Bitirme Sertifikası, 2024
Gizlilik Hukuku ve Veri Koruma – Pensilvanya Üniversitesi, 2023 (Coursera)
Sermaye Piyasası Kurulu Eğitim Semineri Programı Katılımcı Sertifikası, 2023
TÜİÇ Akademi Uluslararası Hukuk Alanında Online Staj Katılım Sertifikası, 2021`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'Dava Takibi ve Tahkim',
      'İş Hukuku',
      'Kişisel Verilerin Korunması Hukuku',
    ],
  },
  {
    name: 'Sümeyya Erol',
    position: 'LAWYER',
    education: `Konya Selçuk Üniversitesi Hukuk Fakültesi, 2015

Anadolu Üniversitesi Uluslararası İlişkiler Bölümü

Eğitimler, Sertifikalar ve Katılım Belgesi:
İş Kazalarında Maluliyet Tespit İşlemleri Eğitimi, 2023
Arsa Payı Kat Karşılığı İnşaat Sözleşmeleri Eğitim, 2022
Adi Şirket Uygulamasına Giriş Eğitimi, 2021
Ölüm Halinde ve Bedensel Zararlarda Tazminatın Belirlenmesi İlkeleri Eğitimi, 2021
İdarenin Kamulaştırma Yetkisi ve Kamulaştırma Süreci Eğitimi, 2021
Marka Hukukunda İhlal Değerlendirmesi Eğitimi, 2021
Tasarım Hukukunda İhlal Değerlendirmesi Eğitimi, 2021
6284 Sayılı Yasa ve Uygulamaları Eğitimi, 2021
Savunma Sanayinde Telif Hakları (FİSAUM), 2019`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [
      'İş Hukuku',
      'Dava Takibi ve Tahkim',
      'Sağlık ve İlaç Hukuku',
      'Gayrimenkul ve İnşaat Hukuku',
    ],
  },
  {
    name: 'Mustafa Aydın',
    position: 'LAWYER',
    education: 'Marmara Üniversitesi Hukuk Fakültesi',
    bar: 'İstanbul Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Dilara Beyatlı',
    position: 'LAWYER',
    education: 'Özyeğin Üniversitesi Hukuk Fakültesi',
    bar: 'İstanbul Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Doğukan Başaran',
    position: 'LAWYER',
    education: 'Ankara Üniversitesi Hukuk Fakültesi',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Sennur Ertufan',
    position: 'INTERN',
    education: 'Ankara Üniversitesi Hukuk Fakültesi, 2024',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Erdem Erdoğan',
    position: 'INTERN',
    education: 'Başkent Üniversitesi Hukuk Fakültesi, 2024',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Baver Bozkurt',
    position: 'INTERN',
    education: `İstanbul Üniversitesi Hukuk Fakültesi, 2022

East Anglia Üniversitesi Uluslararası Ticaret ve Rekabet Hukuku Yüksek Lisans Programı, 2024

CIArb Member (MCIArb)`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Duru Olhan',
    position: 'INTERN',
    education: 'TOBB Üniversitesi Hukuk Fakültesi, 2024',
    bar: 'Ankara Barosu',
    languages: 'İngilizce, Almanca',
    practiceAreaLabels: [],
  },
  {
    name: 'İrem İneci',
    position: 'INTERN',
    education: 'İhsan Doğramaci Bilkent Üniversitesi Hukuk Fakültesi, 2024',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Gaye Vuslat Üstün',
    position: 'INTERN',
    education: 'Ankara Üniversitesi Hukuk Fakültesi, 2024',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
  {
    name: 'Zeynep Defne Tekin',
    position: 'INTERN',
    education: `İhsan Doğramaci Bilkent Üniversitesi Hukuk Fakültesi, 2024

Eğitimler, Sertifikalar ve Katılım Belgesi:
Fikri Mülkiyet Genel Kursu, 2023 Avrupa Konseyi Yardım Çevrimiçi Kursu, Veri Koruma ve Gizlilik Hakları, 2023
Yeni Teknoloji ve Ticaret Hukuku Yaz Programı Tamamlama Sertifikası, 2023
Lahey Akademisi Çevrimiçi Kış Kursu Kayıt Sertifikası, 2023
Uluslararası Bakalorya Diploması, 2019`,
    bar: 'Ankara Barosu',
    languages: 'İngilizce, Almanca',
    practiceAreaLabels: [],
  },
  {
    name: 'Kadir Çam',
    position: 'INTERN',
    education: 'Bilkent Üniversitesi Hukuk Fakültesi, 2025',
    bar: 'Ankara Barosu',
    languages: 'İngilizce',
    practiceAreaLabels: [],
  },
]

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL tanımlı değil (.env)')
    process.exit(1)
  }

  let order = 0
  for (const row of ROWS) {
    const baseSlug = slugifyTR(row.name)
    const flags = positionToFlags(row.position)
    const practiceAreas = normalizeLawyerPracticeAreaSlugs(cleanAreaLabels(row.practiceAreaLabels))

    const lawyer = await prisma.lawyer.upsert({
      where: { slug: baseSlug },
      create: {
        slug: baseSlug,
        order,
        ...flags,
      },
      update: {
        order,
        ...flags,
      },
    })

    const trPayload = {
      name: row.name,
      bio: null as string | null,
      education: row.education.trim() || null,
      languages: row.languages.trim() || null,
      bar: row.bar.trim() || null,
      practiceAreas,
    }

    await prisma.lawyerTranslation.upsert({
      where: {
        lawyerId_language: { lawyerId: lawyer.id, language: Language.TR },
      },
      create: {
        lawyerId: lawyer.id,
        language: Language.TR,
        ...trPayload,
      },
      update: trPayload,
    })

    await prisma.lawyerTranslation.upsert({
      where: {
        lawyerId_language: { lawyerId: lawyer.id, language: Language.EN },
      },
      create: {
        lawyerId: lawyer.id,
        language: Language.EN,
        name: row.name,
        bio: null,
        education: row.education.trim() || null,
        languages: row.languages.trim() || null,
        bar: row.bar.trim() || null,
        practiceAreas,
      },
      update: {
        name: row.name,
        education: row.education.trim() || null,
        languages: row.languages.trim() || null,
        bar: row.bar.trim() || null,
        practiceAreas,
      },
    })

    console.log(`OK [${order}] ${row.name} → ${baseSlug}`)
    order += 1
  }

  console.log(`\nTamam: ${ROWS.length} avukat işlendi.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
