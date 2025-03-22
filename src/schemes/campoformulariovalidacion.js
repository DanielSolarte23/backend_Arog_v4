const { z } = require("zod");

const CampoFormularioSchema = z.object({
  id: z.number().int().positive(),
  formularioTipoId: z.number().int().positive(),
  nombre: z.string().max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z.string().nullable(),
  tipo: z.nativeEnum(TipoCampo),
  requerido: z.boolean().default(false),
  orden: z.number().int().nonnegative(),
  opciones: z.string().nullable().refine(
    (val) => {
      try {
        return val ? JSON.parse(val) instanceof Object : true;
      } catch {
        return false;
      }
    },
    { message: "Opciones debe ser un JSON válido" }
  ),
  valores: z.array(z.any()).optional(), // Puedes definir un esquema más específico según la estructura de `ValorCampo`
});

module.exports =  CampoFormularioSchema ;
