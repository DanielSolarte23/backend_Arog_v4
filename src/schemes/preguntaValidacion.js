const { z } = require("zod");
const { TipoPreguntaEnum } = require ("./EncuestaSchema"); // Importa el enum de tipo de pregunta si está en otro archivo

const PreguntaSchema = z.object({
  id: z.number().int().positive(),
  encuestaId: z.number().int().positive(),
  texto: z.string().min(1, "El texto de la pregunta no puede estar vacío"),
  tipo: TipoPreguntaEnum,
  requerida: z.boolean().default(true),
  orden: z.number().int().nonnegative(),
});


module.exports = PreguntaSchema ;
