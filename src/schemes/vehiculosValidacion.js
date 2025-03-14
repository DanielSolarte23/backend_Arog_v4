const { z } = require("zod");

const VehiculosSchema = z.object({
  id: z.number().int().positive(),
  modelo: z.string().min(1, "El modelo es obligatorio").max(50, "Máximo 50 caracteres"),
  placa: z.string().min(1, "La placa es obligatoria").max(20, "Máximo 20 caracteres"),
  marca: z.string().min(1, "La marca es obligatoria").max(50, "Máximo 50 caracteres"),
  vehiculosAsignados: z.array(z.any()).optional(), 
});


module.exports =  VehiculosSchema ;
