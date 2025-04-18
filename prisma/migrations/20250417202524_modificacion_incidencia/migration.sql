-- DropForeignKey
ALTER TABLE `incidencias` DROP FOREIGN KEY `Incidencias_id_usuario_ciudadano_fkey`;

-- DropForeignKey
ALTER TABLE `incidencias` DROP FOREIGN KEY `Incidencias_id_usuario_modificador_fkey`;

-- DropIndex
DROP INDEX `Incidencias_id_usuario_ciudadano_fkey` ON `incidencias`;

-- DropIndex
DROP INDEX `Incidencias_id_usuario_modificador_fkey` ON `incidencias`;
