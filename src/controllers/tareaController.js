// controllers/tareaController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tareaController = {
  // Crear una nueva tarea
  async create(req, res) {
    try {
        const { titulo, descripcion, asignadoId, creadorId, fechaLimite, prioridad, rutaId, estado, archivada } = req.body;

        const tarea = await prisma.tarea.create({
            data: {
                titulo,
                descripcion,
                asignadoId: Number(asignadoId),
                creadorId: Number(creadorId),
                fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
                prioridad: prioridad || 'media',
                rutaId: rutaId ? Number(rutaId) : undefined,
                estado: estado || 'pendiente', // Agregar estado
                archivada: archivada || false, // Agregar archivada
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
        const { titulo, descripcion, asignadoId, creadorId, fechaLimite, prioridad, rutaId, formularioId, estado, archivada } = req.body;

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
                    rutaId: rutaId ? Number(rutaId) : undefined,
                    estado: estado || 'pendiente',
                    archivada: archivada || false,
                }
            });

            // 2. Asignar formulario existente a la tarea
            let formulario = null;
            if (formularioId) {
                formulario = await prisma.formulario.update({
                    where: { id: Number(formularioId) },
                    data: {
                        tareaId: tarea.id
                    }
                });
                formulario = await prisma.formulario.findUnique({
                  where: {id: Number(formularioId)}
                })
            }

            return { tarea, formulario };
        });

        res.status(201).json({
            message: 'Tarea creada exitosamente con formulario asignado',
            data: resultado
        });
    } catch (error) {
        console.error('Error al crear tarea con formulario asignado:', error);
        res.status(500).json({
            message: 'Error al crear tarea con formulario asignado',
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
                asignadoId: {
                    equals: Number(usuarioId) // Envolver usuarioId en { equals: ... }
                }
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
      const { titulo, descripcion, estado, prioridad, fechaLimite, asignadoId, archivada } = req.body;
      
      const tarea = await prisma.tarea.update({
        where: { id: Number(id) },
        data: {
          titulo,
          descripcion,
          estado,
          prioridad,
          archivada,  // añadir esta línea
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

  async getArchivadas(req, res) {
    try {
      const tareasArchivadas = await prisma.tarea.findMany({
        where: {
          archivada: true
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
      
      res.status(200).json(tareasArchivadas);
    } catch (error) {
      console.error('Error al obtener tareas archivadas:', error);
      res.status(500).json({ 
        message: 'Error al obtener tareas archivadas',
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