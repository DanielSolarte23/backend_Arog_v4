/*
  Warnings:

  - You are about to drop the column `rutaId` on the `formulario_tipos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "formulario_tipos" DROP CONSTRAINT "formulario_tipos_rutaId_fkey";

-- AlterTable
ALTER TABLE "formulario_tipos" DROP COLUMN "rutaId";

-- AlterTable
ALTER TABLE "formularios" ADD COLUMN     "rutaId" INTEGER;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Rutas"("id_ruta") ON DELETE SET NULL ON UPDATE CASCADE;
