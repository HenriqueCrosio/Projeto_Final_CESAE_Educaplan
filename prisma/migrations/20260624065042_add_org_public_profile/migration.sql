-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logoUrl" TEXT;
