const { z } = require("zod");

const PuntosRutaSchema = z.object({
  id: z.number().int().positive(),
  idRuta: z.number().int().positive(),
  ruta: z.any().optional(),
  idUbicacion: z.number().int().positive(),
  ubicacion: z.any().optional(), 
  orden: z.number().int().min(1), 
});


module.exports =  PuntosRutaSchema ;
