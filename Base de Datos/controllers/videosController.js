const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');
const { spawn } = require('child_process'); // lo usaremos para python
const path = require('path');
const { error } = require('console');



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


//conenctando con python
exports.analizar = (req, res) => {
  const pythonPath = path.join(
    __dirname,
    '../../Analisis/venv/bin/python'
  );

  const scriptPath = path.join(
    __dirname,
    '../../Analisis/main.py'
  );

  const videoPath = path.join(
    __dirname,
    '../../Analisis/videos/press_banca.mp4'
  );

  console.log('[PYTHON] Ejecutando análisis...');

  const proceso = spawn(
    pythonPath,
    [scriptPath, videoPath]
  );

  let salida = '';
  let errores = '';

  proceso.stdout.on('data', (data) => {
    salida += data.toString();
  });

  proceso.stderr.on('data', (data) => {
    errores += data.toString();

    console.log(
      '[PYTHON DEBUG]',
      data.toString().trim()
    );
  });

  proceso.on('close', (codigo) => {
    console.log(
      `[PYTHON] Proceso terminado con código ${codigo}`
    );

    if (codigo !== 0) {
      return res.status(500).json({
        estado: 'error',
        error: errores || 'Python terminó con un error'
      });
    }

    try {
      const resultado = JSON.parse(salida);

      return res.json(resultado);

    } catch (error) {
      return res.status(500).json({
        estado: 'error',
        error: 'Python no devolvió un JSON válido',
        salida
      });
    }
  });
};