// controllers/tareaController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tareaController = {
  // Crear una nueva tarea
  async create(req, res) {
    try {
      const { titulo, descripcion, asignadoId, creadorId, fechaLimite, prioridad, rutaId } = req.body;
      
      const tarea = await prisma.tarea.create({
        data: {
          titulo,
          descripcion,
          asignadoId: Number(asignadoId),
          creadorId: Number(creadorId),
          fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
          prioridad: prioridad || 'media',
          rutaId: rutaId ? Number(rutaId) : undefined
        },
        include: {
          asignado: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          creador: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          ruta: true
        }
      });
      
      res.status(201).json({
        message: 'Tarea creada exitosamente',
        data: tarea
      });
    } catch (error) {
      console.error('Error al crear tarea:', error);
      res.status(500).json({ 
        message: 'Error al crear tarea',
        error: error.message
      });
    }
  },
  
  // Crear una tarea con formulario automáticamente
  async crearTareaConFormulario(req, res) {
    try {
      const { titulo, descripcion, asignadoId, creadorId, fechaLimite, prioridad, rutaId, formularioTipoId } = req.body;
      
      // Transacción para crear tarea y formulario asociado
      const resultado = await prisma.$transaction(async (prisma) => {
        // 1. Crear la tarea
        const tarea = await prisma.tarea.create({
          data: {
            titulo,
            descripcion,
            asignadoId: Number(asignadoId),
            creadorId: Number(creadorId),
            fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
            prioridad: prioridad || 'media',
            rutaId: rutaId ? Number(rutaId) : undefined
          }
        });
        
        // 2. Crear formulario asociado a esta tarea
        const formulario = await prisma.formulario.create({
          data: {
            titulo: `Formulario para ${titulo}`,
            descripcion: `Formulario asociado a la tarea: ${descripcion || titulo}`,
            formularioTipoId: Number(formularioTipoId),
            creadorId: Number(creadorId),
            rutaId: rutaId ? Number(rutaId) : undefined,
            tareaId: tarea.id,
            estado: 'borrador'
          }
        });
        
        return { tarea, formulario };
      });
      
      res.status(201).json({
        message: 'Tarea y formulario creados exitosamente',
        data: resultado
      });
    } catch (error) {
      console.error('Error al crear tarea con formulario:', error);
      res.status(500).json({ 
        message: 'Error al crear tarea con formulario',
        error: error.message
      });
    }
  },
  
  // Crear tarea al asignar ruta
  async crearTareaAlAsignarRuta(req, res) {
    try {
      const { rutaId, usuarioId, creadorId, formularioTipoId } = req.body;
      
      // Buscar información de la ruta
      const ruta = await prisma.rutas.findUnique({
        where: { id: Number(rutaId) }
      });
      
      if (!ruta) {
        return res.status(404).json({ message: 'Ruta no encontrada' });
      }
      
      // Transacción para asignar ruta, crear tarea y formulario
      const resultado = await prisma.$transaction(async (prisma) => {
        // 1. Asignar usuario a ruta
        const rutaActualizada = await prisma.rutas.update({
          where: { id: Number(rutaId) },
          data: {
            usuarioAsignadoId: Number(usuarioId)
          }
        });
        
        // 2. Crear tarea asociada
        const tarea = await prisma.tarea.create({
          data: {
            titulo: `Realizar ruta ${ruta.nombre}`,
            descripcion: `Completar el recorrido de la ruta ${ruta.nombre}`,
            asignadoId: Number(usuarioId),
            creadorId: Number(creadorId),
            prioridad: 'media',
            rutaId: Number(rutaId)
          }
        });
        
        // 3. Crear formulario asociado a la tarea (si se proporcionó tipo de formulario)
        let formulario = null;
        if (formularioTipoId) {
          formulario = await prisma.formulario.create({
            data: {
              titulo: `Formulario para ruta ${ruta.nombre}`,
              descripcion: `Registro para la ruta ${ruta.nombre}`,
              formularioTipoId: Number(formularioTipoId),
              creadorId: Number(creadorId),
              rutaId: Number(rutaId),
              tareaId: tarea.id,
              estado: 'borrador'
            }
          });
        }
        
        return { rutaActualizada, tarea, formulario };
      });
      
      res.status(201).json({
        message: 'Ruta asignada y tarea creada exitosamente',
        data: resultado
      });
    } catch (error) {
      console.error('Error al asignar ruta y crear tarea:', error);
      res.status(500).json({ 
        message: 'Error al asignar ruta y crear tarea',
        error: error.message
      });
    }
  },
  
  // Obtener todas las tareas
  async getAll(req, res) {
    try {
      const tareas = await prisma.tarea.findMany({
        include: {
          asignado: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          creador: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          ruta: true,
          formulario: {
            select: {
              id: true,
              titulo: true,
              estado: true
            }
          }
        },
        orderBy: {
          fechaCreacion: 'desc'
        }
      });
      
      res.status(200).json(tareas);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({ 
        message: 'Error al obtener tareas',
        error: error.message
      });
    }
  },
  
  // Obtener tareas asignadas a un usuario
  async getByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      
      const tareas = await prisma.tarea.findMany({
        where: {
          asignadoId: Number(usuarioId)
        },
        include: {
          ruta: true,
          formulario: {
            select: {
              id: true,
              titulo: true,
              estado: true
            }
          }
        },
        orderBy: [
          {
            estado: 'asc' // Primero pendientes y en progreso
          },
          {
            fechaLimite: 'asc' // Ordenar por fecha límite más cercana
          }
        ]
      });
      
      res.status(200).json(tareas);
    } catch (error) {
      console.error('Error al obtener tareas del usuario:', error);
      res.status(500).json({ 
        message: 'Error al obtener tareas del usuario',
        error: error.message
      });
    }
  },
  
  // Obtener una tarea por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const tarea = await prisma.tarea.findUnique({
        where: { id: Number(id) },
        include: {
          asignado: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          creador: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          ruta: true,
          formulario: {
            include: {
              formularioTipo: true,
              valores: {
                include: {
                  campoFormulario: true
                }
              }
            }
          }
        }
      });
      
      if (!tarea) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
      }
      
      res.status(200).json(tarea);
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      res.status(500).json({ 
        message: 'Error al obtener tarea',
        error: error.message
      });
    }
  },
  
  // Actualizar estado de una tarea
  async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const tarea = await prisma.tarea.update({
        where: { id: Number(id) },
        data: {
          estado,
          ...(estado === 'completada' && { fechaCompletada: new Date() })
        }
      });
      
      res.status(200).json({
        message: 'Estado de tarea actualizado exitosamente',
        data: tarea
      });
    } catch (error) {
      console.error('Error al actualizar estado de tarea:', error);
      res.status(500).json({ 
        message: 'Error al actualizar estado de tarea',
        error: error.message
      });
    }
  },
  
  // Actualizar una tarea
  async update(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descripcion, estado, prioridad, fechaLimite, asignadoId } = req.body;
      
      const tarea = await prisma.tarea.update({
        where: { id: Number(id) },
        data: {
          titulo,
          descripcion,
          estado,
          prioridad,
          fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
          asignadoId: asignadoId ? Number(asignadoId) : undefined,
          ...(estado === 'completada' && { fechaCompletada: new Date() })
        }
      });
      
      res.status(200).json({
        message: 'Tarea actualizada exitosamente',
        data: tarea
      });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      res.status(500).json({ 
        message: 'Error al actualizar tarea',
        error: error.message
      });
    }
  },
  
  // Eliminar una tarea
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.tarea.delete({
        where: { id: Number(id) }
      });
      
      res.status(200).json({
        message: 'Tarea eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      res.status(500).json({ 
        message: 'Error al eliminar tarea',
        error: error.message
      });
    }
  }
};

module.exports = tareaController;