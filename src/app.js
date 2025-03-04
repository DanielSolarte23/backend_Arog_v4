const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { COOKIE_SECRET, PORT, JWT_SECRET } = require('./config/config');
const session = require('express-session');
const passport = require('passport');
const encuestaRoutes = require('./routes/encuestaRoutes');
const usuariosRoutes = require('./routes/usuarioRoutes')
const authRoutes = require('./routes/authRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const ubicacionesRoutes = require('./routes/ubicacionesRoutes');
const rutasRoutes = require('./routes/rutasRoutes')
const vehiculosRoutes = require('./routes/vehiculosRoutes')
const logger = require('morgan');


const dotenv = require('dotenv')
const app = express();

app.use(helmet());
app.use(express.json());

dotenv.config()
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

app.use(session({
  secret: process.env.JWT_SECRET || 'your_secret_key', // Usa una variable de entorno
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Limitar peticiones para prevenir ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos
  message: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo después de 15 minutos'
});

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/autos', vehiculosRoutes)
app.use('/api/encuestas', encuestaRoutes);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});