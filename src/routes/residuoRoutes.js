const express = require('express');
const residuoController = require('../controllers/residuoController');

const router = express.Router();

// Rutas de crud residuos
router.get('/', residuoController.findAll);
router.delete('/:id', residuoController.delete);
router.put('/residuos/:id', residuoController.update);
router.post('/residuos', residuoController.create); 

module.exports = router;
