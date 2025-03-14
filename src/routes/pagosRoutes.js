const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');


router.post('/', pagosController.crearpago);
router.get('/', pagosController.obtenerPagos);
router.get('/:id', pagosController.obtenerPagoPorId);
router.put('/:id', pagosController.actualizarPago);
router.delete('/:id', pagosController.eliminarPago);

module.exports = router;