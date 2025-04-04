-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CERTIFICADO', 'INFORME');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('administrador', 'recolector', 'ciudadano', 'encuestador', 'encuestado');

-- CreateEnum
CREATE TYPE "EstadoCiudadano" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "EstadoResiduo" AS ENUM ('disponible', 'en_proceso', 'reciclado');

-- CreateEnum
CREATE TYPE "EstadoEncuesta" AS ENUM ('activa', 'inactiva', 'borrador', 'finalizada');

-- CreateEnum
CREATE TYPE "TipoPregunta" AS ENUM ('opcion_multiple', 'seleccion_unica', 'texto_libre', 'escala', 'si_no');

-- CreateEnum
CREATE TYPE "CategoriaPqrs" AS ENUM ('Reclamo', 'Peticion', 'Queja', 'Sugerencia');

-- CreateEnum
CREATE TYPE "EstadoPqrs" AS ENUM ('Abierto', 'En_proceso', 'Cerrado');

-- CreateEnum
CREATE TYPE "TipoCampo" AS ENUM ('texto', 'numero', 'decimal', 'fecha', 'hora', 'fecha_hora', 'select', 'checkbox', 'radio', 'textarea', 'archivo', 'ubicacion');

-- CreateEnum
CREATE TYPE "Periodicidad" AS ENUM ('semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'paypal', 'otro');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('pendiente', 'pagadoParcial', 'pagadoTotal', 'vencido', 'cancelado');

-- CreateEnum
CREATE TYPE "EstadoFormulario" AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado');

-- CreateEnum
CREATE TYPE "EstadoIncidencia" AS ENUM ('abierta', 'en_progreso', 'cerrada');

-- CreateEnum
CREATE TYPE "FrecuenciaPago" AS ENUM ('mensual', 'trimestral', 'semestral', 'anual');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('por_hacer', 'en_progreso', 'completada', 'cancelado');

-- CreateEnum
CREATE TYPE "PrioridadTarea" AS ENUM ('baja', 'media', 'alta', 'urgente');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(200) NOT NULL,
    "apellidos" VARCHAR(200) NOT NULL,
    "contraseña" VARCHAR(255) NOT NULL,
    "correo_electronico" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "rol" "Rol" NOT NULL DEFAULT 'ciudadano',
    "direccion" VARCHAR(50),
    "barrio" VARCHAR(50),
    "historial_reciclaje" VARCHAR(100),
    "estado" "EstadoCiudadano" NOT NULL DEFAULT 'activo',
    "googleId" VARCHAR(100),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" VARCHAR(100),
    "resetPasswordToken" VARCHAR(100),
    "resetPasswordExpires" TIMESTAMP(3),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Residuos" (
    "id_residuos" SERIAL NOT NULL,
    "tipo_de_residuo" VARCHAR(100) NOT NULL,
    "ubicacion" VARCHAR(100) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "estado" "EstadoResiduo" NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Residuos_pkey" PRIMARY KEY ("id_residuos")
);

