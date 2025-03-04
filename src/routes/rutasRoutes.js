const express = require('express');
const router = express.Router();
const rutasController = require('../controllers/rutasController');

router.get('/', rutasController.getAllRutas);
router.get('/:id', rutasController.getRutaById);
router.post('/', rutasController.createRuta);
router.put('/:id', rutasController.updateRuta);
router.delete('/:id', rutasController.deleteRuta);
router.post('/asignar-vehiculo', rutasController.asignarVehiculo);
router.delete('/eliminar-asignacion/:id', rutasController.eliminarAsignacionVehiculo);

module.exports = router;

