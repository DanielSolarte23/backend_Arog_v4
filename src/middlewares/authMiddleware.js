const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_REFRESH_SECRET, GOOGLE_CLIENT_ID } = require("../config/config");
const prisma = require("../models/prisma");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware para verificar autenticación (JWT o Google OAuth)
const verifyToken = async (req, res, next) => {
  const token =
    req.cookies.token || req.headers["x-access-token"] || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No se proporcionó token de autenticación" });
  }

  try {
    let decoded;
    
    if (token.includes(".")) {
      // Si el token tiene formato JWT, verificarlo localmente
      decoded = jwt.verify(token, JWT_SECRET);
    } else {
      // Si es un ID Token de Google, verificarlo con Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });

      decoded = ticket.getPayload();
      decoded.id = decoded.sub; // El ID de usuario en Google
    }

    // Verificar si el usuario existe en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { correoElectronico: decoded.email },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        correoElectronico: true,
        rol: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado en el sistema" });
    }


    req.user = user;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware para verificar roles
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tiene permisos para esta acción" });
    }

    next();
  };
};

// Middleware para renovar token usando refresh token
const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: "No se proporcionó refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crear nuevo token de acceso
    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hora
    });

    req.user = { id: user.id, rol: user.rol };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido o expirado" });
  }
};

// Nueva ruta para verificar autenticación
const createVerifyEndpoint = (router) => {
  router.get("/verify", verifyToken, (req, res) => {
    return res.json(req.user);
  });
};

module.exports = {
  verifyToken,
  checkRole,
  refreshToken,
  createVerifyEndpoint,
};
