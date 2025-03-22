const { z } = require("zod");

const EstadoIncidenciaEnum = z.enum(["abierta", "en_progreso", "cerrada"]);

const IncidenciasSchema = z.object({
  id: z.number().int().positive(),
  fechaIncidencia: z.coerce.date(), // Convierte automáticamente a Date
  tituloIncidencia: z.string().min(1).max(200), // Longitud entre 1 y 200 caracteres
  descripcionIncidencia: z.string().min(1), // No puede estar vacío
  tipoIncidencia: z.string().min(1).max(200),
  estadoIncidencia: EstadoIncidenciaEnum, // Solo valores permitidos
  idUsuario: z.number().int().positive().nullable(), // Puede ser null
  idUsuarioCiudadano: z.number().int().positive().nullable(),
  idUsuarioCreador: z.number().int().positive(),
  idUsuarioModificador: z.number().int().positive().nullable()
});


module.exports=   IncidenciasSchema ;
