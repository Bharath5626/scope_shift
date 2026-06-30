/*
  Warnings:

  - A unique constraint covering the columns `[projectId,version]` on the table `Analysis` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Analysis_projectId_analysisHash_key` ON `analysis`;

-- AlterTable
ALTER TABLE `analysis` ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `Analysis_projectId_idx` ON `Analysis`(`projectId`);

-- CreateIndex
CREATE UNIQUE INDEX `Analysis_projectId_version_key` ON `Analysis`(`projectId`, `version`);
