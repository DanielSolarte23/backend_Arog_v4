/*
  Warnings:

  - You are about to drop the `registroderecoleccionenfuentes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registrooperativoenruta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `registroderecoleccionenfuentes` DROP FOREIGN KEY `RegistroDeRecoleccionEnFuentes_id_responsable_fkey`;

-- DropForeignKey
ALTER TABLE `registroderecoleccionenfuentes` DROP FOREIGN KEY `RegistroDeRecoleccionEnFuentes_id_responsable_fuente_fkey`;

-- DropForeignKey
ALTER TABLE `registrooperativoenruta` DROP FOREIGN KEY `RegistroOperativoEnRuta_id_operario_fkey`;

-- DropTable
DROP TABLE `registroderecoleccionenfuentes`;

-- DropTable
DROP TABLE `registrooperativoenruta`;

-- CreateTable
CREATE TABLE `formulario_tipos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadorId` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campo_formularios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formularioTipoId` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `tipo` ENUM('texto', 'numero', 'decimal', 'fecha', 'hora', 'fecha_hora', 'select', 'checkbox', 'radio', 'textarea', 'archivo', 'ubicacion') NOT NULL,
    `requerido` BOOLEAN NOT NULL DEFAULT false,
    `orden` INTEGER NOT NULL,
    `opciones` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formularios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formularioTipoId` INTEGER NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `estado` ENUM('borrador', 'enviado', 'aprobado', 'rechazado') NOT NULL DEFAULT 'borrador',
    `rutaId` INTEGER NULL,
    `creadorId` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_envio` DATETIME(3) NULL,
    `tareaId` INTEGER NULL,

    UNIQUE INDEX `formularios_tareaId_key`(`tareaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `valor_campos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formularioId` INTEGER NOT NULL,
    `campoFormularioId` INTEGER NOT NULL,
    `valorTexto` TEXT NULL,
    `valorNumero` INTEGER NULL,
    `valorDecimal` DECIMAL(10, 5) NULL,
    `valorFecha` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tareas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `estado` ENUM('pendiente', 'en_progreso', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    `prioridad` ENUM('baja', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
    `asignadoId` INTEGER NOT NULL,
    `creadorId` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_limite` DATETIME(3) NULL,
    `fecha_completada` DATETIME(3) NULL,
    `rutaId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `formulario_tipos` ADD CONSTRAINT `formulario_tipos_creadorId_fkey` FOREIGN KEY (`creadorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campo_formularios` ADD CONSTRAINT `campo_formularios_formularioTipoId_fkey` FOREIGN KEY (`formularioTipoId`) REFERENCES `formulario_tipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formularios` ADD CONSTRAINT `formularios_formularioTipoId_fkey` FOREIGN KEY (`formularioTipoId`) REFERENCES `formulario_tipos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formularios` ADD CONSTRAINT `formularios_rutaId_fkey` FOREIGN KEY (`rutaId`) REFERENCES `Rutas`(`id_ruta`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formularios` ADD CONSTRAINT `formularios_creadorId_fkey` FOREIGN KEY (`creadorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formularios` ADD CONSTRAINT `formularios_tareaId_fkey` FOREIGN KEY (`tareaId`) REFERENCES `tareas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `valor_campos` ADD CONSTRAINT `valor_campos_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `formularios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `valor_campos` ADD CONSTRAINT `valor_campos_campoFormularioId_fkey` FOREIGN KEY (`campoFormularioId`) REFERENCES `campo_formularios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tareas` ADD CONSTRAINT `tareas_asignadoId_fkey` FOREIGN KEY (`asignadoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tareas` ADD CONSTRAINT `tareas_creadorId_fkey` FOREIGN KEY (`creadorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tareas` ADD CONSTRAINT `tareas_rutaId_fkey` FOREIGN KEY (`rutaId`) REFERENCES `Rutas`(`id_ruta`) ON DELETE SET NULL ON UPDATE CASCADE;
