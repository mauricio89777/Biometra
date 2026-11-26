const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');
const { spawn } = require('child_process'); // lo usaremos para python
const path = require('path');

//para los informes
const fs = require('fs');
//multer multidata
// Obtener la ruta del entorno virtual de Python según el entorno, window,linux,docker
const obtenerPythonPath = () => {
  const rutaVenv = path.join(__dirname, '../../analisis/venv');

  // 1. Docker: utiliza la ruta configurada en docker-compose.yml
  // 2. Windows: utiliza Scripts/python.exe
  // 3. Linux local: utiliza bin/python
  const rutasPosibles = [
    process.env.PYTHON_BIN,
    process.platform === 'win32'
      ? path.join(rutaVenv, 'Scripts', 'python.exe')
      : path.join(rutaVenv, 'bin', 'python')
  ].filter(Boolean);

  const ejecutable = rutasPosibles.find(ruta =>
    fs.existsSync(ruta)
  );

  if (!ejecutable) {
    throw new Error(
      `No se encontró Python. Rutas comprobadas: ${rutasPosibles.join(', ')}`
    );
  }

  console.log(`[PYTHON] Ejecutable seleccionado: ${ejecutable}`);

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
  const usuarioId = Number(req.usuario?.id);

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  const videos = await prisma.video.findMany({
    where: {
      usuario_id: usuarioId
    },
    include: {
      ejercicio: true
    },
    orderBy: {
      fecha_carga: 'desc'
    }
  });

  return res.json(videos);
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




exports.analizar = async (req, res) => {
  // 1. Comprobar que Multer recibió el video
  if (!req.file) {
    return res.status(400).json({
      estado: 'error',
      error: 'No se recibió ningún video'
    });
  }

  // 2. Obtener los datos enviados por el frontend
  const { exercise, registro_ejercicio_id } = req.body;

  if (!exercise) {
    return res.status(400).json({
      estado: 'error',
      error: 'Falta especificar el ejercicio'
    });
  }

  const usuarioId = Number(req.usuario?.id);
  const registroId = Number(registro_ejercicio_id);

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(401).json({
      estado: 'error',
      error: 'Usuario no autenticado'
    });
  }

  if (!Number.isInteger(registroId) || registroId <= 0) {
    return res.status(400).json({
      estado: 'error',
      error: 'El registro de ejercicio es inválido'
    });
  }

  try {
    // 3. Buscar el ejercicio del catálogo mediante su script_key
    const ejercicioDb = await prisma.ejercicio.findUnique({
      where: { script_key: exercise }
    });

    if (!ejercicioDb) {
      return res.status(404).json({
        estado: 'error',
        error: 'No se encontró el ejercicio seleccionado'
      });
    }

    // 4. Buscar el registro de entrenamiento
    const registro = await prisma.registroEjercicio.findUnique({
      where: { id: registroId },
      include: {
        sesion: {
          select: { usuario_id: true }
        },
        ejercicio: {
          select: { id: true }
        }
      }
    });

    if (!registro) {
      return res.status(404).json({
        estado: 'error',
        error: 'No se encontró el registro de entrenamiento'
      });
    }

    // 5. Verificar que el registro pertenece al usuario autenticado
    if (registro.sesion.usuario_id !== usuarioId) {
      return res.status(403).json({
        estado: 'error',
        error: 'No tienes permiso para analizar este registro'
      });
    }

    // 6. Verificar que el ejercicio del video coincide con el registrado
    if (registro.ejercicio_id !== ejercicioDb.id) {
      return res.status(400).json({
        estado: 'error',
        error: 'El ejercicio seleccionado no coincide con el registro de entrenamiento'
      });
    }

    // 7. Preparar la ejecución de Python
    const videoPath = req.file.path;
    const jobId = `job_${Date.now()}`;

    let pythonPath;

    try {
      pythonPath = obtenerPythonPath();
    } catch (error) {
      console.error('[PYTHON]', error.message);

      return res.status(500).json({
        estado: 'error',
        error: error.message
      });
    }

    console.log('[UPLOAD] Video recibido:', videoPath);
    console.log('[ANALISIS] Usuario:', usuarioId);
    console.log('[ANALISIS] Registro:', registroId);
    console.log('[ANALISIS] Ejercicio:', exercise);

    // 8. Ejecutar el análisis de Python
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
      const mensaje = data.toString();
      errores += mensaje;
      console.log('[PYTHON DEBUG]', mensaje.trim());
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

    // 9. Procesar el resultado cuando Python termine
    proceso.on('close', async (codigo) => {
      console.log(`[PYTHON] Proceso terminado con código ${codigo}`);

      if (res.headersSent) return;

      if (codigo !== 0) {
        return res.status(500).json({
          estado: 'error',
          error: errores || 'Python terminó con un error'
        });
      }

      try {

        const resultado = JSON.parse(salida);

        const datosAnalisis = resultado.analisis;
        console.log(
        '[METRICAS PYTHON]',
        JSON.stringify(datosAnalisis.metricas, null, 2)
        );        

        if (resultado.estado !== 'completado' || !datosAnalisis) {
          return res.status(500).json({
            estado: 'error',
            error: resultado.error || 'Python no devolvió un análisis válido'
          });
        }

        // 1. Obtener la puntuación global.
        const puntuacionGlobal = Number(
          datosAnalisis.puntuacion?.global
        );

        // 2. Convertir las métricas de Python al formato de Prisma.
        const metricasPython = datosAnalisis.metricas?.por_metrica || {};

        const metricasDB = Object.entries(metricasPython).map(
          ([nombre, metrica]) => {
            const minimo = Number(metrica.min);
            const maximo = Number(metrica.max);

            const valor = (
              Number.isFinite(minimo) &&
              Number.isFinite(maximo)
            )
              ? (minimo + maximo) / 2
              : null;

            return {
              tipo_metrica: nombre.slice(0, 50),
              valor
            };
          }
        );

        // 3. Convertir el feedback.
        const feedbackDB = (datosAnalisis.feedback || []).map((f) => ({
          observacion: (
            `${f.nivel ? `[${f.nivel}] ` : ''}${f.mensaje || ''}`
          ).slice(0, 500),

          recomendacion: f.correccion
            ? String(f.correccion).slice(0, 500)
            : null
        }));

        // 4. Convertir las repeticiones.
        const repeticionesDB = (datosAnalisis.repeticiones || []).map((r) => ({
          numero_rep: r.indice ?? r.numero ?? 0,
          tiempo_inicio: r.inicio_s ?? null,
          tiempo_fin: r.fin_s ?? null,
          calificacion: r.puntuacion ?? null
        }));

        // 5. Guardar video y análisis relacionados.
        const videoGuardado = await prisma.video.create({
          data: {
            usuario_id: usuarioId,
            ejercicio_id: ejercicioDb.id,
            registro_ejercicio_id: registro.id,

            url_archivo: videoPath,
            url_video_procesado: resultado.video_procesado || null,
            url_informe: resultado.informe || null,

            estado: 'PROCESADO',

            analisis: {
              create: {
                puntuacion: Number.isFinite(puntuacionGlobal)
                  ? puntuacionGlobal
                  : null,

                estado: 'COMPLETADO',

                metricas: {
                  create: metricasDB
                },

                feedbacks: {
                  create: feedbackDB
                },

                repeticiones: {
                  create: repeticionesDB
                }
              }
            }
          },

          include: {
            analisis: {
              include: {
                metricas: true,
                feedbacks: true,
                repeticiones: true
              }
            }
          }
        });

        console.log('[DB] Video y análisis guardados:', videoGuardado.id);

        // 6. Responder al frontend.
        return res.json({
          ...resultado,
          video_id: videoGuardado.id,
          registro_ejercicio_id: registro.id,
          datos_guardados: videoGuardado
        });


      } catch (error) {
        console.error('[DB ERROR]', error);

        return res.status(500).json({
          estado: 'error',
          error: 'Ocurrió un error al guardar el análisis en la base de datos',
          detalle: error.message
        });
      }
    });

  } catch (error) {
    console.error('[ANALISIS ERROR]', error);

    return res.status(500).json({
      estado: 'error',
      error: 'No se pudo procesar la solicitud',
      detalle: error.message
    });
  }
};




