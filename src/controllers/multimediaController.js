// src/controllers/multimediaController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Si estás usando Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de almacenamiento local temporal (para multer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Método para obtener firma para subida directa (Cloudinary)
exports.getSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: 'mi_galeria',
    }, process.env.CLOUDINARY_API_SECRET);
    
    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Error al generar firma:', error);
    res.status(500).json({ error: 'Error al generar firma para subida' });
  }
};

// Método para subir archivo usando multer y cloudinary
exports.subirArchivo = (req, res) => {
  // Usamos multer como middleware en la ruta
  const uploadMiddleware = upload.single('file');

  uploadMiddleware(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: 'Error al subir el archivo', details: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      // Ruta al archivo subido temporalmente
      const filePath = req.file.path;
      
      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'mi_galeria',
        resource_type: 'auto'
      });

      // Eliminar el archivo temporal
      fs.unlinkSync(filePath);

      // Obtener información del archivo
      const fileInfo = {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes / 1024, // Convertir a KB
        originalName: req.file.originalname
      };

      // Guardar en la base de datos
      const multimedia = await prisma.multimedia.create({
        data: {
          url: fileInfo.url,
          nombreArchivo: fileInfo.originalName,
          tamanoArchivo: fileInfo.size,
          tipoArchivo: req.file.mimetype,
          ancho: fileInfo.width || null,
          alto: fileInfo.height || null,
        }
      });

      res.status(201).json({
        mensaje: 'Archivo subido exitosamente',
        archivo: multimedia
      });

    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      res.status(500).json({ error: 'Error al procesar el archivo', details: error.message });
    }
  });
};

// Método para guardar metadatos después de subida
exports.guardarMetadatos = async (req, res) => {
  try {
    const { url, nombreArchivo, tamanoArchivo, tipoArchivo, ancho, alto } = req.body;
    
    console.log('Datos recibidos:', req.body);
    
    const multimedia = await prisma.multimedia.create({
      data: {
        url,
        nombreArchivo,
        tamanoArchivo: Number(tamanoArchivo), // Asegúrate de que sea numérico para Decimal
        tipoArchivo,
        ancho: ancho ? parseInt(ancho) : null,
        alto: alto ? parseInt(alto) : null,
      }
    });
    
    res.status(201).json(multimedia);
  } catch (error) {
    console.error('Error al guardar metadatos:', error);
    res.status(500).json({ error: 'Error al guardar los metadatos del archivo', details: error.message });
  }
};

// Método para listar archivos
exports.listarArchivos = async (req, res) => {
  try {
    const archivos = await prisma.multimedia.findMany({
      orderBy: {
        fechaSubida: 'desc'
      }
    });
    
    res.json(archivos);
  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({ error: 'Error al obtener la lista de archivos' });
  }
};

// Método para eliminar un archivo
exports.eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero obtener la información del archivo
    const archivo = await prisma.multimedia.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!archivo) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Si estás usando Cloudinary, eliminar también de allí
    if (archivo.url.includes('cloudinary')) {
      // Extraer el public_id de la URL
      const urlParts = archivo.url.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const folderPath = urlParts[urlParts.length - 2];
      const publicId = `${folderPath}/${publicIdWithExtension.split('.')[0]}`;
      
      // Eliminar de Cloudinary
      await cloudinary.uploader.destroy(publicId);
    }
    
    // Eliminar de la base de datos
    await prisma.multimedia.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ mensaje: 'Archivo eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo', details: error.message });
  }
};