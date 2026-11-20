
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ejerciciosController = require('../controllers/ejerciciosController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const prisma = require('../utils/prisma');

// Carpeta independiente para videos demostrativos
const carpetaVideos = path.join(__dirname, '../uploads/ejercicios');

fs.mkdirSync(carpetaVideos, { recursive: true });

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaVideos);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombre = `ejercicio-${req.params.id}-${Date.now()}${extension}`;

    cb(null, nombre);
  }
});

// Tipos de video permitidos
const extensionesPermitidas = [
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
  '.avi'
];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !file.mimetype.startsWith('video/') ||
    !extensionesPermitidas.includes(extension)
  ) {
    return cb(new Error('Formato de video no permitido'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

// Middleware para responder los errores de Multer en JSON
const recibirVideo = (req, res, next) => {
  upload.single('video')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'El video supera el límite permitido de 100 MB'
        });
      }

      return res.status(400).json({
        error: 'Error al recibir el archivo',
        detalle: error.message
      });
    }

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    next();
  });
};

// --------------------------------------
// RUTAS ADMINISTRATIVAS
// --------------------------------------

// Sincronizar ejercicios desde Python
router.post(
  '/sincronizar',
  authMiddleware,
  adminMiddleware,
  ejerciciosController.sincronizarEjerciciosPython
);

// Listar ejercicios activos e inactivos
router.get(
  '/admin/listar',
  authMiddleware,
  adminMiddleware,
  ejerciciosController.listarEjerciciosAdmin
);

// Actualizar datos o visibilidad de un ejercicio
router.put(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  ejerciciosController.actualizarEjercicioAdmin
);

// Subir y asociar video demostrativo
router.post(
  '/admin/:id/video-ayuda',
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          error: 'ID de ejercicio inválido'
        });
      }

      const ejercicio = await prisma.ejercicio.findUnique({
        where: { id }
      });

      if (!ejercicio) {
        return res.status(404).json({
          error: 'El ejercicio no existe'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  recibirVideo,
  ejerciciosController.subirVideoAyuda
);

router.delete(
  '/admin/:id/video-ayuda',
  authMiddleware,
  adminMiddleware,
  ejerciciosController.eliminarVideoAyuda
);


// --------------------------------------
// RUTA PÚBLICA
// --------------------------------------

router.get('/', async (req, res) => {
  try {
    const ejerciciosActivos = await prisma.ejercicio.findMany({
      where: { activo: true }
    });

    res.json(ejerciciosActivos);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);

    res.status(500).json({
      error: 'Error al obtener ejercicios'
    });
  }
});

module.exports = router;
