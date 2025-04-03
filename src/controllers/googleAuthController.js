const { PrismaClient } = require("@prisma/client");
const { createAccesToken } = require("../libs/jwt");
const fetch = require('node-fetch');

const prisma = new PrismaClient();

const googleCallback = async (req, usuario) => {
  try {
    let userFound = await prisma.usuario.findUnique({
      where: { correoElectronico: usuario.correoElectronico },
    });

    if (!userFound) {
      userFound = await prisma.usuario.create({
        data: {
          nombres: usuario.nombres,
          correoElectronico: usuario.correoElectronico,
          googleId: usuario.googleId,
        },
      });
    }

    const token = await createAccesToken({ id: userFound.id });

    return {
      token,
      usuario: {
        id: userFound.id,
        nombres: userFound.nombres,
        correoElectronico: userFound.correoElectronico,
        // createdAt: userFound.createdAt,
        // updatedAt: userFound.updatedAt,
      },
    };
  } catch (error) {
    throw error;
  }
};

const googleLogout = async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
    });

    if (req.logout) {
      req.logout();
    }

    const revokeUrl = "https://accounts.google.com/o/oauth2/revoke";
    const token = req.usuario?.accessToken;

    if (token) {
      try {
        await fetch(`${revokeUrl}?token=${token}`);
      } catch (error) {
        console.error("Error revocando token:", error);
      }
    }

    res.redirect(
      `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=${encodeURIComponent(
        "http://localhost:5173"
      )}`
    );
  } catch (error) {
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

module.exports = {
  googleCallback,
  googleLogout,
};