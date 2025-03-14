/*
  Warnings:

  - The values [pendiente,cancelada] on the enum `EstadoTarea` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoTarea_new" AS ENUM ('por_hacer', 'en_progreso', 'completada', 'cancelado');
ALTER TABLE "tareas" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "tareas" ALTER COLUMN "estado" TYPE "EstadoTarea_new" USING ("estado"::text::"EstadoTarea_new");
ALTER TYPE "EstadoTarea" RENAME TO "EstadoTarea_old";
ALTER TYPE "EstadoTarea_new" RENAME TO "EstadoTarea";
DROP TYPE "EstadoTarea_old";
ALTER TABLE "tareas" ALTER COLUMN "estado" SET DEFAULT 'por_hacer';
COMMIT;

-- AlterTable
ALTER TABLE "tareas" ALTER COLUMN "estado" SET DEFAULT 'por_hacer';
