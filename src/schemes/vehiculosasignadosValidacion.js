const { z } = require("zod");

const VehiculosAsignadosSchema = z.object({
  id: z.number().int().positive(),
  idVehiculo: z.number().int().positive("Debe ser un ID válido del vehículo"),
  idRuta: z.number().int().positive("Debe ser un ID válido de la ruta"),
  fechaAsignacion: z.string().datetime().or(z.date()).default(new Date()),
});
module.exports = VehiculosAsignadosSchema ;
