-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(200) NOT NULL,
    `apellidos` VARCHAR(200) NOT NULL,
    `nombre_de_usuario` VARCHAR(100) NOT NULL,
    `contraseña` VARCHAR(255) NOT NULL,
    `correo_electronico` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `rol` ENUM('administrador', 'recolector') NOT NULL,

    UNIQUE INDEX `Usuario_nombre_de_usuario_key`(`nombre_de_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsuarioCiudadano` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `direccion` VARCHAR(50) NOT NULL,
    `barrio` VARCHAR(50) NOT NULL,
    `historial_reciclaje` VARCHAR(100) NULL,
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',

    INDEX `UsuarioCiudadano_barrio_idx`(`barrio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Residuos` (
    `id_residuos` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_de_residuo` VARCHAR(100) NOT NULL,
    `ubicacion` VARCHAR(100) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `estado` ENUM('disponible', 'en_proceso', 'reciclado') NOT NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Residuos_tipo_de_residuo_idx`(`tipo_de_residuo`),
    PRIMARY KEY (`id_residuos`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Encuestas` (
    `id_encuesta` INTEGER NOT NULL AUTO_INCREMENT,
    `preguntas` VARCHAR(200) NOT NULL,
    `respuestas` VARCHAR(100) NOT NULL,
    `resultado` VARCHAR(100) NOT NULL,
    `analisis` VARCHAR(100) NULL,
    `id_usuario` INTEGER NOT NULL,
    `id_ciudadano` INTEGER NOT NULL,

    PRIMARY KEY (`id_encuesta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pqrs` (
    `id_solicitud` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` TEXT NOT NULL,
    `motivo` VARCHAR(200) NOT NULL,
    `categoria` ENUM('Reclamo', 'Peticion', 'Queja', 'Sugerencia') NOT NULL,
    `estado` ENUM('Abierto', 'En_proceso', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    `seguimiento` VARCHAR(255) NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_ciudadano` INTEGER NOT NULL,
    `id_usuario_creador` INTEGER NOT NULL,
    `id_usuario_modificador` INTEGER NULL,

    INDEX `Pqrs_estado_fecha_creacion_idx`(`estado`, `fecha_creacion`),
    PRIMARY KEY (`id_solicitud`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistroDeRecoleccionEnFuentes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATE NOT NULL,
    `recipiente` VARCHAR(100) NOT NULL,
    `peso_vacio` DECIMAL(10, 5) NOT NULL,
    `peso_lleno` DECIMAL(10, 5) NOT NULL,
    `observacion` TEXT NOT NULL,
    `id_responsable` INTEGER NOT NULL,
    `id_responsable_fuente` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistroOperativoEnRuta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item` INTEGER NOT NULL,
    `barrio_vereda` VARCHAR(200) NOT NULL,
    `id_operario` INTEGER NOT NULL,
    `nro_ruta` INTEGER NOT NULL,
    `inicio_recorrido` DATETIME(3) NOT NULL,
    `fin_recorrido` DATETIME(3) NOT NULL,
    `nro_casas_visitadas` INTEGER NOT NULL,
    `total_residuos_recolectados` INTEGER NOT NULL,
    `observacion` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Multimedia` (
    `id_multimedia` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_archivo` ENUM('imagen', 'video', 'audio', 'documento') NOT NULL,
    `nombre_archivo` VARCHAR(255) NOT NULL,
    `ruta_archivo` VARCHAR(255) NOT NULL,
    `tamano_archivo` DECIMAL(10, 2) NOT NULL,
    `categoria` ENUM('reciclaje', 'eventos', 'educacion', 'otro') NOT NULL DEFAULT 'otro',
    `fecha_subida` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Multimedia_categoria_fecha_subida_idx`(`categoria`, `fecha_subida`),
    PRIMARY KEY (`id_multimedia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Incidencias` (
    `id_incidencia` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_incidencia` DATETIME(3) NOT NULL,
    `titulo_incidencia` VARCHAR(200) NOT NULL,
    `descripcion_incidencia` TEXT NOT NULL,
    `tipo_incidencia` VARCHAR(200) NOT NULL,
    `estado_incidencia` ENUM('abierta', 'en_progreso', 'cerrada') NOT NULL DEFAULT 'abierta',
    `id_usuario` INTEGER NULL,
    `id_usuario_ciudadano` INTEGER NULL,
    `id_usuario_creador` INTEGER NOT NULL,
    `id_usuario_modificador` INTEGER NULL,

    PRIMARY KEY (`id_incidencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `direccion` TEXT NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cliente_correo_key`(`correo`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pagos` (
    `id_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NULL,
    `fecha_pago` DATE NOT NULL,
    `descripcion` VARCHAR(300) NULL,
    `monto_deuda` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `metodo_pago` ENUM('efectivo', 'tarjeta', 'transferencia', 'paypal', 'otro') NOT NULL,
    `numero_transaccion` VARCHAR(255) NULL,
    `moneda_pago` VARCHAR(10) NOT NULL,
    `fecha_limite_pago` DATE NULL,
    `interes_mora` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `dias_mora` INTEGER NOT NULL DEFAULT 0,
    `estado_pago` ENUM('pendiente', 'pagado', 'vencido', 'cancelado') NOT NULL DEFAULT 'pendiente',
    `notas` VARCHAR(255) NULL,
    `frecuencia_de_pago` ENUM('mensual', 'trimestral', 'semestral', 'anual') NULL,
    `fecha_proximo_pago` DATE NULL,

    PRIMARY KEY (`id_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ubicaciones` (
    `id_ubicacion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `latitud` DECIMAL(10, 6) NULL,
    `longitud` DECIMAL(10, 6) NULL,
    `tipo` ENUM('parada', 'inicio', 'fin') NOT NULL,

    PRIMARY KEY (`id_ubicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rutas` (
    `id_ruta` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `id_inicio` INTEGER NOT NULL,
    `id_fin` INTEGER NOT NULL,

    PRIMARY KEY (`id_ruta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paradas` (
    `id_ruta` INTEGER NOT NULL,
    `id_ubicacion` INTEGER NOT NULL,
    `orden` INTEGER NOT NULL,

    PRIMARY KEY (`id_ruta`, `id_ubicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Autos` (
    `id_auto` INTEGER NOT NULL AUTO_INCREMENT,
    `modelo` VARCHAR(50) NOT NULL,
    `placa` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `Autos_placa_key`(`placa`),
    PRIMARY KEY (`id_auto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsuarioCiudadano` ADD CONSTRAINT `UsuarioCiudadano_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encuestas` ADD CONSTRAINT `Encuestas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encuestas` ADD CONSTRAINT `Encuestas_id_ciudadano_fkey` FOREIGN KEY (`id_ciudadano`) REFERENCES `UsuarioCiudadano`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pqrs` ADD CONSTRAINT `Pqrs_id_ciudadano_fkey` FOREIGN KEY (`id_ciudadano`) REFERENCES `UsuarioCiudadano`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pqrs` ADD CONSTRAINT `Pqrs_id_usuario_creador_fkey` FOREIGN KEY (`id_usuario_creador`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pqrs` ADD CONSTRAINT `Pqrs_id_usuario_modificador_fkey` FOREIGN KEY (`id_usuario_modificador`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroDeRecoleccionEnFuentes` ADD CONSTRAINT `RegistroDeRecoleccionEnFuentes_id_responsable_fkey` FOREIGN KEY (`id_responsable`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroDeRecoleccionEnFuentes` ADD CONSTRAINT `RegistroDeRecoleccionEnFuentes_id_responsable_fuente_fkey` FOREIGN KEY (`id_responsable_fuente`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroOperativoEnRuta` ADD CONSTRAINT `RegistroOperativoEnRuta_id_operario_fkey` FOREIGN KEY (`id_operario`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_ciudadano_fkey` FOREIGN KEY (`id_usuario_ciudadano`) REFERENCES `UsuarioCiudadano`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_creador_fkey` FOREIGN KEY (`id_usuario_creador`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_modificador_fkey` FOREIGN KEY (`id_usuario_modificador`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagos` ADD CONSTRAINT `Pagos_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rutas` ADD CONSTRAINT `Rutas_id_inicio_fkey` FOREIGN KEY (`id_inicio`) REFERENCES `Ubicaciones`(`id_ubicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rutas` ADD CONSTRAINT `Rutas_id_fin_fkey` FOREIGN KEY (`id_fin`) REFERENCES `Ubicaciones`(`id_ubicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paradas` ADD CONSTRAINT `Paradas_id_ruta_fkey` FOREIGN KEY (`id_ruta`) REFERENCES `Rutas`(`id_ruta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paradas` ADD CONSTRAINT `Paradas_id_ubicacion_fkey` FOREIGN KEY (`id_ubicacion`) REFERENCES `Ubicaciones`(`id_ubicacion`) ON DELETE CASCADE ON UPDATE CASCADE;
