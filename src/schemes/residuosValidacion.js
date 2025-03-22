const { z } = require("zod");

const ResiduosSchema = z.object({
  id: z.number().int().positive(),
  tipoDeResiduo: z.string().min(1, "El tipo de residuo es obligatorio").max(100),
  ubicacion: z.string().min(1, "La ubicación es obligatoria").max(100),
  cantidad: z.number().int().min(0, "La cantidad no puede ser negativa"),
  estado: z.enum(["disponible", "en_proceso", "reciclado"]),
  fechaRegistro: z.date().default(new Date()),
});


module.exports =  ResiduosSchema ;
