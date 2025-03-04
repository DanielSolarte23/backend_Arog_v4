const prisma = require('../models/prisma')

// Obtener todos los vehículos
exports.obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await prisma.vehiculos.findMany();
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un vehículo por ID
exports.obtenerVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await prisma.vehiculos.findUnique({ where: { id: Number(id) } });

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo vehículo
exports.crearVehiculo = async (req, res) => {
  try {
    const { modelo, placa, marca } = req.body;

    if (!modelo || !placa || !marca) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const vehiculoExistente = await prisma.vehiculos.findUnique({ where: { placa } });
    if (vehiculoExistente) {
      return res.status(400).json({ error: 'La placa ya está registrada' });
    }

    const nuevoVehiculo = await prisma.vehiculos.create({
      data: { modelo, placa, marca }
    });

    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un vehículo por ID
exports.actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { modelo, placa, marca } = req.body;

    const vehiculo = await prisma.vehiculos.findUnique({ where: { id: Number(id) } });
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const vehiculoActualizado = await prisma.vehiculos.update({
      where: { id: Number(id) },
      data: { modelo, placa, marca }
    });

    res.json(vehiculoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un vehículo por ID
exports.eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const vehiculo = await prisma.vehiculos.findUnique({ where: { id: Number(id) } });
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    await prisma.vehiculos.delete({ where: { id: Number(id) } });

    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
