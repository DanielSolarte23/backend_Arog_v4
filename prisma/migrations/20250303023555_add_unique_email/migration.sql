/*
  Warnings:

  - A unique constraint covering the columns `[correo_electronico]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Usuario_correo_electronico_key` ON `Usuario`(`correo_electronico`);
