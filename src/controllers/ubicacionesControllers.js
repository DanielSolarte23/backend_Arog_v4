const { PrismaClient, TipoUbicacion } = require('@prisma/client');
const prisma = new PrismaClient();

const ubicacionesController = {
  // Crear una ubicación
  async crearUbicacion(req, res) {
    try {
      const { nombre, latitud, longitud, tipo } = req.body;

      // Validaciones
      if (!nombre || nombre.length < 3 || nombre.length > 255) {
        return res.status(400).json({ error: 'El nombre debe tener entre 3 y 255 caracteres.' });
      }

      if (latitud && (latitud < -90 || latitud > 90)) {
        return res.status(400).json({ error: 'Latitud fuera de rango (-90 a 90).' });
      }

      if (longitud && (longitud < -180 || longitud > 180)) {
        return res.status(400).json({ error: 'Longitud fuera de rango (-180 a 180).' });
      }

      if (!Object.values(TipoUbicacion).includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de ubicación inválido. Opciones: parada, inicio, fin.' });
      }

      // Crear ubicación
      const nuevaUbicacion = await prisma.ubicaciones.create({
        data: { nombre, latitud, longitud, tipo },
      });

      res.status(201).json(nuevaUbicacion);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear la ubicación.' });
    }
  }, 

  // obtener todas las ubicaciones 

  async obtenerUbicaciones(req, res) {
    try {
        const ubicaciones = await prisma.ubicaciones.findMany();
        res.json(ubicaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las ubicaciones.' });
        
    }
  },

  // Obtener una ubicación por id

async obtenerUbicacionesporId(req, res) {
    try {
        const { id } = req.params;
        const ubicacion = await prisma.ubicaciones.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ubicacion) {
            return res.status(404).json({ error: 'Ubicación no encontrada.' });
        }
        res.json(ubicacion);
}
  catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la ubicación.' });
    }},

// Actualizar una ubicación
async actualizarUbicacion(req, res) {
    try {
      const { id } = req.params;
      const { nombre, latitud, longitud, tipo } = req.body;

      let updateData = {};

      if (nombre) {
        if (nombre.length < 3 || nombre.length > 255) {
          return res.status(400).json({ error: 'El nombre debe tener entre 3 y 255 caracteres.' });
        }
        updateData.nombre = nombre;
      }

      if (latitud !== undefined) {
        if (latitud < -90 || latitud > 90) {
          return res.status(400).json({ error: 'Latitud fuera de rango (-90 a 90).' });
        }
        updateData.latitud = latitud;
      }

      if (longitud !== undefined) {
        if (longitud < -180 || longitud > 180) {
          return res.status(400).json({ error: 'Longitud fuera de rango (-180 a 180).' });
        }
        updateData.longitud = longitud;
      }

      if (tipo && !Object.values(TipoUbicacion).includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de ubicación inválido.' });
      }
      if (tipo) updateData.tipo = tipo;

      const ubicacion = await prisma.ubicaciones.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.json(ubicacion);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la ubicación.' });
    }
  },
  // Eliminar una ubicación
  async eliminarUbicaciones(req, res) {
    try {
        const { id } = req.params;

        await prisma.ubicaciones.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({ message: "Ubicación eliminada correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar la ubicación." });
    }
}


};
  module.exports = ubicacionesController
