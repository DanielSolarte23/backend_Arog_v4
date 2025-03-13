const prisma = require('../models/prisma')

// Obtener todas las rutas
exports.getAllRutas = async (req, res) => {
  try {
    const rutas = await prisma.rutas.findMany({
      include: {
        puntosRuta: {
          include: {
            ubicacion: true
          },
          orderBy: {
            orden: 'asc'
          }
        },
        vehiculosAsignados: {
          include: {
            vehiculo: true
          }
        },
        usuarioAsignado: true,
        formularioTipo: true,
        tareas: true
      }
    });
    res.status(200).json(rutas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una ruta por ID
exports.getRutaById = async (req, res) => {
  try {
    const { id } = req.params;
    const ruta = await prisma.rutas.findUnique({
      where: { id: Number(id) },
      include: {
        puntosRuta: {
          include: {
            ubicacion: true
          },
          orderBy: {
            orden: 'asc'
          }
        },
        vehiculosAsignados: {
          include: {
            vehiculo: true
          }
        },
        usuarioAsignado: true,
        // Incluir nuevas relaciones
        formularioTipo: true,
        tareas: true
      }
    });

    if (!ruta) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    res.status(200).json(ruta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRuta = async (req, res) => {
  try {
    const { nombre,  horaInicio, horaFin, usuarioAsignadoId, puntos, formularioTipoId, tareas } = req.body;

    // Validación básica
    if (!nombre ) {
      return res.status(400).json({ error: 'El nombre y el color de la ruta son requeridos' });
    }

    // Crear la ruta con una transacción para garantizar la integridad
    const nuevaRuta = await prisma.$transaction(async (prisma) => {
      // Crear la ruta primero
      const ruta = await prisma.rutas.create({
        data: {
          nombre,
          horaInicio: horaInicio ? new Date(horaInicio) : null,
          horaFin: horaFin ? new Date(horaFin) : null,
          usuarioAsignadoId: usuarioAsignadoId ? Number(usuarioAsignadoId) : null,
          formularioTipoId: formularioTipoId ? Number(formularioTipoId) : null, // Asociar el tipo de formulario
        },
      });

      // Si se proporcionaron puntos de ruta, crearlos
      if (puntos && Array.isArray(puntos)) {
        await Promise.all(puntos.map(async (punto, index) => {
          await prisma.puntosRuta.create({
            data: {
              idRuta: ruta.id,
              idUbicacion: Number(punto.idUbicacion),
              orden: punto.orden || index + 1,
            },
          });
        }));
      }

      // Si se proporcionaron tareas, conectarlas a la ruta
      if (tareas && Array.isArray(tareas)) {
        await Promise.all(tareas.map(async (tareaId) => {
          await prisma.tarea.update({
            where: { id: Number(tareaId) },
            data: {
              rutas: {
                connect: { id: ruta.id },
              },
            },
          });
        }));
      }

      //Crear tarea para el usuario asignado a la ruta.
      if (usuarioAsignadoId) {
        await prisma.tarea.create({
          data: {
            titulo: `Ruta Asignada: ${nombre}`,
            descripcion: `Se te ha asignado la ruta "${nombre}".`,
            asignadoId: usuarioAsignadoId,
            creadorId: usuarioAsignadoId,
            rutaId: ruta.id,
          },
        });
      }

      // Devolver la ruta completa con sus relaciones
      return await prisma.rutas.findUnique({
        where: { id: ruta.id },
        include: {
          puntosRuta: {
            include: {
              ubicacion: true,
            },
            orderBy: {
              orden: 'asc',
            },
          },
          usuarioAsignado: true,
          formularioTipo: true, // Incluir el tipo de formulario
          tareas: true,
        },
      });
    });

    res.status(201).json(nuevaRuta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRuta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre,  horaInicio, horaFin, usuarioAsignadoId, puntos, formularioTipoId, tareas } = req.body;

    // Verificar si la ruta existe
    const rutaExistente = await prisma.rutas.findUnique({
      where: { id: Number(id) },
    });

    if (!rutaExistente) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    // Actualizar la ruta con una transacción
    const rutaActualizada = await prisma.$transaction(async (prisma) => {
      // Actualizar la información básica de la ruta
      const ruta = await prisma.rutas.update({
        where: { id: Number(id) },
        data: {
          nombre: nombre || rutaExistente.nombre,
          horaInicio: horaInicio ? new Date(horaInicio) : rutaExistente.horaInicio,
          horaFin: horaFin ? new Date(horaFin) : rutaExistente.horaFin,
          usuarioAsignadoId: usuarioAsignadoId !== undefined ? Number(usuarioAsignadoId) : rutaExistente.usuarioAsignadoId,
          formularioTipoId: formularioTipoId !== undefined ? Number(formularioTipoId) : rutaExistente.formularioTipoId, // Actualizar el tipo de formulario
        },
      });

      // Si se proporcionaron puntos de ruta, actualizar los puntos
      if (puntos && Array.isArray(puntos)) {
        // Opcional: eliminar los puntos existentes para reemplazarlos
        await prisma.puntosRuta.deleteMany({
          where: { idRuta: Number(id) },
        });

        // Crear los nuevos puntos
        await Promise.all(puntos.map(async (punto, index) => {
          await prisma.puntosRuta.create({
            data: {
              idRuta: Number(id),
              idUbicacion: Number(punto.idUbicacion),
              orden: punto.orden || index + 1,
            },
          });
        }));
      }

      // Si se proporcionaron tareas, actualizar las relaciones
      if (tareas && Array.isArray(tareas)) {
        // Desconectar todas las tareas existentes
        await prisma.rutas.update({
          where: { id: Number(id) },
          data: {
            tareas: {
              set: [], // Eliminar todas las relaciones existentes
            },
          },
        });

        // Conectar las nuevas tareas
        await Promise.all(tareas.map(async (tareaId) => {
          await prisma.tarea.update({
            where: { id: Number(tareaId) },
            data: {
              rutas: {
                connect: { id: Number(id) },
              },
            },
          });
        }));
      }

      // Devolver la ruta actualizada con sus relaciones
      return await prisma.rutas.findUnique({
        where: { id: Number(id) },
        include: {
          puntosRuta: {
            include: {
              ubicacion: true,
            },
            orderBy: {
              orden: 'asc',
            },
          },
          vehiculosAsignados: {
            include: {
              vehiculo: true,
            },
          },
          usuarioAsignado: true,
          formularioTipo: true, // Incluir el tipo de formulario
          tareas: true,
        },
      });
    });

    res.status(200).json(rutaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una ruta
exports.deleteRuta = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la ruta existe
    const rutaExistente = await prisma.rutas.findUnique({
      where: { id: Number(id) }
    });

    if (!rutaExistente) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    // Eliminar la ruta (los puntos relacionados se eliminarán automáticamente por la relación onDelete: Cascade)
    await prisma.rutas.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Ruta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Asignar o actualizar vehículo a una ruta
exports.asignarVehiculo = async (req, res) => {
  try {
    const { idRuta, idVehiculo } = req.body;

    if (!idRuta || !idVehiculo) {
      return res
        .status(400)
        .json({
          error: "Se requieren el ID de la ruta y el ID del vehículo",
        });
    }

    // Verificar si la ruta y el vehículo existen
    const ruta = await prisma.rutas.findUnique({
      where: { id: Number(idRuta) },
    });
    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id: Number(idVehiculo) },
    });

    if (!ruta) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }

    if (!vehiculo) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // Verificar si ya existe una asignación para esta ruta
    const asignacionExistente = await prisma.vehiculosAsignados.findFirst({
      where: { idRuta: Number(idRuta) },
    });

    if (asignacionExistente) {
      // Actualizar la asignación existente
      const asignacionActualizada = await prisma.vehiculosAsignados.update({
        where: { id: asignacionExistente.id },
        data: { idVehiculo: Number(idVehiculo) },
        include: { ruta: true, vehiculo: true },
      });
      res.status(200).json(asignacionActualizada);
    } else {

      const asignacion = await prisma.vehiculosAsignados.create({
        data: { idRuta: Number(idRuta), idVehiculo: Number(idVehiculo) },
        include: { ruta: true, vehiculo: true },
      });
      res.status(201).json(asignacion);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar asignación de vehículo a ruta
exports.eliminarAsignacionVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la asignación existe
    const asignacion = await prisma.vehiculosAsignados.findUnique({
      where: { id: Number(id) }
    });

    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Eliminar la asignación
    await prisma.vehiculosAsignados.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Asignación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};