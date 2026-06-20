-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "status" "CourseStatusEnum" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "_LessonToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LessonToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LessonToTopic_B_index" ON "_LessonToTopic"("B");

-- AddForeignKey
ALTER TABLE "_LessonToTopic" ADD CONSTRAINT "_LessonToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToTopic" ADD CONSTRAINT "_LessonToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
