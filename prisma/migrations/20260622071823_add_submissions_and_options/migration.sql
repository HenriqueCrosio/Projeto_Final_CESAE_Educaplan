-- CreateEnum
CREATE TYPE "SubmissionStatusEnum" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED');

-- CreateTable
CREATE TABLE "ExerciseOption" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ExerciseOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubmission" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "status" "SubmissionStatusEnum" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "gradedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ExamSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "examSubmissionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "responseText" TEXT,
    "isCorrect" BOOLEAN,
    "pointsAwarded" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseOption_exerciseId_order_idx" ON "ExerciseOption"("exerciseId", "order");

-- CreateIndex
CREATE INDEX "ExerciseOption_organizationId_idx" ON "ExerciseOption"("organizationId");

-- CreateIndex
CREATE INDEX "ExamSubmission_examId_idx" ON "ExamSubmission"("examId");

-- CreateIndex
CREATE INDEX "ExamSubmission_studentId_idx" ON "ExamSubmission"("studentId");

-- CreateIndex
CREATE INDEX "ExamSubmission_classId_idx" ON "ExamSubmission"("classId");

-- CreateIndex
CREATE INDEX "ExamSubmission_status_idx" ON "ExamSubmission"("status");

-- CreateIndex
CREATE INDEX "ExamSubmission_organizationId_idx" ON "ExamSubmission"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubmission_examId_studentId_key" ON "ExamSubmission"("examId", "studentId");

-- CreateIndex
CREATE INDEX "Answer_examSubmissionId_idx" ON "Answer"("examSubmissionId");

-- CreateIndex
CREATE INDEX "Answer_exerciseId_idx" ON "Answer"("exerciseId");

-- CreateIndex
CREATE INDEX "Answer_selectedOptionId_idx" ON "Answer"("selectedOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_examSubmissionId_exerciseId_key" ON "Answer"("examSubmissionId", "exerciseId");

-- AddForeignKey
ALTER TABLE "ExerciseOption" ADD CONSTRAINT "ExerciseOption_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseOption" ADD CONSTRAINT "ExerciseOption_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_examSubmissionId_fkey" FOREIGN KEY ("examSubmissionId") REFERENCES "ExamSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "ExerciseOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
