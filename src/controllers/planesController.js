const { PrismaClient, Prisma } = require('@prisma/client'); // Importa Prisma
const prisma = new PrismaClient();
const cron = require('node-cron');
const moment = require('moment'); // Importa moment

const planPagoController = {
    // Crear un nuevo plan de pago
    async createPlanPago(req, res) {
        try {
            const { idCliente, descripcion, montoPeriodico, diaPago, periodicidad, fechaInicio, fechaFin } = req.body;
            const nuevoPlanPago = await prisma.planPago.create({
                data: {
                    idCliente,
                    descripcion,
                    montoPeriodico: parseFloat(montoPeriodico),
                    diaPago: parseInt(diaPago),
                    periodicidad,
                    fechaInicio: new Date(fechaInicio),
                    fechaFin: fechaFin ? new Date(fechaFin) : null,
                },
            });
            res.status(201).json(nuevoPlanPago);
        } catch (error) {
            console.error("Error al crear el plan de pago:", error);
            res.status(500).json({ error: "Error al crear el plan de pago" });
        }
    },

    // Obtener todos los planes de pago
    async getAllPlanPagos(req, res) {
        try {
            const planPagos = await prisma.planPago.findMany();
            res.json(planPagos);
        } catch (error) {
            console.error("Error al obtener los planes de pago:", error);
            res.status(500).json({ error: "Error al obtener los planes de pago" });
        }
    },

    // Obtener un plan de pago por ID
    async getPlanPagoById(req, res) {
        try {
            const { id } = req.params;
            const planPago = await prisma.planPago.findUnique({
                where: { id: parseInt(id) },
            });
            if (!planPago) {
                return res.status(404).json({ error: "Plan de pago no encontrado" });
            }
            res.json(planPago);
        } catch (error) {
            console.error("Error al obtener el plan de pago:", error);
            res.status(500).json({ error: "Error al obtener el plan de pago" });
        }
    },

    // Actualizar un plan de pago por ID
    async updatePlanPago(req, res) {
        try {
            const { id } = req.params;
            const { idCliente, descripcion, montoPeriodico, diaPago, periodicidad, fechaInicio, fechaFin } = req.body;
            const planPagoActualizado = await prisma.planPago.update({
                where: { id: parseInt(id) },
                data: {
                    idCliente,
                    descripcion,
                    montoPeriodico: parseFloat(montoPeriodico),
                    diaPago: parseInt(diaPago),
                    periodicidad,
                    fechaInicio: new Date(fechaInicio),
                    fechaFin: fechaFin ? new Date(fechaFin) : null,
                },
            });
            res.json(planPagoActualizado);
        } catch (error) {
            console.error("Error al actualizar el plan de pago:", error);
            res.status(500).json({ error: "Error al actualizar el plan de pago" });
        }
    },

    // Eliminar un plan de pago por ID
    async deletePlanPago(req, res) {
        try {
            const { id } = req.params;
            await prisma.planPago.delete({
                where: { id: parseInt(id) },
            });
            res.status(204).send(); // No Content
        } catch (error) {
            console.error("Error al eliminar el plan de pago:", error);
            res.status(500).json({ error: "Error al eliminar el plan de pago" });
        }
    },

    async generarPagosAutomaticamente() {
        try {
            const clientesConPlanesActivos = await prisma.cliente.findMany({
                where: {
                    planes: {  
                        some: {
                            activo: true,
                        },
                    },
                },
                include: {
                    planes: { 
                        where: {
                            activo: true,
                        },
                    },
                },
            });
    
            for (const cliente of clientesConPlanesActivos) {
                for (const plan of cliente.planes) { 
                    await this.generarPagoSiEsNecesario(cliente, plan);
                }
            }
    
            console.log("Pagos generados automáticamente.");
        } catch (error) {
            console.error("Error al generar pagos automáticamente:", error);
        }
    },
    
    async generarPagoSiEsNecesario(cliente, planPago) {
        const fechaActual = moment();
        let fechaPago = moment(planPago.fechaInicio);
        const fechaFin = planPago.fechaFin ? moment(planPago.fechaFin) : moment().add(1, 'year');
        

        const maxIteraciones = 100;
        let iteracion = 0;
    
        while (fechaPago.isSameOrBefore(fechaFin) && iteracion < maxIteraciones) {
            iteracion++;
            

            let fechaVencimiento;
            switch (planPago.periodicidad) {
                case 'semanal':
                    fechaVencimiento = moment(fechaPago).add(1, 'week');
                    break;
                case 'quincenal':
                    fechaVencimiento = moment(fechaPago).add(15, 'days');
                    break;
                case 'mensual':
                    fechaVencimiento = moment(fechaPago).add(1, 'month');
                    break;
                case 'trimestral':
                    fechaVencimiento = moment(fechaPago).add(3, 'months');
                    break;
                case 'semestral':
                    fechaVencimiento = moment(fechaPago).add(6, 'months');
                    break;
                case 'anual':
                    fechaVencimiento = moment(fechaPago).add(1, 'year');
                    break;
                default:
                    fechaVencimiento = moment(fechaPago).add(1, 'month');
            }
    
            // Verificar si es el momento de generar el pago
            if (fechaActual.isSame(fechaPago, 'day')) {
                const pagoExistente = await prisma.pago.findFirst({
                    where: {
                        idPlanPago: planPago.id,
                        fechaVencimiento: fechaVencimiento.toDate(),
                    },
                });
    
                if (!pagoExistente) {
                    await prisma.pago.create({
                        data: {
                            idCliente: cliente.id,
                            idPlanPago: planPago.id,
                            descripcion: `Pago recurrente: ${planPago.descripcion} (${fechaPago.format('YYYY-MM-DD')})`,
                            fechaEmision: new Date(),
                            fechaVencimiento: fechaVencimiento.toDate(),
                            montoPago: planPago.montoPeriodico,
                            saldoPendiente: planPago.montoPeriodico,
                            estadoPago: 'pendiente'
                        },
                    });
    
                    console.log(`Pago generado para cliente ${cliente.id}, plan ${planPago.id}`);
                }
            }
    
            // Avanzar a la siguiente fecha de pago según la periodicidad
            switch (planPago.periodicidad) {
                case 'semanal':
                    fechaPago.add(1, 'week');
                    break;
                case 'quincenal':
                    fechaPago.add(15, 'days');
                    break;
                case 'mensual':
                    fechaPago.add(1, 'month');
                    break;
                case 'trimestral':
                    fechaPago.add(3, 'months');
                    break;
                case 'semestral':
                    fechaPago.add(6, 'months');
                    break;
                case 'anual':
                    fechaPago.add(1, 'year');
                    break;
                default:
                    fechaPago.add(1, 'month');
            }
        }
        
        if (iteracion >= maxIteraciones) {
            console.warn(`Alerta: Se alcanzó el límite máximo de iteraciones para el plan ${planPago.id}`);
        }
    },

    // iniciarGeneracionAutomatica() {
    //     cron.schedule('* * * * *', () => {
    //         this.generarPagosAutomaticamente();
    //     });
    // },
    iniciarGeneracionAutomatica() {
        cron.schedule('0 0 * * *', () => {
            this.generarPagosAutomaticamente();
        });
    },
    // iniciarGeneracionAutomatica() {
    //     cron.schedule('* * * * *', () => {
    //         this.generarPagosAutomaticamente();
    //     });
    // },
};

module.exports = planPagoController;