const { z } = require("zod");

const PqrsSchema = z.object({
  descripcion: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(500, "La descripción no puede superar los 500 caracteres."),
  
  motivo: z.string()
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .max(200, "El motivo no puede superar los 200 caracteres."),

  categoria: z.enum(["Reclamo", "Peticion", "Queja", "Sugerencia"]),

  estado: z.enum(["Abierto", "En_proceso", "Cerrado"]).default("Abierto"),

  seguimiento: z.string().max(255).nullable().optional(),

  fechaCreacion: z.string().optional().refine(date => {
    return !date || !isNaN(Date.parse(date));
  }, { message: "Fecha de creación inválida, debe estar en formato ISO." }),

  idCiudadano: z.number().int().positive("El ID del ciudadano debe ser un número positivo."),

  idUsuarioCreador: z.number().int().positive("El ID del usuario creador debe ser un número positivo."),

  idUsuarioModificador: z.number().int().positive().nullable().optional(),
});

module.exports = PqrsSchema;
