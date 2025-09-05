/*
  Warnings:

  - You are about to drop the column `category` on the `announcements` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `lawyer_translations` table. All the data in the column will be lost.
  - You are about to drop the column `bar` on the `lawyers` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `lawyers` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `lawyers` table. All the data in the column will be lost.
  - You are about to drop the column `hasPhD` on the `lawyers` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `lawyers` table. All the data in the column will be lost.
  - You are about to drop the column `practiceAreas` on the `lawyers` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `publications` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `publications` table. All the data in the column will be lost.
  - You are about to drop the column `lawyerId` on the `publications` table. All the data in the column will be lost.
  - You are about to drop the column `practiceArea` on the `publications` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `publications` table. All the data in the column will be lost.
  - Changed the type of `date` on the `announcements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `year` on the `announcements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `publications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `year` on the `publications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "publications" DROP CONSTRAINT "publications_lawyerId_fkey";

-- AlterTable
ALTER TABLE "announcements" DROP COLUMN "category",
ADD COLUMN     "lawyerId" TEXT,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "year",
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "category",
DROP COLUMN "location",
DROP COLUMN "year",
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "lawyer_translations" DROP COLUMN "title",
ADD COLUMN     "bar" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "languages" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "practiceAreas" TEXT[];

-- AlterTable
ALTER TABLE "lawyers" DROP COLUMN "bar",
DROP COLUMN "certifications",
DROP COLUMN "education",
DROP COLUMN "hasPhD",
DROP COLUMN "languages",
DROP COLUMN "practiceAreas";

-- AlterTable
ALTER TABLE "publications" DROP COLUMN "author",
DROP COLUMN "category",
DROP COLUMN "lawyerId",
DROP COLUMN "practiceArea",
DROP COLUMN "tags",
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "year",
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_LawyerToPublication" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LawyerToPublication_AB_unique" ON "_LawyerToPublication"("A", "B");

-- CreateIndex
CREATE INDEX "_LawyerToPublication_B_index" ON "_LawyerToPublication"("B");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "lawyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawyerToPublication" ADD CONSTRAINT "_LawyerToPublication_A_fkey" FOREIGN KEY ("A") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawyerToPublication" ADD CONSTRAINT "_LawyerToPublication_B_fkey" FOREIGN KEY ("B") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
