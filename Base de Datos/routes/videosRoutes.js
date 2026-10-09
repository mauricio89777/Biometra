
const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const controller = require('../controllers/videosController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/originales'));
  },

  filename: (req, file, cb) => {
    const nombre = `${Date.now()}-${file.originalname}`;
    cb(null, nombre);
  }
});

const upload = multer({ storage });

router.get('/', controller.listar);
router.get('/:id', controller.obtener);

router.post('/analizar', upload.single('video'), controller.analizar);

router.post('/', authMiddleware, controller.crear);
router.put('/:id', authMiddleware, controller.actualizar);
router.delete('/:id', authMiddleware, controller.eliminar);

module.exports = router;
