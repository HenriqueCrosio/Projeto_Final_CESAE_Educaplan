-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EXAM_SUBMITTED', 'EXAM_GRADED', 'DAILY_CHECKIN', 'LESSON_DONE', 'MATERIAL_READ');

-- CreateTable
CREATE TABLE "StudentGameProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "books" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityOn" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "books" INTEGER NOT NULL DEFAULT 0,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentGameProfile_studentId_key" ON "StudentGameProfile"("studentId");

-- CreateIndex
CREATE INDEX "ActivityEvent_studentId_createdAt_idx" ON "ActivityEvent"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_studentId_type_refId_idx" ON "ActivityEvent"("studentId", "type", "refId");

-- AddForeignKey
ALTER TABLE "StudentGameProfile" ADD CONSTRAINT "StudentGameProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
