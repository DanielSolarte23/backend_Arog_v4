/*
  Warnings:

  - The primary key for the `documentopdf` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fecha_subida` on the `documentopdf` table. All the data in the column will be lost.
  - You are about to drop the column `id_pdf` on the `documentopdf` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_archivo` on the `documentopdf` table. All the data in the column will be lost.
  - You are about to drop the column `referencia_id` on the `documentopdf` table. All the data in the column will be lost.
  - You are about to drop the column `tamano_archivo` on the `documentopdf` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_archivo` on the `documentopdf` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_documento` on the `documentopdf` table. All the data in the column will be lost.
  - You are about to drop the column `url_archivo` on the `documentopdf` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tipoDocumento,referenciaId]` on the table `DocumentoPdf` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `DocumentoPdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreArchivo` to the `DocumentoPdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tamanoArchivo` to the `DocumentoPdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoArchivo` to the `DocumentoPdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `DocumentoPdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DocumentoPdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `DocumentoPdf` table without a default value. This is not possible if the table is not empty.
  - Made the column `paginas` on table `documentopdf` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `DocumentoPdf_tipo_documento_referencia_id_key` ON `documentopdf`;

-- AlterTable
ALTER TABLE `documentopdf` DROP PRIMARY KEY,
    DROP COLUMN `fecha_subida`,
    DROP COLUMN `id_pdf`,
    DROP COLUMN `nombre_archivo`,
    DROP COLUMN `referencia_id`,
    DROP COLUMN `tamano_archivo`,
    DROP COLUMN `tipo_archivo`,
    DROP COLUMN `tipo_documento`,
    DROP COLUMN `url_archivo`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombreArchivo` VARCHAR(191) NOT NULL,
    ADD COLUMN `referenciaId` INTEGER NULL,
    ADD COLUMN `subtipoCertificado` VARCHAR(191) NULL,
    ADD COLUMN `tamanoArchivo` DOUBLE NOT NULL,
    ADD COLUMN `tipoArchivo` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipoDocumento` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `url` VARCHAR(191) NOT NULL,
    MODIFY `paginas` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `DocumentoPdf_tipoDocumento_referenciaId_key` ON `DocumentoPdf`(`tipoDocumento`, `referenciaId`);
