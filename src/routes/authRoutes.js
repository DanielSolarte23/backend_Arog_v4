const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middlewares/validationMiddleware');
const { verifyToken, refreshToken } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/registro', validateRegistration, authController.registro);
router.post('/inicio', validateLogin, authController.inicio);
router.post('/refresh-token', refreshToken, (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Token renovado exitosamente' 
  });
});

// Rutas protegidas
router.get('/me', verifyToken, authController.mostrarUsuarioActual);
router.post('/cerrarSesion', verifyToken, authController.cerrarSesion);
router.post('/cambioPassword', verifyToken, authController.cambiarContraseña);

module.exports = router;