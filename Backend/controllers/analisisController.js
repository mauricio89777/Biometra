const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

exports.crear = async (req, res) => {
  try {
    const analisis = await prisma.analisis.create({ data: req.body });
    res.status(201).json(analisis);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const { video_id } = req.query;
  const analisis = await prisma.analisis.findMany({
    where: { ...(video_id && { video_id: Number(video_id) }) }
  });
  res.json(analisis);
});

exports.obtener = ah(async (req, res) => {
  const analisis = await prisma.analisis.findUnique({
    where: { id: Number(req.params.id) },
    include: { metricas: true, feedbacks: true }
  });
  if (!analisis) return res.status(404).json({ error: 'No encontrado' });
  res.json(analisis);
});

exports.actualizar = async (req, res) => {
  try {
    const analisis = await prisma.analisis.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(analisis);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    await prisma.analisis.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};