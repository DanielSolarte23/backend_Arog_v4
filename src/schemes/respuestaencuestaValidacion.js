const { z } = require("zod");

const RespuestaEncuestaSchema = z.object({
  id: z.number().int().positive(),
  encuestaId: z.number().int().positive(),
  usuarioId: z.number().int().positive(),
  ciudadanoId: z.number().int().positive().nullable(),
  fechaRespuesta: z.date().default(new Date()),
  completada: z.boolean().default(false),
});

module.exports =  RespuestaEncuestaSchema ;
