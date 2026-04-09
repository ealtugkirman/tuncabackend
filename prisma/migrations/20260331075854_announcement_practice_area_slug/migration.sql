-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "practiceAreaSlug" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "lawyers" ADD COLUMN     "isLawyer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "image" TEXT,
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "tags" TEXT[];

-- CreateIndex
CREATE INDEX "announcements_practiceAreaSlug_idx" ON "announcements"("practiceAreaSlug");
