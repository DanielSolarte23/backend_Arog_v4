const { z } = require("zod");

const ValorCampoSchema = z.object({
  id: z.number().int().positive(),
  formularioId: z.number().int().positive(),
  campoFormularioId: z.number().int().positive(),
  valorTexto: z.string().nullable(),
  valorNumero: z.number().int().nullable(),
  valorDecimal: z.preprocess((val) => (val ? parseFloat(val) : null), z.number().nullable()),
  valorFecha: z.date().nullable()
});


module.exports =  ValorCampoSchema ;
