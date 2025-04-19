const { PrismaClient } = require("@prisma/client");
const { transporter } = require("../config/mailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { createAccesToken } = require("../libs/jwt");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

const sendVerificationEmail = async (usuario, host) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { verificationToken: verificationToken },
    });

    // Determinar el protocolo y URL base basado en entorno
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_URL || `https://${host}`
        : `http://${host}`;

    const verificationLink = `${baseUrl}/api/aauth/verify-email/${verificationToken}`;
    const appUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "https://tu-app.com"
        : "http://localhost:3000";

    const logoUrl =
      "https://res.cloudinary.com/dob9hff6e/image/upload/v1744251421/mi_galeria/cdkv76neaq7gqqvcawdw.png";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: usuario.correoElectronico,
      subject: "¡Bienvenido! Verifica tu correo electrónico",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="Logo" style="max-width: 50px; height: auto;" />
          </div>
          <h2 style="color: #72aa00;">Hola ${usuario.nombres || ""}</h2>
          <p style="color: #181d27;">
            Gracias por registrarte. Para completar tu registro y asegurarnos de que eres tú, por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 20px; background-color: #181d27; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verificar mi correo
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            Si no fuiste tú quien solicitó esta verificación, puedes ignorar este mensaje.
          </p>
          <p style="color: #bbb; font-size: 12px;">
            — El equipo de soporte
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo de verificación enviado a:", usuario.correoElectronico);
  } catch (error) {
    console.error("Error al enviar correo de verificación:", error);
    throw error;
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const usuario = await prisma.usuario.findFirst({
      where: { verificationToken: token },
    });

    if (!usuario) {
      return res
        .status(400)
        .json({ message: "Token de verificación inválido" });
    }

    const appUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "https://tu-app-en-produccion.com"
        : "http://localhost:3000";

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        verified: true,
        verificationToken: null,
      },
    });

    const accessToken = await createAccesToken({
      id: usuario.id,
      verified: true,
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Correo verificado</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f4f8;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
          }
          .card h1 {
            color: #72aa00;
            margin-bottom: 10px;
          }
          .card p {
            color: #555;
            margin-bottom: 30px;
          }
          .btn {
            background-color: #72aa00;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: background-color 0.3s ease;
          }
          .btn:hover {
            background-color: #72aa00;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1> ¡Verificación exitosa!</h1>
          <p>Hola ${
            usuario.nombres || ""
          }, tu correo ha sido verificado correctamente.</p>
          <a class="btn" href="${appUrl}/auth/inicio">Ir al inicio</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { correoElectronico } = req.body;
    const usuario = await prisma.usuario.findFirst({
      where: { correoElectronico: correoElectronico },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(resetPasswordExpires),
      },
    });

    const resetLink = `${process.env.CORS_ORIGIN}/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: usuario.correoElectronico,
      subject: "Restablecimiento de contraseña",
      html: `
        <h1>Restablecimiento de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      message: "Se ha enviado un enlace de restablecimiento a tu correo",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  let token;
  let usuario;

  try {
    token = req.params.token;

    usuario = await prisma.usuario.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date(Date.now()) },
      },
    });

    if (!usuario) {
      return res
        .status(400)
        .json({ message: "Token de restablecimiento inválido o expirado" });
    }

    const { password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        contraseña: passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ message: "Contraseña actualizada exitosamente" });

    console.log("Token recibido:", token);
    console.log("Usuario encontrado:", usuario);
  } catch (error) {
    console.error("Error en resetPassword:", error);
    console.log("Token recibido (en catch):", token);
    console.log("Usuario encontrado (en catch):", usuario);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  sendVerificationEmail,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};
