/*
  Warnings:

  - You are about to drop the `usuariociudadano` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `incidencias` DROP FOREIGN KEY `Incidencias_id_usuario_ciudadano_fkey`;

-- DropForeignKey
ALTER TABLE `pqrs` DROP FOREIGN KEY `Pqrs_id_ciudadano_fkey`;

-- DropForeignKey
ALTER TABLE `respuestas_encuestas` DROP FOREIGN KEY `respuestas_encuestas_ciudadano_id_fkey`;

-- DropIndex
DROP INDEX `Incidencias_id_usuario_ciudadano_fkey` ON `incidencias`;

-- DropIndex
DROP INDEX `Pqrs_id_ciudadano_fkey` ON `pqrs`;

-- DropIndex
DROP INDEX `respuestas_encuestas_ciudadano_id_fkey` ON `respuestas_encuestas`;

-- AlterTable
ALTER TABLE `respuestas_encuestas` MODIFY `ciudadano_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `barrio` VARCHAR(50) NULL,
    ADD COLUMN `direccion` VARCHAR(50) NULL,
    ADD COLUMN `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    ADD COLUMN `historial_reciclaje` VARCHAR(100) NULL,
    MODIFY `rol` ENUM('administrador', 'recolector', 'ciudadano', 'encuestador', 'encuestado') NOT NULL DEFAULT 'ciudadano';

-- DropTable
DROP TABLE `usuariociudadano`;

-- AddForeignKey
ALTER TABLE `respuestas_encuestas` ADD CONSTRAINT `respuestas_encuestas_ciudadano_id_fkey` FOREIGN KEY (`ciudadano_id`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pqrs` ADD CONSTRAINT `Pqrs_id_ciudadano_fkey` FOREIGN KEY (`id_ciudadano`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_ciudadano_fkey` FOREIGN KEY (`id_usuario_ciudadano`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
