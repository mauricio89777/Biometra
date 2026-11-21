
const prisma = require('../utils/prisma');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ruta del entorno virtual local
const rutaVenv = path.resolve(__dirname, '../../analisis/venv');

// Obtener ejecutable de Python
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

const scriptPath = path.resolve(__dirname, '../../analisis/main.py');

// Eliminar únicamente archivos de la carpeta de videos demostrativos.
const eliminarArchivoVideoAyuda = async (rutaPublica) => {
  const prefijo = '/uploads/ejercicios/';

  if (!rutaPublica || !rutaPublica.startsWith(prefijo)) {
    return;
  }

  const nombreArchivo = path.basename(rutaPublica);
  const carpeta = path.resolve(__dirname, '../uploads/ejercicios');
  const rutaArchivo = path.resolve(carpeta, nombreArchivo);

  // Evitar que una ruta manipulada permita salir de la carpeta.
  if (!rutaArchivo.startsWith(carpeta + path.sep)) {
    throw new Error('Ruta de archivo no permitida');
  }

  try {
    await fs.promises.unlink(rutaArchivo);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};



exports.sincronizarEjerciciosPython = async (req, res) => {
  try {
    const pythonPath = obtenerPythonPath();
    const proceso = spawn(pythonPath, [scriptPath, '--listar']);

    let salida = '';
    let errorPython = '';

    proceso.stdout.on('data', (data) => {
      salida += data.toString();
    });

    proceso.stderr.on('data', (data) => {
      errorPython += data.toString();
    });

    proceso.on('error', (error) => {
      console.error('Error ejecutando Python:', error);

      if (!res.headersSent) {
        res.status(500).json({
          error: 'No se pudo ejecutar Python'
        });
      }
    });

    proceso.on('close', async (codigo) => {
      if (res.headersSent) return;

      if (codigo !== 0) {
        console.error('Error de Python:', errorPython);

        return res.status(500).json({
          error: 'Error al listar ejercicios en Python'
        });
      }

      try {
        const dataPython = JSON.parse(salida);
        const listaEjercicios = dataPython.ejercicios || [];

        for (const item of listaEjercicios) {
          const scriptKey = item.clave;
          const nombreLegible = item.titulo;

          await prisma.ejercicio.upsert({
            where: { script_key: scriptKey },

            update: {
              nombre: nombreLegible,
              tipo: item.tipo || null,
              descripcion:
                item.advertencias && item.advertencias.length > 0
                  ? `Advertencias: ${item.advertencias.join(' | ')}`
                  : null
            },

            create: {
              script_key: scriptKey,
              nombre: nombreLegible,
              tipo: item.tipo || null,
              descripcion:
                item.advertencias && item.advertencias.length > 0
                  ? `Advertencias: ${item.advertencias.join(' | ')}`
                  : null,
              activo: true
            }
          });
        }

        const ejerciciosBD = await prisma.ejercicio.findMany();

        return res.json({
          estado: 'success',
          total: ejerciciosBD.length,
          ejercicios: ejerciciosBD
        });

      } catch (error) {
        console.error('Error procesando respuesta de Python:', error);

        return res.status(500).json({
          error: 'Error procesando los ejercicios de Python',
          detalle: error.message
        });
      }
    });

  } catch (error) {
    console.error('Error al sincronizar ejercicios:', error);

    return res.status(500).json({
      error: error.message
    });
  }
};

// 2. LISTAR EJERCICIOS PARA ADMIN
exports.listarEjerciciosAdmin = async (req, res) => {
  try {
    const ejercicios = await prisma.ejercicio.findMany();

    res.json(ejercicios);
  } catch (error) {
    console.error('Error al listar ejercicios:', error);

    res.status(500).json({
      error: 'Error al listar ejercicios'
    });
  }
};

// 3. ACTUALIZAR EJERCICIO
exports.actualizarEjercicioAdmin = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de ejercicio inválido'
      });
    }

    const {
      nombre,
      descripcion,
      grupo_muscular,
      activo
    } = req.body;

    const ejercicioActualizado = await prisma.ejercicio.update({
      where: { id },

      data: {
        ...(nombre !== undefined && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(grupo_muscular !== undefined && { grupo_muscular }),
        ...(activo !== undefined && { activo })
      }
    });

    res.json(ejercicioActualizado);

  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'El ejercicio no existe'
      });
    }

    res.status(500).json({
      error: 'Error al actualizar el ejercicio'
    });
  }
};

// 4. SUBIR VIDEO DEMOSTRATIVO
exports.subirVideoAyuda = async (req, res) => {
  let archivoGuardado = null;

  try {
    const id = Number(req.params.id);

    if (!req.file) {
      return res.status(400).json({
        error: 'Debes seleccionar un video'
      });
    }

    archivoGuardado = req.file.path;

    const rutaPublica = `/uploads/ejercicios/${req.file.filename}`;

    const ejercicioActualizado = await prisma.ejercicio.update({
      where: { id },

      data: {
        video_ayuda: rutaPublica
      }
    });

    return res.json({
      mensaje: 'Video demostrativo asociado correctamente',
      video_ayuda: ejercicioActualizado.video_ayuda,
      ejercicio: ejercicioActualizado
    });

  } catch (error) {
    console.error('Error al subir video demostrativo:', error);

    // Si falla la actualización en la base de datos,
    // eliminamos el archivo recién subido.
    if (archivoGuardado && fs.existsSync(archivoGuardado)) {
      fs.unlinkSync(archivoGuardado);
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'El ejercicio no existe'
      });
    }

    return res.status(500).json({
      error: 'No se pudo asociar el video al ejercicio'
    });
  }
};



// 5. ELIMINAR VIDEO DEMOSTRATIVO
exports.eliminarVideoAyuda = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de ejercicio inválido'
      });
    }

    const ejercicio = await prisma.ejercicio.findUnique({
      where: { id }
    });

    if (!ejercicio) {
      return res.status(404).json({
        error: 'El ejercicio no existe'
      });
    }

    if (!ejercicio.video_ayuda) {
      return res.json({
        mensaje: 'El ejercicio no tiene un video propio asociado'
      });
    }

    const rutaAnterior = ejercicio.video_ayuda;

    // Primero quitar la asociación en la base de datos.
    await prisma.ejercicio.update({
      where: { id },
      data: { video_ayuda: null }
    });

    // Después eliminar el archivo físico.
    try {
      await eliminarArchivoVideoAyuda(rutaAnterior);
    } catch (error) {
      console.error('No se pudo eliminar el archivo anterior:', error);

      return res.json({
        mensaje: 'Video desvinculado, pero no se pudo eliminar el archivo físico'
      });
    }

    return res.json({
      mensaje: 'Video demostrativo eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar video demostrativo:', error);

    return res.status(500).json({
      error: 'No se pudo eliminar el video demostrativo'
    });
  }
};