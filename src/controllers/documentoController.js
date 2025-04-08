
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const os = require('os');
const { PDFDocument } = require('pdf-lib');

const prisma = new PrismaClient();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de almacenamiento temporal para procesar el archivo antes de subirlo a Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Filtro para aceptar solo archivos PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

// const upload = multer({ 
//   storage, 
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
// });

const getNumPages = async (filePath) => {
  try {
    // Leer el archivo PDF
    const dataBuffer = fs.readFileSync(filePath);
    
    // Usar pdf-parse para extraer información
    const data = await pdfParse(dataBuffer);
    
    // pdf-parse proporciona el total de páginas en data.numpages
    return data.numpages;
  } catch (error) {
    console.error('Error al obtener número de páginas:', error);
    return 1; // Valor predeterminado en caso de error
  }
};

// Crear documento PDF
const crearDocumentoPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }
    
    const { tipoDocumento, referenciaId, subtipoCertificado } = req.body;
    
    // Validar tipo de documento
    const tiposDocumentoValidos = ['CERTIFICADO', 'INFORME'];
    if (!tiposDocumentoValidos.includes(tipoDocumento)) {
      return res.status(400).json({ error: 'Tipo de documento no válido' });
    }
    
    // Validar subtipo según el tipo de documento
    if (tipoDocumento === 'CERTIFICADO') {
      const subtiposValidos = ['LABORAL', 'PARTICIPACION', 'CONOCIMIENTO'];
      if (!subtipoCertificado || !subtiposValidos.includes(subtipoCertificado)) {
        return res.status(400).json({ error: 'Subtipo de certificado no válido o no proporcionado' });
      }
    } else if (tipoDocumento === 'INFORME') {
      const subtiposValidos = ['TECNICO', 'GESTION', 'EVALUACION'];
      if (!subtipoCertificado || !subtiposValidos.includes(subtipoCertificado)) {
        return res.status(400).json({ error: 'Subtipo de informe no válido o no proporcionado' });
      }
    }
    
    // Validar referenciaId
    if (!referenciaId) {
      return res.status(400).json({ error: 'Referencias ID es obligatorio' });
    }
    
    // Para informes, aceptamos referenciaId como string (código de informe)
    let referenciaIdParsed;
    if (tipoDocumento === 'CERTIFICADO') {
      // Para certificados seguimos esperando un número (DNI)
      if (isNaN(parseInt(referenciaId))) {
        return res.status(400).json({ error: 'Referencia ID no válida para certificado (debe ser numérico)' });
      }
      referenciaIdParsed = parseInt(referenciaId);
    } else {
      // Para informes, usamos el código como está
      referenciaIdParsed = referenciaId.toString();
    }
    
    // Obtener número de páginas del PDF
    const numPages = await getNumPages(req.file.path);
    
    // Crear carpeta en Cloudinary según el tipo y subtipo de documento
    let folder = `documentos/${tipoDocumento.toLowerCase()}`;
    if (subtipoCertificado) {
      folder += `/${subtipoCertificado.toLowerCase()}`;
    }
    
    // Subir archivo a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true
    });
    
    // Eliminar archivo temporal después de subirlo
    fs.unlinkSync(req.file.path);
    
    // Crear registro en la base de datos
    const nuevoPdf = await prisma.documentoPdf.create({
      data: {
        url: result.secure_url,
        nombreArchivo: req.file.originalname,
        tamanoArchivo: parseFloat((req.file.size / 1024).toFixed(2)), // Convertir a KB
        tipoArchivo: req.file.mimetype,
        paginas: numPages,
        tipoDocumento: tipoDocumento,
        subtipoCertificado: subtipoCertificado || null,
        referenciaId: tipoDocumento === 'CERTIFICADO' ? referenciaIdParsed : null,
        codigoReferencia: tipoDocumento === 'INFORME' ? referenciaIdParsed : null
      }
    });
    
    res.status(201).json(nuevoPdf);
  } catch (error) {
    // Verificar si es un error de restricción única
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Ya existe un documento con este tipo y referencia'
      });
    }
    
    console.error('Error al crear documento PDF:', error);
    res.status(500).json({ error: 'Error al procesar el documento: ' + error.message });
  }
};


// Obtener un documento por ID
const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await prisma.documentoPdf.findUnique({
      where: { id: parseInt(id) }
    });

    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(documento);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ error: 'Error al obtener el documento' });
  }
};

// Obtener documentos por tipo y/o referencia
const obtenerDocumentosPorTipoYReferencia = async (req, res) => {
  try {
    const { tipoDocumento, referenciaId } = req.query;
    
    let where = {};
    
    if (tipoDocumento) {
      const tiposDocumentoValidos = ['CERTIFICADO', 'INFORME'];
      if (!tiposDocumentoValidos.includes(tipoDocumento)) {
        return res.status(400).json({ error: 'Tipo de documento no válido' });
      }
      where.tipoDocumento = tipoDocumento;
    }
    
    if (referenciaId) {
      where.referenciaId = parseInt(referenciaId);
    }
    
    const documentos = await prisma.documentoPdf.findMany({ where });
    res.json(documentos);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener los documentos' });
  }
};

// Actualizar documento (solo permite cambiar tipo y referencia)
const actualizarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoDocumento, referenciaId } = req.body;
    
    // Validaciones
    if (tipoDocumento) {
      const tiposDocumentoValidos = ['CERTIFICADO', 'INFORME'];
      if (!tiposDocumentoValidos.includes(tipoDocumento)) {
        return res.status(400).json({ error: 'Tipo de documento no válido' });
      }
    }
    
    if (referenciaId && isNaN(parseInt(referenciaId))) {
      return res.status(400).json({ error: 'Referencia ID no válida' });
    }
    
    // Actualizar registro
    const documentoActualizado = await prisma.documentoPdf.update({
      where: { id: parseInt(id) },
      data: {
        tipoDocumento: tipoDocumento,
        referenciaId: referenciaId ? parseInt(referenciaId) : null
      }
    });
    
    res.json(documentoActualizado);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Ya existe un documento con este tipo y referencia' 
      });
    }
    
    console.error('Error al actualizar documento:', error);
    res.status(500).json({ error: 'Error al actualizar el documento' });
  }
};

// Eliminar documento
const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el documento primero para obtener la URL
    const documento = await prisma.documentoPdf.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Extraer el public_id de la URL de Cloudinary
    const urlParts = documento.url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `documentos/${documento.tipoDocumento.toLowerCase()}/${filename.split('.')[0]}`;
    
    // Eliminar el archivo de Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    // Eliminar registro de la base de datos
    await prisma.documentoPdf.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar el documento' });
  }
};

module.exports = {
  // upload,
  crearDocumentoPdf,
  obtenerDocumentoPorId,
  obtenerDocumentosPorTipoYReferencia,
  actualizarDocumento,
  eliminarDocumento
};