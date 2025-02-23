/*
  Warnings:

  - The primary key for the `encuestas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `analisis` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `id_ciudadano` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `id_encuesta` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `preguntas` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `respuestas` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `resultado` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_subida` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_archivo` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `ruta_archivo` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_archivo` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_limite_pago` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `moneda_pago` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `numero_transaccion` on the `pagos` table. All the data in the column will be lost.
  - Added the required column `creadorId` to the `encuestas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `encuestas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo` to the `encuestas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_archivo` to the `Multimedia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `encuestas` DROP FOREIGN KEY `Encuestas_id_ciudadano_fkey`;

-- DropForeignKey
ALTER TABLE `encuestas` DROP FOREIGN KEY `Encuestas_id_usuario_fkey`;

-- DropIndex
DROP INDEX `Encuestas_id_ciudadano_fkey` ON `encuestas`;

-- DropIndex
DROP INDEX `Encuestas_id_usuario_fkey` ON `encuestas`;

-- DropIndex
DROP INDEX `Multimedia_categoria_fecha_subida_idx` ON `multimedia`;

-- AlterTable
ALTER TABLE `encuestas` DROP PRIMARY KEY,
    DROP COLUMN `analisis`,
    DROP COLUMN `id_ciudadano`,
    DROP COLUMN `id_encuesta`,
    DROP COLUMN `id_usuario`,
    DROP COLUMN `preguntas`,
    DROP COLUMN `respuestas`,
    DROP COLUMN `resultado`,
    ADD COLUMN `creadorId` INTEGER NOT NULL,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `estado` ENUM('activa', 'inactiva', 'borrador', 'finalizada') NOT NULL DEFAULT 'activa',
    ADD COLUMN `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fechaExpiracion` DATETIME(3) NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `titulo` VARCHAR(200) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `multimedia` DROP COLUMN `categoria`,
    DROP COLUMN `fecha_subida`,
    DROP COLUMN `nombre_archivo`,
    DROP COLUMN `ruta_archivo`,
    DROP COLUMN `tipo_archivo`,
    ADD COLUMN `url_archivo` VARCHAR(200) NOT NULL;

-- AlterTable
ALTER TABLE `pagos` DROP COLUMN `fecha_limite_pago`,
    DROP COLUMN `moneda_pago`,
    DROP COLUMN `numero_transaccion`,
    ADD COLUMN `monto_pago` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `monto_saldo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `usuario` MODIFY `rol` ENUM('administrador', 'recolector', 'encuestador', 'encuestado') NOT NULL;

-- CreateTable
CREATE TABLE `preguntas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encuestaId` INTEGER NOT NULL,
    `texto` TEXT NOT NULL,
    `tipo` ENUM('opcion_multiple', 'seleccion_unica', 'texto_libre', 'escala', 'si_no') NOT NULL,
    `requerida` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opciones_preguntas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `preguntaId` INTEGER NOT NULL,
    `texto` VARCHAR(200) NOT NULL,
    `orden` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `respuestas_encuestas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encuestaId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `ciudadano_id` INTEGER NOT NULL,
    `fechaRespuesta` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completada` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `respuestas_preguntas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `respuestaEncuestaId` INTEGER NOT NULL,
    `preguntaId` INTEGER NOT NULL,
    `opcionSeleccionadaId` INTEGER NULL,
    `textoRespuesta` TEXT NULL,
    `valorEscala` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `encuestas` ADD CONSTRAINT `encuestas_creadorId_fkey` FOREIGN KEY (`creadorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preguntas` ADD CONSTRAINT `preguntas_encuestaId_fkey` FOREIGN KEY (`encuestaId`) REFERENCES `encuestas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opciones_preguntas` ADD CONSTRAINT `opciones_preguntas_preguntaId_fkey` FOREIGN KEY (`preguntaId`) REFERENCES `preguntas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_encuestas` ADD CONSTRAINT `respuestas_encuestas_encuestaId_fkey` FOREIGN KEY (`encuestaId`) REFERENCES `encuestas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_encuestas` ADD CONSTRAINT `respuestas_encuestas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_encuestas` ADD CONSTRAINT `respuestas_encuestas_ciudadano_id_fkey` FOREIGN KEY (`ciudadano_id`) REFERENCES `UsuarioCiudadano`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_preguntas` ADD CONSTRAINT `respuestas_preguntas_respuestaEncuestaId_fkey` FOREIGN KEY (`respuestaEncuestaId`) REFERENCES `respuestas_encuestas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_preguntas` ADD CONSTRAINT `respuestas_preguntas_preguntaId_fkey` FOREIGN KEY (`preguntaId`) REFERENCES `preguntas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_preguntas` ADD CONSTRAINT `respuestas_preguntas_opcionSeleccionadaId_fkey` FOREIGN KEY (`opcionSeleccionadaId`) REFERENCES `opciones_preguntas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
