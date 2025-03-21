const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');


router.post('/', tareaController.create);
router.post('/tareas-con-formulario', tareaController.crearTareaConFormulario);
router.get('/', tareaController.getAll);
router.get('/:id', tareaController.getById);
router.get('/usuario/:usuarioId', tareaController.getByUsuario);
router.get('/archivada/archivadas', tareaController.getArchivadas);
router.put('/:id', tareaController.update);
router.patch('/:id/estado', tareaController.updateEstado);
router.delete('/:id', tareaController.delete);


module.exports = router;