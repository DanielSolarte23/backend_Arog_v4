const { z } = require("zod");

const MetodoPagoEnum = z.enum(["efectivo", "tarjeta", "transferencia", "paypal", "otro"]);
const EstadoPagoEnum = z.enum(["pendiente", "pagado", "vencido", "cancelado"]);
const FrecuenciaPagoEnum = z.enum(["mensual", "trimestral", "semestral", "anual"]).nullable();

const PagosSchema = z.object({
  id: z.number().int().positive(),
  idCliente: z.number().int().positive().nullable(),
  fechaPago: z.coerce.date(),
  descripcion: z.string().max(300).nullable(),
  montoDeuda: z.number().nonnegative(),
  valorPago: z.number().nonnegative(),
  saldoPendiente: z.number().nonnegative(),
  interesMora: z.number().nonnegative(),
  metodoPago: MetodoPagoEnum,
  diasMora: z.number().int().nonnegative(),
  estadoPago: EstadoPagoEnum,
  notas: z.string().max(255).nullable(),
  frecuenciaDePago: FrecuenciaPagoEnum,
  fechaProximoPago: z.coerce.date().nullable(),
});


module.exports=   PagosSchema ;
