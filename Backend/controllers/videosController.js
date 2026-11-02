const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');
const { spawn } = require('child_process'); // lo usaremos para python
const path = require('path');

//para los informes
const fs = require('fs');

//se instalo multer para recibir archivos multipart/form data


// Obtener la ruta del entorno virtual de Python según el sistema operativo
const obtenerPythonPath = () => {
  const rutaVenv = path.join(__dirname, '../../analisis/venv');

  const ejecutable = process.platform === 'win32'
    ? path.join(rutaVenv, 'Scripts', 'python.exe')
    : path.join(rutaVenv, 'bin', 'python');

  if (!fs.existsSync(ejecutable)) {
    throw new Error(
      `No se encontró Python en: ${ejecutable}. Verifica que hayas creado el entorno virtual.`
    );
  }

  return ejecutable;
};

// Ruta del script principal de análisis
const scriptPath = path.resolve(__dirname, '../../analisis/main.py');


//endpoint para listar ejereccion de python
exports.listarEjercicios = (req, res) => {
  let pythonPath;

  try {
    pythonPath = obtenerPythonPath();
  } catch (error) {
    return res.status(500).json({
      estado: 'error',
      error: error.message
    });
  }

  const proceso = spawn(pythonPath, [scriptPath, '--listar']);

  let salida = '';
  let errores = '';

  // Recibir respuesta de Python
  proceso.stdout.on('data', (data) => {
    salida += data.toString();
  });

  // Recibir errores de Python
  proceso.stderr.on('data', (data) => {
    errores += data.toString();
  });

  // Error al intentar iniciar Python
  proceso.on('error', (error) => {
    console.error('[PYTHON] No se pudo iniciar:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        estado: 'error',
        error: 'No se pudo iniciar Python'
      });
    }
  });

  // Cuando termina el proceso
  proceso.on('close', (codigo) => {
    if (codigo !== 0) {
      return res.status(500).json({
        estado: 'error',
        error: errores || 'No se pudo obtener la lista de ejercicios'
      });
    }

    try {
      const resultado = JSON.parse(salida);
      return res.json(resultado);
    } catch (error) {
      return res.status(500).json({
        estado: 'error',
        error: 'Python no devolvió un JSON válido al listar',
        salida
      });
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

  // 2. Obtener el ejercicio seleccionado
  const { exercise } = req.body;

  if (!exercise) {
    return res.status(400).json({
      estado: 'error',
      error: 'Falta especificar el parámetro "exercise"'
    });
  }

  // 3. Obtener rutas e identificador
  const videoPath = req.file.path;
  const jobId = `job_${Date.now()}`;

  const scriptPath = path.resolve(
    __dirname,
    '../../analisis/main.py'
  );

  // 4. Obtener Python según el sistema operativo
  let pythonPath;

  try {
    pythonPath = obtenerPythonPath();
  } catch (error) {
    return res.status(500).json({
      estado: 'error',
      error: error.message
    });
  }

  console.log('[UPLOAD] Video recibido en:', videoPath);
  console.log(`[PYTHON] Ejecutando análisis para el ejercicio: ${exercise}`);

  // 5. Ejecutar análisis
  const args = [
    scriptPath,
    videoPath,
    '--exercise',
    exercise,
    '--job-id',
    jobId,
    '--informe'
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

  proceso.on('error', (error) => {
    console.error('[PYTHON ERROR]', error);

    if (!res.headersSent) {
      return res.status(500).json({
        estado: 'error',
        error: 'No se pudo iniciar el proceso de Python'
      });
    }
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