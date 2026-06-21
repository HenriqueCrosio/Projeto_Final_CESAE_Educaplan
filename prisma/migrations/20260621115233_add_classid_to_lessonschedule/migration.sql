/*
  Warnings:

  - Added the required column `classId` to the `LessonSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LessonSchedule" ADD COLUMN     "classId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "LessonSchedule_classId_idx" ON "LessonSchedule"("classId");

-- AddForeignKey
ALTER TABLE "LessonSchedule" ADD CONSTRAINT "LessonSchedule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
