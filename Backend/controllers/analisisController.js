const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ruta del entorno virtual local
const rutaVenv = path.resolve(__dirname, '../../analisis/venv');

// Seleccionar Python según el entorno
const obtenerPythonPath = () => {
  const rutasPosibles = [
    process.env.PYTHON_BIN,
    process.platform === 'win32'
      ? path.join(rutaVenv, 'Scripts', 'python.exe')
      : path.join(rutaVenv, 'bin', 'python'),
    'python3'
  ].filter(Boolean);

  const ejecutable = rutasPosibles.find(ruta =>
    ruta === 'python3' || fs.existsSync(ruta)
  );

  if (!ejecutable) {
    throw new Error(
      `No se encontró Python. Rutas comprobadas: ${rutasPosibles.join(', ')}`
    );
  }

  return ejecutable;
};

const SCRIPT_PATH = path.resolve(__dirname, '../../analisis/main.py');
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