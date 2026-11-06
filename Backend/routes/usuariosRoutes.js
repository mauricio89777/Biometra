const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', controller.crear);                                // registro (público)
router.get('/', controller.listar);                // protegida
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);         // protegida
router.delete('/:id', controller.eliminar);        // protegida

module.exports = router;


//quitaremos los middleware de
// '/'listar  ,  '/:id'actualizar  ,   '/:id' eliminar


//router.get('/', authMiddleware, controller.listar);                // protegida
//router.get('/:id', controller.obtener); se requiere????
//router.put('/:id', authMiddleware, controller.actualizar);         // protegida
//router.delete('/:id', authMiddleware, controller.eliminar);        // protegida
