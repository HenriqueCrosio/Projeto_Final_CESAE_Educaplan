-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('BADGE', 'PALETTE', 'BANNER', 'BOOST', 'CHEST');

-- CreateTable
CREATE TABLE "RewardItem" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "RewardType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "cost" INTEGER NOT NULL DEFAULT 0,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentReward" (
    "studentId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentReward_pkey" PRIMARY KEY ("studentId","itemId")
);

-- CreateTable
CREATE TABLE "ChestDrop" (
    "id" TEXT NOT NULL,
    "chestId" TEXT NOT NULL,
    "itemId" TEXT,
    "books" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ChestDrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBoost" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentBoost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RewardItem_code_key" ON "RewardItem"("code");

-- CreateIndex
CREATE INDEX "StudentReward_studentId_idx" ON "StudentReward"("studentId");

-- CreateIndex
CREATE INDEX "ChestDrop_chestId_idx" ON "ChestDrop"("chestId");

-- CreateIndex
CREATE INDEX "StudentBoost_studentId_expiresAt_idx" ON "StudentBoost"("studentId", "expiresAt");

-- AddForeignKey
ALTER TABLE "StudentReward" ADD CONSTRAINT "StudentReward_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentReward" ADD CONSTRAINT "StudentReward_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RewardItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChestDrop" ADD CONSTRAINT "ChestDrop_chestId_fkey" FOREIGN KEY ("chestId") REFERENCES "RewardItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChestDrop" ADD CONSTRAINT "ChestDrop_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RewardItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBoost" ADD CONSTRAINT "StudentBoost_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
