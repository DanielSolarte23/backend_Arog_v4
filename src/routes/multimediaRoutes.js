// src/routes/multimediaRoutes.js
const express = require('express');
const router = express.Router();
const multimediaController = require('../controllers/multimediaController');

// Verifica que los controladores estén definidos
// console.log('Controladores disponibles:', Object.keys(multimediaController));

// Rutas para Cloudinary
router.get('/signature', multimediaController.getSignature);

// Ruta para subida directa (esta es la que faltaba)
router.post('/upload', multimediaController.subirArchivo);

// Rutas para la gestión de archivos
router.post('/', multimediaController.guardarMetadatos);
router.get('/', multimediaController.listarArchivos);
router.delete('/:id', multimediaController.eliminarArchivo);

module.exports = router;