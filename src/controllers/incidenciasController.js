const prisma = require('../models/prisma');

const incidenciaController = {
  // Crear una incidencia
  async crearIncidencia(req, res) {
    try {
      const { fechaIncidencia, tituloIncidencia, descripcionIncidencia, tipoIncidencia, estadoIncidencia, idUsuarioAsignado, idUsuarioCiudadano, idUsuarioCreador, idUsuarioModificador } = req.body;

      const incidencia = await prisma.incidencias.create({
        data: {
          fechaIncidencia: new Date(fechaIncidencia),
          tituloIncidencia,
          descripcionIncidencia,
          tipoIncidencia,
          estadoIncidencia,
          usuarioAsignado: idUsuarioAsignado ? { connect: { id: idUsuarioAsignado } } : undefined,
          ciudadano: idUsuarioCiudadano ? { connect: { id: idUsuarioCiudadano } } : undefined,
          creador: { connect: { id: idUsuarioCreador } },
          modificador: idUsuarioModificador ? { connect: { id: idUsuarioModificador } } : undefined
        }
      });

      res.status(201).json(incidencia);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener todas las incidencias
  async obtenerIncidencias(req, res) {
    try {
      const incidencias = await prisma.incidencias.findMany({
        include: {
          usuarioAsignado: true,
          ciudadano: true,
          creador: true,
          modificador: true
        }
      });

      res.json(incidencias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener una incidencia por ID
  async obtenerIncidencia(req, res) {
    try {
      const { id } = req.params;

      const incidencia = await prisma.incidencias.findUnique({
        where: { id: parseInt(id) },
        include: {
          usuarioAsignado: true,
          ciudadano: true,
          creador: true,
          modificador: true
        }
      });

      if (!incidencia) {
        return res.status(404).json({ error: "Incidencia no encontrada" });
      }

      res.json(incidencia);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar una incidencia
  async actualizarIncidencia(req, res) {
    try {
      const { id } = req.params;
      const { fechaIncidencia, tituloIncidencia, descripcionIncidencia, tipoIncidencia, estadoIncidencia, idUsuarioAsignado, idUsuarioCiudadano, idUsuarioModificador } = req.body;

      const incidencia = await prisma.incidencias.update({
        where: { id: parseInt(id) },
        data: {
          fechaIncidencia: fechaIncidencia ? new Date(fechaIncidencia) : undefined,
          tituloIncidencia,
          descripcionIncidencia,
          tipoIncidencia,
          estadoIncidencia,
          usuarioAsignado: idUsuarioAsignado ? { connect: { id: idUsuarioAsignado } } : undefined,
          ciudadano: idUsuarioCiudadano ? { connect: { id: idUsuarioCiudadano } } : undefined,
          modificador: idUsuarioModificador ? { connect: { id: idUsuarioModificador } } : undefined
        }
      });

      res.json(incidencia);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar una incidencia
  async eliminarIncidencia(req, res) {
    try {
      const { id } = req.params;
      await prisma.incidencias.delete({
        where: { id: parseInt(id) }
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = incidenciaController;
