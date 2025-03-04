// routes/ubicacionesRoutes.js
const express = require('express');
const router = express.Router();
const ubicacionesController = require('../controllers/ubicacionesController');

// Rutas para ubicaciones
router.get('/', ubicacionesController.getAllUbicaciones);
router.get('/:id', ubicacionesController.getUbicacionById);
router.post('/', ubicacionesController.createUbicacion);
router.put('/:id', ubicacionesController.updateUbicacion);
router.delete('/:id', ubicacionesController.deleteUbicacion);

module.exports = router;