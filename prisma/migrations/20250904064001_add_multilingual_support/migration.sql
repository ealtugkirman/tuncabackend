-- CreateEnum
CREATE TYPE "Language" AS ENUM ('TR', 'EN');

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'TR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_translations" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_translations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_translations" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publication_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyer_translations" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lawyer_translations_pkey" PRIMARY KEY ("id")
);

-- Add slug columns with default values first
ALTER TABLE "announcements" ADD COLUMN "slug" TEXT;
ALTER TABLE "events" ADD COLUMN "slug" TEXT;
ALTER TABLE "lawyers" ADD COLUMN "slug" TEXT;
ALTER TABLE "publications" ADD COLUMN "slug" TEXT;

-- Generate slugs for existing records
UPDATE "announcements" SET "slug" = 'announcement-' || "id" WHERE "slug" IS NULL;
UPDATE "events" SET "slug" = 'event-' || "id" WHERE "slug" IS NULL;
UPDATE "lawyers" SET "slug" = 'lawyer-' || "id" WHERE "slug" IS NULL;
UPDATE "publications" SET "slug" = 'publication-' || "id" WHERE "slug" IS NULL;

-- Make slug columns unique and not null
ALTER TABLE "announcements" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "events" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "lawyers" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "slug" SET NOT NULL;

-- Migrate existing data to Turkish translations first
INSERT INTO "announcement_translations" ("id", "announcementId", "language", "title", "excerpt", "content", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    'TR',
    COALESCE("title", 'Başlık Yok'),
    COALESCE("excerpt", 'Özet Yok'),
    COALESCE("content", 'İçerik Yok'),
    "createdAt",
    "updatedAt"
FROM "announcements"
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'announcements' 
    AND column_name IN ('title', 'excerpt', 'content')
);

INSERT INTO "event_translations" ("id", "eventId", "language", "title", "excerpt", "content", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    'TR',
    COALESCE("title", 'Başlık Yok'),
    COALESCE("excerpt", 'Özet Yok'),
    COALESCE("content", 'İçerik Yok'),
    "createdAt",
    "updatedAt"
FROM "events"
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name IN ('title', 'excerpt', 'content')
);

INSERT INTO "publication_translations" ("id", "publicationId", "language", "title", "excerpt", "content", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    'TR',
    COALESCE("title", 'Başlık Yok'),
    COALESCE("excerpt", 'Özet Yok'),
    COALESCE("content", 'İçerik Yok'),
    "createdAt",
    "updatedAt"
FROM "publications"
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'publications' 
    AND column_name IN ('title', 'excerpt', 'content')
);

INSERT INTO "lawyer_translations" ("id", "lawyerId", "language", "name", "title", "bio", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    'TR',
    COALESCE("name", 'İsim Yok'),
    COALESCE("title", 'Ünvan Yok'),
    COALESCE("bio", 'Biyografi Yok'),
    "createdAt",
    "updatedAt"
FROM "lawyers"
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lawyers' 
    AND column_name IN ('name', 'title', 'bio')
);

-- Remove old content columns from main tables
ALTER TABLE "announcements" DROP COLUMN IF EXISTS "title";
ALTER TABLE "announcements" DROP COLUMN IF EXISTS "excerpt";
ALTER TABLE "announcements" DROP COLUMN IF EXISTS "content";

ALTER TABLE "events" DROP COLUMN IF EXISTS "title";
ALTER TABLE "events" DROP COLUMN IF EXISTS "excerpt";
ALTER TABLE "events" DROP COLUMN IF EXISTS "content";

ALTER TABLE "publications" DROP COLUMN IF EXISTS "title";
ALTER TABLE "publications" DROP COLUMN IF EXISTS "excerpt";
ALTER TABLE "publications" DROP COLUMN IF EXISTS "content";

ALTER TABLE "lawyers" DROP COLUMN IF EXISTS "name";
ALTER TABLE "lawyers" DROP COLUMN IF EXISTS "title";
ALTER TABLE "lawyers" DROP COLUMN IF EXISTS "bio";

-- Create unique constraints
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");
CREATE UNIQUE INDEX "announcements_slug_key" ON "announcements"("slug");
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
CREATE UNIQUE INDEX "lawyers_slug_key" ON "lawyers"("slug");
CREATE UNIQUE INDEX "publications_slug_key" ON "publications"("slug");

-- Create unique indexes for translations
CREATE UNIQUE INDEX "announcement_translations_announcementId_language_key" ON "announcement_translations"("announcementId", "language");
CREATE UNIQUE INDEX "event_translations_eventId_language_key" ON "event_translations"("eventId", "language");
CREATE UNIQUE INDEX "publication_translations_publicationId_language_key" ON "publication_translations"("publicationId", "language");
CREATE UNIQUE INDEX "lawyer_translations_lawyerId_language_key" ON "lawyer_translations"("lawyerId", "language");

-- Add foreign key constraints
ALTER TABLE "announcement_translations" ADD CONSTRAINT "announcement_translations_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_translations" ADD CONSTRAINT "event_translations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "publication_translations" ADD CONSTRAINT "publication_translations_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lawyer_translations" ADD CONSTRAINT "lawyer_translations_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

