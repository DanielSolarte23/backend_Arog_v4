// const prisma = require("../models/prisma");
// const { subirPdfACloudinary } = require("../services/cloudinary");

// const crearInforme = async (req, res) => {
//   try {
//     const {
//       titulo,
//       descripcion,
//       contenido,
//       autor,
//       tipoInforme,
//       usuarioId
//     } = req.body;

//     const archivoPdf = req.file;

//     if (!archivoPdf) {
//       return res.status(400).json({ error: "No se recibió ningún archivo PDF." });
//     }

//     // Subir el archivo a Cloudinary
//     const resultado = await subirPdfACloudinary(archivoPdf.path);

//     // Crear el registro del informe
//     const informe = await prisma.informe.create({
//       data: {
//         titulo,
//         descripcion,
//         contenido,
//         autor,
//         tipoInforme,
//         usuarioId: usuarioId ? parseInt(usuarioId) : null
//       }
//     });

//     // Crear el registro del documento PDF y asociarlo al informe
//     const documentoPdf = await prisma.documentoPdf.create({
//       data: {
//         url: resultado.secure_url,
//         nombreArchivo: archivoPdf.originalname,
//         tamanoArchivo: parseFloat((archivoPdf.size / 1024 / 1024).toFixed(2)), // en MB
//         tipoArchivo: archivoPdf.mimetype,
//         paginas: null, // Puedes calcular con pdf-parse si quieres
//         tipoDocumento: "informe",
//         referenciaId: informe.id
//       }
//     });

//     return res.status(201).json({
//       mensaje: "Informe creado correctamente",
//       informe,
//       documentoPdf
//     });

//   } catch (error) {
//     console.error("Error al crear el informe:", error);
//     return res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

// module.exports = { crearInforme };
