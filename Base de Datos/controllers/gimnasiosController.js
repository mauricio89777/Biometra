const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

exports.crear = async (req, res) => {
  try {
    const gimnasio = await prisma.gimnasio.create({ data: req.body });
    res.status(201).json(gimnasio);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const gimnasios = await prisma.gimnasio.findMany();
  res.json(gimnasios);
});

exports.obtener = ah(async (req, res) => {
  const gimnasio = await prisma.gimnasio.findUnique({ where: { id: Number(req.params.id) } });
  if (!gimnasio) return res.status(404).json({ error: 'No encontrado' });
  res.json(gimnasio);
});

exports.actualizar = async (req, res) => {
  try {
    const gimnasio = await prisma.gimnasio.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(gimnasio);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    await prisma.gimnasio.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};