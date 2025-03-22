const { z } = require("zod");

const RutasSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().max(255),
  horaInicio: z.coerce.date().nullable(), 
  horaFin: z.coerce.date().nullable(),
  puntosRuta: z.array(z.any()).optional(), 
  vehiculosAsignados: z.array(z.any()).optional(),
  usuarioAsignadoId: z.number().int().positive().nullable(),
  usuarioAsignado: z.any().optional(), 
  tareas: z.array(z.any()).optional(),
  formularioTipoId: z.number().int().positive().nullable(),
  formularioTipo: z.any().optional(),
});

module.exports = RutasSchema ;
