const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { COOKIE_SECRET, PORT, JWT_SECRET } = require("./src/config/config");
const session = require("express-session");
const passport = require("passport");
const encuestaRoutes = require("./src/routes/encuestaRoutes");
const usuariosRoutes = require("./src/routes/usuarioRoutes");
const authRoutes = require("./src/routes/authRoutes");
const oauthRoutes = require("./src/routes/oauthRoutes");
const ubicacionesRoutes = require("./src/routes/ubicacionesRoutes");
const rutasRoutes = require("./src/routes/rutasRoutes");
const vehiculosRoutes = require("./src/routes/vehiculosRoutes");
const formularioTipoRoutes = require("./src/routes/formularioTipoRoutes");
const formularioRoutes = require("./src/routes/formularioRoutes");
const tareaRoutes = require("./src/routes/tareaRoutes");
const pqrRoutes = require("./src/routes/pqrsRoutes");
const clienteRoutes = require("./src/routes/clienteRoutes");
const pagosRoutes = require("./src/routes/pagosRoutes");
const residuosRoutes = require("./src/routes/residuoRoutes");
const planPagoRoutes = require("./src/routes/planesRoutes");
const planPagoController = require("./src/controllers/planesController");
const multimediaRoutes = require("./src/routes/multimediaRoutes");
const googleAuthRoutes = require("./src/routes/googleAuthRoutes");
const aauthRoutes = require("./src/routes/aauthRoutes");
const documentoRoutes = require("./src/routes/documentoRoutes");
const incidenciaRoutes = require("./src/routes/incidenciaRoutes");

const logger = require("morgan");

const dotenv = require("dotenv");
const app = express();

app.use(helmet());
app.use(express.json());

dotenv.config();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Limitar peticiones para prevenir ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // 10 intentos
  message:
    "Demasiados intentos de inicio de sesión, por favor intente de nuevo después de 15 minutos",
});

// Rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);
app.use("/api/rutas", rutasRoutes);
app.use("/api/autos", vehiculosRoutes);
app.use("/api/encuestas", encuestaRoutes);
app.use("/api/tareas", tareaRoutes);
app.use("/api/formulariosTipo", formularioTipoRoutes);
app.use("/api/formularios", formularioRoutes);
app.use("/api/pqr", pqrRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/cliente", clienteRoutes);
app.use("/api/multimedia", multimediaRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/residuos", residuosRoutes);
app.use("/api/plan-pagos", planPagoRoutes);
app.use("/api/multimedia", multimediaRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/incidencias", incidenciaRoutes);

planPagoController.iniciarGeneracionAutomatica();

// app.use("/api/google-auth", googleAuthRoutes);
app.use("/api/aauth", aauthRoutes);
// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: "Recurso no encontrado" });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Error en el servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
