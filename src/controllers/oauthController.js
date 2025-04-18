const { PrismaClient } = require("@prisma/client");
const { createAccesToken } = require("../libs/jwt");
const fetch = require('node-fetch');
const prisma = new PrismaClient();

const googleCallback = async (req, usuario) => {
  try {
    console.log("Procesando autenticación para:", usuario.correoElectronico);
    
    let userFound = await prisma.usuario.findUnique({
      where: { correoElectronico: usuario.correoElectronico },
    });

    if (!userFound) {
      console.log("Usuario nuevo, creando registro");
      
      // Separamos el nombre completo para obtener nombres y apellidos
      let nombres = usuario.nombres || "Usuario";
      let apellidos = "";
      
      // Si el nombre tiene formato "Nombres Apellidos", intentamos separarlo
      if (usuario.nombres && usuario.nombres.includes(" ")) {
        const nombreCompleto = usuario.nombres.split(" ");
        if (nombreCompleto.length > 1) {
          nombres = nombreCompleto[0];
          apellidos = nombreCompleto.slice(1).join(" ");
        }
      }
      
      userFound = await prisma.usuario.create({
        data: {
          nombres: nombres,
          apellidos: apellidos,
          correoElectronico: usuario.correoElectronico,
          googleId: usuario.googleId,
          telefono: "", // Campo requerido según tu esquema
          contraseña: Math.random().toString(36).slice(-10),
          rol: "ciudadano",
          verified: true,
          estado: "activo"
        },
      });
      console.log("Usuario creado con ID:", userFound.id);
    } else if (!userFound.googleId) {
      // Si el usuario existe pero no tiene googleId, lo actualizamos
      console.log("Usuario existente, actualizando googleId y verificación");
      await prisma.usuario.update({
        where: { id: userFound.id },
        data: {
          googleId: usuario.googleId,
          verified: true,
          estado: "activo"
        }
      });
    }
    
    const token = await createAccesToken({ id: userFound.id });
    return {
      token,
      usuario: {
        id: userFound.id,
        nombres: userFound.nombres,
        apellidos: userFound.apellidos, // Añadimos apellidos a la respuesta
        correoElectronico: userFound.correoElectronico,
        rol: userFound.rol || "ciudadano"
      },
    };
  } catch (error) {
    console.error("Error en autenticación Google:", error);
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
        "http://localhost:3000/secure/administrador"
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