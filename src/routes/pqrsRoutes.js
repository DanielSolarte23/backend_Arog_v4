const express = require('express');
const router = express.Router();
const pqrsController = require('../controllers/pqrscontrollers');

router.post('/', pqrsController.crearPqrs);
router.get('/', pqrsController.mostrarPqrs);
router.get('/:id', pqrsController.mostrarPqrsPorId);
router.put('/:id', pqrsController.actualizarPqrs);
router.delete('/:id', pqrsController.eliminarPqrs);


module.exports = router;