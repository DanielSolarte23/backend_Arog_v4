const express = require('express');
const router = express.Router();
const incidenciaController = require('../controllers/incidenciasController');


// Rutas 
router.post('/', incidenciaController.crearIncidencia);
router.get('/', incidenciaController.obtenerIncidencias);
router.get('/:id', incidenciaController.obtenerIncidencia);
router.put('/:id', incidenciaController.actualizarIncidencia);
router.delete('/:id', incidenciaController.eliminarIncidencia);

module.exports = router;

