/*
  Warnings:

  - You are about to drop the column `complexity` on the `analysis` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,analysisHash]` on the table `Analysis` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `analysis` DROP COLUMN `complexity`,
    ADD COLUMN `analysisHash` VARCHAR(191) NULL,
    ADD COLUMN `availableHours` DOUBLE NULL,
    ADD COLUMN `bufferHours` DOUBLE NULL,
    ADD COLUMN `bufferPercent` DOUBLE NULL,
    ADD COLUMN `capacityUtilization` DOUBLE NULL,
    ADD COLUMN `complexityLevel` VARCHAR(191) NULL,
    ADD COLUMN `complexityScore` INTEGER NULL,
    ADD COLUMN `confidence` INTEGER NULL,
    ADD COLUMN `documentationHours` DOUBLE NULL,
    ADD COLUMN `estimatedHours` DOUBLE NULL,
    ADD COLUMN `estimatedWeeks` DOUBLE NULL,
    ADD COLUMN `integrationHours` DOUBLE NULL,
    ADD COLUMN `productiveHours` DOUBLE NULL,
    ADD COLUMN `projectHealth` VARCHAR(191) NULL,
    ADD COLUMN `rawDevelopmentHours` DOUBLE NULL,
    ADD COLUMN `reworkHours` DOUBLE NULL,
    ADD COLUMN `scopeScore` INTEGER NULL,
    ADD COLUMN `testingHours` DOUBLE NULL,
    ADD COLUMN `timelineFit` VARCHAR(191) NULL,
    ADD COLUMN `workingDays` INTEGER NULL,
    MODIFY `scopeIncreasePercent` DOUBLE NULL,
    MODIFY `additionalHours` DOUBLE NULL,
    MODIFY `delayWeeks` DOUBLE NULL,
    MODIFY `riskLevel` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Analysis_projectId_analysisHash_key` ON `Analysis`(`projectId`, `analysisHash`);
