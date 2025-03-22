const { z } = require("zod");

const ClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  apellido: z.string().min(1, "El apellido es requerido").max(100, "Máximo 100 caracteres"),
  correo: z.string().email("Correo inválido").max(150, "Máximo 150 caracteres"),
  telefono: z.string().min(7, "Mínimo 7 caracteres").max(20, "Máximo 20 caracteres"),
  direccion: z.string().nullable().optional(), // Puede ser null o no estar presente
  fechaRegistro: z.coerce.date().optional() // Convierte automáticamente a Date y es opcional
});

module.exports = ClienteSchema;
