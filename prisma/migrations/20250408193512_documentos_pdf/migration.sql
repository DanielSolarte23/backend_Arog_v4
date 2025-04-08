/*
  Warnings:

  - The values [CERTIFICADO,INFORME] on the enum `DocumentoPdf_tipo_documento` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `documentopdf` MODIFY `tipo_documento` ENUM('informe', 'certificado') NOT NULL;
