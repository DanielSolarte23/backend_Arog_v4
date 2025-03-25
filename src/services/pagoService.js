// services/pagoService.js
const { prisma } = require('../models/prisma');

class PagoService {
  async actualizarEstadosPagos() {
    const hoy = new Date();
    
    // Obtener todos los pagos pendientes o parciales con fecha de vencimiento pasada
    const pagosPendientes = await prisma.pago.findMany({
      where: {
        fechaVencimiento: { lt: hoy },
        estadoPago: { in: ['pendiente', 'pagadoParcial'] }
      }
    });
    
    let actualizados = 0;
    
    for (const pago of pagosPendientes) {
      // Calcular días de mora
      const diffTime = Math.abs(hoy - pago.fechaVencimiento);
      const diasMora = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Calcular interés de mora (ejemplo: 0.1% diario)
      const tasaInteresDiaria = 0.001;
      const interesMora = pago.saldoPendiente * tasaInteresDiaria * diasMora;
      
      // Actualizar el pago
      await prisma.pago.update({
        where: { id: pago.id },
        data: {
          diasMora,
          interesMora,
          estadoPago: 'vencido',
          ultimaActualizacion: new Date()
        }
      });
      
      actualizados++;
    }
    
    console.log(`Actualizado ${actualizados} pagos vencidos.`);
    return actualizados;
  }
  

}

module.exports = new PagoService();