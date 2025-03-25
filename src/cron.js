const cron = require('node-cron');
const pagoService = require('./services/pagoService');

// Ejecutar todos los días a la medianoche
cron.schedule('0 0 * * *', async () => {
  console.log('Ejecutando tarea programada: actualización de pagos vencidos');
  try {
    const actualizados = await pagoService.actualizarEstadosPagos();
    console.log(`Tarea completada. Se actualizaron ${actualizados} pagos.`);
  } catch (error) {
    console.error('Error al ejecutar tarea programada:', error);
  }
});