const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Crear un transportador más compatible con servicios en producción
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // gmail, hotmail, etc.
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false
  }
});

module.exports = { transporter };