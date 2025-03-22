const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const PqrsSchema = require ('../schemes/clienteValidacion')
const validacionEsquemas = require ('../middlewares/validacionMiddleware')


// Rutas CRUD para Cliente
router.post('/',  validacionEsquemas(PqrsSchema),clienteController.createCliente);
router.get('/', clienteController.getClientes);
router.get('/:id', clienteController.getClienteById);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;
