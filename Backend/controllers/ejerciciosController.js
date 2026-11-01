const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

exports.crear = async (req, res) => {
  try {
    const ejercicio = await prisma.ejercicio.create({ data: req.body });
    res.status(201).json(ejercicio);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const { grupo_muscular, tipo } = req.query;
  const ejercicios = await prisma.ejercicio.findMany({
    where: {
      ...(grupo_muscular && { grupo_muscular }),
      ...(tipo && { tipo })
    }
  });
  res.json(ejercicios);
});

exports.obtener = ah(async (req, res) => {
  const ejercicio = await prisma.ejercicio.findUnique({ where: { id: Number(req.params.id) } });
  if (!ejercicio) return res.status(404).json({ error: 'No encontrado' });
  res.json(ejercicio);
});

exports.actualizar = async (req, res) => {
  try {
    const ejercicio = await prisma.ejercicio.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(ejercicio);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    await prisma.ejercicio.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};