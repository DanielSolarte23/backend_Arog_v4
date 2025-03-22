const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pqrsController = {
  // Crear un PQRS
  async crearPqrs(req, res) {
    try {
      let { descripcion, motivo, categoria, idCiudadano, idUsuarioCreador, estado } = req.body;

      // Convertir a número
      idCiudadano = Number(idCiudadano);
      idUsuarioCreador = Number(idUsuarioCreador);

      // Validaciones
      if (!descripcion || descripcion.length < 10 || descripcion.length > 500) {
        return res.status(400).json({ error: 'La descripción debe tener entre 10 y 500 caracteres.' });
      }
      if (!motivo || motivo.length < 5 || motivo.length > 200) {
        return res.status(400).json({ error: 'El motivo debe tener entre 5 y 200 caracteres.' });
      }
      if (!["Reclamo", "Peticion", "Queja", "Sugerencia"].includes(categoria)) {
        return res.status(400).json({ error: 'Categoría inválida.' });
      }
      if (!["Abierto", "En_proceso", "Cerrado"].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido.' });
      }
      if (!idCiudadano || isNaN(idCiudadano)) {
        return res.status(400).json({ error: 'El ID del ciudadano es inválido.' });
      }
      if (!idUsuarioCreador || isNaN(idUsuarioCreador)) {
        return res.status(400).json({ error: 'El ID del usuario creador es inválido.' });
      }

      // Crear el PQRS en la BD
      const nuevoPqrs = await prisma.pqrs.create({
        data: { descripcion, motivo, categoria, estado, idCiudadano, idUsuarioCreador },
      });

      return res.status(201).json(nuevoPqrs);
    } catch (error) {
      console.error("Error al crear PQRS:", error);
      return res.status(500).json({ error: 'Ocurrió un error al crear el PQRS.' });
    }
  },

  // Mostrar todos los PQRS
  async mostrarPqrs(req, res) {
    try {
      const pqrsList = await prisma.pqrs.findMany({
        include: {
          ciudadano: true,
          creador: true,
        },
      });
      return res.json(pqrsList);
    } catch (error) {
      console.error("Error al obtener PQRS:", error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los PQRS.' });
    }
  },

  // Mostrar PQRS por ID
  async mostrarPqrsPorId(req, res) {
    try {
      const { id } = req.params;
      const pqrs = await prisma.pqrs.findUnique({
        where: { id: parseInt(id) },
        include: {
          ciudadano: true,
          creador: true,
        },
      });

      if (!pqrs) return res.status(404).json({ message: 'PQRS no encontrado' });

      return res.json(pqrs);
    } catch (error) {
      console.error("Error al obtener PQRS por ID:", error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener el PQRS.' });
    }
  },

  // Actualizar un PQRS
  async actualizarPqrs(req, res) {
    try {
      const { id } = req.params;
      const { descripcion, motivo, categoria, estado, seguimiento } = req.body;
      let updateData = {};

      if (descripcion && (descripcion.length < 10 || descripcion.length > 500)) {
        return res.status(400).json({ error: 'La descripción debe tener entre 10 y 500 caracteres.' });
      }
      if (motivo && (motivo.length < 5 || motivo.length > 200)) {
        return res.status(400).json({ error: 'El motivo debe tener entre 5 y 200 caracteres.' });
      }
      if (categoria && !["Reclamo", "Peticion", "Queja", "Sugerencia"].includes(categoria)) {
        return res.status(400).json({ error: 'Categoría inválida.' });
      }
      if (estado && !["Abierto", "En_proceso", "Cerrado"].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido.' });
      }

      if (descripcion) updateData.descripcion = descripcion;
      if (motivo) updateData.motivo = motivo;
      if (categoria) updateData.categoria = categoria;
      if (estado) updateData.estado = estado;
      if (seguimiento) updateData.seguimiento = seguimiento;

      const pqrs = await prisma.pqrs.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      return res.json(pqrs);
    } catch (error) {
      console.error("Error al actualizar PQRS:", error);
      return res.status(500).json({ error: 'Ocurrió un error al actualizar el PQRS.' });
    }
  },

  // Eliminar un PQRS
  async eliminarPqrs(req, res) {
    try {
      const { id } = req.params;
      await prisma.pqrs.delete({ where: { id: parseInt(id) } });
      return res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar PQRS:", error);
      return res.status(500).json({ error: 'Ocurrió un error al eliminar el PQRS.' });
    }
  },
};

module.exports = pqrsController;
