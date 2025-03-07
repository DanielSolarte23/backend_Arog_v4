const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const formularioController = {
  // Crear un nuevo formulario
  async create(req, res) {
    try {
      const { formularioTipoId, titulo, descripcion, valores, rutaId, creadorId } = req.body;
      
      // Verificar que el tipo de formulario existe
      const tipoFormulario = await prisma.formularioTipo.findUnique({
        where: { id: Number(formularioTipoId) },
        include: { campos: true }
      });
      
      if (!tipoFormulario) {
        return res.status(404).json({ message: 'Tipo de formulario no encontrado' });
      }
      
      // Crear el formulario con sus valores
      const formulario = await prisma.formulario.create({
        data: {
          titulo,
          descripcion,
          formularioTipoId: Number(formularioTipoId),
          rutaId: rutaId ? Number(rutaId) : undefined,
          creadorId: Number(creadorId),
          estado: 'borrador',
          valores: {
            create: valores.map((valor) => {
              // Encontrar el campo correspondiente para saber su tipo
              const campo = tipoFormulario.campos.find(c => c.id === Number(valor.campoFormularioId));
              const tipo = campo ? campo.tipo : null;
              
              return {
                campoFormularioId: Number(valor.campoFormularioId),
                valorTexto: ['texto', 'textarea', 'select', 'radio', 'checkbox'].includes(tipo) ? valor.valor : null,
                valorNumero: tipo === 'numero' ? parseInt(valor.valor) : null,
                valorDecimal: tipo === 'decimal' ? parseFloat(valor.valor) : null,
                valorFecha: ['fecha', 'fecha_hora', 'hora'].includes(tipo) ? new Date(valor.valor) : null
              };
            })
          }
        },
        include: {
          valores: {
            include: {
              campoFormulario: true
            }
          },
          formularioTipo: true
        }
      });
      
      res.status(201).json({
        message: 'Formulario creado exitosamente',
        data: formulario
      });
    } catch (error) {
      console.error('Error al crear formulario:', error);
      res.status(500).json({ 
        message: 'Error al crear formulario',
        error: error.message
      });
    }
  },
  
  // Obtener todos los formularios
  async getFormularios(req, res) {
    try {
      const formularios = await prisma.formulario.findMany({
        include: {
          formularioTipo: true,
          creador: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          }
        },
        orderBy: {
          fechaCreacion: 'desc'
        }
      });
      
      res.status(200).json(formularios);
    } catch (error) {
      console.error('Error al obtener formularios:', error);
      res.status(500).json({ 
        message: 'Error al obtener formularios',
        error: error.message
      });
    }
  },
  
  // Obtener formularios por usuario asignado
  async getByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      
      // Buscar tareas asignadas al usuario que tienen formularios
      const tareas = await prisma.tarea.findMany({
        where: {
          asignadoId: Number(usuarioId)
        },
        include: {
          formulario: {
            include: {
              formularioTipo: true
            }
          }
        }
      });
      
      // Filtrar solo las tareas que tienen formulario
      const formularios = tareas
        .filter(tarea => tarea.formulario)
        .map(tarea => tarea.formulario);
      
      res.status(200).json(formularios);
    } catch (error) {
      console.error('Error al obtener formularios del usuario:', error);
      res.status(500).json({ 
        message: 'Error al obtener formularios del usuario',
        error: error.message
      });
    }
  },
  
  // Obtener un formulario por ID
  async getFormulariosById(req, res) {
    try {
      const { id } = req.params;
      const formulario = await prisma.formulario.findUnique({
        where: { id: Number(id) },
        include: {
          formularioTipo: true,
          valores: {
            include: {
              campoFormulario: true
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
          tarea: true
        }
      });
      
      if (!formulario) {
        return res.status(404).json({ message: 'Formulario no encontrado' });
      }
      
      res.status(200).json(formulario);
    } catch (error) {
      console.error('Error al obtener formulario:', error);
      res.status(500).json({ 
        message: 'Error al obtener formulario',
        error: error.message
      });
    }
  },
  
  // Actualizar un formulario
  async update(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descripcion, estado, valores } = req.body;
      
      // Primero actualizamos el formulario
      const formulario = await prisma.formulario.update({
        where: { id: Number(id) },
        data: {
          titulo,
          descripcion,
          estado,
          ...(estado === 'enviado' && { fechaEnvio: new Date() })
        }
      });
      
      // Si hay valores para actualizar
      if (valores && valores.length > 0) {
        // Para cada valor
        for (const valor of valores) {
          // Obtener tipo del campo
          const campo = await prisma.campoFormulario.findUnique({
            where: { id: Number(valor.campoFormularioId) }
          });
          
          const tipo = campo ? campo.tipo : null;
          
          if (valor.id) {
            // Actualizar valor existente
            await prisma.valorCampo.update({
              where: { id: Number(valor.id) },
              data: {
                valorTexto: ['texto', 'textarea', 'select', 'radio', 'checkbox'].includes(tipo) ? valor.valor : null,
                valorNumero: tipo === 'numero' ? parseInt(valor.valor) : null,
                valorDecimal: tipo === 'decimal' ? parseFloat(valor.valor) : null,
                valorFecha: ['fecha', 'fecha_hora', 'hora'].includes(tipo) ? new Date(valor.valor) : null
              }
            });
          } else {
            // Crear nuevo valor
            await prisma.valorCampo.create({
              data: {
                formularioId: Number(id),
                campoFormularioId: Number(valor.campoFormularioId),
                valorTexto: ['texto', 'textarea', 'select', 'radio', 'checkbox'].includes(tipo) ? valor.valor : null,
                valorNumero: tipo === 'numero' ? parseInt(valor.valor) : null,
                valorDecimal: tipo === 'decimal' ? parseFloat(valor.valor) : null,
                valorFecha: ['fecha', 'fecha_hora', 'hora'].includes(tipo) ? new Date(valor.valor) : null
              }
            });
          }
        }
      }
      
      // Obtener el formulario con los valores actualizados
      const formularioActualizado = await prisma.formulario.findUnique({
        where: { id: Number(id) },
        include: {
          valores: {
            include: {
              campoFormulario: true
            }
          }
        }
      });
      
      res.status(200).json({
        message: 'Formulario actualizado exitosamente',
        data: formularioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar formulario:', error);
      res.status(500).json({ 
        message: 'Error al actualizar formulario',
        error: error.message
      });
    }
  },
  
  // Enviar un formulario (completo)
  async enviar(req, res) {
    try {
      const { id } = req.params;
      
      const formulario = await prisma.formulario.update({
        where: { id: Number(id) },
        data: {
          estado: 'enviado',
          fechaEnvio: new Date()
        },
        include: {
          tarea: true
        }
      });
      
      // Si el formulario está asociado a una tarea, actualizamos la tarea
      if (formulario.tareaId) {
        await prisma.tarea.update({
          where: { id: formulario.tareaId },
          data: {
            estado: 'completada',
            fechaCompletada: new Date()
          }
        });
      }
      
      res.status(200).json({
        message: 'Formulario enviado exitosamente',
        data: formulario
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      res.status(500).json({ 
        message: 'Error al enviar formulario',
        error: error.message
      });
    }
  },
  
  // Eliminar un formulario
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.formulario.delete({
        where: { id: Number(id) }
      });
      
      res.status(200).json({
        message: 'Formulario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar formulario:', error);
      res.status(500).json({ 
        message: 'Error al eliminar formulario',
        error: error.message
      });
    }
  }
};

module.exports = formularioController;