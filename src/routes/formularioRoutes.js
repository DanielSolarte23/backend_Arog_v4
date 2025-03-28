const express = require('express');
const router = express.Router();
const formularioController = require('../controllers/formularioController');


router.post('/', formularioController.create);
router.get('/',  formularioController.getFormularios);
router.get('/:id', formularioController.getFormulariosById);
router.put('/:id', formularioController.update);
router.delete('/:id', formularioController.delete);


module.exports = router;