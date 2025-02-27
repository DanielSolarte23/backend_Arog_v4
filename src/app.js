const express = require('express');
const encuestaRoutes = require('./routes/encuestaRoutes');
const usuariosRoutes = require('./routes/usuarioRoutes')
const pqrsRoutes = require('./routes/pqrsRoutes')
const ubicacionesRoutes = require('./routes/ubicacionesRoutes')
const app = express();
const dotenv = require('dotenv')


app.use(express.json());
dotenv.config()

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/encuestas', encuestaRoutes);
app.use('/api/pqrs',pqrsRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
}

);