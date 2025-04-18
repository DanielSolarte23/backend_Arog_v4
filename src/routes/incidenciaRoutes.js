const express = require('express');
const incidenciaController = require('../controllers/incidenciaController');
const { verifyToken, } = require('../middlewares/authMiddleware');

const router = express.Router();


router.get('/', incidenciaController.getAllIncidencias);
router.get('/:id', incidenciaController.getIncidenciaById);

router.post('/',  incidenciaController.createIncidencia);
router.put('/:id',  incidenciaController.updateIncidencia);
router.delete('/:id',  incidenciaController.deleteIncidencia);

// Rutas para manejar el estado de las incidencias
router.patch('/:id/status',  incidenciaController.updateIncidenciaEstado);

// Rutas para obtener incidencias por criterios específicos
router.get('/usuario/:usuarioId',  incidenciaController.getIncidenciasByUsuario);
router.get('/estado/:estado', incidenciaController.getIncidenciasByEstado);

module.exports = router;