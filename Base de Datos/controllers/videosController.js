const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

exports.crear = async (req, res) => {
  try {
    const video = await prisma.video.create({ data: req.body });
    res.status(201).json(video);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const { usuario_id } = req.query;
  const videos = await prisma.video.findMany({
    where: { ...(usuario_id && { usuario_id: Number(usuario_id) }) },
    include: { ejercicio: true }
  });
  res.json(videos);
});

exports.obtener = ah(async (req, res) => {
  const video = await prisma.video.findUnique({
    where: { id: Number(req.params.id) },
    include: { ejercicio: true, analisis: true }
  });
  if (!video) return res.status(404).json({ error: 'No encontrado' });
  res.json(video);
});

exports.actualizar = async (req, res) => {
  try {
    const video = await prisma.video.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(video);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    await prisma.video.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};