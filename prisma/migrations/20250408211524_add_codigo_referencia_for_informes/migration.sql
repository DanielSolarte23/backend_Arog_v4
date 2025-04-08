/*
  Warnings:

  - A unique constraint covering the columns `[tipoDocumento,referenciaId,codigoReferencia]` on the table `DocumentoPdf` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `DocumentoPdf_tipoDocumento_referenciaId_key` ON `documentopdf`;

-- AlterTable
ALTER TABLE `documentopdf` ADD COLUMN `codigoReferencia` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `DocumentoPdf_tipoDocumento_referenciaId_codigoReferencia_key` ON `DocumentoPdf`(`tipoDocumento`, `referenciaId`, `codigoReferencia`);
