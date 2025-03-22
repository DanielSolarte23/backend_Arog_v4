const { z } = require("zod");

const FormularioTipoSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z.string().nullable(),
  activo: z.boolean().default(true),
  creadorId: z.number().int().positive(),
  fechaCreacion: z.date(),
  rutas: z.array(z.any()).optional(), // Puedes especificar un esquema si necesitas validar rutas específicas
});


module.exports =  FormularioTipoSchema ;
