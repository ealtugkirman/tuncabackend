-- AlterTable
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "practiceAreaSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
