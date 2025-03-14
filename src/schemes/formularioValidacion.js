const { z } = require("zod");

const EstadoFormularioEnum = z.enum(["borrador", "enviado", "aprobado", "rechazado"]);

const FormularioSchema = z.object({
  id: z.number().int().positive(),
  formularioTipoId: z.number().int().positive(),
  titulo: z.string().max(200, "El título no puede superar los 200 caracteres."),
  descripcion: z.string().nullable(),
  estado: EstadoFormularioEnum.default("borrador"),
  valores: z.array(z.any()).optional(), // Definir mejor según la estructura de `ValorCampo`
  creadorId: z.number().int().positive(),
  fechaCreacion: z.date(),
  fechaEnvio: z.date().nullable(),
  tareaId: z.number().int().positive().nullable()
});

module.exports =  FormularioSchema ;
