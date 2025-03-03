const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/config');
const prisma = require('../models/prisma');

// Middleware para verificar autenticación (JWT o Auth0)
const verifyToken = (req, res, next) => {
  // Verificar si el usuario está autenticado con Auth0
  if (req.oidc && req.oidc.isAuthenticated()) {
    // Obtener información del usuario de Auth0
    const auth0User = req.oidc.user;
    
    // Buscar el usuario en nuestra base de datos por correo electrónico
    prisma.usuario.findFirst({
      where: { correoElectronico: auth0User.email }
    })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'Usuario autenticado con Auth0 no encontrado en el sistema' });
      }
      
      // Establecer la información del usuario para mantener consistencia con JWT
      req.user = {
        id: user.id,
        rol: user.rol
      };
      next();
    })
    .catch(error => {
      console.error('Error al buscar usuario de Auth0:', error);
      return res.status(500).json({ message: 'Error en autenticación Auth0' });
    });
    
    return;
  }
  
  // Si no está autenticado con Auth0, verificar JWT como antes
  const token = req.cookies.token || req.headers['x-access-token'];
  
  if (!token) {
    return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado', 
        expired: true 
      });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar roles (mantiene la misma funcionalidad)
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const hasRole = roles.includes(req.user.rol);
    if (!hasRole) {
      return res.status(403).json({ message: 'No tiene permisos para esta acción' });
    }
    
    next();
  };
};

// Middleware para renovar token usando refresh token
// Nota: Este middleware solo funciona para autenticación JWT normal
const refreshToken = async (req, res, next) => {
  // Si el usuario ya está autenticado con Auth0, simplemente continuar
  if (req.oidc && req.oidc.isAuthenticated()) {
    return next();
  }

  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(403).json({ message: 'No se proporcionó refresh token' });
  }

  try {
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Verificar usuario en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear nuevo token de acceso
    const token = jwt.sign(
      { id: user.id, rol: user.rol }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Establecer nuevo token en cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hora
    });

    req.user = { id: user.id, rol: user.rol };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token inválido o expirado' });
  }
};

module.exports = {
  verifyToken,
  checkRole,
  refreshToken
};