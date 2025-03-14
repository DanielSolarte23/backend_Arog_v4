const { z } = require("zod");

const RespuestaPreguntaSchema = z.object({
  id: z.number().int().positive(),
  respuestaEncuestaId: z.number().int().positive(),
  preguntaId: z.number().int().positive(),
  opcionSeleccionadaId: z.number().int().positive().nullable(),
  textoRespuesta: z.string().max(500).nullable(),
  valorEscala: z.number().int().min(1).max(10).nullable(), // Ajusta según la escala que uses
});

module.exports = RespuestaPreguntaSchema ;
