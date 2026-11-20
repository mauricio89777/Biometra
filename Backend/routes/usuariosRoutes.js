
const express = require('express');
const router = express.Router();

const controller = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadPerfil = require('../middlewares/uploadPerfil');

const verificarPermisoFotos = (req, res, next) => {
  const id = Number(req.params.id);
  const esAdmin = req.usuario?.rol?.toUpperCase() === 'ADMIN';
  const esPropietario = Number(req.usuario?.id) === id;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  if (!esAdmin && !esPropietario) {
    return res.status(403).json({
      error: 'No tienes permisos para modificar estas imágenes'
    });
  }

  next();
};

router.post('/', authMiddleware, controller.crear);
router.get('/', authMiddleware, controller.listar);
router.get('/:id', authMiddleware, controller.obtener);
router.put('/:id', authMiddleware, controller.actualizar);

// Subida de foto de perfil y portada
router.post(
  '/:id/fotos',
  authMiddleware,
  verificarPermisoFotos,
  (req, res, next) => {
    uploadPerfil.fields([
      { name: 'foto_perfil', maxCount: 1 },
      { name: 'foto_portada', maxCount: 1 }
    ])(req, res, (error) => {
      if (error) {
        const estado = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(estado).json({ error: error.message });
      }
      next();
    });
  },
  controller.subirFotos
);

router.delete('/:id', authMiddleware, controller.eliminar);

module.exports = router;
