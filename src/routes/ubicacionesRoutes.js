<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const ubicacionesController = require('../controllers/ubicacionesControllers');

router.post('/', ubicacionesController.crearUbicacion);
router.get('/', ubicacionesController.obtenerUbicaciones);
router.get('/:id', ubicacionesController.obtenerUbicacionesporId);
router.put('/:id', ubicacionesController.actualizarUbicacion);
router.delete('/:id', ubicacionesController.eliminarUbicaciones);
=======
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
>>>>>>> 6ccab0bf1120c9cdc18c6e371fa74a7222f62dc5

module.exports = router;