// dotenv SIEMPRE primero, antes de cualquier otro require
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const prisma = require('./utils/prisma');

// Sin JWT_SECRET no se pueden firmar ni verificar tokens: mejor fallar de inmediato
if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba rápida
app.get('/', (req, res) => {
  res.json({ mensaje: 'API OpenGYM funcionando' });
});

// ============================================
// RUTAS
// ============================================
app.use('/', require('./routes/authRoutes'));            // POST /login
app.use('/usuarios', require('./routes/usuariosRoutes'));
app.use('/ejercicios', require('./routes/ejerciciosRoutes'));
app.use('/videos', require('./routes/videosRoutes'));
app.use('/analisis', require('./routes/analisisRoutes'));
app.use('/metricas', require('./routes/metricasRoutes'));
app.use('/feedbacks', require('./routes/feedbacksRoutes'));
app.use('/gimnasios', require('./routes/gimnasiosRoutes'));

// ============================================
// 404 y MANEJADOR GLOBAL DE ERRORES
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ============================================
// ARRANQUE
// ============================================
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, (err) => {
  if (err) return;
  console.log(`Servidor OpenGYM corriendo en http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra el otro servidor (Stop-Process -Name node -Force) e intenta de nuevo.`);
  } else {
    console.error('No se pudo iniciar el servidor:', err.message);
  }
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});