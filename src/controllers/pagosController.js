const { PrismaClient, MetodoPago, EstadoPago, FrecuenciaPago } = require('@prisma/client');
const { json } = require('express');
const { cliente } = require('../models/prisma');
const prisma = new PrismaClient();



const pagos = {
  crearpago: async (req, res) => {
    try {
      const { idCliente, fechaPago, descripcion, montoDeuda, valorPago, interesMora, metodoPago, diasMora, estadoPago, notas, frecuenciaDePago, fechaProximoPago } = req.body;

      console.log("Datos recibidos:", req.body); // Para depuración

      // Validar que idCliente sea un número válido
      const idClienteValido = idCliente ? parseInt(idCliente, 10) : null;

      // Construcción del objeto de datos
      const dataPago = {
        fechaPago: new Date(fechaPago),
        descripcion,
        montoDeuda: parseFloat(montoDeuda),
        valorPago: parseFloat(valorPago),
        saldoPendiente: (parseFloat(montoDeuda) || 0) - (parseFloat(valorPago) || 0) + (parseFloat(interesMora) || 0),
        interesMora: parseFloat(interesMora),
        metodoPago,
        diasMora,
        estadoPago,
        notas,
        frecuenciaDePago,
        fechaProximoPago: fechaProximoPago ? new Date(fechaProximoPago) : null,
      };

      // Si hay un cliente, conectar el pago con él
      if (idClienteValido) {
        dataPago.cliente = { connect: { id: idClienteValido } };
      }

      // Crear el pago en la base de datos
      const nuevoPago = await prisma.pagos.create({ data: dataPago });

      return res.status(201).json(nuevoPago);
    } catch (error) {
      console.error("Error al crear el pago:", error);
      return res.status(500).json({ error: "Error al crear el pago" });
    }
  },

  obtenerPagos: async (req, res) => {
    try {
      const pagos = await prisma.pagos.findMany({
        include: {
          cliente: {
              select: {
                  id: true, 
                  nombre: true  
              }
          }
      }
  });
return res.json(pagos);  
  } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Error al obtener los pagos' });
    }
  },

  obtenerPagoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const pago = await prisma.pagos.findUnique({
          where: { id: Number(id) },
          include: {
              cliente: {
                  select: {
                      id: true,
                      nombre: true
                  }
              }
          }
      });

      if (!pago) {
        return res.status(404).json({ error: 'Pago no encontrado.' });
      }

      return res.json(pago);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener el pago.' });
    }
  },

  actualizarPago: async (req, res) => {
    try {
      const { id } = req.params;
      const { estadoPago, valorPago } = req.body;

      const pagoExistente = await prisma.pagos.findUnique({ where: { id: Number(id) } });
      if (!pagoExistente) {
        return res.status(404).json({ error: 'Pago no encontrado.' });
      }

      const saldoPendiente = (pagoExistente.montoDeuda || 0) - (valorPago || pagoExistente.valorPago) + (pagoExistente.interesMora || 0);

      const pagoActualizado = await prisma.pagos.update({
        where: { id: Number(id) },
        data: { estadoPago, valorPago, saldoPendiente },
      });

      return res.json(pagoActualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar el pago.' });
    }
  },

  eliminarPago: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.pagos.delete({ where: { id: Number(id) } });
      return res.json({ mensaje: 'Pago eliminado correctamente.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar el pago.' });
    }
  },
};

module.exports = pagos;


   
