const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const multimedia ={
    async crearMultimedia(req,res){
        try {
            const {url, tamanoArchivo}= req.body
            const nuevoArchivo = await prisma.multimedia.create({
                data: {
                    url, 
                    tamanoArchivo
                },
            });
            return res.status(201).json(nuevoArchivo);
        } catch (error) {
            console.log(error);
            return res.status(500).json({error:'error al guardar la multimedia '})
            
        }
        
    },
     // Obtener todos los archivos multimedia
  async obtenerMultimedia(req, res) {
    try {
      const archivos = await prisma.multimedia.findMany();
      return res.json(archivos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener los archivos multimedia.' });
    }
  },

  // Obtener un archivo multimedia por ID
  async obtenerMultimediaPorId(req, res) {
    try {
      const { id } = req.params;
      const archivo = await prisma.multimedia.findUnique({
        where: { id: Number(id) },
      });

      if (!archivo) {
        return res.status(404).json({ error: 'Archivo multimedia no encontrado.' });
      }

      return res.json(archivo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener el archivo multimedia.' });
    }
  },

  // Actualizar un archivo multimedia
  async actualizarMultimedia(req, res) {
    try {
      const { id } = req.params;
      const { url, tamanoArchivo } = req.body;

      const archivoExistente = await prisma.multimedia.findUnique({ where: { id: Number(id) } });
      if (!archivoExistente) {
        return res.status(404).json({ error: 'Archivo multimedia no encontrado.' });
      }

      const archivoActualizado = await prisma.multimedia.update({
        where: { id: Number(id) },
        data: { url, tamanoArchivo },
      });

      return res.json(archivoActualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar el archivo multimedia.' });
    }
  },

  // Eliminar un archivo multimedia
  async eliminarMultimedia(req, res) {
    try {
      const { id } = req.params;
      await prisma.multimedia.delete({ where: { id: Number(id) } });
      return res.json({ mensaje: 'Archivo multimedia eliminado correctamente.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar el archivo multimedia.' });
    }
  },
};

module.exports = multimedia;
