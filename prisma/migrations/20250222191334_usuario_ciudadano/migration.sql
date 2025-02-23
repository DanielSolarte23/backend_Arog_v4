/*
  Warnings:

  - You are about to drop the column `id_usuario` on the `usuariociudadano` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `usuariociudadano` DROP FOREIGN KEY `UsuarioCiudadano_id_usuario_fkey`;

-- DropIndex
DROP INDEX `UsuarioCiudadano_id_usuario_fkey` ON `usuariociudadano`;

-- AlterTable
ALTER TABLE `usuariociudadano` DROP COLUMN `id_usuario`;
