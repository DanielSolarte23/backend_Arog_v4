import { PrismaClient, CategoriaPqrs, EstadoPqrs } from '@prisma/client';

const prisma = new PrismaClient();


//crear un pqrs
const pqrsController = {
  async crearPqrs(req, res) {
    try {
      const { descripcion, motivo, categoria, idCiudadano, idUsuarioCreador } = req.body;

 //limite de la descripcion 
      if (!descripcion || descripcion.length < 10 || descripcion.length > 500) {
        return res.status(400).json({ error: 'La descripción debe tener entre 10 y 500 caracteres.' });
      }

  
      if (!motivo || motivo.length < 5 || motivo.length > 200) {
        return res.status(400).json({ error: 'El motivo debe tener entre 5 y 200 caracteres.' });
      }

     //si la categoría es válida
      if (!Object.values(CategoriaPqrs).includes(categoria)) {
        return res.status(400).json({ error: 'Categoría inválida. Las opciones válidas son: Reclamo, Peticion, Queja, Sugerencia.' });
      }

     //número válido
      if (!idCiudadano || !Number.isInteger(idCiudadano)) {
        return res.status(400).json({ error: 'El ID del ciudadano es inválido.' });
      }


      if (!idUsuarioCreador || !Number.isInteger(idUsuarioCreador)) {
        return res.status(400).json({ error: 'El ID del usuario creador es inválido.' });
      }

    //si la categoría existe en la base de datos
      const categoriaExistente = await prisma.categoriaPqrs.findUnique({
        where: { nombre: categoria },
      });

      if (!categoriaExistente) {
        return res.status(400).json({ error: 'La categoría proporcionada no existe.' });
      }

      //PQRS en la base de datos
      const nuevoPqrs = await prisma.pqrs.create({
        data: {
          descripcion: descripcion,
          motivo: motivo,
          categoria: categoria, 
          estado: EstadoPqrs.Abierto, 
          idCiudadano: idCiudadano,
          idUsuarioCreador: idUsuarioCreador,
        },
      });

      return res.status(201).json(nuevoPqrs);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocurrió un error al crear el PQRS.' });
    }
  },
  async mostrarPqrs(req, res) {
    try {
      const pqrsList = await prisma.pqrs.findMany({
        include: {
          categoria: true, 
          ciudadano: true,  
          creador: true,    
        }
      });
      return res.json(pqrsList); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los PQRS.' });
    }
  },

  // Mostrar un PQRS por su id
  async mostrarPqrsPorId(req, res) {
    try {
      const { id } = req.params;

      // Buscar el PQRS por su id 
      const pqrs = await prisma.pqrs.findUnique({
        where: { id: parseInt(id) },
        include: {
          categoria: true, 
          ciudadano: true, 
          creador: true,   
        }
      });

      if (!pqrs) {
        return res.status(404).json({ message: 'PQRS no encontrado' });
      }

      return res.json(pqrs); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener el PQRS.' });
    }
  },
  async actualizarPqrs(req, res) {
    try {
      const { id } = req.params;
      const { descripcion, motivo, categoria, estado, seguimiento } = req.body;

      let updateData = {};

      // Validar campos 
      if (descripcion && (descripcion.length < 10 || descripcion.length > 500)) {
        return res.status(400).json({ error: 'La descripción debe tener entre 10 y 500 caracteres.' });
      }
      if (motivo && (motivo.length < 5 || motivo.length > 200)) {
        return res.status(400).json({ error: 'El motivo debe tener entre 5 y 200 caracteres.' });
      }
      
  
      if (categoria && !Object.values(CategoriaPqrs).includes(categoria)) {
        return res.status(400).json({ error: 'Categoría inválida.' });
      }

   
      if (estado && !Object.values(EstadoPqrs).includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido.' });
      }

      if (seguimiento) {
        updateData.seguimiento = seguimiento;
      }

 
      if (descripcion) updateData.descripcion = descripcion;
      if (motivo) updateData.motivo = motivo;
      if (categoria) updateData.categoria = categoria;
      if (estado) updateData.estado = estado;

      const pqrs = await prisma.pqrs.update({
        where: { id: parseInt(id) },
        data: updateData
      });


      res.json(pqrs);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },
  
async eliminarPqrs(req, res) {
    try {
        const { id } = req.params;
       await prisma.pqrs.delete({ where: { id: parseInt(id) }
      });

  res.status(204).send();
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
  }
};
  







export default pqrsController;
