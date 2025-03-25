const prisma = require('../models/prisma');

const clienteController = {
    // Obtener todos los clientes con sus pagos
    async getClientes(req, res) {
        try {
            const clientes = await prisma.cliente.findMany({
                include: {
                    planes: {
                        include: {
                            pagos: {
                                include: {
                                    transacciones: true, // Incluir transacciones de cada pago
                                },
                            },
                        },
                    },
                    pagos: {
                        include: {
                            transacciones: true, // Incluir transacciones de cada pago
                        },
                    },
                },
            });
    
            // Calcular deuda total y días de mora para cada cliente
            const clientesConDeuda = clientes.map(cliente => {
                let deudaTotal = 0;
                let diasMoraTotal = 0;
    
                cliente.pagos.forEach(pago => {
                    deudaTotal += pago.saldoPendiente.toNumber(); // Usar saldoPendiente para la deuda
                    diasMoraTotal += pago.diasMora;
                });
    
                return {
                    ...cliente,
                    deudaTotal,
                    diasMoraTotal,
                };
            });
    
            return res.json(clientesConDeuda);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener los clientes.' });
        }
    },

    // Obtener un cliente por ID con sus pagos, deudas y días de mora
    async getClienteById(req, res) {
        try {
            const { id } = req.params;
            const cliente = await prisma.cliente.findUnique({
                where: { id: Number(id) },
                include: { pagos: true },
            });

            if (!cliente) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }

            // Calcular deuda total y días de mora para el cliente
            let deudaTotal = 0;
            let diasMoraTotal = 0;

            cliente.pagos.forEach(pago => {
                deudaTotal += pago.deuda.toNumber(); // Convertir Decimal a Number
                diasMoraTotal += pago.diasMora;
            });

            const clienteConDeuda = {
                ...cliente,
                deudaTotal,
                diasMoraTotal,
            };

            return res.json(clienteConDeuda);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener el cliente" });
        }
    },

    // Crear un nuevo cliente
    async createCliente(req, res) {
        try {
            const { nombre, apellido, correo, telefono, direccion } = req.body;

            // Validaciones básicas
            if (!nombre || !apellido || !correo || !telefono) {
                return res.status(400).json({ error: "Los campos nombre, apellido, correo y teléfono son obligatorios" });
            }

            // Verificar si el correo ya existe
            const clienteExistente = await prisma.cliente.findUnique({
                where: { correo }
            });

            if (clienteExistente) {
                return res.status(400).json({ error: "Ya existe un cliente con este correo electrónico" });
            }

            const nuevoCliente = await prisma.cliente.create({
                data: {
                    nombre,
                    apellido,
                    correo,
                    telefono,
                    direccion
                }
            });

            // Si se proporcionó información de plan de pago, crearlo también
            if (req.body.planPago) {
                const { descripcion, montoPeriodico, diaPago, periodicidad, fechaInicio } = req.body.planPago;

                await prisma.planPago.create({
                    data: {
                        descripcion,
                        montoPeriodico: parseFloat(montoPeriodico),
                        diaPago: parseInt(diaPago),
                        periodicidad,
                        fechaInicio: new Date(fechaInicio),
                        cliente: { connect: { id: nuevoCliente.id } }
                    }
                });
            }

            // Devolver el cliente creado
            const clienteConDetalles = await prisma.cliente.findUnique({
                where: { id: nuevoCliente.id },
                include: { planes: true }
            });

            res.status(201).json(clienteConDetalles);
        } catch (error) {
            console.error("Error al crear el cliente:", error);
            res.status(500).json({ error: "Error al crear el cliente" });
        }
    },

    // Actualizar un cliente
    async updateCliente(req, res) {
        try {
            const { id } = req.params;
            const { nombre, apellido, correo, telefono, direccion } = req.body;
            const clienteActualizado = await prisma.cliente.update({
                where: { id: Number(id) },
                data: { nombre, apellido, correo, telefono, direccion }
            });
            res.json(clienteActualizado);
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar el cliente" });
        }
    },

    // Eliminar un cliente
    async deleteCliente(req, res) {
        try {
            const { id } = req.params;
            await prisma.cliente.delete({
                where: { id: Number(id) }
            });
            res.json({ message: "Cliente eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar el cliente" });
        }
    }
};

module.exports = clienteController;
