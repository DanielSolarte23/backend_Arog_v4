const prisma = require('../models/prisma');
const bcrypt = require('bcryptjs');

// Expresiones regulares para validar nombre de usuario y correo electrónico
const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/; // 3-20 caracteres, sin espacios
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de correo válido
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/; // Contraseña segura

const usuarioController = {
  async crearUsuario(req, res) {
    try {
      const { nombres, apellidos, nombreDeUsuario, contraseña, correoElectronico, telefono, rol } = req.body;

      // Validar nombre de usuario
      if (!usernameRegex.test(nombreDeUsuario)) {
        return res.status(400).json({ error: 'El nombre de usuario no es válido. Debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones o guiones bajos.' });
      }

      // Validar correo electrónico
      if (!emailRegex.test(correoElectronico)) {
        return res.status(400).json({ error: 'El correo electrónico no es válido.' });
      }

      // Validar que el nombre de usuario y el correo sean únicos
      const existingUser = await prisma.usuario.findFirst({
        where: {
          OR: [{ nombreDeUsuario }, { correoElectronico }]
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario o el correo electrónico ya están registrados.' });
      }

      // Validar seguridad de la contraseña
      if (!passwordRegex.test(contraseña)) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial (@#$%^&+=!).'
        });
      }

      // Hashear la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(contraseña, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nombres,
          apellidos,
          nombreDeUsuario,
          contraseña: hashedPassword,
          correoElectronico,
          telefono,
          rol
        }
      });

      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener todos los usuarios
  async mostrarUsuarios(req, res) {
    try {
      const usuarios = await prisma.usuario.findMany();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un usuario por id
  async mostrarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar usuario
  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombres, apellidos, nombreDeUsuario, correoElectronico, telefono, rol, contraseña } = req.body;

      let updateData = { nombres, apellidos, nombreDeUsuario, correoElectronico, telefono, rol };

      // Validar si se envía un nuevo nombre de usuario
      if (nombreDeUsuario && !usernameRegex.test(nombreDeUsuario)) {
        return res.status(400).json({ error: 'El nombre de usuario no es válido.' });
      }

      // Validar si se envía un nuevo correo electrónico
      if (correoElectronico && !emailRegex.test(correoElectronico)) {
        return res.status(400).json({ error: 'El correo electrónico no es válido.' });
      }

      // Verificar si el nombre de usuario o el correo ya existen en otro usuario
      if (nombreDeUsuario || correoElectronico) {
        const existingUser = await prisma.usuario.findFirst({
          where: {
            OR: [{ nombreDeUsuario }, { correoElectronico }],
            NOT: { id: parseInt(id) }
          }
        });

        if (existingUser) {
          return res.status(400).json({ error: 'El nombre de usuario o el correo electrónico ya están en uso.' });
        }
      }

      // Si se envía una nueva contraseña, validarla y hashearla
      if (contraseña) {
        if (!passwordRegex.test(contraseña)) {
          return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial (@#$%^&+=!).'
          });
        }
        updateData.contraseña = await bcrypt.hash(contraseña, 10);
      }

      const usuario = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar usuario
  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;
      await prisma.usuario.delete({
        where: { id: parseInt(id) }
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = usuarioController;
