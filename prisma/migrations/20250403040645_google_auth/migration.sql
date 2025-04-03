-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(100) NULL,
    ADD COLUMN `verificationToken` VARCHAR(100) NULL,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;
