const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');
const { spawn } = require('child_process'); // lo usaremos para python
const path = require('path');
const { error } = require('console');

//para los informes
const fs = require('fs');

//se instalo multer para recibir archivos multipart/form data

//endpoint para listar ejereccion de python
exports.listarEjercicios = (req, res) => {
  const pythonPath = path.join(__dirname, '../../analisis/venv/bin/python');
  const scriptPath = path.join(__dirname, '../../analisis/main.py');

  const proceso = spawn(pythonPath, [scriptPath, '--listar']);
  let salida = '';
  let errores = '';

  proceso.stdout.on('data', (data) => { salida += data.toString(); });
  proceso.stderr.on('data', (data) => { errores += data.toString(); });

  proceso.on('close', (codigo) => {
    if (codigo !== 0) {
      return res.status(500).json({ estado: 'error', error: errores || 'No se pudo obtener la lista de ejercicios' });
    }
    try {
      const resultado = JSON.parse(salida);
      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ estado: 'error', error: 'Python no devolvió un JSON válido al listar', salida });
    }
  });
};


// NUEVO: Endpoint para transmitir o servir el video procesado por Python
exports.streamVideo = (req, res) => {
  const videoPath = req.query.path;

  if (!videoPath || !fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video procesado no encontrado en el servidor' });
  }

  // Enviar el archivo de video al cliente
  res.sendFile(path.resolve(videoPath));
};



//se instalo multer para recibir archivos multipart/form data
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





exports.analizar = (req, res) => {
  // 1. Validar que Multer recibió el video
  if (!req.file) {
    return res.status(400).json({
      estado: 'error',
      error: 'No se recibió ningún video'
    });
  }

  // 2. Obtener la clave del ejercicio que envió React (ej: "press_militar", "sentadilla", etc.)
  const { exercise } = req.body;
  if (!exercise) {
    return res.status(400).json({
      estado: 'error',
      error: 'Falta especificar el parámetro "exercise"'
    });
  }

  // Ruta del video subido temporalmente por Multer
  const videoPath = req.file.path;
  const jobId = `job_${Date.now()}`;

  const pythonPath = path.join(
    __dirname,
    '../../analisis/venv/bin/python'
  );

  const scriptPath = path.join(
    __dirname,
    '../../analisis/main.py'
  );

  console.log('[UPLOAD] Video recibido en:', videoPath);
  console.log(`[PYTHON] Ejecutando análisis para el ejercicio: ${exercise}`);

  // 3. Pasamos únicamente el video y el ejercicio seleccionado a Python
  // (Python se encargará internamente de usar su carpeta output y sus rutas)
  const args = [
    scriptPath,
    videoPath,
    '--exercise',
    exercise,
    '--job-id',
    jobId,
    '--informe' // Si genera el informe html/salida en output
  ];

  const proceso = spawn(pythonPath, args);

  let salida = '';
  let errores = '';

  proceso.stdout.on('data', (data) => {
    salida += data.toString();
  });

  proceso.stderr.on('data', (data) => {
    errores += data.toString();
    console.log('[PYTHON DEBUG]', data.toString().trim());
  });

  proceso.on('close', (codigo) => {
    console.log(`[PYTHON] Proceso terminado con código ${codigo}`);

    if (codigo !== 0) {
      return res.status(500).json({
        estado: 'error',
        error: errores || 'Python terminó con un error'
      });
    }

    try {
      // Python imprime SOLO un JSON final por stdout
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