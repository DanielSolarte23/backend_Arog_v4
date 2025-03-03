/*
  Warnings:

  - You are about to drop the column `nombre_de_usuario` on the `usuario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Usuario_nombre_de_usuario_key` ON `usuario`;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `nombre_de_usuario`;
