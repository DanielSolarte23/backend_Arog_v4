const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const formularioTipoController = {
  // Crear un nuevo tipo de formulario
  async create(req, res) {
    try {
      const { nombre, descripcion, campos, creadorId } = req.body;
      
      const formularioTipo = await prisma.formularioTipo.create({
        data: {
          nombre,
          descripcion,
          creadorId,
          campos: {
            create: campos.map((campo, index) => ({
              nombre: campo.nombre,
              descripcion: campo.descripcion,
              tipo: campo.tipo,
              requerido: campo.requerido || false,
              orden: index + 1,
              opciones: campo.opciones ? JSON.stringify(campo.opciones) : null
            }))
          }
        },
        include: {
          campos: true
        }
      });
      
      res.status(201).json({
        message: 'Tipo de formulario creado exitosamente',
        data: formularioTipo
      });
    } catch (error) {
      console.error('Error al crear tipo de formulario:', error);
      res.status(500).json({ 
        message: 'Error al crear tipo de formulario',
        error: error.message
      });
    }
  },
  
  // Obtener todos los tipos de formulario
  async getFormulariosTipo(req, res) {
    try {
      const formularioTipos = await prisma.formularioTipo.findMany({
        include: {
          campos: {
            orderBy: {
              orden: 'asc'
            }
          }
        }
      });
      
      res.status(200).json(formularioTipos);
    } catch (error) {
      console.error('Error al obtener tipos de formulario:', error);
      res.status(500).json({ 
        message: 'Error al obtener tipos de formulario',
        error: error.message
      });
    }
  },
  
  // Obtener un tipo de formulario por ID
  async getFormulariosTipoById(req, res) {
    try {
      const { id } = req.params;
      const formularioTipo = await prisma.formularioTipo.findUnique({
        where: { id: Number(id) },
        include: {
          campos: {
            orderBy: { orden: 'asc' }
          }
        }
      });
      
      if (!formularioTipo) {
        return res.status(404).json({ message: 'Tipo de formulario no encontrado' });
      }
      
      res.status(200).json(formularioTipo);
    } catch (error) {
      console.error('Error al obtener tipo de formulario:', error);
      res.status(500).json({ 
        message: 'Error al obtener tipo de formulario',
        error: error.message
      });
    }
  },
  
  // Actualizar un tipo de formulario
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;
      
      const formularioTipo = await prisma.formularioTipo.update({
        where: { id: Number(id) },
        data: {
          nombre,
          descripcion,
          activo
        }
      });
      
      res.status(200).json({
        message: 'Tipo de formulario actualizado exitosamente',
        data: formularioTipo
      });
    } catch (error) {
      console.error('Error al actualizar tipo de formulario:', error);
      res.status(500).json({ 
        message: 'Error al actualizar tipo de formulario',
        error: error.message
      });
    }
  },
  
  // Eliminar un tipo de formulario
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.formularioTipo.delete({
        where: { id: Number(id) }
      });
      
      res.status(200).json({
        message: 'Tipo de formulario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar tipo de formulario:', error);
      res.status(500).json({ 
        message: 'Error al eliminar tipo de formulario',
        error: error.message
      });
    }
  }
};

module.exports = formularioTipoController;