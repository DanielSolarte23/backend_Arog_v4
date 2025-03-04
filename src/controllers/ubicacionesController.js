const prisma = require('../models/prisma')

// Obtener todas las ubicaciones
exports.getAllUbicaciones = async (req, res) => {
  try {
    const ubicaciones = await prisma.ubicaciones.findMany();
    res.status(200).json(ubicaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una ubicación por ID
exports.getUbicacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const ubicacion = await prisma.ubicaciones.findUnique({
      where: { id: Number(id) },
      include: {
        puntosRuta: true
      }
    });
    
    if (!ubicacion) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }
    
    res.status(200).json(ubicacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva ubicación
exports.createUbicacion = async (req, res) => {
  try {
    const { nombre, latitud, longitud } = req.body;
    
    // Validación básica
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la ubicación es requerido' });
    }
    
    const nuevaUbicacion = await prisma.ubicaciones.create({
      data: {
        nombre,
        latitud: latitud ? parseFloat(latitud) : null,
        longitud: longitud ? parseFloat(longitud) : null
      }
    });
    
    res.status(201).json(nuevaUbicacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una ubicación
exports.updateUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, latitud, longitud } = req.body;
    
    // Verificar si la ubicación existe
    const ubicacionExistente = await prisma.ubicaciones.findUnique({
      where: { id: Number(id) }
    });
    
    if (!ubicacionExistente) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }
    
    // Actualizar la ubicación
    const ubicacionActualizada = await prisma.ubicaciones.update({
      where: { id: Number(id) },
      data: {
        nombre: nombre || ubicacionExistente.nombre,
        latitud: latitud !== undefined ? parseFloat(latitud) : ubicacionExistente.latitud,
        longitud: longitud !== undefined ? parseFloat(longitud) : ubicacionExistente.longitud
      }
    });
    
    res.status(200).json(ubicacionActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una ubicación
exports.deleteUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la ubicación existe
    const ubicacionExistente = await prisma.ubicaciones.findUnique({
      where: { id: Number(id) }
    });
    
    if (!ubicacionExistente) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }
    
    // Eliminar la ubicación
    await prisma.ubicaciones.delete({
      where: { id: Number(id) }
    });
    
    res.status(200).json({ message: 'Ubicación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};