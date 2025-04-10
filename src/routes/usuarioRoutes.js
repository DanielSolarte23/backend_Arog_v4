const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authRequire } = require('../middlewares/validateToken')

router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.mostrarUsuarios);
router.get('/:id', usuarioController.mostrarUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;

