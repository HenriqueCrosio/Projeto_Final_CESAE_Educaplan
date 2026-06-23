-- CreateEnum
CREATE TYPE "StudentResourceKind" AS ENUM ('LINK', 'YOUTUBE', 'SPOTIFY');

-- CreateTable
CREATE TABLE "StudentResource" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "kind" "StudentResourceKind" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentResource_studentId_idx" ON "StudentResource"("studentId");

-- AddForeignKey
ALTER TABLE "StudentResource" ADD CONSTRAINT "StudentResource_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
