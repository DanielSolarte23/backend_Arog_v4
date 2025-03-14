const { z } = require("zod");

const MultimediaSchema = z.object({
  id: z.number().int().positive(),
  url: z.string().url(), // Debe ser una URL válida
  tamanoArchivo: z.preprocess((val) => (val ? parseFloat(val) : null), z.number().positive().nullable()) 
});


module.exports =  MultimediaSchema ;
