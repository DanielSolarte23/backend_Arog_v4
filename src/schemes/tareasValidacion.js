const { z } = require("zod");

const EstadoTarea = z.enum(["pendiente", "en_progreso", "completada", "cancelada"]);
const PrioridadTarea = z.enum(["baja", "media", "alta", "urgente"]);

const tareaSchema = z.object({
  id: z.number().int().positive(),
  titulo: z.string().max(200),
  descripcion: z.string().nullable().optional(),
  estado: EstadoTarea.default("pendiente"),
  prioridad: PrioridadTarea.default("media"),
  asignadoId: z.number().int().positive(),
  creadorId: z.number().int().positive(),
  fechaCreacion: z.date().default(() => new Date()),
  fechaLimite: z.date().nullable().optional(),
  fechaCompletada: z.date().nullable().optional(),
  archivada: z.boolean().default(false),
  rutaId: z.number().int().positive().nullable().optional(),
  formulario: z.any().optional() // Se debe ajustar según la estructura esperada del formulario
});

module.exports= tareaSchema;
