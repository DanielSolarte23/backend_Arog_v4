/*
  Warnings:

  - You are about to drop the column `id_fin` on the `rutas` table. All the data in the column will be lost.
  - You are about to drop the column `id_inicio` on the `rutas` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `ubicaciones` table. All the data in the column will be lost.
  - You are about to alter the column `latitud` on the `ubicaciones` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,8)`.
  - You are about to alter the column `longitud` on the `ubicaciones` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(11,8)`.
  - You are about to drop the `autos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `paradas` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuarioAsignadoId]` on the table `Rutas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color` to the `Rutas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `paradas` DROP FOREIGN KEY `Paradas_id_ruta_fkey`;

-- DropForeignKey
ALTER TABLE `paradas` DROP FOREIGN KEY `Paradas_id_ubicacion_fkey`;

-- DropForeignKey
ALTER TABLE `rutas` DROP FOREIGN KEY `Rutas_id_fin_fkey`;

-- DropForeignKey
ALTER TABLE `rutas` DROP FOREIGN KEY `Rutas_id_inicio_fkey`;

-- DropIndex
DROP INDEX `Rutas_id_fin_fkey` ON `rutas`;

-- DropIndex
DROP INDEX `Rutas_id_inicio_fkey` ON `rutas`;

-- AlterTable
ALTER TABLE `rutas` DROP COLUMN `id_fin`,
    DROP COLUMN `id_inicio`,
    ADD COLUMN `color` VARCHAR(7) NOT NULL,
    ADD COLUMN `usuarioAsignadoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ubicaciones` DROP COLUMN `tipo`,
    MODIFY `latitud` DECIMAL(10, 8) NULL,
    MODIFY `longitud` DECIMAL(11, 8) NULL;

-- DropTable
DROP TABLE `autos`;

-- DropTable
DROP TABLE `paradas`;

-- CreateTable
CREATE TABLE `PuntosRuta` (
    `id_punto_ruta` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ruta` INTEGER NOT NULL,
    `id_ubicacion` INTEGER NOT NULL,
    `orden` INTEGER NOT NULL,

    PRIMARY KEY (`id_punto_ruta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehiculos` (
    `id_auto` INTEGER NOT NULL AUTO_INCREMENT,
    `modelo` VARCHAR(50) NOT NULL,
    `placa` VARCHAR(20) NOT NULL,
    `marca` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Vehiculos_placa_key`(`placa`),
    PRIMARY KEY (`id_auto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehiculosAsignados` (
    `id_vehiculo_asignado` INTEGER NOT NULL AUTO_INCREMENT,
    `id_vehiculo` INTEGER NOT NULL,
    `id_ruta` INTEGER NOT NULL,
    `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_vehiculo_asignado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Rutas_usuarioAsignadoId_key` ON `Rutas`(`usuarioAsignadoId`);

-- AddForeignKey
ALTER TABLE `Rutas` ADD CONSTRAINT `Rutas_usuarioAsignadoId_fkey` FOREIGN KEY (`usuarioAsignadoId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PuntosRuta` ADD CONSTRAINT `PuntosRuta_id_ruta_fkey` FOREIGN KEY (`id_ruta`) REFERENCES `Rutas`(`id_ruta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PuntosRuta` ADD CONSTRAINT `PuntosRuta_id_ubicacion_fkey` FOREIGN KEY (`id_ubicacion`) REFERENCES `Ubicaciones`(`id_ubicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehiculosAsignados` ADD CONSTRAINT `VehiculosAsignados_id_vehiculo_fkey` FOREIGN KEY (`id_vehiculo`) REFERENCES `Vehiculos`(`id_auto`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehiculosAsignados` ADD CONSTRAINT `VehiculosAsignados_id_ruta_fkey` FOREIGN KEY (`id_ruta`) REFERENCES `Rutas`(`id_ruta`) ON DELETE CASCADE ON UPDATE CASCADE;
