const express = require('express');
const router = express.Router();
const ejerciciosController = require('../controllers/ejerciciosController');
const authMiddleware = require('../middlewares/authMiddleware');

//Rutas para ejerciciosRoutes.js
router.post('/sincronizar', ejerciciosController.sincronizarEjerciciosPython);
router.get('/admin/listar', ejerciciosController.listarEjerciciosAdmin);
router.put('/admin/:id', ejerciciosController.actualizarEjercicioAdmin);



router.get('/', async (req, res)=>{
    try {
        const prisma = require('../utils/prisma');
        const ejerciciosActivos = await prisma.ejercicio.findMany({
            where: { activo: true }
        });
        res.json(ejerciciosActivos);
    } catch (error){
        res.status(500).json({ error: 'Error al obtener ejercicios'});
    }
});


module.exports = router;