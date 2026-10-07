const express = require('express');
const router = express.Router();
const controller = require('../controllers/videosController');
const authMiddleware = require('../middlewares/authMiddleware');


//Ruta de analisis de python
router.post('/analizar',
    authMiddleware,
    controller.analizar
);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', authMiddleware, controller.crear);


router.put('/:id', authMiddleware, controller.actualizar);
router.delete('/:id', authMiddleware, controller.eliminar);

module.exports = router;