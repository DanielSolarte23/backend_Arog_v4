const { z } = require("zod");

// Enum de EstadoEncuesta
const EstadoEncuestaEnum = z.enum(["activa", "inactiva", "borrador", "finalizada"]);

// Enum de TipoPregunta
const TipoPreguntaEnum = z.enum(["opcion_multiple", "seleccion_unica", "texto_libre", "escala", "si_no"]);

// Esquema de validación para Encuesta
const EncuestaSchema = z.object({
  id: z.number().int().positive(),
  titulo: z.string().min(1).max(200),
  descripcion: z.string().optional(),
  fechaCreacion: z.date().default(() => new Date()),
  fechaExpiracion: z.date().optional(),
  estado: EstadoEncuestaEnum.default("activa"),
  creadorId: z.number().int().positive(),
});

module.exports =  EncuestaSchema, EstadoEncuestaEnum, TipoPreguntaEnum ;
