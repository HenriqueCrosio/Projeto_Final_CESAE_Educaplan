-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_addedById_fkey";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "addedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