exports.servirArchivo = async (req, res) => {
  try {
    const videoId = Number(req.params.id);
    const usuarioId = Number(req.usuario?.id);
    const tipo = req.params.tipo;

    if (!Number.isInteger(videoId) || videoId <= 0) {
      return res.status(400).json({
        error: 'ID de video inválido'
      });
    }

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const camposPermitidos = {
      original: 'url_archivo',
      procesado: 'url_video_procesado',
      informe: 'url_informe'
    };

    const campo = camposPermitidos[tipo];

    if (!campo) {
      return res.status(400).json({
        error: 'Tipo de archivo no válido'
      });
    }

    const video = await prisma.video.findUnique({
      where: {
        id: videoId
      },
      select: {
        usuario_id: true,
        url_archivo: true,
        url_video_procesado: true,
        url_informe: true
      }
    });

    if (!video) {
      return res.status(404).json({
        error: 'Video no encontrado'
      });
    }

    if (video.usuario_id !== usuarioId) {
      return res.status(403).json({
        error: 'No tienes permiso para acceder a este archivo'
      });
    }

    const archivo = video[campo];

    if (!archivo || !fs.existsSync(archivo)) {
      return res.status(404).json({
        error: 'Archivo no encontrado en el servidor'
      });
    }

    return res.sendFile(path.resolve(archivo), (error) => {
      if (error && !res.headersSent) {
        console.error('Error al enviar archivo:', error);

        res.status(500).json({
          error: 'No se pudo entregar el archivo'
        });
      }
    });

  } catch (error) {
    console.error('Error al servir archivo:', error);

    return res.status(500).json({
      error: 'Error al acceder al archivo'
    });
  }
};