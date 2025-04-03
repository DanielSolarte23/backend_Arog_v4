const { PrismaClient } = require("@prisma/client");
const { transporter } = require("../config/mailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { createAccesToken } = require("../libs/jwt");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

const sendVerificationEmail = async (usuario, host) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { verificationToken: verificationToken },
  });

  const verificationLink = `http://${host}/api/aauth/verify-email/${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: usuario.correoElectronico,
    subject: "Verifica tu correo electrónico",
    html: `
      <h1>Verifica tu correo electrónico</h1>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const usuario = await prisma.usuario.findFirst({
      where: { verificationToken: token },
    });

    if (!usuario) {
      return res.status(400).json({ message: "Token de verificación inválido" });
    }

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

    res.json({
      message: "Email verificado exitosamente",
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        correoElectronico: usuario.correoElectronico,
        verified: usuario.verified,
      },
    });
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

    const resetLink = `${process.env.CORS_ORIGIN}/reset-contraseña/${resetToken}`;

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
    res.json({ message: "Se ha enviado un enlace de restablecimiento a tu correo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { contraseña } = req.body;

    const usuario = await prisma.usuario.findFirst({
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

    const passwordHash = await bcrypt.hash(contraseña, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        contraseña: passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};