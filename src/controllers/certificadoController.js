// const prisma = require("../models/prisma"); // o donde tengas tu instancia
// const { subirPdfACloudinary } = require("../services/cloudinary");

// const crearCertificado = async (req, res) => {
//   try {
//     const {
//       nombreParticipante,
//       documento,
//       fechaParticipacion,
//       nombreActividad,
//       lugar,
//       organizacion,
//       textoCertificado,
//       nombreFirma,
//       cargoFirma,
//       fechaEmision,
//       codigoCertificado,
//       usuarioId
//     } = req.body;

//     const archivoPdf = req.file; // si usas multer
//     if (!archivoPdf) return res.status(400).json({ error: "No se envió ningún PDF" });

//     // 1. Subir a Cloudinary
//     const resultado = await subirPdfACloudinary(archivoPdf.path);

//     // 2. Crear DocumentoPdf
//     const documentoPdf = await prisma.documentoPdf.create({
//       data: {
//         url: resultado.secure_url,
//         nombreArchivo: archivoPdf.originalname,
//         tamanoArchivo: parseFloat((archivoPdf.size / 1024 / 1024).toFixed(2)), // MB
//         tipoArchivo: archivoPdf.mimetype,
//         paginas: null, // opcional: podrías usar una lib para contarlas
//         tipoDocumento: "certificado",
//         referenciaId: null // lo asignaremos abajo
//       }
//     });

//     // 3. Crear Certificado y asociar PDF
//     const certificado = await prisma.certificados.create({
//       data: {
//         nombreParticipante,
//         documento,
//         fechaParticipacion: new Date(fechaParticipacion),
//         nombreActividad,
//         lugar,
//         organizacion,
//         textoCertificado,
//         nombreFirma,
//         cargoFirma,
//         fechaEmision: new Date(fechaEmision),
//         codigoCertificado,
//         usuarioId: usuarioId ? parseInt(usuarioId) : null,
//         documentoPdfId: documentoPdf.id
//       }
//     });

//     // 4. Actualizar referenciaId del documento
//     await prisma.documentoPdf.update({
//       where: { id: documentoPdf.id },
//       data: { referenciaId: certificado.id }
//     });

//     res.status(201).json({ certificado });

//   } catch (error) {
//     console.error("Error al crear certificado:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

// module.exports = { crearCertificado };
