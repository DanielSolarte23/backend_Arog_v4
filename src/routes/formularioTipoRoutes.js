const express = require('express');
const router = express.Router();
const formularioTipoController = require('../controllers/formularioTipoController');


router.post('/', formularioTipoController.create);
router.get('/', formularioTipoController.getFormulariosTipo);
router.get('/:id', formularioTipoController.getFormulariosTipoById);
router.put('/:id', formularioTipoController.update);
router.delete('/:id', formularioTipoController.delete);


module.exports = router;