const express = require('express');
const router = express.Router();
const encuestaController = require('../controllers/encuestaController');
const EncuestaSchema = require('../schemes/encuestaValidacion')
const  validacionEsquemas = require('../middlewares/validacionMiddleware')


// Rutas básicas CRUD
router.post('/', 
    // validacionEsquemas(EncuestaSchema), 
    encuestaController.create);
router.get('/', encuestaController.findAll);
router.get('/:id', encuestaController.findOne);
router.put('/:id', encuestaController.update);
router.delete('/:id', encuestaController.delete);

// Rutas adicionales
router.post('/:encuestaId/responder', encuestaController.responder);
router.get('/:id/resultados', encuestaController.getResultados);

module.exports = router;