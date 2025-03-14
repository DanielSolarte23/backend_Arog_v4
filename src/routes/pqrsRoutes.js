const express = require('express');
const router = express.Router();
const pqrsController = require('../controllers/pqrscontrollers');
const PqrsSchema = require ('../schemes/pqrsValidacion')
const validacionEsquemas = require ('../middlewares/validacionMiddleware')


router.post('/', validacionEsquemas(PqrsSchema), pqrsController.crearPqrs);
router.get('/', pqrsController.mostrarPqrs);
router.get('/:id', pqrsController.mostrarPqrsPorId);
router.put('/:id', validacionEsquemas(PqrsSchema), pqrsController.actualizarPqrs); // ← Agregar validación en PUT
router.delete('/:id', pqrsController.eliminarPqrs);

module.exports = router;
