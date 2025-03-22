const prisma = require('../models/prisma');

const clienteController = {
    // Obtener todos los clientes con sus pagos
    async getClientes(req, res) {
        try {
            const clientes = await prisma.cliente.findMany({
                include: { pagos: true } // Incluir pagos asociados al cliente
            });
            return res.json(clientes);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener los clientes.' });
        }
    },
    
    

    // Obtener un cliente por ID con sus pagos
    async getClienteById(req, res) {
        try {
            const { id } = req.params;
            const cliente = await prisma.cliente.findUnique({
                where: { id: Number(id) },
                include: { pagos: true }  
            });
            cliente ? res.json(cliente) : res.status(404).json({ error: "Cliente no encontrado" });
        } catch (error) {
            res.status(500).json({ error: "Error al obtener el cliente" });
        }
    },

    // Crear un nuevo cliente
    async createCliente(req, res) {
        try {
            const { nombre, apellido, correo, telefono, direccion } = req.body;
            const nuevoCliente = await prisma.cliente.create({
                data: { nombre, apellido, correo, telefono, direccion }
            });
            res.json(nuevoCliente);
        } catch (error) {
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
