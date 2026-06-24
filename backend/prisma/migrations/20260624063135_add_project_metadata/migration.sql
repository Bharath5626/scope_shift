-- AlterTable
ALTER TABLE `project` ADD COLUMN `methodology` VARCHAR(191) NULL,
    ADD COLUMN `projectType` VARCHAR(191) NULL,
    ADD COLUMN `teamSize` INTEGER NULL,
    ADD COLUMN `techStack` TEXT NULL,
    ADD COLUMN `workingHours` INTEGER NULL;
