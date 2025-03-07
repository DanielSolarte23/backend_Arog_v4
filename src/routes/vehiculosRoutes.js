const express = require('express');
const router = express.Router();
const vehiculosController = require('../controllers/vehiculosController');

// Rutas CRUD para Vehículos
router.get('/', vehiculosController.obtenerVehiculos);
router.get('/:id', vehiculosController.obtenerVehiculoPorId);
router.post('/', vehiculosController.crearVehiculo);
router.put('/:id', vehiculosController.actualizarVehiculo);
router.delete('/:id', vehiculosController.eliminarVehiculo);

module.exports = router;