-- CreateTable
CREATE TABLE "encuestas" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),
    "estado" "EstadoEncuesta" NOT NULL DEFAULT 'activa',
    "creadorId" INTEGER NOT NULL,

    CONSTRAINT "encuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preguntas" (
    "id" SERIAL NOT NULL,
    "encuestaId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" "TipoPregunta" NOT NULL,
    "requerida" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opciones_preguntas" (
    "id" SERIAL NOT NULL,
    "preguntaId" INTEGER NOT NULL,
    "texto" VARCHAR(200) NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "opciones_preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_encuestas" (
    "id" SERIAL NOT NULL,
    "encuestaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "ciudadano_id" INTEGER,
    "fechaRespuesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "respuestas_encuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_preguntas" (
    "id" SERIAL NOT NULL,
    "respuestaEncuestaId" INTEGER NOT NULL,
    "preguntaId" INTEGER NOT NULL,
    "opcionSeleccionadaId" INTEGER,
    "textoRespuesta" TEXT,
    "valorEscala" INTEGER,

    CONSTRAINT "respuestas_preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pqrs" (
    "id_solicitud" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "motivo" VARCHAR(200) NOT NULL,
    "categoria" "CategoriaPqrs" NOT NULL,
    "estado" "EstadoPqrs" NOT NULL DEFAULT 'Abierto',
    "seguimiento" VARCHAR(255),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_ciudadano" INTEGER NOT NULL,
    "id_usuario_creador" INTEGER NOT NULL,
    "id_usuario_modificador" INTEGER,

    CONSTRAINT "Pqrs_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "formulario_tipos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadorId" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formulario_tipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campo_formularios" (
    "id" SERIAL NOT NULL,
    "formularioTipoId" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoCampo" NOT NULL,
    "requerido" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL,
    "opciones" TEXT,

    CONSTRAINT "campo_formularios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios" (
    "id" SERIAL NOT NULL,
    "formularioTipoId" INTEGER NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoFormulario" NOT NULL DEFAULT 'borrador',
    "creadorId" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_envio" TIMESTAMP(3),
    "tareaId" INTEGER,

    CONSTRAINT "formularios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valor_campos" (
    "id" SERIAL NOT NULL,
    "formularioId" INTEGER NOT NULL,
    "campoFormularioId" INTEGER NOT NULL,
    "valorTexto" TEXT,
    "valorNumero" INTEGER,
    "valorDecimal" DECIMAL(10,5),
    "valorFecha" TIMESTAMP(3),

    CONSTRAINT "valor_campos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Multimedia" (
    "id_multimedia" SERIAL NOT NULL,
    "url_archivo" VARCHAR(200) NOT NULL,
    "nombre_archivo" VARCHAR(150) NOT NULL,
    "tamano_archivo" DECIMAL(10,2) NOT NULL,
    "tipo_archivo" VARCHAR(50) NOT NULL,
    "ancho" INTEGER,
    "alto" INTEGER,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Multimedia_pkey" PRIMARY KEY ("id_multimedia")
);

-- CreateTable
CREATE TABLE "Incidencias" (
    "id_incidencia" SERIAL NOT NULL,
    "fecha_incidencia" TIMESTAMP(3) NOT NULL,
    "titulo_incidencia" VARCHAR(200) NOT NULL,
    "descripcion_incidencia" TEXT NOT NULL,
    "tipo_incidencia" VARCHAR(200) NOT NULL,
    "estado_incidencia" "EstadoIncidencia" NOT NULL DEFAULT 'abierta',
    "id_usuario" INTEGER,
    "id_usuario_ciudadano" INTEGER,
    "id_usuario_creador" INTEGER NOT NULL,
    "id_usuario_modificador" INTEGER,

    CONSTRAINT "Incidencias_pkey" PRIMARY KEY ("id_incidencia")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "direccion" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "PlanPago" (
    "id_plan" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "monto_periodico" DECIMAL(10,2) NOT NULL,
    "dia_pago" INTEGER NOT NULL,
    "periodicidad" "Periodicidad" NOT NULL DEFAULT 'mensual',
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PlanPago_pkey" PRIMARY KEY ("id_plan")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id_pago" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_plan" INTEGER,
    "descripcion" VARCHAR(200) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" DATE NOT NULL,
    "monto_pago" DECIMAL(10,2) NOT NULL,
    "monto_pagado" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "saldo_pendiente" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "interes_mora" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "dias_mora" INTEGER NOT NULL DEFAULT 0,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "notas" VARCHAR(500),
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "Transaccion" (
    "id_transaccion" SERIAL NOT NULL,
    "id_pago" INTEGER NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "referencia" VARCHAR(100),
    "comprobante" VARCHAR(255),

    CONSTRAINT "Transaccion_pkey" PRIMARY KEY ("id_transaccion")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoTarea" NOT NULL DEFAULT 'por_hacer',
    "prioridad" "PrioridadTarea" NOT NULL DEFAULT 'media',
    "asignadoId" INTEGER NOT NULL,
    "creadorId" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite" TIMESTAMP(3),
    "fecha_completada" TIMESTAMP(3),
    "archivada" BOOLEAN NOT NULL DEFAULT false,
    "rutaId" INTEGER,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicaciones" (
    "id_ubicacion" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),

    CONSTRAINT "Ubicaciones_pkey" PRIMARY KEY ("id_ubicacion")
);

-- CreateTable
CREATE TABLE "Rutas" (
    "id_ruta" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "horaInicio" TIMESTAMP(3),
    "horaFin" TIMESTAMP(3),
    "usuarioAsignadoId" INTEGER,
    "formularioTipoId" INTEGER,

    CONSTRAINT "Rutas_pkey" PRIMARY KEY ("id_ruta")
);

-- CreateTable
CREATE TABLE "PuntosRuta" (
    "id_punto_ruta" SERIAL NOT NULL,
    "id_ruta" INTEGER NOT NULL,
    "id_ubicacion" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "PuntosRuta_pkey" PRIMARY KEY ("id_punto_ruta")
);

-- CreateTable
CREATE TABLE "Vehiculos" (
    "id_auto" SERIAL NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,
    "placa" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(50) NOT NULL,

    CONSTRAINT "Vehiculos_pkey" PRIMARY KEY ("id_auto")
);

-- CreateTable
CREATE TABLE "VehiculosAsignados" (
    "id_vehiculo_asignado" SERIAL NOT NULL,
    "id_vehiculo" INTEGER NOT NULL,
    "id_ruta" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehiculosAsignados_pkey" PRIMARY KEY ("id_vehiculo_asignado")
);

-- CreateTable
CREATE TABLE "DocumentoPdf" (
    "id_pdf" SERIAL NOT NULL,
    "url_archivo" VARCHAR(200) NOT NULL,
    "nombre_archivo" VARCHAR(150) NOT NULL,
    "tamano_archivo" DECIMAL(10,2) NOT NULL,
    "tipo_archivo" VARCHAR(50) NOT NULL,
    "paginas" INTEGER,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_documento" "TipoDocumento" NOT NULL,
    "referencia_id" INTEGER,

    CONSTRAINT "DocumentoPdf_pkey" PRIMARY KEY ("id_pdf")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_electronico_key" ON "Usuario"("correo_electronico");

-- CreateIndex
CREATE INDEX "Residuos_tipo_de_residuo_idx" ON "Residuos"("tipo_de_residuo");

-- CreateIndex
CREATE INDEX "Pqrs_estado_fecha_creacion_idx" ON "Pqrs"("estado", "fecha_creacion");

-- CreateIndex
CREATE UNIQUE INDEX "formularios_tareaId_key" ON "formularios"("tareaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_correo_key" ON "Cliente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculos_placa_key" ON "Vehiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoPdf_tipo_documento_referencia_id_key" ON "DocumentoPdf"("tipo_documento", "referencia_id");

-- AddForeignKey
ALTER TABLE "encuestas" ADD CONSTRAINT "encuestas_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preguntas" ADD CONSTRAINT "preguntas_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "encuestas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opciones_preguntas" ADD CONSTRAINT "opciones_preguntas_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "preguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_encuestas" ADD CONSTRAINT "respuestas_encuestas_ciudadano_id_fkey" FOREIGN KEY ("ciudadano_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_encuestas" ADD CONSTRAINT "respuestas_encuestas_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_encuestas" ADD CONSTRAINT "respuestas_encuestas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_preguntas" ADD CONSTRAINT "respuestas_preguntas_opcionSeleccionadaId_fkey" FOREIGN KEY ("opcionSeleccionadaId") REFERENCES "opciones_preguntas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_preguntas" ADD CONSTRAINT "respuestas_preguntas_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "preguntas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_preguntas" ADD CONSTRAINT "respuestas_preguntas_respuestaEncuestaId_fkey" FOREIGN KEY ("respuestaEncuestaId") REFERENCES "respuestas_encuestas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pqrs" ADD CONSTRAINT "Pqrs_id_ciudadano_fkey" FOREIGN KEY ("id_ciudadano") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pqrs" ADD CONSTRAINT "Pqrs_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pqrs" ADD CONSTRAINT "Pqrs_id_usuario_modificador_fkey" FOREIGN KEY ("id_usuario_modificador") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulario_tipos" ADD CONSTRAINT "formulario_tipos_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campo_formularios" ADD CONSTRAINT "campo_formularios_formularioTipoId_fkey" FOREIGN KEY ("formularioTipoId") REFERENCES "formulario_tipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_formularioTipoId_fkey" FOREIGN KEY ("formularioTipoId") REFERENCES "formulario_tipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "tareas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valor_campos" ADD CONSTRAINT "valor_campos_campoFormularioId_fkey" FOREIGN KEY ("campoFormularioId") REFERENCES "campo_formularios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valor_campos" ADD CONSTRAINT "valor_campos_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencias" ADD CONSTRAINT "Incidencias_id_usuario_ciudadano_fkey" FOREIGN KEY ("id_usuario_ciudadano") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencias" ADD CONSTRAINT "Incidencias_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencias" ADD CONSTRAINT "Incidencias_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencias" ADD CONSTRAINT "Incidencias_id_usuario_modificador_fkey" FOREIGN KEY ("id_usuario_modificador") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPago" ADD CONSTRAINT "PlanPago_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "PlanPago"("id_plan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaccion" ADD CONSTRAINT "Transaccion_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "Pago"("id_pago") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Rutas"("id_ruta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rutas" ADD CONSTRAINT "Rutas_formularioTipoId_fkey" FOREIGN KEY ("formularioTipoId") REFERENCES "formulario_tipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rutas" ADD CONSTRAINT "Rutas_usuarioAsignadoId_fkey" FOREIGN KEY ("usuarioAsignadoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntosRuta" ADD CONSTRAINT "PuntosRuta_id_ruta_fkey" FOREIGN KEY ("id_ruta") REFERENCES "Rutas"("id_ruta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntosRuta" ADD CONSTRAINT "PuntosRuta_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "Ubicaciones"("id_ubicacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiculosAsignados" ADD CONSTRAINT "VehiculosAsignados_id_ruta_fkey" FOREIGN KEY ("id_ruta") REFERENCES "Rutas"("id_ruta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiculosAsignados" ADD CONSTRAINT "VehiculosAsignados_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculos"("id_auto") ON DELETE CASCADE ON UPDATE CASCADE;
