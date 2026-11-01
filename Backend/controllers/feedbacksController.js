const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

exports.crear = async (req, res) => {
  try {
    const feedback = await prisma.feedback.create({ data: req.body });
    res.status(201).json(feedback);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const { analisis_id } = req.query;
  const feedbacks = await prisma.feedback.findMany({
    where: { ...(analisis_id && { analisis_id: Number(analisis_id) }) }
  });
  res.json(feedbacks);
});

exports.actualizar = async (req, res) => {
  try {
    const feedback = await prisma.feedback.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(feedback);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    await prisma.feedback.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};