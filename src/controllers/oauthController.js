const prisma = require('../models/prisma');
const createAccesToken = require('../libs/jwt.js')


const googleCallback = async (req, user) => {
  try {
    // Buscar si el usuario ya existe por email
    let userFound = await prisma.usuario.findUnique({
      where: {
        correoElectronico: user.email
      }
    });

    if (!userFound) {
      // Si no existe, crear nuevo usuario
      // Dividimos el nombre completo en nombres y apellidos
      const nameParts = user.name.split(' ');
      const nombres = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
      const apellidos = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

      userFound = await prisma.usuario.create({
        data: {
          nombres: nombres || user.name, // Por si no se puede dividir correctamente
          apellidos: apellidos || '',
          correoElectronico: user.email,
          contraseña: '', // Al ser autenticación por Google, no necesitamos contraseña
          rol: 'ciudadano', // Rol por defecto
          estado: 'activo',
          // No se almacena googleId en el nuevo modelo, pero podrías extenderlo si es necesario
        }
      });
    }

    // En tu función que maneja OAuth
    const payload = { id: userFound.id, rol: userFound.rol };

    // Crear token
    const token = await createAccesToken(payload);

    return {
      token,
      user: {
        id: userFound.id,
        nombres: userFound.nombres,
        apellidos: userFound.apellidos,
        correoElectronico: userFound.correoElectronico,
        rol: userFound.rol,
        // No incluimos la contraseña por seguridad
      }
    };
  } catch (error) {
    throw error;
  }
};

// En googleAuth.controller.js
const googleLogout = async (req, res) => {
  try {
    // Limpiar la cookie del token
    res.cookie('token', "", {
      expires: new Date(0)
    });

    // Limpiar la sesión de passport
    if (req.logout) {
      req.logout();
    }

    // Primero revocar el acceso local
    const revokeUrl = 'https://accounts.google.com/o/oauth2/revoke';
    const token = req.user?.accessToken; // asegúrate de guardar el accessToken durante la autenticación

    if (token) {
      try {
        await fetch(`${revokeUrl}?token=${token}`);
      } catch (error) {
        console.error('Error revocando token:', error);
      }
    }

    // Redirigir a Google logout y luego volver a tu aplicación
    res.redirect(`https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=${encodeURIComponent('http://localhost:5173')}`);

  } catch (error) {
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

module.exports = { googleCallback, googleLogout }