const express = require('express');
const router = express.Router();
const multimediaController = require('../controllers/multimediaController');


router.post('/', multimediaController.crearMultimedia);
router.get('/', multimediaController.obtenerMultimedia);
router.get('/:id', multimediaController.obtenerMultimediaPorId);
router.put('/:id', multimediaController.actualizarMultimedia);
router.delete('/:id', multimediaController.eliminarMultimedia);

module.exports = router;