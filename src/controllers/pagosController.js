const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pagos = {
  crearPago: async (req, res) => {
    try {
      const {
        idCliente,
        idPlanPago,
        descripcion,
        fechaEmision,
        fechaVencimiento,
        montoPago,
        pagoInicial, // Opcional: pago que se realiza al momento de crear
        metodoPago,  // Solo se usa si hay pagoInicial
        referencia   // Solo se usa si hay pagoInicial
      } = req.body;

      // Iniciar una transacción de base de datos para asegurar consistencia
      const resultado = await prisma.$transaction(async (tx) => {
        // Crear el registro de pago
        const nuevoPago = await tx.pago.create({
          data: {
            descripcion,
            fechaEmision: fechaEmision ? new Date(fechaEmision) : new Date(),
            fechaVencimiento: new Date(fechaVencimiento),
            montoPago: parseFloat(montoPago),
            saldoPendiente: parseFloat(montoPago) - (parseFloat(pagoInicial) || 0),
            cliente: { connect: { id: parseInt(idCliente) } },
            ...(idPlanPago ? { planPago: { connect: { id: parseInt(idPlanPago) } } } : {})
          }
        });

        // Si hay un pago inicial, registrar la transacción
        if (pagoInicial && parseFloat(pagoInicial) > 0) {
          await tx.transaccion.create({
            data: {
              pago: { connect: { id: nuevoPago.id } },
              monto: parseFloat(pagoInicial),
              metodoPago,
              referencia,
              fechaPago: new Date()
            }
          });

          // Actualizar el estado del pago según el monto pagado
          const montoPagado = parseFloat(pagoInicial);
          const estadoPago = montoPagado >= parseFloat(montoPago)
            ? 'pagadoTotal'
            : montoPagado > 0
              ? 'pagadoParcial'
              : 'pendiente';

          await tx.pago.update({
            where: { id: nuevoPago.id },
            data: {
              montoPagado,
              estadoPago,
              saldoPendiente: parseFloat(montoPago) - montoPagado
            }
          });
        }

        return nuevoPago;
      });

      return res.status(201).json(resultado);
    } catch (error) {
      console.error("Error al crear el pago:", error);
      return res.status(500).json({ error: "Error al crear el pago" });
    }
  },

  registrarTransaccion: async (req, res) => {
    try {
      const { idPago, monto, metodoPago, referencia } = req.body;

      // Obtener el pago actual para verificar el saldo pendiente
      const pagoActual = await prisma.pago.findUnique({
        where: { id: parseInt(idPago) }
      });

      if (!pagoActual) {
        return res.status(404).json({ error: "Pago no encontrado" });
      }

      const montoFloat = parseFloat(monto);

      // Verificar que el monto no exceda el saldo pendiente
      if (montoFloat > pagoActual.saldoPendiente) {
        return res.status(400).json({
          error: "El monto excede el saldo pendiente",
          saldoPendiente: pagoActual.saldoPendiente
        });
      }

      // Iniciar transacción
      const resultado = await prisma.$transaction(async (tx) => {
        // Registrar la transacción
        const nuevaTransaccion = await tx.transaccion.create({
          data: {
            pago: { connect: { id: parseInt(idPago) } },
            monto: montoFloat,
            metodoPago,
            referencia,
            fechaPago: new Date()
          }
        });

        // Calcular nuevo monto pagado y saldo pendiente
        // Convertimos montoPagado a número antes de sumar
        const nuevoPagado = parseFloat(pagoActual.montoPagado) + montoFloat;
        const nuevoSaldo = parseFloat(pagoActual.saldoPendiente) - montoFloat;

        // Determinar el nuevo estado
        let nuevoEstado;
        if (nuevoSaldo <= 0) {
          nuevoEstado = 'pagadoTotal';
        } else if (nuevoPagado > 0) {
          nuevoEstado = 'pagadoParcial';
        } else {
          nuevoEstado = 'pendiente';
        }

        // Actualizar el pago
        const pagoActualizado = await tx.pago.update({
          where: { id: parseInt(idPago) },
          data: {
            montoPagado: nuevoPagado,
            saldoPendiente: nuevoSaldo,
            estadoPago: nuevoEstado,
            ultimaActualizacion: new Date()
          }
        });

        return { transaccion: nuevaTransaccion, pago: pagoActualizado };
      });

      return res.status(201).json(resultado);
    } catch (error) {
      console.error("Error al registrar la transacción:", error);
      return res.status(500).json({ error: "Error al registrar la transacción" });
    }
  },

  listarTransaccionesPorPago: async (req, res) => {
    try {
        const { idPago } = req.params;
    
        // Buscar las transacciones del pago
        const transacciones = await prisma.transaccion.findMany({
            where: { idPago: parseInt(idPago) },
            orderBy: { fechaPago: "desc" }
        });

        return res.status(200).json(transacciones);
    } catch (error) {
        console.error("Error al listar transacciones:", error);
        return res.status(500).json({ error: "Error al obtener las transacciones" });
    }
},

  obtenerPagos: async (req, res) => {
    try {
      const pagos = await prisma.pago.findMany({
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          planPago: true, // Incluir información del plan de pago
          transacciones: true, // Incluir transacciones asociadas
        },
      });
      return res.json(pagos);
    } catch (error) {
      console.error("Error al obtener los pagos:", error);
      return res.status(500).json({ error: 'Error al obtener los pagos' });
    }
  },

  obtenerPagoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const pago = await prisma.pago.findUnique({
        where: { id: Number(id) },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          planPago: true, // Incluir información del plan de pago
          transacciones: true, // Incluir transacciones asociadas
        },
      });

      if (!pago) {
        return res.status(404).json({ error: 'Pago no encontrado.' });
      }

      return res.json(pago);
    } catch (error) {
      console.error("Error al obtener el pago:", error);
      return res.status(500).json({ error: 'Error al obtener el pago.' });
    }
  },

  actualizarPago: async (req, res) => {
    try {
      const { id } = req.params;
      const { descripcion, fechaVencimiento, montoPago, montoPagado, interesMora, diasMora, estadoPago, notas } = req.body;

      const pagoExistente = await prisma.pago.findUnique({ where: { id: Number(id) } });
      if (!pagoExistente) {
        return res.status(404).json({ error: 'Pago no encontrado.' });
      }

      // Calcular el saldo pendiente
      const saldoPendiente = parseFloat(montoPago) - parseFloat(montoPagado || 0) + parseFloat(interesMora || 0);

      const pagoActualizado = await prisma.pago.update({
        where: { id: Number(id) },
        data: {
          descripcion,
          fechaVencimiento: new Date(fechaVencimiento),
          montoPago: parseFloat(montoPago),
          montoPagado: parseFloat(montoPagado) || 0,
          saldoPendiente: saldoPendiente,
          interesMora: parseFloat(interesMora) || 0,
          diasMora: parseInt(diasMora) || 0,
          estadoPago: estadoPago,
          notas: notas,
        },
      });

      return res.json(pagoActualizado);
    } catch (error) {
      console.error("Error al actualizar el pago:", error);
      return res.status(500).json({ error: 'Error al actualizar el pago.' });
    }
  },

  eliminarPago: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.pago.delete({ where: { id: Number(id) } });
      return res.json({ mensaje: 'Pago eliminado correctamente.' });
    } catch (error) {
      console.error("Error al eliminar el pago:", error);
      return res.status(500).json({ error: 'Error al eliminar el pago.' });
    }
  }
};



module.exports = pagos;