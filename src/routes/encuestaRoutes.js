const express = require('express');
const router = express.Router();
const encuestaController = require('../controllers/encuestaController');

// Rutas básicas CRUD
router.post('/', encuestaController.create);
router.get('/', encuestaController.findAll);
router.get('/:id', encuestaController.findOne);
router.put('/:id', encuestaController.update);
router.delete('/:id', encuestaController.delete);

// Rutas adicionales
router.post('/:encuestaId/responder', encuestaController.responder);
router.get('/:id/resultados', encuestaController.getResultados);

module.exports = router;