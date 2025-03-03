const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma');
const { JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION } = require('../config/config');

// Manejar login con Auth0
const handleAuth0Login = async (req, res) => {
  try {
    console.log("Verificando autenticación con Auth0...");

    if (!req.oidc || !req.oidc.isAuthenticated()) {
      console.log("Usuario no autenticado en Auth0.");
      return res.status(401).json({
        success: false,
        message: 'No autenticado con Auth0'
      });
    }

    console.log("Usuario autenticado con Auth0:", req.oidc.user);

    const userInfo = req.oidc.user;

    if (!userInfo || !userInfo.email) {
      console.log("No se pudo obtener el email del usuario.");
      return res.status(400).json({
        success: false,
        message: 'Error al obtener información del usuario'
      });
    }

    // Verificar si el usuario ya existe en nuestra base de datos
    console.log("Buscando usuario en la base de datos:", userInfo.email);
    let usuario = await prisma.usuario.findFirst({
      where: { correoElectronico: userInfo.email }
    });
    console.log("Resultado de la búsqueda:", usuario);


    // Si no existe, lo creamos
    if (!usuario) {
      // Generar una contraseña aleatoria segura para usuarios de OAuth
      const randomPassword = Math.random().toString(36).slice(-10) +
        Math.random().toString(36).toUpperCase().slice(-2) +
        Math.random().toString(36).slice(-2) +
        '@1';

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      // Extraer nombres y apellidos del perfil de Auth0
      const fullName = userInfo.name || '';
      const nameParts = fullName.split(' ');
      const nombres = userInfo.given_name || nameParts[0] || 'Usuario';
      const apellidos = userInfo.family_name ||
        (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Google');

      // Crear el usuario en nuestra base de datos
      usuario = await prisma.usuario.create({
        data: {
          nombres,
          apellidos,
          correoElectronico: userInfo.email,
          contraseña: hashedPassword,
          telefono: null,
          rol: 'ciudadano',
          estado: 'activo',
        }
      });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION }
    );

    // Establecer cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 día
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    // Eliminar contraseña de la respuesta
    const { contraseña, ...userWithoutPassword } = usuario;

    // Decidir si redirigir o devolver JSON según el tipo de solicitud
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      // Si es una solicitud de navegador, redirigir a la página principal
      return res.redirect('/dashboard');
    } else {
      // Si es una solicitud API, devolver JSON
      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión con Google exitoso',
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error('Error en Auth0 login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación con Google',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleAuth0Login
};