const { z } = require("zod");

const UbicacionesSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().max(255),
  latitud: z.number().min(-90).max(90).nullable(),
  longitud: z.number().min(-180).max(180).nullable(),
  puntosRuta: z.array(z.any()).optional(), 
});


module.exports =  UbicacionesSchema ;
