-- CreateTable
CREATE TABLE "StudentHubConfig" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "bannerItemId" TEXT,
    "paletteItemId" TEXT,
    "favoriteBadgeIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentHubConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentHubConfig_studentId_key" ON "StudentHubConfig"("studentId");

-- AddForeignKey
ALTER TABLE "StudentHubConfig" ADD CONSTRAINT "StudentHubConfig_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
