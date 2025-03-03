const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma');
const createAccesToken = require("../libs/jwt");
const { JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION } = require('../config/config');

// Registrar un nuevo usuario
const registro = async (req, res) => {
  try {
    const { nombres, apellidos, correoElectronico, contraseña, telefono } = req.body;

    // Verificar si el correo ya está registrado
    const existingUser = await prisma.usuario.findFirst({
      where: { correoElectronico }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este correo electrónico ya está registrado'
      });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // Crear el usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombres,
        apellidos,
        correoElectronico,
        contraseña: hashedPassword,
        telefono,
        rol: 'ciudadano',
        estado: 'activo'
      }
    });

    const token = await createAccesToken({
      id: newUser.id, rol: newUser.rol
    });
    // Crear tokens JWT
    // const token = jwt.sign(
    //   { id: newUser.id, rol: newUser.rol },
    //   JWT_SECRET,
    //   { expiresIn: JWT_EXPIRATION }
    // );

    // const refreshToken = jwt.sign(
    //   { id: newUser.id },
    //   JWT_REFRESH_SECRET,
    //   { expiresIn: JWT_REFRESH_EXPIRATION }
    // );

    // Establecer cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 día
    });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    // });

    // Respuesta exitosa sin exponer la contraseña
    const { contraseña: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Iniciar sesión
const inicio = async (req, res) => {
  try {
    const { correoElectronico, contraseña } = req.body;

    // Buscar usuario por correo
    const user = await prisma.usuario.findFirst({
      where: { correoElectronico }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar estado del usuario
    if (user.estado === 'inactivo') {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta está inactiva. Contacta al administrador'
      });
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Crear tokens JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
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

    // Respuesta exitosa sin exponer la contraseña
    const { contraseña: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener datos del usuario actual
const mostrarUsuarioActual = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        correoElectronico: true,
        telefono: true,
        rol: true,
        direccion: true,
        barrio: true,
        estado: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cerrar sesión
const cerrarSesion = (req, res) => {
  // Limpiar cookies
  res.clearCookie('token');
  res.clearCookie('refreshToken');

  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
};

// Cambiar contraseña
const cambiarContraseña = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contraseñaActual, nuevaContraseña } = req.body;

    // Validar nueva contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    if (!passwordRegex.test(nuevaContraseña)) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (@#$%^&+=!)'
      });
    }

    // Buscar usuario
    const user = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(contraseñaActual, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContraseña, salt);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: userId },
      data: { contraseña: hashedPassword }
    });

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: 'No autorizado' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'No autorizado' });

    const userId = decoded.id;

    if (!userId) return res.status(401).json({ message: 'No autorizado' });

    try {
      const userFound = await prisma.usuario.findUnique({
        where: { id: userId }
      });

      if (!userFound) return res.status(401).json({ message: 'No autorizado' });

      return res.json({
        id: userFound.id,
        nombres: userFound.nombres,
        correoElectronico: userFound.correoElectronico,
        verified: userFound.verified
      });
    } catch (error) {
      console.error('Error al buscar el usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  });
};


module.exports = {
  registro,
  inicio,
  mostrarUsuarioActual,
  cerrarSesion,
  cambiarContraseña,
  verifyToken
};




