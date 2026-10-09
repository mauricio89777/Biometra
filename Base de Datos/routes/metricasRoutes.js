const express = require('express');
const router = express.Router();
const controller = require('../controllers/metricasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', controller.listar);
router.post('/', authMiddleware, controller.crear);
router.put('/:id', authMiddleware, controller.actualizar);
router.delete('/:id', authMiddleware, controller.eliminar);

module.exports = router;