const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { createAccesToken } = require("../libs/jwt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config.js");
const { sendVerificationEmail } = require("./emailController.js");

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { nombres, apellidos, correoElectronico, contraseña, telefono } =
      req.body;

    const userFound = await prisma.usuario.findUnique({
      where: { correoElectronico },
    });

    if (userFound) {
      return res.status(400).json(["El correo ya está en uso"]);
    }

    const passwordHash = await bcrypt.hash(contraseña, 10);

    const userSaved = await prisma.usuario.create({
      data: {
        nombres,
        apellidos,
        correoElectronico,
        contraseña: passwordHash,
        telefono,
        verified: false,
      },
    });

    await sendVerificationEmail(userSaved, req.headers.host);

    const token = await createAccesToken({
      id: userSaved.id,
      verified: false,
    });

    res.cookie("token", token);

    res.json({
      id: userSaved.id,
      nombres: userSaved.nombres,
      correoElectronico: userSaved.correoElectronico,
      verified: userSaved.verified,
      message:
        "Se ha enviado un correo de verificación a tu dirección de correoElectronico",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { correoElectronico, contraseña } = req.body;
    const userFound = await prisma.usuario.findUnique({
      where: { correoElectronico },
    });

    if (!userFound) {
      return res.status(400).json(["Usuario no encontrado"]);
    }

    const isMatch = await bcrypt.compare(contraseña, userFound.contraseña);
    if (!isMatch) return res.status(400).json(["Contraseña incorrecta"]);

    if (!userFound.verified) {
      return res
        .status(400)
        .json([
          "Por favor verifica tu correo electrónico antes de iniciar sesión",
        ]);
    }

    const token = await createAccesToken({
      id: userFound.id,
      verified: userFound.verified,
    });

    res.cookie("token", token);
    res.json({
      id: userFound.id,
      nombres: userFound.nombres,
      correoElectronico: userFound.correoElectronico,
      verified: userFound.verified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
    });

    if (req.logout) {
      req.logout();
    }

    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

const profile = async (req, res) => {
  try {
    const userFound = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
    });

    if (!userFound) {
      return res.status(400).json({ mensaje: "Usuario no encontrado" });
    }

    return res.json({
      id: userFound.id,
      nombres: userFound.nombres,
      correoElectronico: userFound.correoElectronico,
      // createdAt: userFound.createdAt,
      // updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "No autorizado" });

  jwt.verify(token, JWT_SECRET, async (err, usuario) => {
    if (err) return res.status(401).json({ message: "No autorizado" });

    try {
      const userFound = await prisma.usuario.findUnique({
        where: { id: usuario.id },
      });

      if (!userFound) return res.status(401).json({ message: "No autorizado" });

      return res.json({
        id: userFound.id,
        nombres: userFound.nombres,
        correoElectronico: userFound.correoElectronico,
        verified: userFound.verified,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  profile,
  verifyToken,
};