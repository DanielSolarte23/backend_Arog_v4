const express = require('express');
const router = express.Router();
const ubicacionesController = require('../controllers/ubicacionesControllers');

router.post('/', ubicacionesController.crearUbicacion);
router.get('/', ubicacionesController.obtenerUbicaciones);
router.get('/:id', ubicacionesController.obtenerUbicacionesporId);
router.put('/:id', ubicacionesController.actualizarUbicacion);
router.delete('/:id', ubicacionesController.eliminarUbicaciones);

module.exports = router;