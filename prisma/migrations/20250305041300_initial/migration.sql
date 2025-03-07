-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(200) NOT NULL,
    `apellidos` VARCHAR(200) NOT NULL,
    `contraseña` VARCHAR(255) NOT NULL,
    `correo_electronico` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `rol` ENUM('administrador', 'recolector', 'ciudadano', 'encuestador', 'encuestado') NOT NULL DEFAULT 'ciudadano',
    `direccion` VARCHAR(50) NULL,
    `barrio` VARCHAR(50) NULL,
    `historial_reciclaje` VARCHAR(100) NULL,
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    `googleId` VARCHAR(100) NULL,

    UNIQUE INDEX `Usuario_correo_electronico_key`(`correo_electronico`),
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
CREATE TABLE `encuestas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaExpiracion` DATETIME(3) NULL,
    `estado` ENUM('activa', 'inactiva', 'borrador', 'finalizada') NOT NULL DEFAULT 'activa',
    `creadorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `ciudadano_id` INTEGER NULL,
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
    `url_archivo` VARCHAR(200) NOT NULL,
    `tamano_archivo` DECIMAL(10, 2) NOT NULL,

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
    `monto_pago` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `monto_saldo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `interes_mora` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `metodo_pago` ENUM('efectivo', 'tarjeta', 'transferencia', 'paypal', 'otro') NOT NULL,
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
    `latitud` DECIMAL(10, 8) NULL,
    `longitud` DECIMAL(11, 8) NULL,

    PRIMARY KEY (`id_ubicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rutas` (
    `id_ruta` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `color` VARCHAR(7) NOT NULL,
    `horaInicio` DATETIME(3) NULL,
    `horaFin` DATETIME(3) NULL,
    `usuarioAsignadoId` INTEGER NULL,

    PRIMARY KEY (`id_ruta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `respuestas_encuestas` ADD CONSTRAINT `respuestas_encuestas_ciudadano_id_fkey` FOREIGN KEY (`ciudadano_id`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_preguntas` ADD CONSTRAINT `respuestas_preguntas_respuestaEncuestaId_fkey` FOREIGN KEY (`respuestaEncuestaId`) REFERENCES `respuestas_encuestas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_preguntas` ADD CONSTRAINT `respuestas_preguntas_preguntaId_fkey` FOREIGN KEY (`preguntaId`) REFERENCES `preguntas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respuestas_preguntas` ADD CONSTRAINT `respuestas_preguntas_opcionSeleccionadaId_fkey` FOREIGN KEY (`opcionSeleccionadaId`) REFERENCES `opciones_preguntas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pqrs` ADD CONSTRAINT `Pqrs_id_ciudadano_fkey` FOREIGN KEY (`id_ciudadano`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_ciudadano_fkey` FOREIGN KEY (`id_usuario_ciudadano`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_creador_fkey` FOREIGN KEY (`id_usuario_creador`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencias` ADD CONSTRAINT `Incidencias_id_usuario_modificador_fkey` FOREIGN KEY (`id_usuario_modificador`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagos` ADD CONSTRAINT `Pagos_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

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
