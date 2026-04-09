-- AlterTable
ALTER TABLE "announcements" ADD COLUMN "practiceAreaSlug" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "announcements_practiceAreaSlug_idx" ON "announcements"("practiceAreaSlug");
