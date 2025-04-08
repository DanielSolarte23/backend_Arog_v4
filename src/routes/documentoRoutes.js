// documentoRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  crearDocumentoPdf,
  obtenerDocumentoPorId,
  obtenerDocumentosPorTipoYReferencia,
  actualizarDocumento,
  eliminarDocumento,
  // upload,
} = require("../controllers/documentoController");

const router = express.Router();

// Asegúrate de que exista el directorio para los archivos temporales
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para evitar colisiones
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// Configurar Multer con el nombre de campo correcto 'file'
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo PDFs
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
});

// Rutas para documentos PDF
router.post("/", upload.single("file"), crearDocumentoPdf);
// router.post("/", upload.single("archivo"), crearDocumentoPdf);
router.get("/:id", obtenerDocumentoPorId);
router.get("/", obtenerDocumentosPorTipoYReferencia);
router.put("/:id", actualizarDocumento);
router.delete("/:id", eliminarDocumento);

module.exports = router;
