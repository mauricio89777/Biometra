
const express = require('express');
const router = express.Router();

const sesionesController = require('../controllers/sesionesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Consultar sesiones de un usuario
router.get(
  '/usuario/:id',
  authMiddleware,
  sesionesController.listarPorUsuario
);

// Registrar una nueva sesión de entrenamiento
router.post(
  '/',
  authMiddleware,
  sesionesController.crear
);

module.exports = router;
