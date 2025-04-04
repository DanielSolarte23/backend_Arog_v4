// documentoRoutes.js
const express = require('express');
const { 
  crearDocumentoPdf, 
  obtenerDocumentoPorId, 
  obtenerDocumentosPorTipoYReferencia,
  actualizarDocumento,
  eliminarDocumento,
  upload
} = require('../controllers/documentoController');

const router = express.Router();

// Rutas para documentos PDF
router.post('/', upload.single('archivo'), crearDocumentoPdf);
router.get('/:id', obtenerDocumentoPorId);
router.get('/', obtenerDocumentosPorTipoYReferencia);
router.put('/:id', actualizarDocumento);
router.delete('/:id', eliminarDocumento);

module.exports = router;