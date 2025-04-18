
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const os = require('os');
const { PDFDocument } = require('pdf-lib');

const prisma = new PrismaClient();

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


const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};


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

    // Validaciones adicionales según tipo
    let referenciaIdParsed = null;
    let codigoReferencia = null;

    if (tipoDocumento === 'CERTIFICADO') {
      // Para certificados, validamos el referenciaId (DNI)
      if (!referenciaId || isNaN(parseInt(referenciaId))) {
        return res.status(400).json({ error: 'Referencia ID no válida para certificado (debe ser numérico)' });
      }
      referenciaIdParsed = parseInt(referenciaId);

    } else if (tipoDocumento === 'INFORME') {
      // Para informes, generamos un código automático
      const año = new Date().getFullYear();
      const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');

      // Buscar el último informe para incrementar el contador
      const ultimoInforme = await prisma.documentoPdf.findFirst({
        where: {
          tipoDocumento: 'INFORME',
          codigoReferencia: {
            startsWith: `INF-${año}${mes}`
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Obtener el último número secuencial y aumentarlo en 1
      let numeroSecuencial = 1;
      if (ultimoInforme && ultimoInforme.codigoReferencia) {
        // Extraer el número al final del código (último componente después del último guion)
        const ultimoNumero = ultimoInforme.codigoReferencia.split('-').pop();
        if (ultimoNumero && !isNaN(parseInt(ultimoNumero))) {
          numeroSecuencial = parseInt(ultimoNumero) + 1;
        }
      }

      // Formatear con ceros a la izquierda (001, 002, etc.)
      codigoReferencia = `INF-${año}${mes}-${subtipoCertificado.substring(0, 3)}-${numeroSecuencial.toString().padStart(3, '0')}`;
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
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true
    });

    // Eliminar archivo temporal después de subirlo
    fs.unlinkSync(req.file.path);

    let secureUrl = result.secure_url;
    if (!secureUrl.toLowerCase().endsWith('.pdf')) {
      secureUrl = secureUrl + '.pdf';
    }

    // Crear registro en la base de datos
    const nuevoPdf = await prisma.documentoPdf.create({
      data: {
        url: secureUrl,
        nombreArchivo: req.file.originalname,
        tamanoArchivo: parseFloat((req.file.size / 1024).toFixed(2)),
        tipoArchivo: req.file.mimetype,
        paginas: numPages,
        tipoDocumento: tipoDocumento,
        subtipoCertificado: subtipoCertificado || null,
        referenciaId: tipoDocumento === 'CERTIFICADO' ? referenciaIdParsed : null,
        codigoReferencia: tipoDocumento === 'INFORME' ? codigoReferencia : null
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

    // Verificar si se solicita la descarga
    const { download } = req.query;

    if (download === 'true') {
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombreArchivo}"`);

      // Redireccionar a la URL del documento en Cloudinary
      return res.redirect(documento.url);
    } else {
      // Configurar headers para visualización en el navegador
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${documento.nombreArchivo}"`);

      // Redireccionar a la URL del documento en Cloudinary
      return res.redirect(documento.url);
    }
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

const obtenerInformes = async (req, res) => {
  try {
    const informes = await prisma.documentoPdf.findMany({
      where: {
        tipoDocumento: 'informe'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(informes);
  } catch (error) {
    console.error('Error al obtener informes:', error);
    res.status(500).json({ error: 'Error al obtener los informes' });
  }
};


const obtenerCertificados = async (req, res) => {
  try {
    const certificados = await prisma.documentoPdf.findMany({
      where: {
        tipoDocumento: 'CERTIFICADO'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(certificados);
  } catch (error) {
    console.error('Error al obtener certificados:', error);
    res.status(500).json({ error: 'Error al obtener los certificados' });
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
  crearDocumentoPdf,
  obtenerDocumentoPorId,
  obtenerDocumentosPorTipoYReferencia,
  actualizarDocumento,
  eliminarDocumento,
  obtenerInformes,
  obtenerCertificados
};