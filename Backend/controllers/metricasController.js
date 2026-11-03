const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

exports.crear = async (req, res) => {
  try {
    const metrica = await prisma.metrica.create({ data: req.body });
    res.status(201).json(metrica);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const { analisis_id } = req.query;
  const metricas = await prisma.metrica.findMany({
    where: { ...(analisis_id && { analisis_id: Number(analisis_id) }) }
  });
  res.json(metricas);
});

exports.actualizar = async (req, res) => {
  try {
    const metrica = await prisma.metrica.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(metrica);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    await prisma.metrica.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};