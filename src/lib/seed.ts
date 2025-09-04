import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@tuncalaw.com' },
    update: {
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
    create: {
      email: 'admin@tuncalaw.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
  })

  console.log('Superadmin user created/updated:', superadmin)

  // Create additional admin user
  const adminHashedPassword = await bcrypt.hash('password123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      password: adminHashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@admin.com',
      password: adminHashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('Admin user created/updated:', admin)

  // Create sample lawyers
  const lawyer1 = await prisma.lawyer.upsert({
    where: { id: 'lawyer-1' },
    update: {},
    create: {
      id: 'lawyer-1',
      name: 'Dr. Mehmet Tunca',
      title: 'ORTAK AVUKAT',
      education: ['Ankara Üniversitesi Hukuk Fakültesi', 'LL.M. Harvard Law School'],
      bar: 'Ankara Barosu',
      languages: ['İngilizce', 'Almanca'],
      practiceAreas: ['Kurumsal Hukuk', 'Birleşme ve Devralmalar', 'Sermaye Piyasaları'],
      image: '/team/mehmet-tunca.jpg',
      isPartner: true,
      isFounder: true,
      hasPhD: true,
      certifications: ['CFA', 'CPA'],
      bio: 'Kurumsal hukuk alanında 20 yıllık deneyime sahip, uluslararası şirketlerin birleşme ve devralma işlemlerinde uzman.',
    },
  })

  const lawyer2 = await prisma.lawyer.upsert({
    where: { id: 'lawyer-2' },
    update: {},
    create: {
      id: 'lawyer-2',
      name: 'Ayşe Yılmaz',
      title: 'AVUKAT',
      education: ['İstanbul Üniversitesi Hukuk Fakültesi'],
      bar: 'İstanbul Barosu',
      languages: ['İngilizce'],
      practiceAreas: ['İş Hukuku', 'Ticaret Hukuku'],
      image: '/team/ayse-yilmaz.jpg',
      isPartner: false,
      isFounder: false,
      hasPhD: false,
      certifications: [],
      bio: 'İş hukuku ve ticaret hukuku alanında uzman, işçi hakları konularında deneyimli.',
    },
  })

  console.log('Sample lawyers created:', { lawyer1, lawyer2 })

  // Create sample announcements
  const announcement1 = await prisma.announcement.upsert({
    where: { id: 'announcement-1' },
    update: {},
    create: {
      id: 'announcement-1',
      title: 'Büyük Birleşme ve Devralma İşlemi Tamamlandı',
      date: '15 Aralık 2024',
      year: '2024',
      excerpt: 'Müvekkilimiz ABC Şirketi\'nin XYZ A.Ş. ile birleşme işlemi başarıyla tamamlanmıştır.',
      content: `
        <h2>Büyük Birleşme ve Devralma İşlemi Tamamlandı</h2>
        <p>Müvekkilimiz ABC Şirketi'nin XYZ A.Ş. ile birleşme işlemi başarıyla tamamlanmıştır. Bu işlem, sektörde önemli bir dönüm noktası oluşturmaktadır.</p>
        <p>İşlem sürecinde, tüm yasal gereklilikler yerine getirilmiş ve hisse sahiplerinin hakları korunmuştur.</p>
      `,
      image: '/images/merger-announcement.jpg',
      category: 'Birleşme ve Devralmalar',
      isDark: false,
      published: true,
    },
  })

  console.log('Sample announcement created:', announcement1)

  // Create sample events
  const event1 = await prisma.event.upsert({
    where: { id: 'event-1' },
    update: {},
    create: {
      id: 'event-1',
      title: 'Sürdürülebilirlik ve Hukuk Semineri',
      date: '20 Ocak 2025',
      year: '2025',
      excerpt: 'Sürdürülebilirlik konularında hukuki yaklaşımlar ve uygulamalar ele alınacak.',
      content: `
        <h2>Sürdürülebilirlik ve Hukuk Semineri</h2>
        <p>Çevre hukuku ve sürdürülebilirlik konularında uzman avukatlarımızın katılımıyla gerçekleştirilecek seminerde, güncel mevzuat ve uygulamalar ele alınacaktır.</p>
        <p>Etkinlik ücretsizdir ve tüm hukukçulara açıktır.</p>
      `,
      image: '/images/sustainability-seminar.jpg',
      eventType: 'Sürdürülebilirlik',
      category: 'Kurumsal Sorumluluk',
      location: 'Ankara',
      published: true,
    },
  })

  console.log('Sample event created:', event1)

  // Create sample publications
  const publication1 = await prisma.publication.upsert({
    where: { id: 'publication-1' },
    update: {},
    create: {
      id: 'publication-1',
      title: 'Yeni İş Kanunu Değişiklikleri',
      date: '10 Aralık 2024',
      year: '2024',
      excerpt: 'İş Kanunu\'nda yapılan son değişiklikler ve işverenlere etkileri.',
      content: `
        <h2>Yeni İş Kanunu Değişiklikleri</h2>
        <p>İş Kanunu'nda yapılan son değişiklikler, işverenlerin çalışan hakları konusundaki yükümlülüklerini artırmaktadır.</p>
        <p>Bu değişikliklerin işletmelere etkileri ve alınması gereken önlemler hakkında detaylı bilgi...</p>
      `,
      practiceArea: 'İş Hukuku',
      category: 'Mevzuat Değişikliği',
      author: 'Ayşe Yılmaz',
      tags: ['İş Hukuku', 'Mevzuat', 'İşveren Hakları'],
      published: true,
      lawyerId: 'lawyer-2',
    },
  })

  console.log('Sample publication created:', publication1)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
